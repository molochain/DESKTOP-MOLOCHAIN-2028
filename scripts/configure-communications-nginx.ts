import { Client } from 'ssh2';

const SERVER_HOST = '31.186.24.19';
const SERVER_USER = 'root';
const SERVER_PASSWORD = process.env.SERVER_SSH_PASSWORD;

const NGINX_CONFIG = `
# Communications Hub API - Nginx Configuration
# Location: /etc/nginx/conf.d/communications.molochain.com.conf

server {
    listen 80;
    server_name communications.molochain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name communications.molochain.com;

    ssl_certificate /etc/letsencrypt/live/molochain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/molochain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    access_log /var/log/nginx/communications.access.log;
    error_log /var/log/nginx/communications.error.log;

    location / {
        proxy_pass http://127.0.0.1:7020;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /health {
        proxy_pass http://127.0.0.1:7020/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
`;

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

  console.log('🔧 Configuring Nginx for communications.molochain.com...');

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
    console.log('\n📝 Writing Nginx configuration...');
    const escapedConfig = NGINX_CONFIG.replace(/'/g, "'\\''");
    await executeSSH(client, `echo '${escapedConfig}' > /etc/nginx/conf.d/communications.molochain.com.conf`);

    console.log('\n🔍 Testing Nginx configuration...');
    await executeSSH(client, 'nginx -t');

    console.log('\n🔄 Reloading Nginx...');
    await executeSSH(client, 'systemctl reload nginx');

    console.log('\n✅ Nginx configuration complete!');
    console.log('🌐 Communications API available at: https://communications.molochain.com');

    console.log('\n🧪 Testing subdomain...');
    await executeSSH(client, 'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:7020/health');

  } catch (error) {
    console.error('❌ Configuration failed:', error);
    throw error;
  } finally {
    client.end();
  }
}

main().catch(console.error);
