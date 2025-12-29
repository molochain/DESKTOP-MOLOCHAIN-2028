import { Client } from 'ssh2';

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
    console.log('Checking current version...');
    const currentVersion = await executeSSH(client, 'curl -s http://localhost:7020/health | grep -o "version.*" | head -1 2>&1');
    console.log('Current:', currentVersion);

    console.log('Updating index.ts with /api/health endpoint...');
    
    const sedCommand = `cd ${REMOTE_PATH}/src && sed -i "s/app.get('\\/health'/const healthResponse = () => ({\\n    status: 'healthy',\\n    service: 'molochain-communications-hub',\\n    version: '1.2.0',\\n    timestamp: new Date().toISOString(),\\n    database: dbConnected ? 'connected' : 'disconnected',\\n    channels: channelManager.getChannelStatus(),\\n    queue: messageQueue.getStats(),\\n  });\\n\\n  app.get('\\/health'/g" index.ts 2>&1 || true`;
    
    const patchContent = `
    const updateCode = \`
  const healthResponse = () => ({
    status: 'healthy',
    service: 'molochain-communications-hub',
    version: '1.2.0',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    channels: channelManager.getChannelStatus(),
    queue: messageQueue.getStats(),
  });

  app.get('/health', (req, res) => {
    res.json(healthResponse());
  });

  app.get('/api/health', (req, res) => {
    res.json(healthResponse());
  });
\`;`;

    const checkHealthEndpoint = await executeSSH(client, `grep "/api/health" ${REMOTE_PATH}/src/index.ts 2>&1 || echo "NOT_FOUND"`);
    
    if (checkHealthEndpoint.includes('NOT_FOUND')) {
      console.log('/api/health endpoint not found, patching...');

      await executeSSH(client, `cd ${REMOTE_PATH}/src && sed -i '/app.get.*\\/health/,/});/c\\  const healthResponse = () => ({\\n    status: '"'"'healthy'"'"',\\n    service: '"'"'molochain-communications-hub'"'"',\\n    version: '"'"'1.2.0'"'"',\\n    timestamp: new Date().toISOString(),\\n    database: dbConnected ? '"'"'connected'"'"' : '"'"'disconnected'"'"',\\n    channels: channelManager.getChannelStatus(),\\n    queue: messageQueue.getStats(),\\n  });\\n\\n  app.get('"'"'/health'"'"', (req, res) => {\\n    res.json(healthResponse());\\n  });\\n\\n  app.get('"'"'/api/health'"'"', (req, res) => {\\n    res.json(healthResponse());\\n  });' index.ts 2>&1`);

      console.log('Rebuilding TypeScript...');
      await executeSSH(client, `cd ${REMOTE_PATH} && npm run build 2>&1 | tail -5`);

      console.log('Rebuilding Docker container...');
      const buildOutput = await executeSSH(client, `cd ${REMOTE_PATH} && docker-compose build 2>&1 | tail -10`);
      console.log(buildOutput);

      console.log('Restarting container...');
      await executeSSH(client, `cd ${REMOTE_PATH} && docker-compose up -d 2>&1`);
    } else {
      console.log('/api/health endpoint already exists');
      
      console.log('Rebuilding and restarting anyway to ensure latest...');
      await executeSSH(client, `cd ${REMOTE_PATH} && npm run build 2>&1 | tail -3`);
      const buildOutput = await executeSSH(client, `cd ${REMOTE_PATH} && docker-compose build 2>&1 | tail -5`);
      console.log(buildOutput);
      await executeSSH(client, `cd ${REMOTE_PATH} && docker-compose up -d 2>&1`);
    }

    console.log('Waiting for service...');
    await new Promise(resolve => setTimeout(resolve, 12000));

    console.log('Testing health endpoints...');
    const h1 = await executeSSH(client, 'curl -s http://localhost:7020/health 2>&1');
    console.log('/health:', h1.substring(0, 150) + '...');

    const h2 = await executeSSH(client, 'curl -s http://localhost:7020/api/health 2>&1');
    console.log('/api/health:', h2.substring(0, 150) + '...');

    if (h2.includes('"status":"healthy"')) {
      console.log('\nSUCCESS: Both health endpoints working!');
    } else {
      console.log('\nWARNING: /api/health may not be working correctly');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.end();
  }
}

main();
