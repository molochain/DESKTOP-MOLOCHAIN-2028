import { Client, SFTPWrapper } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

interface DeployConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  deployPath: string;
  backupPath: string;
}

const config: DeployConfig = {
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
  console.log(`${prefix[type]} ${message}`);
}

function findLatestPackage(): string {
  const files = fs.readdirSync('.').filter(f => f.startsWith('molochain-deploy-') && f.endsWith('.tar.gz'));
  if (files.length === 0) throw new Error('No deployment package found');
  files.sort().reverse();
  return files[0];
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
      process.stdout.write(`\rUploading: ${percent}%`);
    });
    
    writeStream.on('close', () => {
      console.log('\rUploading: 100%');
      resolve();
    });
    
    writeStream.on('error', reject);
    readStream.on('error', reject);
    
    readStream.pipe(writeStream);
  });
}

async function executeCommand(conn: Client, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      
      let stdout = '';
      let stderr = '';
      
      stream.on('close', (code: number) => {
        if (code !== 0 && stderr) {
          log(`Command exited with code ${code}`, 'warn');
          log(stderr, 'warn');
        }
        resolve(stdout);
      });
      
      stream.on('data', (data: Buffer) => {
        stdout += data.toString();
        process.stdout.write(data.toString());
      });
      
      stream.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
        process.stderr.write(data.toString());
      });
    });
  });
}

async function deploy() {
  console.log('\n==========================================');
  console.log('  MoloChain Production SSH Deployment');
  console.log('==========================================\n');
  
  if (!config.password) {
    log('SERVER_SSH_PASSWORD environment variable not set', 'error');
    process.exit(1);
  }
  
  const packageFile = findLatestPackage();
  log(`Found deployment package: ${packageFile}`, 'info');
  
  const conn = new Client();
  
  conn.on('ready', async () => {
    log('SSH connection established', 'success');
    
    try {
      conn.sftp(async (err, sftp) => {
        if (err) throw err;
        
        log('Starting file upload...', 'info');
        const remotePath = `${config.deployPath}/${packageFile}`;
        await uploadFile(sftp, packageFile, remotePath);
        log('Upload complete', 'success');
        
        log('Creating backup of current deployment...', 'info');
        const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0];
        await executeCommand(conn, 
          `cd ${config.deployPath} && ` +
          `tar -czf ${config.backupPath}/molochain-backup-${timestamp}.tar.gz dist/ --ignore-failed-read 2>/dev/null || true`
        );
        
        log('Extracting deployment package...', 'info');
        await executeCommand(conn, 
          `cd ${config.deployPath} && tar -xzf ${packageFile}`
        );
        
        log('Installing dependencies (this may take a while)...', 'info');
        await executeCommand(conn, 
          `cd ${config.deployPath} && npm ci --production --silent 2>&1 | tail -5`
        );
        
        log('Setting up environment...', 'info');
        await executeCommand(conn, 
          `cd ${config.deployPath} && mkdir -p logs`
        );
        
        log('Restarting PM2 processes...', 'info');
        await executeCommand(conn, 
          `cd ${config.deployPath} && ` +
          `pm2 delete molochain-core 2>/dev/null || true && ` +
          `pm2 start ecosystem.config.production.cjs --env production && ` +
          `pm2 save`
        );
        
        log('Checking deployment status...', 'info');
        await executeCommand(conn, `pm2 status molochain-core`);
        
        log('Cleaning up old deployment packages...', 'info');
        await executeCommand(conn, 
          `cd ${config.deployPath} && ls -t molochain-deploy-*.tar.gz | tail -n +4 | xargs rm -f 2>/dev/null || true`
        );
        
        console.log('\n==========================================');
        log('Deployment completed successfully!', 'success');
        console.log('==========================================');
        console.log('Visit: https://molochain.com');
        console.log('');
        
        conn.end();
      });
    } catch (error) {
      log(`Deployment failed: ${error}`, 'error');
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

deploy().catch(console.error);
