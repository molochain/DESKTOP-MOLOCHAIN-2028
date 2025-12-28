# MoloChain Communications Hub

Unified communications microservice for MoloChain platform - handles Email, SMS, WhatsApp, and Push notifications with Plesk integration.

## Features

- **Multi-Channel Support**: Email, SMS, WhatsApp, Push notifications
- **Message Queue**: Redis-based queue with priority, retry logic, and dead letter handling
- **Template System**: Reusable message templates with variable interpolation
- **Plesk Integration**: Sync email accounts with Plesk mail server
- **Analytics**: Delivery tracking, metrics, and reporting
- **High Availability**: Docker containerized with health checks

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              Communications Hub (Port 7020)         │
├─────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌───────┐ │
│  │  Email  │  │   SMS   │  │ WhatsApp │  │ Push  │ │
│  │ Channel │  │ Channel │  │ Channel  │  │Channel│ │
│  └────┬────┘  └────┬────┘  └────┬─────┘  └───┬───┘ │
│       └────────────┴───────────┴─────────────┘     │
│                     ↓                               │
│           Message Queue (Redis)                     │
│                     ↓                               │
│              REST API + Analytics                   │
└─────────────────────────────────────────────────────┘
```

## Quick Start

### Development

```bash
cd services/communications-hub
npm install
npm run dev
```

### Docker

```bash
docker-compose up -d
```

## API Endpoints

### Messages
- `POST /api/messages/send` - Queue a message for delivery
- `POST /api/messages/send-bulk` - Queue multiple messages
- `POST /api/messages/send-direct` - Send immediately (bypass queue)
- `GET /api/messages/queue/stats` - Get queue statistics

### Templates
- `GET /api/templates` - List all templates
- `POST /api/templates` - Create a template
- `GET /api/templates/:slug` - Get template by slug
- `PATCH /api/templates/:slug` - Update template
- `DELETE /api/templates/:slug` - Delete template
- `POST /api/templates/:slug/render` - Render template with variables

### Channels
- `GET /api/channels/status` - Get all channel statuses
- `GET /api/channels/:channel/status` - Get specific channel status
- `POST /api/channels/:channel/test` - Send test message

### Plesk Integration
- `GET /api/channels/plesk/connection` - Test Plesk connection
- `GET /api/channels/plesk/domains` - List domains
- `POST /api/channels/plesk/mail` - Create mail account
- `DELETE /api/channels/plesk/mail/:email` - Delete mail account

### Analytics
- `GET /api/analytics/overview` - Get delivery overview
- `GET /api/analytics/channel/:channel` - Get channel metrics
- `GET /api/analytics/timeseries` - Get time series data
- `GET /api/analytics/delivery-logs` - Get delivery logs

## Environment Variables

See `.env.example` for all configuration options.

## Channel Setup

### Email
Configure SMTP settings. Supports Plesk's Postfix relay or external SMTP.

### SMS (Twilio)
1. Create Twilio account
2. Get Account SID, Auth Token, and Phone Number
3. Set environment variables

### WhatsApp (Meta Cloud API)
1. Create Meta Business account
2. Set up WhatsApp Business API
3. Get API key and Phone Number ID
4. Set environment variables

### Push Notifications
WebSocket-based push to connected clients. No external setup required.

## Production Deployment

1. Build the Docker image:
```bash
docker build -t molochain-communications-hub .
```

2. Deploy with docker-compose:
```bash
docker-compose up -d
```

3. Configure Nginx proxy in Plesk for `communications.molochain.com`

## Health Check

```bash
curl http://localhost:7020/health
```

## License

MIT - MoloChain 2025
