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

### Core Features
- **REST Proxy**: Routes API requests to 9 backend microservices
- **WebSocket Proxy**: Handles WS upgrade and bidirectional proxying
- **Authentication**: JWT tokens + API keys (dual authentication)
- **Rate Limiting**: Redis-backed with per-service configurable limits

### Grade A+ Security
- **Sensitive Endpoint Protection**: Blocks access to `/`, `/schema`, `/docs`, `/internal`, `/swagger`
- **SQL Injection Protection**: Request body scanning and blocking
- **XSS Protection**: Script tag and event handler detection
- **Path Traversal Protection**: Blocks `../` and encoded variants
- **Metrics Protection**: `/metrics` requires authentication

### Enterprise Features
- **Circuit Breaker**: Prevents cascade failures when services are down
- **Response Caching**: Redis-backed TTL caching for GET requests
- **Request Logging**: Structured logging with Winston, audit trails
- **API Versioning**: v1/v2 support with deprecation notices
- **Request Validation**: Size limits, content-type validation
- **Health Checks**: Individual service health + aggregate status

### Observability
- **Prometheus Metrics**: Request counts, latencies, active connections
- **Jaeger Tracing**: Distributed tracing support
- **Structured Logging**: JSON logs with request IDs

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

### Prerequisites

1. **Docker Networks** - Create external networks on production server:
   ```bash
   docker network create molochain-ecosystem
   docker network create rayanava-ai_default
   ```

2. **SSL Certificates** - Obtain certificates for api.molochain.com and ws.molochain.com:
   ```bash
   certbot certonly --webroot -w /var/www/certbot -d api.molochain.com
   certbot certonly --webroot -w /var/www/certbot -d ws.molochain.com
   ```

3. **Environment Variables** - Required secrets:
   - `JWT_SECRET` - Must match molochain-core JWT secret
   - `REDIS_URL` - Redis connection (or use bundled Redis)

### Deployment Steps

1. **Build deployment package:**
   ```bash
   cd services/api-gateway
   ./scripts/prepare-deployment.sh
   ```

2. **Upload to production:**
   ```bash
   scp api-gateway-*.tar.gz user@production:/opt/molochain/
   ```

3. **Deploy on production:**
   ```bash
   cd /opt/molochain
   tar -xzf api-gateway-*.tar.gz
   export JWT_SECRET="your-production-jwt-secret"
   ./scripts/deploy.sh
   ```

4. **Configure NGINX:**
   ```bash
   sudo cp nginx/*.conf /etc/nginx/sites-available/
   sudo ln -sf /etc/nginx/sites-available/api.molochain.com.conf /etc/nginx/sites-enabled/
   sudo ln -sf /etc/nginx/sites-available/ws.molochain.com.conf /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

### Production Checklist

- [ ] Docker networks created (`molochain-ecosystem`, `rayanava-ai_default`)
- [ ] SSL certificates installed for both domains
- [ ] JWT_SECRET environment variable set
- [ ] NGINX configs installed and tested
- [ ] Health check passing: `curl https://api.molochain.com/health/live`
- [ ] WebSocket test: `wscat -c wss://ws.molochain.com/ws/main`
- [ ] Rate limiting verified
- [ ] Metrics accessible from internal network

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
