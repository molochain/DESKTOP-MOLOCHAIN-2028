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
      let errorOutput = '';
      stream.on('data', (data: Buffer) => {
        output += data.toString();
        console.log(data.toString());
      });
      stream.stderr.on('data', (data: Buffer) => {
        errorOutput += data.toString();
        console.error(data.toString());
      });
      stream.on('close', (code: number) => {
        if (code !== 0 && errorOutput) {
          console.warn(`Command exited with code ${code}`);
        }
        resolve(output);
      });
    });
  });
}

async function uploadFile(client: Client, localPath: string, remotePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.sftp((err, sftp) => {
      if (err) return reject(err);
      const readStream = fs.createReadStream(localPath);
      const writeStream = sftp.createWriteStream(remotePath);
      writeStream.on('close', () => {
        console.log(`✅ Uploaded ${localPath} to ${remotePath}`);
        resolve();
      });
      writeStream.on('error', reject);
      readStream.pipe(writeStream);
    });
  });
}

async function main() {
  if (!SERVER_PASSWORD) {
    console.error('❌ SERVER_SSH_PASSWORD environment variable not set');
    process.exit(1);
  }

  console.log('🚀 Deploying Communications Hub to production server...');
  console.log(`📍 Target: ${SERVER_USER}@${SERVER_HOST}`);

  const client = new Client();

  await new Promise<void>((resolve, reject) => {
    client.on('ready', () => {
      console.log('✅ SSH connection established');
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
    console.log('\n📂 Creating directory structure...');
    await executeSSH(client, `mkdir -p ${REMOTE_PATH}`);

    console.log('\n📤 Uploading Communications Hub package...');
    await uploadFile(client, '/tmp/communications-hub.tar.gz', '/tmp/communications-hub.tar.gz');

    console.log('\n📦 Extracting package...');
    await executeSSH(client, `cd ${REMOTE_PATH} && rm -rf src config *.ts *.json *.yml *.md Dockerfile 2>/dev/null || true`);
    await executeSSH(client, `tar -xzf /tmp/communications-hub.tar.gz -C ${REMOTE_PATH}`);
    await executeSSH(client, `rm /tmp/communications-hub.tar.gz`);

    console.log('\n📋 Checking if .env file exists...');
    const envCheck = await executeSSH(client, `test -f ${REMOTE_PATH}/.env && echo "exists" || echo "missing"`);
    
    if (envCheck.trim() === 'missing') {
      console.log('⚠️  Creating .env file from example...');
      await executeSSH(client, `cp ${REMOTE_PATH}/.env.example ${REMOTE_PATH}/.env`);
      console.log('⚠️  NOTE: You need to update the .env file with actual credentials');
    } else {
      console.log('✅ .env file already exists');
    }

    console.log('\n🐳 Building and starting Docker containers...');
    await executeSSH(client, `cd ${REMOTE_PATH} && docker-compose down 2>/dev/null || true`);
    await executeSSH(client, `cd ${REMOTE_PATH} && docker-compose build --no-cache`);
    await executeSSH(client, `cd ${REMOTE_PATH} && docker-compose up -d`);

    console.log('\n🔍 Checking container status...');
    await executeSSH(client, `docker ps --filter "name=communications" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"`);

    console.log('\n⏳ Waiting for service to start (10 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log('\n🏥 Testing health endpoint...');
    const healthCheck = await executeSSH(client, `curl -s http://localhost:7020/health || echo "Service not responding"`);
    console.log('Health check response:', healthCheck);

    console.log('\n✅ Communications Hub deployment complete!');
    console.log(`🌐 Service URL: http://localhost:7020`);
    console.log(`📊 Dashboard: https://molochain.com/admin/multi-channel`);

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  } finally {
    client.end();
  }
}

main().catch(console.error);
