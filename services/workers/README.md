# Background Workers

Containerized background workers for the Molochain ecosystem.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Worker Services                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌──────────────────────────────────┐ │
│  │   backup-worker     │  │      health-monitor              │ │
│  │  - PostgreSQL dumps │  │  - Container health checks       │ │
│  │  - Scheduled @ 2AM  │  │  - Prometheus metrics push       │ │
│  │  - 30-day retention │  │  - Slack/Email alerts            │ │
│  └─────────────────────┘  └──────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    log-aggregator                           ││
│  │  - Promtail for Loki integration                           ││
│  │  - Docker log collection                                    ││
│  │  - Worker log forwarding                                    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Services

### backup-worker

Automated PostgreSQL backup service.

**Features:**
- Scheduled backups (default: 2:00 AM)
- Compressed dumps (pg_dump -Z 9)
- Weekly snapshots on Sundays
- Configurable retention (default: 30 days)
- Slack/Email notifications

### health-monitor

Container health monitoring service.

**Features:**
- Monitors specified containers
- Pushes metrics to Prometheus
- Alerts on container failures
- Recovery notifications
- State tracking (no duplicate alerts)

### log-aggregator

Promtail-based log collection.

**Features:**
- Docker container log collection
- Worker log forwarding to Loki
- Structured log parsing
- Label extraction

## Quick Start

```bash
# Create required networks
docker network create molochain-network 2>/dev/null || true
docker network create postgres-network 2>/dev/null || true

# Start workers
docker-compose up -d
```

## Environment Variables

### backup-worker

| Variable | Description | Default |
|----------|-------------|---------|
| `PGHOST` | PostgreSQL host | molochain-postgres |
| `PGPORT` | PostgreSQL port | 5432 |
| `PGUSER` | PostgreSQL user | molochain |
| `PGPASSWORD` | PostgreSQL password | Required |
| `BACKUP_RETENTION_DAYS` | Days to keep backups | 30 |
| `BACKUP_SCHEDULE` | Cron schedule | 0 2 * * * |
| `SLACK_WEBHOOK_URL` | Slack notifications | Optional |

### health-monitor

| Variable | Description | Default |
|----------|-------------|---------|
| `CHECK_INTERVAL` | Seconds between checks | 60 |
| `CONTAINERS_TO_MONITOR` | Comma-separated list | molochain-admin,... |
| `PROMETHEUS_PUSHGATEWAY` | Pushgateway URL | Optional |
| `SLACK_WEBHOOK_URL` | Slack notifications | Optional |

## Volumes

| Volume | Purpose |
|--------|---------|
| backup-data | PostgreSQL backup storage |
| health-logs | Health monitor logs |

## Notifications

### Slack Integration

Set `SLACK_WEBHOOK_URL` to enable Slack notifications:

```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
docker-compose up -d
```

### Alert Types

| Type | Color | Description |
|------|-------|-------------|
| info | green | Recovery, success |
| warning | yellow | Degraded state |
| error | red | Failure, down |

## Metrics

### Prometheus Metrics

```
# Container health (1 = healthy, 0 = unhealthy)
container_health{container="molochain-app"} 1
```

### Grafana Dashboard

Import the provided dashboard JSON for visualization.

## Logs

### View Logs

```bash
# All workers
docker-compose logs -f

# Specific worker
docker-compose logs -f backup-worker
```

### Log Locations

| Service | Path |
|---------|------|
| backup-worker | /backups/*.log |
| health-monitor | /var/log/health-monitor/*.log |

## Migration from Host Cron

1. Disable host cron jobs:
   ```bash
   crontab -e
   # Comment out backup and health monitor jobs
   ```

2. Start container workers:
   ```bash
   docker-compose up -d
   ```

3. Verify functionality:
   ```bash
   docker-compose logs -f
   ```

## License

Proprietary - Molochain Ltd.
