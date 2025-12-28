# Molochain Docker Deployment

This directory contains Docker configuration for containerizing the Molochain platform as microservices.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Nginx Reverse Proxy                         │
│                    (Port 80/443 - External Access)                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│  Main App     │         │  Admin        │         │  Auth         │
│  (Port 5000)  │◄───────►│  (Port 7000)  │◄───────►│  (Port 7010)  │
└───────────────┘         └───────────────┘         └───────────────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
            ┌───────────────┐             ┌───────────────┐
            │  PostgreSQL   │             │     Redis     │
            │  (Port 5432)  │             │  (Port 6379)  │
            └───────────────┘             └───────────────┘
```

## Quick Start

### Development

```bash
# Start development environment
cd docker
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop
docker-compose -f docker-compose.dev.yml down
```

Development includes:
- Hot-reload for all services
- Adminer (database UI) at http://localhost:8080
- Redis Commander at http://localhost:8081
- Debug ports exposed (9229, 9230, 9231)

### Production

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with production values

# Build and start
cd docker
docker-compose up -d --build

# With Nginx proxy
docker-compose --profile with-nginx up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Main | 5000 | Main platform application |
| Admin | 7000 | Admin microservice with RBAC |
| Auth | 7010 | Centralized authentication |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache and sessions |
| Nginx | 80/443 | Reverse proxy (optional) |

## Environment Variables

See `.env.example` for all available configuration options.

### Required Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret (64+ chars) |
| `SESSION_SECRET` | Session encryption secret (64+ chars) |
| `POSTGRES_PASSWORD` | Database password |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CMS_API_URL` | https://cms.molochain.com/api | CMS endpoint |
| `TOKEN_EXPIRY` | 24h | JWT token expiry |
| `RATE_LIMIT_ENABLED` | true | Enable rate limiting |
| `LOG_LEVEL` | info | Logging level |

## Health Checks

Each service exposes a health endpoint:

```bash
# Main
curl http://localhost:5000/api/health

# Admin
curl http://localhost:7000/api/health

# Auth
curl http://localhost:7010/api/health
```

## Scaling

```bash
# Scale admin service to 3 instances
docker-compose up -d --scale admin=3

# Scale with load balancing (requires Nginx config update)
docker-compose --profile with-nginx up -d --scale admin=3
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs <service-name>

# Check health
docker-compose ps
```

### Database connection issues

```bash
# Verify PostgreSQL is running
docker-compose exec postgres pg_isready -U molochain

# Check connection from app container
docker-compose exec main nc -zv postgres 5432
```

### Permission denied on entrypoint

```bash
# Fix entrypoint permissions
chmod +x docker/entrypoint-*.sh
```

## Building Individual Images

```bash
# Build admin image
docker build -f docker/Dockerfile.admin -t molochain/admin:latest ..

# Build main image
docker build -f docker/Dockerfile.main -t molochain/main:latest ..

# Build auth image
docker build -f docker/Dockerfile.auth -t molochain/auth:latest ..
```

## Deployment Verification Checklist

Before deploying to production, run these verification steps:

### 1. Build Verification
```bash
# Build all images (must complete without errors)
docker-compose -f docker-compose.yml build

# Expected: All three images build successfully
# - molochain/main:latest
# - molochain/admin:latest  
# - molochain/auth:latest
```

### 2. Startup Verification
```bash
# Start containers
docker-compose up -d

# Check all services are running
docker-compose ps

# Expected: All services show "healthy" status
```

### 3. Health Check Verification
```bash
# Wait 60 seconds for startup, then check health endpoints
curl -f http://localhost:5000/api/health  # Main
curl -f http://localhost:7000/api/health  # Admin
curl -f http://localhost:7010/api/health  # Auth

# Expected: HTTP 200 with health status JSON
```

### 4. Log Verification
```bash
# Check for any errors in logs
docker-compose logs --tail=100 | grep -i error

# Expected: No critical errors (some warnings are normal)
```

### 5. Database Connection Verification
```bash
# Verify database is accessible from containers
docker-compose exec main nc -zv postgres 5432

# Expected: "Connection to postgres 5432 port [tcp/postgresql] succeeded!"
```

## Kubernetes Migration

The Docker Compose setup is designed to be easily migrated to Kubernetes:

1. Convert compose services to Deployments
2. Convert environment variables to ConfigMaps/Secrets
3. Create Services for internal communication
4. Create Ingress for external access

See `docs/TARGET_ARCHITECTURE.md` for Kubernetes migration guide.
