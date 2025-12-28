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
  password: process.env.SERVER_SSH_PASSWORD || '',
};

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' | 'header' = 'info') {
  const prefix = {
    info: '\x1b[36m[INFO]\x1b[0m',
    success: '\x1b[32m[SUCCESS]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m',
    header: '\x1b[35m[SECTION]\x1b[0m'
  };
  console.log(`${prefix[type]} ${message}`);
}

function section(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

async function executeCommand(conn: Client, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      
      let stdout = '';
      let stderr = '';
      
      stream.on('close', (code: number) => {
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

async function checkServer() {
  console.log('\n' + '='.repeat(60));
  console.log('  MoloChain Production Server Health Check');
  console.log('  Server: ' + config.host);
  console.log('  Time: ' + new Date().toISOString());
  console.log('='.repeat(60));
  
  if (!config.password) {
    log('SERVER_SSH_PASSWORD environment variable not set', 'error');
    process.exit(1);
  }
  
  const conn = new Client();
  
  conn.on('ready', async () => {
    log('SSH connection established successfully!', 'success');
    
    try {
      // 1. System Information
      section('SYSTEM INFORMATION');
      
      const hostname = await executeCommand(conn, 'hostname');
      log(`Hostname: ${hostname.trim()}`, 'info');
      
      const uptime = await executeCommand(conn, 'uptime');
      log(`Uptime: ${uptime.trim()}`, 'info');
      
      const osInfo = await executeCommand(conn, 'cat /etc/os-release | head -5');
      console.log('\nOS Information:');
      console.log(osInfo);
      
      const kernelVersion = await executeCommand(conn, 'uname -r');
      log(`Kernel: ${kernelVersion.trim()}`, 'info');
      
      // 2. CPU & Load
      section('CPU & LOAD AVERAGE');
      
      const cpuInfo = await executeCommand(conn, 'nproc');
      log(`CPU Cores: ${cpuInfo.trim()}`, 'info');
      
      const loadAvg = await executeCommand(conn, 'cat /proc/loadavg');
      log(`Load Average: ${loadAvg.trim()}`, 'info');
      
      const cpuUsage = await executeCommand(conn, "top -bn1 | grep 'Cpu(s)' | head -1");
      console.log(`CPU Usage: ${cpuUsage.trim()}`);
      
      // 3. Memory Usage
      section('MEMORY USAGE');
      
      const memInfo = await executeCommand(conn, 'free -h');
      console.log(memInfo);
      
      // 4. Disk Usage
      section('DISK USAGE');
      
      const diskInfo = await executeCommand(conn, 'df -h');
      console.log(diskInfo);
      
      const diskInodes = await executeCommand(conn, 'df -i | head -5');
      console.log('Inode Usage:');
      console.log(diskInodes);
      
      // 5. Network Status
      section('NETWORK STATUS');
      
      const networkInterfaces = await executeCommand(conn, 'ip addr show | grep -E "inet |state"');
      console.log('Network Interfaces:');
      console.log(networkInterfaces);
      
      const listeningPorts = await executeCommand(conn, 'ss -tulpn | head -20');
      console.log('\nListening Ports:');
      console.log(listeningPorts);
      
      // 6. PM2 Process Status
      section('PM2 PROCESSES (Application Layer)');
      
      const pm2Status = await executeCommand(conn, 'pm2 list 2>/dev/null || echo "PM2 not running"');
      console.log(pm2Status);
      
      const pm2Logs = await executeCommand(conn, 'pm2 logs --nostream --lines 10 2>/dev/null || echo "No PM2 logs"');
      console.log('\nRecent PM2 Logs:');
      console.log(pm2Logs);
      
      // 7. Web Server Status (Nginx/Apache)
      section('WEB SERVER STATUS');
      
      const nginxStatus = await executeCommand(conn, 'systemctl status nginx 2>/dev/null | head -15 || echo "Nginx not found"');
      console.log('Nginx:');
      console.log(nginxStatus);
      
      const apacheStatus = await executeCommand(conn, 'systemctl status apache2 2>/dev/null | head -5 || systemctl status httpd 2>/dev/null | head -5 || echo "Apache not found"');
      console.log('\nApache:');
      console.log(apacheStatus);
      
      // 8. Database Services
      section('DATABASE SERVICES');
      
      const postgresStatus = await executeCommand(conn, 'systemctl status postgresql 2>/dev/null | head -10 || echo "PostgreSQL service not found"');
      console.log('PostgreSQL:');
      console.log(postgresStatus);
      
      const mysqlStatus = await executeCommand(conn, 'systemctl status mysql 2>/dev/null | head -10 || systemctl status mariadb 2>/dev/null | head -10 || echo "MySQL/MariaDB not found"');
      console.log('\nMySQL/MariaDB:');
      console.log(mysqlStatus);
      
      const redisStatus = await executeCommand(conn, 'systemctl status redis 2>/dev/null | head -10 || echo "Redis not found"');
      console.log('\nRedis:');
      console.log(redisStatus);
      
      // 9. Application Directory
      section('APPLICATION DIRECTORY');
      
      const appDir = await executeCommand(conn, 'ls -la /var/www/vhosts/molochain.com/molochain-core/ 2>/dev/null | head -20 || echo "App directory not found"');
      console.log('Application Files:');
      console.log(appDir);
      
      const envCheck = await executeCommand(conn, 'ls -la /var/www/vhosts/molochain.com/molochain-core/.env* 2>/dev/null || echo "No .env files found"');
      console.log('\nEnvironment Files:');
      console.log(envCheck);
      
      // 10. Recent Deployments
      section('RECENT BACKUPS/DEPLOYMENTS');
      
      const backups = await executeCommand(conn, 'ls -lht /var/www/vhosts/molochain.com/BACKUPS/ 2>/dev/null | head -10 || echo "No backups found"');
      console.log(backups);
      
      // 11. Security Checks
      section('SECURITY ANALYSIS');
      
      const failedLogins = await executeCommand(conn, 'grep "Failed password" /var/log/auth.log 2>/dev/null | tail -5 || grep "Failed password" /var/log/secure 2>/dev/null | tail -5 || echo "No failed login attempts found"');
      console.log('Recent Failed SSH Logins:');
      console.log(failedLogins);
      
      const firewallStatus = await executeCommand(conn, 'ufw status 2>/dev/null || iptables -L -n 2>/dev/null | head -15 || echo "Firewall status unavailable"');
      console.log('\nFirewall Status:');
      console.log(firewallStatus);
      
      const activeSSH = await executeCommand(conn, 'who');
      console.log('\nActive SSH Sessions:');
      console.log(activeSSH || 'No active sessions');
      
      // 12. System Logs Analysis
      section('RECENT SYSTEM ERRORS');
      
      const sysErrors = await executeCommand(conn, 'journalctl -p err --since "1 hour ago" 2>/dev/null | tail -20 || dmesg | tail -10');
      console.log(sysErrors || 'No recent errors');
      
      // 13. Docker (if applicable)
      section('DOCKER STATUS (if applicable)');
      
      const dockerStatus = await executeCommand(conn, 'docker ps 2>/dev/null || echo "Docker not running or not installed"');
      console.log(dockerStatus);
      
      // 14. SSL Certificates
      section('SSL CERTIFICATE STATUS');
      
      const sslCerts = await executeCommand(conn, 'ls -la /etc/letsencrypt/live/ 2>/dev/null || ls -la /etc/ssl/certs/ 2>/dev/null | head -10 || echo "SSL directory not found"');
      console.log(sslCerts);
      
      const certExpiry = await executeCommand(conn, 'certbot certificates 2>/dev/null | head -20 || echo "Certbot not available"');
      console.log('\nCertificate Expiry:');
      console.log(certExpiry);
      
      // Summary
      section('HEALTH CHECK SUMMARY');
      log('Connection: OK', 'success');
      log('All checks completed', 'success');
      
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
  
  conn.on('timeout', () => {
    log('SSH connection timeout', 'error');
    process.exit(1);
  });
  
  log(`Connecting to ${config.host}...`, 'info');
  conn.connect({
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    readyTimeout: 30000,
    keepaliveInterval: 10000
  });
}

checkServer().catch((err) => {
  log(`Fatal error: ${err.message}`, 'error');
  process.exit(1);
});
