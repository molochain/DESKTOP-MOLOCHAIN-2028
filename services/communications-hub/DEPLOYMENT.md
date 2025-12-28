# Communications Hub Deployment Guide

## Overview
The Communications Hub is a standalone microservice for multi-channel messaging (Email, SMS, WhatsApp, Push notifications). It runs on port 7020 and uses Redis for message queue management.

## Prerequisites
- Docker and Docker Compose installed
- Redis (included in docker-compose.yml)
- Production server access (31.186.24.19)
- Nginx configured for subdomain routing

## Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

### Required Configuration:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | 7020 |
| `REDIS_URL` | Redis connection URL | redis://localhost:6379 |
| `SMTP_HOST` | SMTP server hostname | mail.molochain.com |
| `SMTP_PORT` | SMTP port | 587 |
| `SMTP_USERNAME` | SMTP authentication username | - |
| `SMTP_PASSWORD` | SMTP authentication password | - |
| `SMTP_SKIP_TLS_VERIFY` | Skip TLS verification (dev only) | false |
| `FROM_EMAIL` | Default sender email | noreply@molochain.com |
| `FROM_NAME` | Default sender name | MoloChain |
| `TWILIO_ACCOUNT_SID` | Twilio account SID (for SMS) | - |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | - |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | - |
| `WHATSAPP_TOKEN` | Meta WhatsApp API token | - |
| `WHATSAPP_PHONE_ID` | WhatsApp phone number ID | - |
| `PLESK_API_URL` | Plesk API URL (optional) | - |
| `PLESK_API_KEY` | Plesk API key (optional) | - |
| `PLESK_SKIP_TLS_VERIFY` | Skip Plesk TLS verification | false |

## Deployment Steps

### 1. Build and Deploy with Docker Compose

```bash
cd services/communications-hub

# Build the image
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f communications-hub
```

### 2. Configure Nginx Reverse Proxy

Add to your Nginx configuration for `communications.molochain.com`:

```nginx
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

    location / {
        proxy_pass http://127.0.0.1:7020;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
```

### 3. Main Platform Integration

Set the environment variable in your main platform:

```bash
# For Docker deployments
COMMS_HUB_URL=http://communications-hub:7020

# For separate server deployments
COMMS_HUB_URL=https://communications.molochain.com
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/status` | GET | Channel status |
| `/api/messages` | POST | Send message |
| `/api/messages/:id` | GET | Get message status |
| `/api/templates` | GET/POST | Manage templates |
| `/api/templates/:id` | GET/PUT/DELETE | Template CRUD |
| `/api/analytics` | GET | Delivery analytics |
| `/api/plesk/accounts` | GET | List Plesk mail accounts |

## Monitoring

Check service health:
```bash
curl http://localhost:7020/health
```

View queue stats:
```bash
curl http://localhost:7020/api/status
```

## Troubleshooting

### Redis Connection Issues
```bash
docker-compose logs redis
docker exec -it comms-redis redis-cli ping
```

### SMTP Connection Issues
- Verify `SMTP_SKIP_TLS_VERIFY=false` (secure default)
- Check firewall allows port 587/465
- Test with: `openssl s_client -connect mail.molochain.com:587 -starttls smtp`

### Plesk API Issues
- Ensure API key has mail management permissions
- Verify `PLESK_SKIP_TLS_VERIFY=false` for production
