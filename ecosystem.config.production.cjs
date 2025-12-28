/**
 * PM2 Production Configuration for Molochain Platform
 * 
 * IMPORTANT: Sensitive environment variables are loaded from /var/www/molochain/shared/.env
 * This file should NOT contain any secrets or credentials.
 * 
 * Required environment variables in .env file:
 * - DATABASE_URL
 * - SESSION_SECRET
 * - JWT_SECRET
 */
module.exports = {
  apps: [
    {
      name: 'molochain-core',
      script: './index.js',
      cwd: '/var/www/molochain/current',
      instances: 1,
      exec_mode: 'fork',
      
      // Non-sensitive configuration only
      // Sensitive values loaded from .env file via dotenv
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        HOST: '0.0.0.0',
        VITE_API_CMS_BASE_URL: 'https://cms.molochain.com/api',
        VITE_API_OTMS_BASE_URL: 'https://opt.molochain.com/v1',
        VITE_API_GODLAYER_BASE_URL: 'https://molochain.com/api',
        // Cross-subdomain SSO - all subdomains must be listed
        CORS_ORIGINS: 'https://molochain.com,https://www.molochain.com,https://admin.molochain.com,https://app.molochain.com,https://api.molochain.com,https://auth.molochain.com,https://opt.molochain.com,https://mololink.molochain.com,https://cms.molochain.com',
        ALLOWED_ORIGINS: 'https://molochain.com,https://www.molochain.com,https://admin.molochain.com,https://app.molochain.com,https://api.molochain.com,https://auth.molochain.com,https://opt.molochain.com,https://mololink.molochain.com,https://cms.molochain.com',
        SESSION_SECURE: 'true',
        LOG_LEVEL: 'info',
        FEATURE_AI_ENABLED: 'false',
      },
      
      node_args: '--max-old-space-size=1536',
      
      max_memory_restart: '1500M',
      
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      min_uptime: '10s',
      
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      combine_logs: true,
      merge_logs: true,
      
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 10000,
      
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git', 'dist'],
      
      source_map_support: false,
    },
  ],
};
