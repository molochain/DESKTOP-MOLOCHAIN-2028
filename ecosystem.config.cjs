// Load environment variables from .env file
require('dotenv').config({ path: '/var/www/vhosts/molochain.com/molochain-core/.env' });

module.exports = {
  apps: [{
    name: 'molochain-core',
    script: 'dist/index.js',
    cwd: '/var/www/vhosts/molochain.com/molochain-core',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      COMMS_HUB_URL: 'http://localhost:7020',
      ...process.env
    },
    error_file: '/var/www/vhosts/molochain.com/molochain-core/logs/pm2-error.log',
    out_file: '/var/www/vhosts/molochain.com/molochain-core/logs/pm2-out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
