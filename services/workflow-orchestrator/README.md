# Molochain Workflow Orchestrator

Unified workflow orchestration service for the Molochain ecosystem. This service provides:

- **Scheduled Workflows**: Cron-based execution of recurring tasks
- **Event-Driven Workflows**: React to system events and trigger workflows
- **Step-based Execution**: Break complex workflows into manageable steps with retry logic
- **Redis-backed Event Bus**: Durable event storage and pub/sub communication
- **REST API**: Trigger and monitor workflows programmatically

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Workflow Orchestrator                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Scheduler  │  │  Event Bus  │  │   Workflow Registry     │  │
│  │  (node-cron)│  │  (Redis)    │  │   (10 workflows)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│         │               │                    │                   │
│         └───────────────┴────────────────────┘                   │
│                         │                                        │
│                ┌────────▼────────┐                               │
│                │   Orchestrator   │                               │
│                │  (Step Executor) │                               │
│                └─────────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

## Registered Workflows

| Workflow ID | Schedule | Description |
|-------------|----------|-------------|
| cms-sync | */5 * * * * | Sync content from Laravel CMS |
| database-backup | 0 2 * * * | Daily PostgreSQL backup |
| health-monitoring | * * * * * | Container and service health checks |
| cache-warmup | */30 * * * * | Pre-warm application caches |
| sales-operations | 0 8 * * 1-5 | AI-powered Rayanava workflow |
| log-rotation | 0 0 * * * | Rotate and cleanup log files |
| performance-optimization | */15 * * * * | Automated performance tuning |
| user-onboarding | Event-driven | New user welcome sequence |
| notification-digest | 0 9 * * * | Daily notification summary |
| security-audit | 0 3 * * * | Security compliance checks |

## API Endpoints

### Health Check
```
GET /health
```

### List Workflows
```
GET /api/workflows
```

### Trigger Workflow
```
POST /api/workflows/:workflowId/trigger
Content-Type: application/json

{
  "inputData": { ... }
}
```

### Get Workflow Status
```
GET /api/workflows/:workflowId/status
```

### View Recent Events
```
GET /api/events
```

### Publish Event
```
POST /api/events
Content-Type: application/json

{
  "eventType": "cms.content.updated",
  "payload": { "serviceId": 123 }
}
```

## Deployment

### Build and Run
```bash
cd services/workflow-orchestrator
docker-compose up -d --build
```

### Check Status
```bash
docker logs molochain-workflow-orchestrator
curl http://localhost:5003/health
```

### Integration with Main Stack
Add to the main docker-compose network:

```yaml
networks:
  molochain-network:
    external: true
```

## Event Types

The orchestrator responds to these event types:

| Event | Triggers Workflow |
|-------|------------------|
| cms.content.updated | cms-sync |
| cms.service.created | cms-sync |
| cache.invalidated | cache-warmup |
| deployment.completed | cache-warmup |
| system.health.check | health-monitoring |
| user.registered | user-onboarding |
| user.verified | user-onboarding |
| sales.lead.created | sales-operations |
| security.alert | security-audit |
| performance.degraded | performance-optimization |
| memory.high | performance-optimization |

## Integration with Existing Systems

This orchestrator works alongside:

- **Mastra/Inngest** (server/ai/rayanava/inngest): AI workflow execution
- **Docker Workers** (services/workers): backup-worker, health-monitor
- **API Gateway** (services/api-gateway): Routes /api/workflows
- **Communications Hub**: Sends notifications via webhooks

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5003 | HTTP server port |
| REDIS_URL | redis://workflow-redis:6379 | Redis connection |
| DATABASE_URL | - | PostgreSQL connection |
| LOG_LEVEL | info | Winston log level |
| INNGEST_EVENT_KEY | - | Inngest cloud key |
| INNGEST_SIGNING_KEY | - | Inngest signing key |
