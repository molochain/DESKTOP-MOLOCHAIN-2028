# Molochain API Gateway

Unified API Gateway for the Molochain Ecosystem - handles REST API routing and WebSocket proxying for all microservices.

## Architecture

```
                    ┌─────────────────────────────────────────────────────────────┐
                    │                    API Gateway (Port 4000)                   │
                    │  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
                    │  │   CORS      │  │ Rate Limit   │  │  Auth Middleware  │  │
                    │  │   Helmet    │  │ (Redis)      │  │  JWT + API Key    │  │
                    │  └─────────────┘  └──────────────┘  └───────────────────┘  │
                    │                                                              │
                    │  ┌──────────────────────────────────────────────────────┐  │
                    │  │              HTTP Proxy Middleware                     │  │
                    │  │   /api/v1/*       → molochain-core:5000              │  │
                    │  │   /api/mololink/* → mololink:7010                    │  │
                    │  │   /api/rayanava/* → rayanava-gateway:5001            │  │
                    │  │   /api/ai/*       → rayanava-ai-agents:5002          │  │
                    │  │   /api/comms/*    → communications-hub:7020          │  │
                    │  │   /api/workflows/*→ rayanava-workflows:5004          │  │
                    │  └──────────────────────────────────────────────────────┘  │
                    │                                                              │
                    │  ┌──────────────────────────────────────────────────────┐  │
                    │  │              WebSocket Gateway                         │  │
                    │  │   /ws/*           → molochain-core:5000/ws           │  │
                    │  │   /ws/mololink/*  → mololink:7010/ws                 │  │
                    │  │   /ws/rayanava/*  → rayanava-gateway:5001/ws         │  │
                    │  │   /ws/ai/*        → rayanava-ai-agents:5002/ws       │  │
                    │  │   /ws/workflows/* → rayanava-workflows:5004/ws       │  │
                    │  └──────────────────────────────────────────────────────┘  │
                    └─────────────────────────────────────────────────────────────┘
```

## Features

- **REST Proxy**: Routes API requests to backend microservices
- **WebSocket Proxy**: Handles WS upgrade and bidirectional proxying
- **Authentication**: JWT tokens and API keys (compatible with existing system)
- **Rate Limiting**: Redis-backed with per-service limits
- **Security**: Helmet, CORS, request validation
- **Observability**: Prometheus metrics, Jaeger tracing, structured logging
- **Health Checks**: Individual service health + aggregate status

## Quick Start

### Development

```bash
cd services/api-gateway
npm install
npm run dev
```

### Docker

```bash
cd services/api-gateway
docker-compose up -d
```

## API Endpoints

### Health

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Full health status with all services |
| `GET /health/services` | Detailed service health checks |
| `GET /health/ready` | Kubernetes readiness probe |
| `GET /health/live` | Kubernetes liveness probe |

### Service Routes

| Path Prefix | Target Service | Auth |
|-------------|----------------|------|
| `/api/v1/*` | Molochain Core | JWT/API Key |
| `/api/mololink/*` | Mololink Microservice | JWT |
| `/api/rayanava/*` | RAYANAVA Gateway | API Key |
| `/api/ai/*` | RAYANAVA AI Agents | API Key |
| `/api/comms/*` | Communications Hub | JWT |
| `/api/workflows/*` | RAYANAVA Workflows | API Key |
| `/api/voice/*` | RAYANAVA Voice | API Key |
| `/api/notifications/*` | RAYANAVA Notifications | JWT |
| `/api/monitoring/*` | RAYANAVA Monitoring | JWT |

### WebSocket Namespaces

| Path | Target | Description |
|------|--------|-------------|
| `/ws/*` | Molochain Core | Main app WebSockets |
| `/ws/mololink/*` | Mololink | Link tracking WebSockets |
| `/ws/rayanava/*` | RAYANAVA Gateway | AI platform WebSockets |
| `/ws/ai/*` | AI Agents | Real-time AI interactions |
| `/ws/workflows/*` | Workflows | Workflow execution updates |

## Authentication

### JWT Token

```bash
curl -H "Authorization: Bearer <jwt-token>" \
  https://api.molochain.com/api/v1/users/me
```

### API Key

```bash
curl -H "X-API-Key: mk_live_..." \
     -H "X-API-Secret: msk_..." \
  https://api.molochain.com/api/rayanava/status
```

### WebSocket Auth

```javascript
const ws = new WebSocket('wss://ws.molochain.com/ws/main?token=<jwt-token>');
```

## Rate Limits

| Service | Requests/Hour |
|---------|---------------|
| Molochain Core | 1000 |
| Mololink | 500 |
| RAYANAVA Gateway | 200 |
| RAYANAVA AI | 100 |
| Communications Hub | 500 |
| Workflows | 200 |
| Voice | 50 |

## Environment Variables

See `.env.example` for all configuration options.

## Deployment

### Production NGINX Config

```nginx
# api.molochain.com
upstream api_gateway {
    server 127.0.0.1:4000;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name api.molochain.com;

    location / {
        proxy_pass http://api_gateway;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ws.molochain.com
server {
    listen 443 ssl http2;
    server_name ws.molochain.com;

    location / {
        proxy_pass http://api_gateway;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }
}
```

## License

Proprietary - Molochain Ltd.
