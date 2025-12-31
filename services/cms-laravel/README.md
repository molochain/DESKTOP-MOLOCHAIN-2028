# Laravel CMS Containerization

Dockerized Laravel CMS for the Molochain ecosystem.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CMS Laravel Stack                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  cms-nginx  │  │  cms-app    │  │     cms-redis          │ │
│  │  (port 80)  │──│  (PHP-FPM)  │──│  (session/cache)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                          │                                       │
│  ┌─────────────┐  ┌─────────────┐                              │
│  │ cms-queue   │  │ cms-scheduler│                              │
│  │ (workers)   │  │ (cron)      │                              │
│  └─────────────┘  └─────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

## Services

| Service | Description | Port |
|---------|-------------|------|
| cms-app | PHP 8.4 FPM with Laravel | 9000 (internal) |
| cms-nginx | Nginx web server | 8090 (localhost) |
| cms-queue | Queue worker (artisan queue:work) | - |
| cms-scheduler | Scheduler (artisan schedule:work) | - |
| cms-redis | Redis for sessions/cache | 6379 (internal) |

## Quick Start

### Prerequisites

1. Copy your Laravel application to this directory
2. Create `.env` file from `.env.example`
3. Set database credentials

### Development

```bash
docker-compose up -d
docker-compose logs -f
```

### Production Deployment

```bash
./scripts/deploy.sh production
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CMS_DB_NAME` | Database name | cmsdb |
| `CMS_DB_USER` | Database user | cmsuser |
| `CMS_DB_PASSWORD` | Database password | Required |

## Zero-Downtime Deployment

The `deploy.sh` script implements zero-downtime deployment:

1. Build new image
2. Run migrations
3. Scale queue workers to 2
4. Restart app with health check
5. Restart nginx
6. Scale workers back to 1
7. Clear and warm caches

## Rollback

```bash
docker-compose down
docker tag molochain/cms-laravel:previous molochain/cms-laravel:latest
docker-compose up -d
```

## Volumes

| Volume | Purpose |
|--------|---------|
| cms-storage | Laravel storage (uploads, logs) |
| cms-logs | PHP error logs |
| cms-nginx-logs | Nginx access/error logs |
| cms-redis-data | Redis persistence |

## Migration from Plesk

1. Export current database
2. Copy application files
3. Update `.env` with new database connection
4. Run `docker-compose up -d`
5. Test thoroughly
6. Update DNS/proxy to point to container

## License

Proprietary - Molochain Ltd.
