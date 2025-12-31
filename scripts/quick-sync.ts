import { Client, SFTPWrapper } from 'ssh2';
import * as fs from 'fs';
import { execSync } from 'child_process';

const config = {
  host: '31.186.24.19',
  port: 22,
  username: 'root',
  password: process.env.SERVER_SSH_PASSWORD || '',
  deployPath: '/var/www/vhosts/molochain.com/molochain-core',
  backupPath: '/var/www/vhosts/molochain.com/BACKUPS'
};

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const icons = { info: '📋', success: '✅', error: '❌', warn: '⚠️' };
  console.log(`${icons[type]} ${message}`);
}

async function executeCommand(conn: Client, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      let output = '';
      stream.on('close', () => resolve(output));
      stream.on('data', (data: Buffer) => { output += data.toString(); });
      stream.stderr.on('data', (data: Buffer) => { output += data.toString(); });
    });
  });
}

async function uploadFile(sftp: SFTPWrapper, localPath: string, remotePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const stats = fs.statSync(localPath);
    let transferred = 0;
    const readStream = fs.createReadStream(localPath);
    const writeStream = sftp.createWriteStream(remotePath);
    
    readStream.on('data', (chunk: Buffer) => {
      transferred += chunk.length;
      const pct = Math.round((transferred / stats.size) * 100);
      process.stdout.write(`\r   Uploading: ${pct}% (${(transferred / 1024 / 1024).toFixed(1)}MB)`);
    });
    
    writeStream.on('close', () => { console.log('\r   Uploading: 100% Complete     '); resolve(); });
    writeStream.on('error', reject);
    readStream.on('error', reject);
    readStream.pipe(writeStream);
  });
}

async function quickSync() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  🚀 Quick Production Sync');
  console.log('  📍 Target: 31.186.24.19');
  console.log('═══════════════════════════════════════════\n');
  
  if (!config.password) {
    log('SERVER_SSH_PASSWORD not set', 'error');
    process.exit(1);
  }
  
  if (!fs.existsSync('dist')) {
    log('No dist folder - run npm run build first', 'error');
    process.exit(1);
  }
  
  const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0].replace('T', '_');
  const packageName = `molochain-deploy-${timestamp}.tar.gz`;
  
  log('Creating deployment package...', 'info');
  const files = ['dist/', 'shared/', 'package.json', 'package-lock.json'].filter(f => fs.existsSync(f));
  execSync(`tar --exclude='*.log' -czf ${packageName} ${files.join(' ')}`, { stdio: 'pipe' });
  const pkgSize = (fs.statSync(packageName).size / 1024 / 1024).toFixed(1);
  log(`Package: ${packageName} (${pkgSize} MB)`, 'success');
  
  const conn = new Client();
  
  conn.on('ready', async () => {
    log('SSH connected', 'success');
    
    try {
      conn.sftp(async (err, sftp) => {
        if (err) throw err;
        
        log('Creating backup...', 'info');
        await executeCommand(conn, 
          `cd ${config.deployPath} && tar -czf ${config.backupPath}/backup-${timestamp}.tar.gz dist/ 2>/dev/null || true`
        );
        
        log('Uploading package...', 'info');
        await uploadFile(sftp, packageName, `${config.deployPath}/${packageName}`);
        
        log('Extracting on server...', 'info');
        await executeCommand(conn, `cd ${config.deployPath} && tar -xzf ${packageName}`);
        
        log('Installing dependencies...', 'info');
        const npmResult = await executeCommand(conn, 
          `cd ${config.deployPath} && npm ci --production 2>&1; NPM_EXIT=$?; if [ $NPM_EXIT -ne 0 ]; then echo "NPM_INSTALL_FAILED"; exit $NPM_EXIT; fi`
        );
        if (npmResult.includes('NPM_INSTALL_FAILED')) {
          log('npm install failed! Aborting deployment', 'warn');
          fs.unlinkSync(packageName);
          conn.end();
          process.exit(1);
        }
        log('Dependencies installed', 'success');
        
        log('Syncing frontend to httpdocs...', 'info');
        await executeCommand(conn,
          `cp -r ${config.deployPath}/dist/public/* /var/www/vhosts/molochain.com/httpdocs/ 2>/dev/null || true`
        );
        
        log('Restarting molochain-core container...', 'info');
        await executeCommand(conn, 'docker restart molochain-core 2>/dev/null || true');
        
        await new Promise(r => setTimeout(r, 5000));
        
        log('Verifying deployment...', 'info');
        const health = await executeCommand(conn, 
          'curl -s http://127.0.0.1:5000/api/health 2>/dev/null | grep -o \'"status":"[^"]*"\' | head -1'
        );
        
        if (health.includes('healthy')) {
          log('API Health: Healthy', 'success');
        } else {
          log('API Health: Check container logs', 'warn');
        }
        
        const containerStatus = await executeCommand(conn, 
          'docker ps --filter "name=molochain-core" --format "{{.Status}}"'
        );
        log(`Container: ${containerStatus.trim()}`, containerStatus.includes('healthy') ? 'success' : 'info');
        
        log('Cleaning up old packages...', 'info');
        await executeCommand(conn, 
          `cd ${config.deployPath} && ls -t molochain-deploy-*.tar.gz | tail -n +6 | xargs rm -f 2>/dev/null || true`
        );
        await executeCommand(conn, 
          `cd ${config.backupPath} && ls -t backup-*.tar.gz | tail -n +10 | xargs rm -f 2>/dev/null || true`
        );
        
        fs.unlinkSync(packageName);
        log('Local cleanup done', 'info');
        
        console.log('\n═══════════════════════════════════════════');
        log('Production sync completed!', 'success');
        console.log('═══════════════════════════════════════════');
        console.log('   🌐 https://molochain.com');
        console.log('   🔧 https://api.molochain.com');
        console.log('═══════════════════════════════════════════\n');
        
        conn.end();
      });
    } catch (error) {
      log(`Sync failed: ${error}`, 'error');
      if (fs.existsSync(packageName)) fs.unlinkSync(packageName);
      conn.end();
      process.exit(1);
    }
  });
  
  conn.on('error', (err) => {
    log(`SSH error: ${err.message}`, 'error');
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

quickSync().catch(console.error);
