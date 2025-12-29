import { Client } from 'ssh2';

const SERVER_HOST = '31.186.24.19';
const SERVER_USER = 'root';
const SERVER_PASSWORD = process.env.SERVER_SSH_PASSWORD;

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
      console.log('Connected to', SERVER_HOST);
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
    const appDir = '/var/www/vhosts/molochain.com/molochain-core';
    const envPath = appDir + '/.env';

    console.log('Checking if .env exists...');
    const envExists = await executeSSH(client, 'test -f ' + envPath + ' && echo "YES" || echo "NO"');
    console.log('.env exists:', envExists);

    console.log('Checking current feature flag...');
    const current = await executeSSH(client, 'grep FEATURE_COMMS_HUB_ENABLED ' + envPath + ' 2>/dev/null || echo "NOT_SET"');
    console.log('Current value:', current);

    console.log('\\nUpdating .env file...');
    await executeSSH(client, "sed -i '/^FEATURE_COMMS_HUB_ENABLED=/d' " + envPath);
    await executeSSH(client, 'echo "FEATURE_COMMS_HUB_ENABLED=true" >> ' + envPath);

    console.log('Verifying...');
    const newValue = await executeSSH(client, 'grep FEATURE_COMMS_HUB_ENABLED ' + envPath);
    console.log('New value:', newValue);

    console.log('\\nRestarting molochain-core...');
    const restart = await executeSSH(client, 'pm2 restart molochain-core 2>&1 | tail -15');
    console.log(restart);

    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\\nVerifying app is healthy...');
    const health = await executeSSH(client, 'curl -s http://localhost:5000/api/health 2>&1 | head -100');
    console.log('Health check:', health.substring(0, 200) + '...');

    console.log('\\nFEATURE_COMMS_HUB_ENABLED=true is now active in production!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.end();
  }
}

main();
