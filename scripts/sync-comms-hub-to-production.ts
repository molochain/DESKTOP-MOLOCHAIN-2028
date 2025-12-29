import { Client } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';

const SERVER_HOST = '31.186.24.19';
const SERVER_USER = 'root';
const SERVER_PASSWORD = process.env.SERVER_SSH_PASSWORD;
const REMOTE_PATH = '/opt/molochain/services/communications-hub';

async function executeSSH(client: Client, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    client.exec(command, (err, stream) => {
      if (err) return reject(err);
      let output = '';
      stream.on('data', (data: Buffer) => { output += data.toString(); });
      stream.stderr.on('data', (data: Buffer) => { output += data.toString(); });
      stream.on('close', () => resolve(output.trim()));
    });
  });
}

async function uploadFile(client: Client, localPath: string, remotePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.sftp((err, sftp) => {
      if (err) return reject(err);
      
      const content = fs.readFileSync(localPath, 'utf8');
      const writeStream = sftp.createWriteStream(remotePath);
      
      writeStream.on('close', () => resolve());
      writeStream.on('error', reject);
      writeStream.end(content);
    });
  });
}

async function main() {
  if (!SERVER_PASSWORD) {
    console.error('SERVER_SSH_PASSWORD not set');
    process.exit(1);
  }

  console.log('Connecting to production server...');
  const client = new Client();

  await new Promise<void>((resolve, reject) => {
    client.on('ready', () => {
      console.log('SSH connected to', SERVER_HOST);
      resolve();
    });
    client.on('error', reject);
    client.connect({
      host: SERVER_HOST,
      port: 22,
      username: SERVER_USER,
      password: SERVER_PASSWORD,
    });
  });

  try {
    console.log('Syncing Communications Hub files to production...');

    const filesToSync = [
      'services/communications-hub/src/index.ts',
      'services/communications-hub/src/api/messages.ts',
      'services/communications-hub/src/api/channels.ts',
      'services/communications-hub/src/api/templates.ts',
      'services/communications-hub/src/api/analytics.ts',
      'services/communications-hub/src/api/preferences.ts',
      'services/communications-hub/src/channels/channel-manager.ts',
      'services/communications-hub/src/channels/email-channel.ts',
      'services/communications-hub/src/channels/whatsapp-channel.ts',
      'services/communications-hub/src/channels/sms-channel.ts',
      'services/communications-hub/src/channels/push-channel.ts',
      'services/communications-hub/src/db/operations.ts',
      'services/communications-hub/src/db/schema.ts',
      'services/communications-hub/src/db/index.ts',
      'services/communications-hub/src/queue/message-queue.ts',
      'services/communications-hub/src/plesk/plesk-client.ts',
      'services/communications-hub/src/utils/logger.ts',
      'services/communications-hub/Dockerfile',
      'services/communications-hub/docker-compose.yml',
      'services/communications-hub/package.json',
      'services/communications-hub/tsconfig.json',
    ];

    await executeSSH(client, 'mkdir -p ' + REMOTE_PATH + '/src/api');
    await executeSSH(client, 'mkdir -p ' + REMOTE_PATH + '/src/channels');
    await executeSSH(client, 'mkdir -p ' + REMOTE_PATH + '/src/db');
    await executeSSH(client, 'mkdir -p ' + REMOTE_PATH + '/src/queue');
    await executeSSH(client, 'mkdir -p ' + REMOTE_PATH + '/src/plesk');
    await executeSSH(client, 'mkdir -p ' + REMOTE_PATH + '/src/utils');

    for (const file of filesToSync) {
      const localPath = path.join(process.cwd(), file);
      const remotePath = REMOTE_PATH + '/' + file.replace('services/communications-hub/', '');
      
      if (fs.existsSync(localPath)) {
        console.log('  Uploading:', file);
        await uploadFile(client, localPath, remotePath);
      } else {
        console.log('  Skipping (not found):', file);
      }
    }

    console.log('Installing dependencies...');
    const npmOutput = await executeSSH(client, 'cd ' + REMOTE_PATH + ' && npm install --omit=dev 2>&1');
    console.log(npmOutput.substring(0, 500));

    console.log('Building TypeScript...');
    const buildOutput = await executeSSH(client, 'cd ' + REMOTE_PATH + ' && npm run build 2>&1');
    console.log(buildOutput.substring(0, 500));

    console.log('Rebuilding Docker container...');
    const buildContainerOutput = await executeSSH(client, 'cd ' + REMOTE_PATH + ' && docker-compose build --no-cache 2>&1');
    console.log(buildContainerOutput.substring(0, 1000));

    console.log('Restarting container...');
    const restartOutput = await executeSSH(client, 'cd ' + REMOTE_PATH + ' && docker-compose up -d 2>&1');
    console.log(restartOutput);

    console.log('Waiting for service to start...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log('Testing health endpoints...');
    const healthCheck1 = await executeSSH(client, 'curl -s http://localhost:7020/health 2>&1');
    console.log('/health response:', healthCheck1.substring(0, 200));

    const healthCheck2 = await executeSSH(client, 'curl -s http://localhost:7020/api/health 2>&1');
    console.log('/api/health response:', healthCheck2.substring(0, 200));

    console.log('Deployment complete!');

  } catch (error) {
    console.error('Deployment error:', error);
  } finally {
    client.end();
  }
}

main();
