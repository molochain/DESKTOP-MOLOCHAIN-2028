import { Client } from 'ssh2';

interface ServerConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

const config: ServerConfig = {
  host: '31.186.24.19',
  port: 22,
  username: 'root',
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
          log(`Command exited with code ${code}`, 'warn');
        }
        resolve(stdout + stderr);
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

async function checkServer() {
  console.log('\n==========================================');
  console.log('  Production Server Health Check');
  console.log('  Target: 31.186.24.19');
  console.log('==========================================\n');
  
  if (!config.password) {
    log('SERVER_SSH_PASSWORD environment variable not set', 'error');
    process.exit(1);
  }
  
  const conn = new Client();
  
  conn.on('ready', async () => {
    log('SSH connection established successfully!', 'success');
    
    try {
      console.log('\n--- Server Information ---');
      const hostname = await executeCommand(conn, 'hostname');
      log(`Hostname: ${hostname.trim()}`, 'info');
      
      const uptime = await executeCommand(conn, 'uptime');
      log(`Uptime: ${uptime.trim()}`, 'info');
      
      console.log('\n--- Docker Containers Status ---');
      const dockerPs = await executeCommand(conn, 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -30');
      console.log(dockerPs);
      
      console.log('\n--- Container Health Summary ---');
      const containerCount = await executeCommand(conn, 'docker ps -q | wc -l');
      const healthyCount = await executeCommand(conn, 'docker ps --filter "health=healthy" -q | wc -l');
      log(`Total Running Containers: ${containerCount.trim()}`, 'info');
      log(`Healthy Containers: ${healthyCount.trim()}`, 'info');
      
      console.log('\n--- Molochain Core Status (PM2) ---');
      const pm2Status = await executeCommand(conn, 'pm2 status molochain-core 2>/dev/null || echo "PM2 process not found"');
      console.log(pm2Status);
      
      console.log('\n--- Disk Usage ---');
      const diskUsage = await executeCommand(conn, 'df -h /var/www/vhosts/molochain.com');
      console.log(diskUsage);
      
      console.log('\n--- Memory Usage ---');
      const memUsage = await executeCommand(conn, 'free -h');
      console.log(memUsage);
      
      console.log('\n--- Latest Deployments ---');
      const deployments = await executeCommand(conn, 'ls -lth /var/www/vhosts/molochain.com/molochain-core/molochain-deploy-*.tar.gz 2>/dev/null | head -5 || echo "No deployment packages found"');
      console.log(deployments);
      
      console.log('\n--- API Gateway Status ---');
      const gatewayStatus = await executeCommand(conn, 'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4000/health 2>/dev/null || echo "Gateway not responding"');
      log(`API Gateway Health: HTTP ${gatewayStatus.trim()}`, gatewayStatus.trim() === '200' ? 'success' : 'warn');
      
      console.log('\n--- CMS Status ---');
      const cmsStatus = await executeCommand(conn, 'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8090/api/health 2>/dev/null || echo "CMS not responding"');
      log(`CMS Health: HTTP ${cmsStatus.trim()}`, cmsStatus.trim() === '200' ? 'success' : 'warn');
      
      console.log('\n==========================================');
      log('Server health check completed!', 'success');
      console.log('==========================================\n');
      
      conn.end();
    } catch (error) {
      log(`Error during health check: ${error}`, 'error');
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

checkServer().catch(console.error);
