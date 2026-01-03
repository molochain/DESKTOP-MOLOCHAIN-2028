# Ecosystem Registry Deployment Runbook

## Overview
This runbook documents the deployment process for the Ecosystem Service Registry, Health Worker, and Webhook Delivery System to the production server (31.186.24.19).

## Pre-Deployment Checklist

### Required Components
| Component | Location | Description |
|-----------|----------|-------------|
| Health Worker | `server/services/ecosystem-health-worker.ts` | 2-minute polling, Prometheus metrics |
| Webhook Delivery | `server/services/webhook-delivery.ts` | HMAC signatures, exponential retry |
| Registry Routes | `server/routes/ecosystem-registry.ts` | CRUD API for services/webhooks/docs |
| Metrics Routes | `server/routes/ecosystem-metrics.ts` | Prometheus endpoint |
| Schema | `shared/schema.ts` | ecosystemServices, ecosystemWebhooks, ecosystemApiDocs |
| Seed Script | `server/scripts/seed-ecosystem-services.ts` | Initial service registration |

### Environment Variables (Already Configured)
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Express session secret

## Deployment Steps

### Step 1: SSH to Production Server
```bash
ssh root@31.186.24.19
# Or: ssh root@molochain.com
```

### Step 2: Navigate to Project Directory
```bash
cd /var/www/vhosts/molochain.com/molochain-core
```

### Step 3: Stop PM2 Application (Prevent Webhook Flood)
**CRITICAL**: Stop the application BEFORE migrations to prevent the health worker from firing webhooks during schema changes or seeding.

```bash
# Stop the backend to prevent webhook flood
pm2 stop molochain-core

# Verify it's stopped
pm2 status molochain-core
```

### Step 4: Create Database Backup
```bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p ../BACKUPS

# Backup entire database
pg_dump $DATABASE_URL > ../BACKUPS/db_backup_${TIMESTAMP}.sql

# Or backup specific tables if they exist
psql $DATABASE_URL -c "\dt ecosystem*" && \
pg_dump $DATABASE_URL -t ecosystem_services -t ecosystem_webhooks -t ecosystem_api_docs > ../BACKUPS/ecosystem_backup_${TIMESTAMP}.sql
```

### Step 5: Pull Latest Code
```bash
git pull origin main
```

### Step 6: Install Dependencies
```bash
npm ci
```

### Step 7: Run Database Migrations
```bash
# Push schema changes to database
npm run db:push

# If there are conflicts, use force (destructive for schema changes)
# npm run db:push --force
```

### Step 8: Check Existing Ecosystem Data (Before Seeding)
**IMPORTANT**: Check if ecosystem tables already contain data to avoid duplicates.

```bash
# Check if ecosystem tables exist and have data
psql $DATABASE_URL -c "SELECT COUNT(*) as service_count FROM ecosystem_services;" 2>/dev/null || echo "Table does not exist yet"
psql $DATABASE_URL -c "SELECT COUNT(*) as webhook_count FROM ecosystem_webhooks;" 2>/dev/null || echo "Table does not exist yet"
```

**Decision Matrix:**
| Scenario | Action |
|----------|--------|
| Tables don't exist | Run seed script (Step 9) |
| Tables exist but empty (count = 0) | Run seed script (Step 9) |
| Tables have data (count > 0) | **SKIP Step 9** - data already exists |

If data exists but needs refresh:
```bash
# DANGEROUS: Only if you want to completely reset ecosystem data
# This will regenerate all API keys - notify all integrators first!
psql $DATABASE_URL -c "TRUNCATE ecosystem_services, ecosystem_webhooks, ecosystem_api_docs CASCADE;"
```

### Step 9: Seed Ecosystem Services (First Time Only)
**SKIP THIS STEP if data already exists (see Step 8).**

```bash
# Run the seed script to register all services
npx tsx server/scripts/seed-ecosystem-services.ts

# IMPORTANT: Save the generated API keys - they are shown only once!
```

### Step 10: Restart PM2 Application
```bash
# Start the backend
pm2 start molochain-core

# Check status
pm2 status molochain-core

# Check logs for errors
pm2 logs molochain-core --lines 50
```

### Step 11: Validate Deployment

#### Check Health Worker Status
```bash
curl https://molochain.com/api/ecosystem/metrics/worker/status
```
Expected Response:
```json
{
  "running": true,
  "intervalMs": 120000,
  "lastCheck": "2026-01-03T...",
  "servicesMonitored": 7
}
```

#### Check Prometheus Metrics
```bash
curl https://molochain.com/api/ecosystem/metrics/prometheus | head -30
```
Expected: Prometheus-formatted metrics with `ecosystem_service_up`, `ecosystem_service_response_time_ms`, etc.

#### Check JSON Metrics
```bash
curl https://molochain.com/api/ecosystem/metrics/json
```
Expected: JSON array of service health metrics

#### List Registered Services
```bash
curl https://molochain.com/api/ecosystem/registry/services
```
Expected: Array of 7 registered services

#### Trigger Test Webhook (Optional)
```bash
curl -X POST https://molochain.com/api/ecosystem/metrics/webhook/trigger \
  -H "Content-Type: application/json" \
  -d '{"serviceSlug": "api-gateway", "eventType": "test.ping", "payload": {"message": "test"}}'
```

## Rollback Procedure

If deployment fails:

### 1. Restore Database
```bash
cd /var/www/vhosts/molochain.com/molochain-core
LATEST_BACKUP=$(ls -t ../BACKUPS/db_backup_*.sql | head -1)
psql $DATABASE_URL < $LATEST_BACKUP
```

### 2. Restore Code
```bash
git checkout HEAD~1
npm ci
pm2 restart molochain-core
```

### 3. Verify Rollback
```bash
curl https://molochain.com/api/health
```

## Post-Deployment Monitoring

### Configure Prometheus Scraping
Add to Prometheus configuration:
```yaml
scrape_configs:
  - job_name: 'molochain-ecosystem'
    scrape_interval: 30s
    static_configs:
      - targets: ['molochain.com']
    metrics_path: '/api/ecosystem/metrics/prometheus'
    scheme: https
```

### Alert Rules (Alertmanager)
```yaml
groups:
  - name: molochain-ecosystem
    rules:
      - alert: ServiceDown
        expr: ecosystem_service_up == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.service }} is down"
          
      - alert: HighResponseTime
        expr: ecosystem_service_response_time_ms > 5000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Service {{ $labels.service }} has high response time"
```

## Service URLs Reference

| Service | Production URL | Internal URL |
|---------|----------------|--------------|
| API Gateway | https://molochain.com/api | - |
| Communications Hub | https://comms.molochain.com | - |
| Notification Service | - | http://172.22.0.1:7020 |
| Container Monitor | - | http://172.22.0.1:7030 |
| SSL Checker | - | http://172.22.0.1:7040 |
| CMS Sync | https://cms.molochain.com/api | - |
| RAYANAVA AI | http://localhost:5000/api/rayanava | - |

## Troubleshooting

### Health Worker Not Starting
```bash
# Check PM2 logs
pm2 logs molochain-core --lines 100 | grep -i "EcosystemHealth"

# Verify database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM ecosystem_services"
```

### Webhooks Not Delivering
```bash
# Check webhook delivery logs
pm2 logs molochain-core --lines 100 | grep -i "WebhookDelivery"

# Verify registered webhooks
curl https://molochain.com/api/ecosystem/registry/webhooks
```

### Prometheus Metrics Empty
```bash
# Force health check
curl -X POST https://molochain.com/api/ecosystem/metrics/check
```

## Contact

For deployment support, contact the Platform Engineering team.
