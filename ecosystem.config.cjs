// Load environment variables from .env file
require('dotenv').config({ path: '/var/www/vhosts/molochain.com/molochain-core/.env' });

module.exports = {
  apps: [{
    name: 'molochain-core',
    script: 'dist/index.js',
    cwd: '/var/www/vhosts/molochain.com/molochain-core',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '512M',
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    restart_delay: 1000,
    autorestart: true,
    watch: false,
    node_args: ['--max-old-space-size=512', '--optimize-for-size'],
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      COMMS_HUB_URL: 'http://localhost:7020',
      ...process.env
    },
    error_file: '/var/www/vhosts/molochain.com/molochain-core/logs/pm2-error.log',
    out_file: '/var/www/vhosts/molochain.com/molochain-core/logs/pm2-out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    kill_timeout: 5000,
    listen_timeout: 8000,
    shutdown_with_message: true
  }]
};
