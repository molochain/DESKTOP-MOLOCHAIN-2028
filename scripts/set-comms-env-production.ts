import { Client } from 'ssh2';

const SERVER_HOST = '31.186.24.19';
const SERVER_USER = 'root';
const SERVER_PASSWORD = process.env.SERVER_SSH_PASSWORD;

async function executeSSH(client: Client, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    client.exec(command, (err, stream) => {
      if (err) return reject(err);
      let output = '';
      stream.on('data', (data: Buffer) => {
        output += data.toString();
        console.log(data.toString());
      });
      stream.stderr.on('data', (data: Buffer) => {
        console.error(data.toString());
      });
      stream.on('close', () => resolve(output));
    });
  });
}

async function main() {
  if (!SERVER_PASSWORD) {
    console.error('❌ SERVER_SSH_PASSWORD not set');
    process.exit(1);
  }

  console.log('🔧 Setting COMMS_HUB_URL environment variable on production...');

  const client = new Client();

  await new Promise<void>((resolve, reject) => {
    client.on('ready', () => {
      console.log('✅ SSH connected');
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
    console.log('\n📋 Checking current ecosystem config...');
    const checkResult = await executeSSH(client, 'grep -c "COMMS_HUB_URL" /opt/molochain/core/ecosystem.config.js || echo "0"');
    
    if (checkResult.trim() !== '0') {
      console.log('✅ COMMS_HUB_URL already configured');
    } else {
      console.log('📝 Adding COMMS_HUB_URL to ecosystem config...');
      await executeSSH(client, `sed -i "s/env: {/env: {\\n        COMMS_HUB_URL: 'http:\\/\\/localhost:7020',/" /opt/molochain/core/ecosystem.config.js`);
    }

    console.log('\n🔄 Reloading PM2 with updated environment...');
    await executeSSH(client, 'cd /opt/molochain/core && pm2 reload molochain-core --update-env');

    console.log('\n💾 Saving PM2 state...');
    await executeSSH(client, 'pm2 save');

    console.log('\n✅ Production environment updated!');
    console.log('🔗 Main platform now connects to Communications Hub at http://localhost:7020');

  } catch (error) {
    console.error('❌ Failed:', error);
    throw error;
  } finally {
    client.end();
  }
}

main().catch(console.error);
