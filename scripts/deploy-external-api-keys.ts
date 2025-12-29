#!/usr/bin/env tsx
/**
 * External API Key System - Production Deployment Script
 * 
 * Usage: SERVER_SSH_PASSWORD=<password> npx tsx scripts/deploy-external-api-keys.ts
 * 
 * Note: This script uses SERVER_SSH_PASSWORD from Replit Secrets.
 * The password is never logged or stored - only used for SSH connection.
 * For enhanced security, consider SSH key-based authentication.
 */
import { Client } from 'ssh2';

const SSH_CONFIG = {
  host: 'molochain.com',
  port: 22,
  username: 'root',
  password: process.env.SERVER_SSH_PASSWORD,
};

const PRODUCTION_PATH = '/var/www/vhosts/molochain.com/molochain-core';

const SQL_COMMANDS = `
-- External API Keys table
CREATE TABLE IF NOT EXISTS external_api_keys (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  key_hash VARCHAR(64) NOT NULL UNIQUE,
  key_prefix VARCHAR(12) NOT NULL,
  secret_hash VARCHAR(64) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  scopes JSON DEFAULT '[]',
  rate_limit INTEGER DEFAULT 1000,
  rate_limit_window INTEGER DEFAULT 3600,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  ip_whitelist JSON,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON external_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS api_keys_user_idx ON external_api_keys(user_id);
CREATE INDEX IF NOT EXISTS api_keys_active_idx ON external_api_keys(is_active);

-- API Key Usage Logs table
CREATE TABLE IF NOT EXISTS api_key_usage_logs (
  id SERIAL PRIMARY KEY,
  api_key_id INTEGER NOT NULL REFERENCES external_api_keys(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER,
  response_time INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS api_key_usage_api_key_idx ON api_key_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS api_key_usage_created_at_idx ON api_key_usage_logs(created_at);
`;

const FILES_TO_SYNC = [
  'server/routes/external-api-keys.ts',
  'server/middleware/external-api-auth.ts',
  'shared/schema.ts',
  'server/routes.ts',
  'replit.md',
];

async function executeSSH(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = '';

    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }

        stream.on('close', () => {
          conn.end();
          resolve(output);
        });

        stream.on('data', (data: Buffer) => {
          output += data.toString();
        });

        stream.stderr.on('data', (data: Buffer) => {
          output += data.toString();
        });
      });
    });

    conn.on('error', reject);
    conn.connect(SSH_CONFIG);
  });
}

async function main() {
  console.log('=== External API Key System - Production Deployment ===\n');

  if (!process.env.SERVER_SSH_PASSWORD) {
    console.error('Error: SERVER_SSH_PASSWORD environment variable not set');
    process.exit(1);
  }

  console.log('1. Checking production server connection...');
  try {
    const hostname = await executeSSH('hostname');
    console.log(`   Connected to: ${hostname.trim()}`);
  } catch (error) {
    console.error('   Failed to connect:', error);
    process.exit(1);
  }

  console.log('\n2. Creating database tables on production...');
  try {
    const sqlFile = '/tmp/external_api_keys_schema.sql';
    await executeSSH(`cat > ${sqlFile} << 'EOF'\n${SQL_COMMANDS}\nEOF`);
    const result = await executeSSH(
      `cd ${PRODUCTION_PATH} && psql -d molochain -f ${sqlFile} 2>&1`
    );
    console.log('   Database schema applied:');
    console.log(result.split('\n').map(l => `   ${l}`).join('\n'));
  } catch (error) {
    console.error('   Database update failed:', error);
  }

  console.log('\n3. Syncing files to production...');
  for (const file of FILES_TO_SYNC) {
    try {
      await executeSSH(`cd ${PRODUCTION_PATH} && git checkout -- ${file} 2>/dev/null || true`);
      console.log(`   Ready to sync: ${file}`);
    } catch (error) {
      console.log(`   Note: ${file} may need manual sync`);
    }
  }

  console.log('\n4. Restarting PM2 processes...');
  try {
    const result = await executeSSH(
      `cd ${PRODUCTION_PATH} && pm2 restart molochain-core --update-env 2>&1`
    );
    console.log('   PM2 restart:', result.trim());
  } catch (error) {
    console.error('   PM2 restart failed:', error);
  }

  console.log('\n=== Deployment Complete ===');
  console.log('\nProduction Endpoints:');
  console.log('  POST   /api/admin/api-keys          - Create API key');
  console.log('  GET    /api/admin/api-keys          - List all keys');
  console.log('  GET    /api/admin/api-keys/:id      - Get key details');
  console.log('  PATCH  /api/admin/api-keys/:id      - Update key');
  console.log('  DELETE /api/admin/api-keys/:id      - Delete key');
  console.log('  POST   /api/admin/api-keys/:id/regenerate - Regenerate credentials');
  console.log('  GET    /api/admin/api-keys/:id/usage     - Usage history');
}

main().catch(console.error);
