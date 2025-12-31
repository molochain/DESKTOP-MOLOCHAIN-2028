import { Client } from 'ssh2';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const config = {
  host: '31.186.24.19',
  port: 22,
  username: 'root',
  password: process.env.SERVER_SSH_PASSWORD || '',
  deployPath: '/var/www/vhosts/molochain.com/molochain-core'
};

function log(msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') {
  const icons = { info: '📋', success: '✅', warn: '⚠️', error: '❌' };
  console.log(`${icons[type]} ${msg}`);
}

function executeCommand(conn: Client, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      let output = '';
      stream.on('close', () => resolve(output));
      stream.on('data', (d: Buffer) => output += d.toString());
      stream.stderr.on('data', (d: Buffer) => output += d.toString());
    });
  });
}

async function getChangedFiles(): Promise<string[]> {
  try {
    const result = execSync('git diff --name-only HEAD~1 HEAD 2>/dev/null || git diff --name-only HEAD', { encoding: 'utf-8' });
    const files = result.trim().split('\n').filter(f => f.length > 0);
    
    const relevantFiles = files.filter(f => 
      (f.startsWith('server/') || f.startsWith('shared/') || f.startsWith('scripts/') || f.startsWith('packages/')) &&
      !f.includes('node_modules') &&
      !f.endsWith('.log')
    );
    
    return relevantFiles;
  } catch {
    return [];
  }
}

async function incrementalSync() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  🔄 Incremental Production Sync');
  console.log('  📍 Target: ' + config.host);
  console.log('═══════════════════════════════════════════\n');

  if (!config.password) {
    log('SERVER_SSH_PASSWORD not set', 'error');
    process.exit(1);
  }

  const changedFiles = await getChangedFiles();
  
  if (changedFiles.length === 0) {
    log('No changed files detected. Nothing to sync.', 'info');
    process.exit(0);
  }

  log(`Found ${changedFiles.length} changed files:`, 'info');
  changedFiles.forEach(f => console.log(`   - ${f}`));

  const packageName = `incremental-${Date.now()}.tar.gz`;
  
  log('Creating incremental package...', 'info');
  try {
    const fileList = changedFiles.join(' ');
    execSync(`tar -czf ${packageName} ${fileList} 2>/dev/null || true`, { stdio: 'pipe' });
    
    if (!fs.existsSync(packageName)) {
      log('No files to package (all changes may be in excluded directories)', 'warn');
      process.exit(0);
    }
    
    const stats = fs.statSync(packageName);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    log(`Package size: ${sizeMB} MB`, 'success');
  } catch (error) {
    log(`Failed to create package: ${error}`, 'error');
    process.exit(1);
  }

  const conn = new Client();

  conn.on('ready', async () => {
    log('SSH connected', 'success');

    try {
      log('Uploading incremental package...', 'info');
      
      await new Promise<void>((resolve, reject) => {
        conn.sftp((err, sftp) => {
          if (err) return reject(err);
          
          const localPath = path.join(process.cwd(), packageName);
          const remotePath = `${config.deployPath}/${packageName}`;
          
          sftp.fastPut(localPath, remotePath, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      });
      log('Upload complete', 'success');

      log('Extracting on server...', 'info');
      await executeCommand(conn, `cd ${config.deployPath} && tar -xzf ${packageName} --overwrite`);
      
      await executeCommand(conn, `cd ${config.deployPath} && rm -f ${packageName}`);
      
      log('Restarting services...', 'info');
      await executeCommand(conn, 'cd /root/molochain-services && docker-compose restart molochain-core 2>/dev/null || true');
      
      fs.unlinkSync(packageName);
      
      console.log('\n═══════════════════════════════════════════');
      log('Incremental sync completed!', 'success');
      console.log('═══════════════════════════════════════════\n');

      conn.end();
    } catch (error) {
      log(`Sync error: ${error}`, 'error');
      if (fs.existsSync(packageName)) fs.unlinkSync(packageName);
      conn.end();
      process.exit(1);
    }
  });

  conn.on('error', (err) => {
    log(`SSH error: ${err.message}`, 'error');
    if (fs.existsSync(packageName)) fs.unlinkSync(packageName);
    process.exit(1);
  });

  log('Connecting to server...', 'info');
  conn.connect({
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    readyTimeout: 30000
  });
}

incrementalSync().catch(console.error);
