import { Client } from 'ssh2';

const SERVER_HOST = '31.186.24.19';
const SERVER_USER = 'root';
const SERVER_PASSWORD = process.env.SERVER_SSH_PASSWORD;
const REMOTE_PATH = '/opt/molochain/services/communications-hub';

const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function executeSSH(client: Client, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    client.exec(command, (err, stream) => {
      if (err) return reject(err);
      let output = '';
      stream.on('data', (data: Buffer) => { output += data.toString(); });
      stream.stderr.on('data', (data: Buffer) => { console.error(data.toString()); });
      stream.on('close', () => resolve(output.trim()));
    });
  });
}

async function main() {
  if (!SERVER_PASSWORD) {
    console.error('❌ SERVER_SSH_PASSWORD not set');
    process.exit(1);
  }
  
  if (!WHATSAPP_API_KEY || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error('❌ WhatsApp credentials not set');
    console.log('WHATSAPP_API_KEY:', WHATSAPP_API_KEY ? 'SET' : 'MISSING');
    console.log('WHATSAPP_PHONE_NUMBER_ID:', WHATSAPP_PHONE_NUMBER_ID ? 'SET' : 'MISSING');
    process.exit(1);
  }

  console.log('🔌 Connecting to production server...');
  const client = new Client();

  await new Promise<void>((resolve, reject) => {
    client.on('ready', () => {
      console.log('✅ SSH connected to', SERVER_HOST);
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
    console.log('📋 Updating WhatsApp credentials in production .env...');
    
    const envPath = REMOTE_PATH + '/.env';
    const envExists = await executeSSH(client, 'test -f ' + envPath + ' && echo "yes" || echo "no"');
    
    if (envExists === 'no') {
      console.log('⚠️  No .env file found, creating one...');
      await executeSSH(client, 'touch ' + envPath);
    }

    await executeSSH(client, "sed -i '/^WHATSAPP_API_KEY=/d' " + envPath + " 2>/dev/null || true");
    await executeSSH(client, "sed -i '/^WHATSAPP_PHONE_NUMBER_ID=/d' " + envPath + " 2>/dev/null || true");
    await executeSSH(client, 'echo "WHATSAPP_API_KEY=' + WHATSAPP_API_KEY + '" >> ' + envPath);
    await executeSSH(client, 'echo "WHATSAPP_PHONE_NUMBER_ID=' + WHATSAPP_PHONE_NUMBER_ID + '" >> ' + envPath);
    
    console.log('✅ WhatsApp credentials added to .env');

    console.log('🔄 Restarting Communications Hub container...');
    const restartOutput = await executeSSH(client, 'cd ' + REMOTE_PATH + ' && docker-compose restart 2>&1');
    console.log(restartOutput);
    
    console.log('⏳ Waiting for service to restart...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    console.log('🏥 Checking channel status...');
    const status = await executeSSH(client, 'curl -s http://localhost:7020/api/channels/status 2>&1');
    console.log('Channel Status:', status);

    console.log('\n✅ WhatsApp credentials deployed to production!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.end();
  }
}

main();
