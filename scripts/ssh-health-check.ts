import { Client } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';

interface ServerConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: Buffer;
}

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const prefix = {
    info: '\x1b[36m[INFO]\x1b[0m',
    success: '\x1b[32m[SUCCESS]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m'
  };
  console.log(`${prefix[type]} ${message}`);
}

function loadConfig(): ServerConfig {
  const host = process.env.SSH_HOST;
  const username = process.env.SSH_USERNAME;
  const password = process.env.SERVER_SSH_PASSWORD;
  const privateKeyPath = process.env.SSH_PRIVATE_KEY_PATH;
  
  if (!host) {
    log('SSH_HOST environment variable is required', 'error');
    log('Set it using: export SSH_HOST=your.server.ip', 'info');
    process.exit(1);
  }
  
  if (!username) {
    log('SSH_USERNAME environment variable is required', 'error');
    log('Set it using: export SSH_USERNAME=your_username', 'info');
    process.exit(1);
  }
  
  let privateKey: Buffer | undefined;
  if (privateKeyPath) {
    try {
      privateKey = fs.readFileSync(path.resolve(privateKeyPath));
      log('Using SSH key authentication (recommended)', 'success');
    } catch (err) {
      log(`Failed to read private key: ${privateKeyPath}`, 'error');
      process.exit(1);
    }
  } else if (password) {
    log('Using password authentication (consider using SSH keys for better security)', 'warn');
  } else {
    log('Either SERVER_SSH_PASSWORD or SSH_PRIVATE_KEY_PATH must be set', 'error');
    process.exit(1);
  }
  
  return {
    host,
    port: parseInt(process.env.SSH_PORT || '22'),
    username,
    password,
    privateKey
  };
}

const config = loadConfig();

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
  
  log(`Connecting to ${config.host}:${config.port} as ${config.username}...`, 'info');
  
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
        const ports = await executeCommand(conn, 'ss -tuln | grep -E ":(80|443|3000|5000)" | head -10 2>/dev/null || echo "Port check unavailable"');
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
    
    const connectionOptions: any = {
      host: config.host,
      port: config.port,
      username: config.username,
      readyTimeout: 10000
    };
    
    if (config.privateKey) {
      connectionOptions.privateKey = config.privateKey;
    } else if (config.password) {
      connectionOptions.password = config.password;
    }
    
    conn.connect(connectionOptions);
  });
}

runHealthCheck().catch((error) => {
  log(`Failed: ${error.message}`, 'error');
  process.exit(1);
});
