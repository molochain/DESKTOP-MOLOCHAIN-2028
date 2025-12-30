import { Client } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';

const REMOTE_PATH = '/opt/molochain/services/api-gateway';
const JWT_SECRET = process.env.JWT_SECRET || '';

function executeSSH(client: Client, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    client.exec(command, (err, stream) => {
      if (err) reject(err);
      let output = '';
      stream.on('data', (data: Buffer) => { output += data.toString(); });
      stream.stderr.on('data', (data: Buffer) => { output += data.toString(); });
      stream.on('close', () => resolve(output));
    });
  });
}

async function uploadFileSFTP(client: Client, localPath: string, remotePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.sftp((err, sftp) => {
      if (err) reject(err);
      const content = fs.readFileSync(localPath, 'utf-8');
      sftp.writeFile(remotePath, content, { mode: 0o644 }, (writeErr) => {
        if (writeErr) reject(writeErr);
        else resolve();
      });
    });
  });
}

async function main(): Promise<void> {
  console.log('=== API Gateway Deployment ===\n');

  if (!JWT_SECRET) {
    console.error('ERROR: JWT_SECRET environment variable is required');
    process.exit(1);
  }

  const client = new Client();
  
  await new Promise<void>((resolve, reject) => {
    client.on('ready', resolve);
    client.on('error', reject);
    client.connect({
      host: process.env.PRODUCTION_SERVER_HOST || '31.186.24.19',
      port: 22,
      username: 'root',
      password: process.env.SERVER_SSH_PASSWORD
    });
  });

  console.log('✓ SSH connected\n');

  console.log('--- Syncing docker-compose.yml ---');
  const dockerComposePath = path.join(process.cwd(), 'services/api-gateway/docker-compose.yml');
  await uploadFileSFTP(client, dockerComposePath, `${REMOTE_PATH}/docker-compose.yml`);
  console.log('  Updated docker-compose.yml\n');

  console.log('--- Stopping existing containers ---');
  const stopOutput = await executeSSH(client, `cd ${REMOTE_PATH} && docker-compose down 2>&1 || echo "No containers to stop"`);
  console.log(stopOutput);

  console.log('--- Building and starting containers ---');
  const buildOutput = await executeSSH(client, `cd ${REMOTE_PATH} && JWT_SECRET="${JWT_SECRET}" docker-compose up -d --build 2>&1`);
  console.log(buildOutput);

  console.log('\n--- Checking container status ---');
  const statusOutput = await executeSSH(client, 'docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "gateway|redis"');
  console.log(statusOutput);

  console.log('\n--- Testing health endpoint ---');
  await new Promise(resolve => setTimeout(resolve, 5000));
  const healthOutput = await executeSSH(client, 'curl -s http://localhost:4000/health/live 2>&1 | head -20');
  console.log(healthOutput);

  console.log('\n--- NGINX Configuration ---');
  console.log('Copy configs to NGINX:');
  console.log('  sudo cp /opt/molochain/services/api-gateway/nginx/*.conf /etc/nginx/sites-available/');
  console.log('  sudo ln -sf /etc/nginx/sites-available/api.molochain.com.conf /etc/nginx/sites-enabled/');
  console.log('  sudo ln -sf /etc/nginx/sites-available/ws.molochain.com.conf /etc/nginx/sites-enabled/');
  console.log('  sudo nginx -t && sudo systemctl reload nginx');

  client.end();
  console.log('\n=== Deployment Complete ===');
}

main().catch(err => {
  console.error('Deployment failed:', err.message);
  process.exit(1);
});
