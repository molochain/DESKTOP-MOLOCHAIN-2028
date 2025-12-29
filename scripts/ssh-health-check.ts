import { Client } from 'ssh2';

interface ServerConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

const config: ServerConfig = {
  host: process.env.SSH_HOST || '31.186.24.19',
  port: parseInt(process.env.SSH_PORT || '22'),
  username: process.env.SSH_USERNAME || 'root',
  password: process.env.SERVER_SSH_PASSWORD || ''
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

async function executeCommand(conn: Client, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      
      let stdout = '';
      let stderr = '';
      
      stream.on('close', (code: number) => {
        if (code !== 0 && stderr) {
          log(`Command warning (exit code ${code})`, 'warn');
        }
        resolve(stdout || stderr);
      });
      
      stream.on('data', (data: Buffer) => {
        stdout += data.toString();
      });
      
      stream.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });
    });
  });
}

async function runHealthCheck() {
  console.log('\n==========================================');
  console.log('  Production Server SSH Health Check');
  console.log('==========================================\n');
  
  if (!config.password) {
    log('SERVER_SSH_PASSWORD environment variable not set', 'error');
    log('Set the password using: export SERVER_SSH_PASSWORD=your_password', 'info');
    process.exit(1);
  }
  
  log(`Connecting to ${config.host}:${config.port}...`, 'info');
  
  const conn = new Client();
  
  return new Promise<void>((resolve, reject) => {
    const connectionTimeout = setTimeout(() => {
      log('Connection timeout after 10 seconds', 'error');
      conn.end();
      reject(new Error('Connection timeout'));
    }, 10000);
    
    conn.on('ready', async () => {
      clearTimeout(connectionTimeout);
      log('SSH connection established', 'success');
      
      try {
        console.log('\n--- Server Uptime ---');
        const uptime = await executeCommand(conn, 'uptime');
        console.log(uptime.trim());
        
        console.log('\n--- Memory Usage ---');
        const memory = await executeCommand(conn, 'free -m');
        console.log(memory.trim());
        
        console.log('\n--- Disk Usage ---');
        const disk = await executeCommand(conn, 'df -h | head -5');
        console.log(disk.trim());
        
        console.log('\n--- PM2 Status ---');
        const pm2Status = await executeCommand(conn, 'pm2 status molochain-core 2>/dev/null || echo "PM2 not running or molochain-core not found"');
        console.log(pm2Status.trim());
        
        console.log('\n--- Network Ports (HTTP/HTTPS) ---');
        const ports = await executeCommand(conn, 'netstat -tuln | grep -E ":(80|443|3000|5000)" | head -10 || ss -tuln | grep -E ":(80|443|3000|5000)" | head -10');
        console.log(ports.trim() || 'No HTTP/HTTPS ports listening');
        
        console.log('\n--- Recent Application Logs ---');
        const logs = await executeCommand(conn, 'tail -10 /var/www/vhosts/molochain.com/molochain-core/logs/combined.log 2>/dev/null || echo "No logs found"');
        console.log(logs.trim());
        
        console.log('\n==========================================');
        log('Health check completed successfully!', 'success');
        console.log('==========================================\n');
        
        conn.end();
        resolve();
      } catch (error) {
        log(`Health check error: ${error}`, 'error');
        conn.end();
        reject(error);
      }
    });
    
    conn.on('error', (err) => {
      clearTimeout(connectionTimeout);
      log(`SSH connection error: ${err.message}`, 'error');
      reject(err);
    });
    
    conn.connect({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      readyTimeout: 10000
    });
  });
}

runHealthCheck().catch((error) => {
  log(`Failed: ${error.message}`, 'error');
  process.exit(1);
});
