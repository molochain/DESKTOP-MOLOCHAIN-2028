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
    success: '\x1b[32m[OK]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m',
    header: '\x1b[35m[SECTION]\x1b[0m'
  };
  console.log(`${prefix[type]} ${message}`);
}

function section(title: string) {
  console.log('\n' + '='.repeat(70));
  console.log(`  ${title}`);
  console.log('='.repeat(70));
}

async function executeCommand(conn: Client, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', () => resolve(stdout || stderr));
      stream.on('data', (data: Buffer) => { stdout += data.toString(); });
      stream.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });
    });
  });
}

async function deepScan() {
  console.log('\n' + '='.repeat(70));
  console.log('  MOLOCHAIN PRODUCTION SERVER - DEEP SCAN ANALYSIS');
  console.log('  Server: ' + config.host);
  console.log('  Time: ' + new Date().toISOString());
  console.log('='.repeat(70));

  if (!config.password) {
    log('SERVER_SSH_PASSWORD not set', 'error');
    process.exit(1);
  }

  const conn = new Client();

  conn.on('ready', async () => {
    log('SSH Connected', 'success');

    try {
      // ==================== SUBDOMAINS & VIRTUAL HOSTS ====================
      section('1. SUBDOMAINS & VIRTUAL HOSTS');
      
      const vhosts = await executeCommand(conn, 'ls -la /var/www/vhosts/');
      console.log('Virtual Hosts Directory:');
      console.log(vhosts);
      
      const nginxSites = await executeCommand(conn, 'ls -la /etc/nginx/conf.d/ 2>/dev/null || ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "No nginx sites found"');
      console.log('Nginx Sites Configuration:');
      console.log(nginxSites);

      const pleskDomains = await executeCommand(conn, 'plesk bin domain --list 2>/dev/null || echo "Plesk domains not available"');
      console.log('Plesk Domains:');
      console.log(pleskDomains);

      const sslDomains = await executeCommand(conn, 'ls /etc/letsencrypt/live/ 2>/dev/null');
      console.log('SSL Certificate Domains:');
      console.log(sslDomains);

      // ==================== DOCKER DETAILED ANALYSIS ====================
      section('2. DOCKER CONTAINERS & CONFIGURATIONS');
      
      const dockerPs = await executeCommand(conn, 'docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"');
      console.log('All Docker Containers:');
      console.log(dockerPs);

      const dockerImages = await executeCommand(conn, 'docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"');
      console.log('\nDocker Images:');
      console.log(dockerImages);

      const dockerNetworks = await executeCommand(conn, 'docker network ls');
      console.log('\nDocker Networks:');
      console.log(dockerNetworks);

      const dockerVolumes = await executeCommand(conn, 'docker volume ls');
      console.log('\nDocker Volumes:');
      console.log(dockerVolumes);

      const dockerCompose = await executeCommand(conn, 'find /var/www -name "docker-compose*.yml" -o -name "docker-compose*.yaml" 2>/dev/null | head -20');
      console.log('\nDocker Compose Files:');
      console.log(dockerCompose || 'None found');

      // ==================== DATABASE ANALYSIS ====================
      section('3. DATABASE SERVICES');

      const pgDatabases = await executeCommand(conn, 'docker exec kong-database psql -U postgres -c "\\l" 2>/dev/null || echo "PostgreSQL via Docker not accessible"');
      console.log('PostgreSQL Databases (Docker):');
      console.log(pgDatabases);

      const systemPg = await executeCommand(conn, 'sudo -u postgres psql -c "\\l" 2>/dev/null || echo "System PostgreSQL not running"');
      console.log('\nSystem PostgreSQL:');
      console.log(systemPg);

      const mysqlDbs = await executeCommand(conn, 'mysql -e "SHOW DATABASES;" 2>/dev/null || echo "MySQL not accessible directly"');
      console.log('\nMySQL Databases:');
      console.log(mysqlDbs);

      const redisInfo = await executeCommand(conn, 'redis-cli INFO keyspace 2>/dev/null || echo "Redis not accessible"');
      console.log('\nRedis Keyspaces:');
      console.log(redisInfo);

      // ==================== APPLICATION FILES ====================
      section('4. APPLICATION FILES & STRUCTURE');

      const appRoot = await executeCommand(conn, 'ls -la /var/www/vhosts/molochain.com/molochain-core/ 2>/dev/null');
      console.log('Main Application Root:');
      console.log(appRoot);

      const appDist = await executeCommand(conn, 'ls -la /var/www/vhosts/molochain.com/molochain-core/dist/ 2>/dev/null');
      console.log('\nDist Folder:');
      console.log(appDist);

      const envFiles = await executeCommand(conn, 'find /var/www/vhosts/molochain.com -name ".env*" -type f 2>/dev/null');
      console.log('\nEnvironment Files Found:');
      console.log(envFiles || 'None');

      const configFiles = await executeCommand(conn, 'find /var/www/vhosts/molochain.com -name "*.config.*" -type f 2>/dev/null | head -30');
      console.log('\nConfiguration Files:');
      console.log(configFiles || 'None');

      // ==================== NGINX CONFIGURATIONS ====================
      section('5. NGINX/WEB SERVER CONFIGURATIONS');

      const nginxConf = await executeCommand(conn, 'cat /etc/nginx/nginx.conf 2>/dev/null | head -50 || echo "Nginx main config not found"');
      console.log('Nginx Main Config (first 50 lines):');
      console.log(nginxConf);

      const moloNginx = await executeCommand(conn, 'cat /etc/nginx/plesk.conf.d/vhosts/molochain.com.conf 2>/dev/null | head -100 || cat /etc/nginx/conf.d/molochain.conf 2>/dev/null | head -100 || echo "Domain config not found"');
      console.log('\nMolochain Domain Nginx Config:');
      console.log(moloNginx);

      const proxyConfigs = await executeCommand(conn, 'grep -r "proxy_pass" /etc/nginx/ 2>/dev/null | head -30');
      console.log('\nProxy Pass Configurations:');
      console.log(proxyConfigs || 'None');

      // ==================== PM2 ECOSYSTEM ====================
      section('6. PM2 ECOSYSTEM CONFIGURATION');

      const pm2Ecosystem = await executeCommand(conn, 'cat /var/www/vhosts/molochain.com/molochain-core/ecosystem.config.production.cjs 2>/dev/null || cat /var/www/vhosts/molochain.com/molochain-core/ecosystem.config.js 2>/dev/null');
      console.log('PM2 Ecosystem Config:');
      console.log(pm2Ecosystem || 'Not found');

      const pm2Describe = await executeCommand(conn, 'pm2 describe molochain-core 2>/dev/null | head -50');
      console.log('\nPM2 Process Details:');
      console.log(pm2Describe);

      // ==================== API GATEWAY (KONG) ====================
      section('7. API GATEWAY (KONG) CONFIGURATION');

      const kongRoutes = await executeCommand(conn, 'curl -s http://localhost:8001/routes 2>/dev/null | head -100 || echo "Kong admin API not accessible"');
      console.log('Kong Routes:');
      console.log(kongRoutes);

      const kongServices = await executeCommand(conn, 'curl -s http://localhost:8001/services 2>/dev/null | head -100 || echo "Kong services not accessible"');
      console.log('\nKong Services:');
      console.log(kongServices);

      const kongPlugins = await executeCommand(conn, 'curl -s http://localhost:8001/plugins 2>/dev/null | head -50');
      console.log('\nKong Plugins:');
      console.log(kongPlugins || 'Not accessible');

      // ==================== MONITORING STACK ====================
      section('8. MONITORING STACK (PROMETHEUS/GRAFANA/LOKI)');

      const prometheusTargets = await executeCommand(conn, 'curl -s http://localhost:9090/api/v1/targets 2>/dev/null | head -50 || echo "Prometheus not accessible"');
      console.log('Prometheus Targets:');
      console.log(prometheusTargets);

      const alertmanagerAlerts = await executeCommand(conn, 'curl -s http://localhost:9093/api/v2/alerts 2>/dev/null | head -30');
      console.log('\nAlertmanager Alerts:');
      console.log(alertmanagerAlerts || 'None');

      const lokiLabels = await executeCommand(conn, 'curl -s http://localhost:3100/loki/api/v1/labels 2>/dev/null');
      console.log('\nLoki Labels:');
      console.log(lokiLabels || 'Not accessible');

      // ==================== CRON JOBS ====================
      section('9. SCHEDULED TASKS (CRON)');

      const cronJobs = await executeCommand(conn, 'crontab -l 2>/dev/null || echo "No crontab for root"');
      console.log('Root Crontab:');
      console.log(cronJobs);

      const systemdTimers = await executeCommand(conn, 'systemctl list-timers --all 2>/dev/null | head -20');
      console.log('\nSystemd Timers:');
      console.log(systemdTimers);

      // ==================== LOGS ANALYSIS ====================
      section('10. RECENT APPLICATION LOGS');

      const pm2Errors = await executeCommand(conn, 'pm2 logs molochain-core --err --nostream --lines 20 2>/dev/null');
      console.log('PM2 Error Logs (last 20):');
      console.log(pm2Errors || 'No errors');

      const nginxErrors = await executeCommand(conn, 'tail -20 /var/log/nginx/error.log 2>/dev/null || tail -20 /var/log/httpd/error_log 2>/dev/null');
      console.log('\nNginx Error Log (last 20):');
      console.log(nginxErrors || 'No errors');

      // ==================== SECURITY SCAN ====================
      section('11. SECURITY CONFIGURATION');

      const openPorts = await executeCommand(conn, 'ss -tulpn | grep LISTEN');
      console.log('Open Listening Ports:');
      console.log(openPorts);

      const fail2banStatus = await executeCommand(conn, 'fail2ban-client status 2>/dev/null || echo "fail2ban not installed"');
      console.log('\nFail2ban Status:');
      console.log(fail2banStatus);

      const sshConfig = await executeCommand(conn, 'grep -E "^(PermitRootLogin|PasswordAuthentication|Port)" /etc/ssh/sshd_config');
      console.log('\nSSH Security Settings:');
      console.log(sshConfig);

      // ==================== SUMMARY ====================
      section('SCAN COMPLETE');
      log('Deep scan completed successfully', 'success');

      conn.end();

    } catch (error) {
      log(`Scan error: ${error}`, 'error');
      conn.end();
      process.exit(1);
    }
  });

  conn.on('error', (err) => {
    log(`SSH error: ${err.message}`, 'error');
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

deepScan().catch(console.error);
