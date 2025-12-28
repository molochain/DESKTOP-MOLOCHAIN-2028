# Mololink Service - Docker Deployment

Mololink is part of the Molochain ecosystem - a B2B networking and marketplace platform where users can **Connect. Grow. Buy/Sell services**.

## Quick Start

### Prerequisites
- Docker & Docker Compose installed
- PostgreSQL database (mololinkdb) accessible
- molochain-core Docker network exists

### Deploy

```bash
# 1. Copy files to server
scp -r ./* root@31.186.24.19:/var/www/vhosts/molochain.com/mololink-docker/

# 2. SSH into server
ssh root@31.186.24.19

# 3. Navigate to directory
cd /var/www/vhosts/molochain.com/mololink-docker

# 4. Build and start
docker-compose up -d --build

# 5. Check logs
docker logs -f mololink-app
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Shared JWT secret (must match auth-service) |
| `AUTH_SERVICE_URL` | Central auth service URL |
| `REDIS_URL` | Redis connection for sessions |

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    molochain-core network                    │
├──────────────┬──────────────┬──────────────┬───────────────┤
│ mololink-app │ redis-session│ auth-service │ kong-gateway  │
│   :5001      │   :6379      │   :3002      │   :8000       │
└──────────────┴──────────────┴──────────────┴───────────────┘
```

### API Endpoints

| Category | Endpoints |
|----------|-----------|
| Auth | `/api/auth/register`, `/api/auth/login`, `/api/auth/me` |
| Companies | `/api/companies` (GET, POST) |
| Jobs | `/api/jobs` (GET, POST) |
| Marketplace | `/api/marketplace/listings`, `/api/marketplace/auctions` |
| Posts | `/api/posts` (GET, POST) |
| Profiles | `/api/profiles`, `/api/profiles/:id` |
| Connections | `/api/connections` (GET, POST) |

### Health Check

```bash
curl https://mololink.molochain.com/health
```

### Switching from PM2 to Docker

```bash
# 1. Stop PM2 service
pm2 stop mololink-service
pm2 delete mololink-service

# 2. Start Docker container
docker-compose up -d

# 3. Verify
curl https://mololink.molochain.com/api/companies
```

## Volumes

- `mololink_uploads` - Profile images and uploaded files
- `redis_data` - Redis persistence

## Logs

```bash
docker logs mololink-app -f --tail 100
```
