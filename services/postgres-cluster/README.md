# PostgreSQL Cluster

Containerized PostgreSQL 16 for the Molochain ecosystem.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Cluster                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌──────────────────────────────────┐ │
│  │  molochain-postgres │  │        postgres-backup           │ │
│  │  (PostgreSQL 16)    │  │  (scheduled backup worker)       │ │
│  │  Port: 5433         │  │                                  │ │
│  └─────────────────────┘  └──────────────────────────────────┘ │
│            │                                                     │
│  ┌─────────────────────┐                                        │
│  │      pgadmin        │                                        │
│  │  (Web UI)           │                                        │
│  │  Port: 5050         │                                        │
│  └─────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Databases

| Database | Owner | Purpose |
|----------|-------|---------|
| molochaindb | molodb | Main Molochain application |
| mololinkdb | mololink | Mololink microservice |
| cmsdb | cmsuser | Laravel CMS |

## Quick Start

### Prerequisites

1. Set environment variables in `.env`
2. Ensure `molochain-network` exists

### Start Cluster

```bash
docker-compose up -d
```

### Access pgAdmin

Open `http://localhost:5050` with credentials from `.env`

## Migration from Host PostgreSQL

```bash
# Set source connection
export SOURCE_HOST=localhost
export SOURCE_PORT=5432
export SOURCE_USER=postgres
export DATABASES="molochaindb mololinkdb"

# Run migration
./scripts/migrate-from-host.sh
```

## Configuration

### postgresql.conf Highlights

- `max_connections`: 200
- `shared_buffers`: 512MB
- `effective_cache_size`: 1.5GB
- `work_mem`: 2.6MB
- `wal_level`: replica (ready for replication)
- `archive_mode`: on

### Backup Schedule

- Daily backups at 2:00 AM
- Weekly backups on Sundays
- 30-day retention for daily
- 90-day retention for weekly

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Superuser name | molochain |
| `POSTGRES_PASSWORD` | Superuser password | Required |
| `POSTGRES_DB` | Default database | molochaindb |
| `PGADMIN_EMAIL` | pgAdmin login | admin@molochain.com |
| `PGADMIN_PASSWORD` | pgAdmin password | Required |

## Backup & Restore

### Manual Backup

```bash
docker-compose exec molochain-postgres pg_dump -U molochain -d molochaindb -F c -f /backups/manual.dump
```

### Restore

```bash
docker-compose exec molochain-postgres pg_restore -U molochain -d molochaindb /backups/manual.dump
```

## Monitoring

- Health check every 10 seconds
- Logs available via `docker-compose logs`
- Performance monitoring via pg_stat_statements

## Security

- scram-sha-256 password encryption
- Network-based access control via pg_hba.conf
- Bound to localhost only (127.0.0.1:5433)

## License

Proprietary - Molochain Ltd.
