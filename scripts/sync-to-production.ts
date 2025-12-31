import { Client, SFTPWrapper } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface ServerConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  deployPath: string;
  backupPath: string;
}

const config: ServerConfig = {
  host: '31.186.24.19',
  port: 22,
  username: 'root',
  password: process.env.SERVER_SSH_PASSWORD || '',
  deployPath: '/var/www/vhosts/molochain.com/molochain-core',
  backupPath: '/var/www/vhosts/molochain.com/BACKUPS'
};

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const prefix = {
    info: '\x1b[36m[INFO]\x1b[0m',
    success: '\x1b[32m[SUCCESS]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m'
  };
  const timestamp = new Date().toISOString().substring(11, 19);
  console.log(`${timestamp} ${prefix[type]} ${message}`);
}

async function executeCommand(conn: Client, command: string, silent = false): Promise<string> {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      
      let stdout = '';
      let stderr = '';
      
      stream.on('close', (code: number) => {
        if (code !== 0 && stderr && !silent) {
          log(`Command exited with code ${code}`, 'warn');
        }
        resolve(stdout + stderr);
      });
      
      stream.on('data', (data: Buffer) => {
        stdout += data.toString();
        if (!silent) process.stdout.write(data.toString());
      });
      
      stream.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
        if (!silent) process.stderr.write(data.toString());
      });
    });
  });
}

async function uploadFile(sftp: SFTPWrapper, localPath: string, remotePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const stats = fs.statSync(localPath);
    const fileSize = stats.size;
    let transferred = 0;
    
    const readStream = fs.createReadStream(localPath);
    const writeStream = sftp.createWriteStream(remotePath);
    
    readStream.on('data', (chunk: Buffer) => {
      transferred += chunk.length;
      const percent = Math.round((transferred / fileSize) * 100);
      const mb = (transferred / 1024 / 1024).toFixed(1);
      const totalMb = (fileSize / 1024 / 1024).toFixed(1);
      process.stdout.write(`\r[UPLOAD] ${percent}% (${mb}/${totalMb} MB)`);
    });
    
    writeStream.on('close', () => {
      console.log(`\r[UPLOAD] 100% Complete                `);
      resolve();
    });
    
    writeStream.on('error', reject);
    readStream.on('error', reject);
    
    readStream.pipe(writeStream);
  });
}

function createDeploymentPackage(): string {
  const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0].replace('T', '_');
  const packageName = `molochain-deploy-${timestamp}.tar.gz`;
  
  log('Building production assets...', 'info');
  try {
    execSync('npm run build 2>&1', { stdio: 'inherit' });
  } catch (error) {
    log('Build failed, continuing with existing dist...', 'warn');
  }
  
  log('Creating deployment package...', 'info');
  const includeFiles = [
    'dist/',
    'db/',
    'shared/',
    'package.json',
    'package-lock.json'
  ];
  
  const existingFiles = includeFiles.filter(f => fs.existsSync(f));
  
  if (existingFiles.length === 0) {
    throw new Error('No files to deploy - build the project first');
  }
  
  const tarCommand = `tar --exclude='node_modules' --exclude='.git' --exclude='*.log' -czf ${packageName} ${existingFiles.join(' ')}`;
  execSync(tarCommand, { stdio: 'inherit' });
  
  const stats = fs.statSync(packageName);
  log(`Package created: ${packageName} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`, 'success');
  
  return packageName;
}

