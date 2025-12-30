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
                    │  │   /api/v2/*       → molochain-core:5000 (v2 API)     │  │
                    │  │   /api/mololink/* → mololink:7010                    │  │
                    │  │   /api/rayanava/* → rayanava-gateway:5001            │  │
                    │  │   /api/ai/*       → rayanava-ai-agents:5002          │  │
                    │  │   /api/comms/*    → communications-hub:7020          │  │
                    │  │   /api/workflows/*→ rayanava-workflows:5004          │  │
                    │  │   /api/voice/*    → rayanava-voice:5005              │  │
                    │  │   /api/notifications/* → rayanava-notifications:5006 │  │
                    │  │   /api/monitoring/*→ rayanava-monitoring:5007        │  │
                    │  └──────────────────────────────────────────────────────┘  │
                    │                                                              │
                    │  ┌──────────────────────────────────────────────────────┐  │
                    │  │              WebSocket Gateway                         │  │
                    │  │   /ws/*           → molochain-core:5000/ws           │  │
                    │  │   /ws/v2/*        → molochain-core:5000/ws/v2        │  │
                    │  │   /ws/mololink/*  → mololink:7010/ws                 │  │
                    │  │   /ws/rayanava/*  → rayanava-gateway:5001/ws         │  │
                    │  │   /ws/ai/*        → rayanava-ai-agents:5002/ws       │  │
                    │  │   /ws/workflows/* → rayanava-workflows:5004/ws       │  │
                    │  └──────────────────────────────────────────────────────┘  │
                    └─────────────────────────────────────────────────────────────┘
```

## Features

### Core Features
- **REST Proxy**: Routes API requests to 10 backend microservices
- **WebSocket Proxy**: Handles WS upgrade and bidirectional proxying with metrics
- **Authentication**: JWT tokens + API keys (dual authentication)
- **Rate Limiting**: Redis-backed with per-service configurable limits

### Grade A+ Security
- **Sensitive Endpoint Protection**: Blocks access to `/`, `/schema`, `/docs`, `/internal`, `/swagger`
- **SQL Injection Protection**: Request body scanning and blocking
- **XSS Protection**: Script tag and event handler detection
- **Path Traversal Protection**: Blocks `../` and encoded variants
- **Metrics Protection**: `/metrics` accessible only from internal network (403 externally)
- **Port Binding**: Port 4000 bound to 127.0.0.1 only (not exposed externally)

### Enterprise Features
- **Circuit Breaker**: Prevents cascade failures when services are down
- **Response Caching**: Redis-backed with per-service TTLs (60s core, 120s mololink)
- **Request Logging**: Structured logging with Winston, audit trails
- **API Versioning**: v1/v2 support with separate service configurations
- **Request Validation**: Size limits, content-type validation
- **Health Checks**: Individual service health + aggregate status

### Observability
- **Prometheus Metrics**: HTTP requests, latencies, WebSocket connections/messages
- **Jaeger Tracing**: Distributed tracing support
- **Structured Logging**: JSON logs with request IDs
- **Grafana Dashboard**: https://grafana.molochain.com/d/api-gateway-overview

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
| `GET /health/live` | Kubernetes liveness probe |
| `GET /health/ready` | Kubernetes readiness probe |
| `GET /health/services` | Detailed service health checks (10 services) |

### Service Routes (10 Services)

| Path Prefix | Target Service | Auth | Rate Limit |
|-------------|----------------|------|------------|
| `/api/v1/*` | Molochain Core | JWT/API Key | 1000/hr |
| `/api/v2/*` | Molochain Core v2 | JWT/API Key | 1500/hr |
| `/api/mololink/*` | Mololink Microservice | JWT | 500/hr |
| `/api/rayanava/*` | RAYANAVA Gateway | API Key | 200/hr |
| `/api/ai/*` | RAYANAVA AI Agents | API Key | 100/hr |
| `/api/comms/*` | Communications Hub | JWT | 500/hr |
| `/api/workflows/*` | RAYANAVA Workflows | API Key | 200/hr |
| `/api/voice/*` | RAYANAVA Voice | API Key | 50/hr |
| `/api/notifications/*` | RAYANAVA Notifications | JWT | 500/hr |
| `/api/monitoring/*` | RAYANAVA Monitoring | JWT | 200/hr |

### WebSocket Namespaces

| Path | Target | Description |
|------|--------|-------------|
| `/ws/*` | Molochain Core | Main app WebSockets |
| `/ws/v2/*` | Molochain Core v2 | v2 API WebSockets |
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

## Caching

Per-service cache TTLs are configured for optimal performance:

| Service | TTL | Cacheable Paths |
|---------|-----|-----------------|
| molochain-core | 60s | /public/, /catalog/, /config/, /products, /categories |
| molochain-core-v2 | 60s | /public/, /catalog/, /config/, /products, /categories |
| mololink | 120s | /public/ |

## Prometheus Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `gateway_http_requests_total` | Counter | Total HTTP requests by method/path/status |
| `gateway_http_request_duration_seconds` | Histogram | Request duration |
| `gateway_ws_connections_active` | Gauge | Active WebSocket connections |
| `gateway_ws_messages_total` | Counter | WebSocket messages by direction |
| `gateway_rate_limit_hits_total` | Counter | Rate limit hits |
| `gateway_circuit_breaker_state` | Gauge | Circuit breaker state per service |

## Load Testing

Artillery load test scripts are available in `tests/load/`:

```bash
cd tests/load
./run-tests.sh all      # Run all tests
./run-tests.sh rest     # REST endpoints only
./run-tests.sh ws       # WebSocket only
./run-tests.sh stress   # Stress test
```

## File Structure

```
services/api-gateway/
├── src/
│   ├── index.ts                 # Entry point
│   ├── config/
│   │   └── services.ts          # Service configurations (10 services)
│   ├── middleware/
│   │   ├── api-versioning.ts    # v1/v2 version handling
│   │   ├── auth.ts              # JWT + API Key authentication
│   │   ├── cache.ts             # Redis response caching
│   │   ├── circuit-breaker.ts   # Circuit breaker pattern
│   │   ├── cors.ts              # CORS configuration
│   │   ├── metrics.ts           # Prometheus metrics
│   │   ├── rate-limit.ts        # Redis rate limiting
│   │   ├── request-id.ts        # Request ID generation
│   │   ├── request-logger.ts    # Structured logging
│   │   ├── request-validation.ts# Request size/type validation
│   │   └── security.ts          # Security protections
│   ├── routes/
│   │   ├── health.ts            # Health check endpoints
│   │   ├── proxy.ts             # HTTP proxy routing
│   │   └── websocket.ts         # WebSocket proxy with metrics
│   └── utils/
│       └── logger.ts            # Winston logger
├── tests/
│   └── load/
│       ├── rest-load-test.yml   # REST load test
│       ├── websocket-load-test.yml # WebSocket load test
│       ├── stress-test.yml      # Stress test
│       └── run-tests.sh         # Test orchestrator
├── scripts/
│   ├── production-scan.sh       # Production verification
│   └── integration-check.sh     # Integration testing
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## Production Deployment

### Current Status

- **Server**: 31.186.24.19 (zen-agnesi.31-186-24-19.plesk.page)
- **Container**: molochain-api-gateway (healthy)
- **Services**: 10/10 healthy
- **SSL**: Valid (Let's Encrypt, expires Mar 2026)

### Production URLs

| Service | URL |
|---------|-----|
| REST API | https://api.molochain.com |
| WebSocket | wss://ws.molochain.com |
| Monitoring | https://grafana.molochain.com |

### Docker Networks

The gateway connects to 13 Docker networks for full microservice connectivity:
- molochain-core
- molochain-network
- rayanava-ai-agents_rayanava-network
- rayanava-gateway_default
- rayanava-notifications_default
- rayanava-workflows_default
- rayanava-voice_default
- rayanava-monitoring_default
- rayanava-backup_rayanava-network
- rayanava-workspace_rayanava-network
- rayanava-communications_rayanava-comm-network
- rayanava-dashboard_default
- rayanava-network

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Gateway port | 4000 |
| `JWT_SECRET` | JWT signing secret | Required |
| `REDIS_URL` | Redis connection URL | redis://localhost:6379 |
| `NODE_ENV` | Environment | development |
| `MOLOCHAIN_CORE_URL` | Core service URL | http://127.0.0.1:5000 |

## License

Proprietary - Molochain Ltd.

## Last Updated

December 30, 2025
