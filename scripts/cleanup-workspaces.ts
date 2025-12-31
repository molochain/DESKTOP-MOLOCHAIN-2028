import { Client } from 'ssh2';

const config = {
  host: '31.186.24.19',
  port: 22,
  username: 'root',
  password: process.env.SERVER_SSH_PASSWORD || ''
};

function log(msg: string, type: 'info' | 'success' | 'warn' = 'info') {
  const icons = { info: '📋', success: '✅', warn: '⚠️' };
  console.log(`${icons[type]} ${msg}`);
}

async function executeCommand(conn: Client, command: string): Promise<string> {
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

async function cleanupWorkspaces() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  🧹 Workspace Cleanup Tool');
  console.log('═══════════════════════════════════════════\n');
  
  if (!config.password) {
    log('SERVER_SSH_PASSWORD not set', 'warn');
    process.exit(1);
  }
  
  const conn = new Client();
  
  conn.on('ready', async () => {
    log('Connected to production server', 'success');
    
    try {
      console.log('\n--- Production Server Cleanup ---');
      
      log('Cleaning old deployment packages (keeping last 5)...', 'info');
      await executeCommand(conn, 
        'cd /var/www/vhosts/molochain.com/molochain-core && ls -t molochain-deploy-*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true'
      );
      
      log('Cleaning old backups (keeping last 10)...', 'info');
      await executeCommand(conn, 
        'cd /var/www/vhosts/molochain.com/BACKUPS && ls -t *.tar.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true'
      );
      
      log('Cleaning old log files (keeping last 7 days)...', 'info');
      await executeCommand(conn, 
        'find /var/www/vhosts/molochain.com/molochain-core/logs -name "*.log" -mtime +7 -delete 2>/dev/null || true'
      );
      
      log('Cleaning Docker resources...', 'info');
      await executeCommand(conn, 'docker system prune -f 2>/dev/null || true');
      
      log('Checking disk usage after cleanup...', 'info');
      const diskUsage = await executeCommand(conn, 'df -h /var/www/vhosts/molochain.com');
      console.log(diskUsage);
      
      log('Listing remaining deployment packages...', 'info');
      const packages = await executeCommand(conn, 
        'ls -lh /var/www/vhosts/molochain.com/molochain-core/molochain-deploy-*.tar.gz 2>/dev/null | tail -5 || echo "No packages"'
      );
      console.log(packages);
      
      console.log('\n═══════════════════════════════════════════');
      log('Production cleanup completed!', 'success');
      console.log('═══════════════════════════════════════════\n');
      
      conn.end();
    } catch (error) {
      console.error('Cleanup error:', error);
      conn.end();
      process.exit(1);
    }
  });
  
  conn.on('error', (err) => {
    console.error('SSH error:', err.message);
    process.exit(1);
  });
  
  log('Connecting to production server...', 'info');
  conn.connect({
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    readyTimeout: 15000
  });
}

cleanupWorkspaces().catch(console.error);