async function syncToProduction() {
  console.log('\n==========================================');
  console.log('  Molochain Production Sync');
  console.log('  Target: 31.186.24.19');
  console.log('==========================================\n');
  
  if (!config.password) {
    log('SERVER_SSH_PASSWORD environment variable not set', 'error');
    process.exit(1);
  }
  
  const packageFile = createDeploymentPackage();
  
  const conn = new Client();
  
  conn.on('ready', async () => {
    log('SSH connection established', 'success');
    
    try {
      conn.sftp(async (err, sftp) => {
        if (err) throw err;
        
        log('Creating backup of current deployment...', 'info');
        const backupTimestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0];
        await executeCommand(conn, 
          `cd ${config.deployPath} && ` +
          `tar -czf ${config.backupPath}/molochain-backup-${backupTimestamp}.tar.gz dist/ --ignore-failed-read 2>/dev/null || true`,
          true
        );
        log('Backup created', 'success');
        
        log('Uploading deployment package...', 'info');
        const remotePath = `${config.deployPath}/${packageFile}`;
        await uploadFile(sftp, packageFile, remotePath);
        
        log('Extracting deployment package...', 'info');
        await executeCommand(conn, 
          `cd ${config.deployPath} && tar -xzf ${packageFile}`
        );
        
        log('Installing production dependencies...', 'info');
        await executeCommand(conn, 
          `cd ${config.deployPath} && npm ci --production --silent 2>&1 | tail -10`
        );
        
        log('Setting up directories...', 'info');
        await executeCommand(conn, 
          `cd ${config.deployPath} && mkdir -p logs uploads temp`,
          true
        );
        
        log('Syncing static files to httpdocs...', 'info');
        await executeCommand(conn,
          `cd ${config.deployPath} && ` +
          `if [ -d "dist/public" ]; then ` +
          `cp -r dist/public/* /var/www/vhosts/molochain.com/httpdocs/ 2>/dev/null || true; ` +
          `fi`
        );
        
        log('Restarting Docker container...', 'info');
        await executeCommand(conn, 
          `docker restart molochain-core 2>/dev/null || echo "Container restart skipped"`
        );
        
        log('Waiting for container to be healthy...', 'info');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        log('Checking container status...', 'info');
        const containerStatus = await executeCommand(conn, 
          `docker ps --filter "name=molochain-core" --format "{{.Status}}"`,
          true
        );
        console.log(`  Container Status: ${containerStatus.trim()}`);
        
        log('Verifying health endpoints...', 'info');
        const healthCheck = await executeCommand(conn, 
          `curl -s http://127.0.0.1:5000/api/health | head -c 200`,
          true
        );
        if (healthCheck.includes('"status":"healthy"')) {
          log('Core API: Healthy', 'success');
        } else {
          log('Core API: Check logs', 'warn');
        }
        
        const gatewayCheck = await executeCommand(conn, 
          `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4000/health`,
          true
        );
        log(`API Gateway: HTTP ${gatewayCheck.trim()}`, gatewayCheck.trim() === '200' ? 'success' : 'warn');
        
        log('Cleaning up old packages (keeping last 5)...', 'info');
        await executeCommand(conn, 
          `cd ${config.deployPath} && ls -t molochain-deploy-*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true`,
          true
        );
        
        await executeCommand(conn, 
          `cd ${config.backupPath} && ls -t molochain-backup-*.tar.gz 2>/dev/null | tail -n +10 | xargs rm -f 2>/dev/null || true`,
          true
        );
        
        fs.unlinkSync(packageFile);
        log('Local package cleaned up', 'info');
        
        console.log('\n==========================================');
        log('Production sync completed successfully!', 'success');
        console.log('==========================================');
        console.log('  Website: https://molochain.com');
        console.log('  API: https://api.molochain.com');
        console.log('==========================================\n');
        
        conn.end();
      });
    } catch (error) {
      log(`Sync failed: ${error}`, 'error');
      if (fs.existsSync(packageFile)) fs.unlinkSync(packageFile);
      conn.end();
      process.exit(1);
    }
  });
  
  conn.on('error', (err) => {
    log(`SSH connection error: ${err.message}`, 'error');
    process.exit(1);
  });
  
  log(`Connecting to ${config.host}...`, 'info');
  conn.connect({
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    readyTimeout: 30000
  });
}

syncToProduction().catch(console.error);
