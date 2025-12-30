import { Client } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';

const SERVER_HOST = process.env.PRODUCTION_SERVER_HOST || '31.186.24.19';
const SERVER_USER = process.env.PRODUCTION_SERVER_USER || 'root';
const SERVER_PASSWORD = process.env.SERVER_SSH_PASSWORD;
const REMOTE_PATH = process.env.API_GATEWAY_REMOTE_PATH || '/opt/molochain/services/api-gateway';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function uploadFileSFTP(client: Client, localPath: string, remotePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.sftp((err, sftp) => {
      if (err) return reject(err);
      
      const content = fs.readFileSync(localPath, 'utf8');
      const writeStream = sftp.createWriteStream(remotePath);
      
      writeStream.on('close', () => {
        sftp.end();
        resolve();
      });
      writeStream.on('error', (e: Error) => {
        sftp.end();
        reject(e);
      });
      writeStream.end(content);
    });
  });
}

async function main() {
  if (!SERVER_PASSWORD) {
    console.error('SERVER_SSH_PASSWORD not set');
    process.exit(1);
  }

  console.log('=== API Gateway Production Sync ===');
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
    console.log('Creating directory structure...');
    await executeSSH(client, `mkdir -p ${REMOTE_PATH}/src/config`);
    await executeSSH(client, `mkdir -p ${REMOTE_PATH}/src/middleware`);
    await executeSSH(client, `mkdir -p ${REMOTE_PATH}/src/routes`);
    await executeSSH(client, `mkdir -p ${REMOTE_PATH}/src/utils`);
    await executeSSH(client, `mkdir -p ${REMOTE_PATH}/nginx`);
    await executeSSH(client, `mkdir -p ${REMOTE_PATH}/scripts`);

    const filesToSync = [
      'services/api-gateway/src/index.ts',
      'services/api-gateway/src/config/services.ts',
      'services/api-gateway/src/middleware/auth.ts',
      'services/api-gateway/src/middleware/cors.ts',
      'services/api-gateway/src/middleware/metrics.ts',
      'services/api-gateway/src/middleware/rate-limit.ts',
      'services/api-gateway/src/middleware/request-id.ts',
      'services/api-gateway/src/routes/health.ts',
      'services/api-gateway/src/routes/proxy.ts',
      'services/api-gateway/src/routes/websocket.ts',
      'services/api-gateway/src/utils/logger.ts',
      'services/api-gateway/nginx/api.molochain.com.conf',
      'services/api-gateway/nginx/ws.molochain.com.conf',
      'services/api-gateway/Dockerfile',
      'services/api-gateway/docker-compose.yml',
      'services/api-gateway/package.json',
      'services/api-gateway/tsconfig.json',
      'services/api-gateway/.env.example',
      'services/api-gateway/README.md',
    ];

    console.log('Syncing API Gateway files to production...');
    let successCount = 0;
    for (const file of filesToSync) {
      const localPath = path.join(process.cwd(), file);
      const remotePath = REMOTE_PATH + '/' + file.replace('services/api-gateway/', '');
      
      if (fs.existsSync(localPath)) {
        try {
          console.log('  Uploading:', file.replace('services/api-gateway/', ''));
          await uploadFileSFTP(client, localPath, remotePath);
          successCount++;
          await delay(100);
        } catch (uploadErr) {
          console.log('  Retry uploading:', file.replace('services/api-gateway/', ''));
          await delay(500);
          try {
            await uploadFileSFTP(client, localPath, remotePath);
            successCount++;
          } catch (retryErr) {
            console.log('  Failed to upload:', file, (retryErr as Error).message);
          }
        }
      } else {
        console.log('  Skipping (not found):', file);
      }
    }

    console.log(`\nUploaded ${successCount}/${filesToSync.length} files`);

    console.log('\nAlso syncing internal API key validation endpoint to molochain-core...');
    const internalEndpointPath = path.join(process.cwd(), 'server/routes/internal-api-key-validation.ts');
    if (fs.existsSync(internalEndpointPath)) {
      console.log('  Found internal endpoint file locally');
      const remoteCoreRoutesPath = '/opt/molochain/server/routes/internal-api-key-validation.ts';
      console.log('  Uploading to: ' + remoteCoreRoutesPath);
      try {
        await executeSSH(client, 'mkdir -p /opt/molochain/server/routes');
        await uploadFileSFTP(client, internalEndpointPath, remoteCoreRoutesPath);
        console.log('  Success!');
      } catch (e) {
        console.log('  Failed:', (e as Error).message);
      }
    } else {
      console.log('  Local file not found:', internalEndpointPath);
    }

    console.log('\n=== Installing all dependencies on production ===');
    const npmInstall = await executeSSH(client, `cd ${REMOTE_PATH} && npm install 2>&1 | tail -10`);
    console.log(npmInstall || '(npm install completed)');

    console.log('\n=== Building TypeScript on production ===');
    const tscBuild = await executeSSH(client, `cd ${REMOTE_PATH} && npm run build 2>&1 | tail -10`);
    console.log(tscBuild || '(build completed)');

    console.log('\n=== Checking Docker status ===');
    const dockerPs = await executeSSH(client, 'docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(gateway|redis)" || echo "No gateway containers running"');
    console.log(dockerPs);

    console.log('\n=== Sync Complete ===');
    console.log('Files synced to:', REMOTE_PATH);
    console.log('\nTo deploy the gateway, run on production:');
    console.log(`  cd ${REMOTE_PATH}`);
    console.log('  docker network create molochain-ecosystem 2>/dev/null || true');
    console.log('  docker network create rayanava-ai_default 2>/dev/null || true');
    console.log('  export JWT_SECRET="your-jwt-secret"');
    console.log('  docker-compose up -d --build');

  } catch (error) {
    console.error('Sync error:', error);
  } finally {
    client.end();
    console.log('\nSSH connection closed.');
  }
}

main().catch(console.error);
