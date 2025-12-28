import { Client } from 'ssh2';

const config = {
  host: '31.186.24.19',
  port: 22,
  username: 'root',
  password: process.env.SERVER_SSH_PASSWORD || '',
};

function log(msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') {
  const colors = { info: '\x1b[36m', success: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m' };
  console.log(`${colors[type]}[${type.toUpperCase()}]\x1b[0m ${msg}`);
}

async function exec(conn: Client, cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream.on('data', (d: Buffer) => { out += d.toString(); });
      stream.stderr.on('data', (d: Buffer) => { out += d.toString(); });
      stream.on('close', () => resolve(out));
    });
  });
}

async function cleanup() {
  console.log('\n' + '='.repeat(60));
  console.log('  MOLOCHAIN BACKUP CLEANUP SCRIPT');
  console.log('  Server: ' + config.host);
  console.log('  Time: ' + new Date().toISOString());
  console.log('='.repeat(60) + '\n');

  if (!config.password) {
    log('SERVER_SSH_PASSWORD not set', 'error');
    process.exit(1);
  }

  const conn = new Client();

  conn.on('ready', async () => {
    log('SSH Connected', 'success');

    try {
      // Check disk usage before cleanup
      log('Checking disk usage before cleanup...', 'info');
      const diskBefore = await exec(conn, "df -h / | tail -1 | awk '{print $5}'");
      log(`Disk usage before: ${diskBefore.trim()}`, 'info');

      // List of files/folders to delete
      const toDelete = [
        // Main backups - old files
        '/var/www/vhosts/molochain.com/BACKUPS/DESKTOP-MOLOCHAIN-modules-6\\ \\(3\\).zip',
        '/var/www/vhosts/molochain.com/BACKUPS/backup-20251227_234954.tar.gz',
        '/var/www/vhosts/molochain.com/BACKUPS/molochain-backup-20251225T184856.tar.gz',
        '/var/www/vhosts/molochain.com/BACKUPS/httpdocs-backup-2025-12-08-2027',
        '/var/www/vhosts/molochain.com/BACKUPS/httpdocs-backup-20251210_092449',
        '/var/www/vhosts/molochain.com/BACKUPS/opt-backup-2025-12-08-2033',
        
        // Molochain backups - old files
        '/var/www/molochain/backups/rollback_20251219_233047.tar.gz',
        '/var/www/molochain/backups/molochain_backup_20250928_201550.tar.gz',
        '/var/www/molochain/backups/20250929_114546',
        '/var/www/molochain/backups/frontend-backup-20250928_215012',
        '/var/www/molochain/backups/deployment-backup-20250928_215812',
        
        // Frontend backups - old files
        '/var/www/vhosts/molochain.com/backups/httpdocs_backup_20251209_193311.tar.gz',
        '/var/www/vhosts/molochain.com/backups/httpdocs_backup_20251209_205915.tar.gz',
      ];

      log(`\nDeleting ${toDelete.length} old backup files/folders...`, 'warn');
      console.log('');

      for (const path of toDelete) {
        const shortPath = path.split('/').slice(-2).join('/');
        try {
          const exists = await exec(conn, `test -e ${path} && echo "exists" || echo "not found"`);
          if (exists.trim() === 'exists') {
            const size = await exec(conn, `du -sh ${path} 2>/dev/null | cut -f1`);
            log(`Deleting: ${shortPath} (${size.trim()})`, 'warn');
            await exec(conn, `rm -rf ${path}`);
            log(`Deleted: ${shortPath}`, 'success');
          } else {
            log(`Skipped (not found): ${shortPath}`, 'info');
          }
        } catch (e) {
          log(`Failed to delete: ${shortPath}`, 'error');
        }
      }

      // Prune Docker system
      console.log('');
      log('Pruning unused Docker resources...', 'info');
      const dockerPrune = await exec(conn, 'docker system prune -f 2>&1 | tail -5');
      console.log(dockerPrune);

      // Clean old PM2 logs
      log('Cleaning old PM2 logs...', 'info');
      await exec(conn, 'pm2 flush 2>/dev/null || true');
      log('PM2 logs flushed', 'success');

      // Clean old deployment packages
      log('Cleaning old deployment packages...', 'info');
      const deployPkgs = await exec(conn, 'cd /var/www/vhosts/molochain.com/molochain-core && ls -t molochain-deploy-*.tar.gz 2>/dev/null | tail -n +3 | xargs rm -f 2>/dev/null; echo "Done"');
      log('Old deployment packages cleaned', 'success');

      // Check disk usage after cleanup
      console.log('');
      log('Checking disk usage after cleanup...', 'info');
      const diskAfter = await exec(conn, "df -h / | tail -1 | awk '{print $5}'");
      log(`Disk usage after: ${diskAfter.trim()}`, 'success');

      // Calculate savings
      const before = parseInt(diskBefore.trim());
      const after = parseInt(diskAfter.trim());
      const saved = before - after;

      console.log('\n' + '='.repeat(60));
      log(`CLEANUP COMPLETE!`, 'success');
      log(`Disk usage reduced from ${diskBefore.trim()} to ${diskAfter.trim()}`, 'success');
      if (saved > 0) {
        log(`Space saved: ~${saved}% of disk`, 'success');
      }
      console.log('='.repeat(60) + '\n');

      conn.end();

    } catch (error) {
      log(`Cleanup error: ${error}`, 'error');
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

cleanup().catch(console.error);
