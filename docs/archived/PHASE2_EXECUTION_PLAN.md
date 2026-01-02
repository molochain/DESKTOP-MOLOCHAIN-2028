# PHASE 2 — MOLOCHAIN ECOSYSTEM EXECUTION PLAN
**Date:** December 25, 2025  
**Based on:** PHASE 1 Audit Report  
**Server:** 31.186.24.19 (molochain.com)

---

## 1) TARGET ARCHITECTURE (Incremental, Not Rewrite)

### 1.1) Current vs Target State

| Service | Current State | Target State | Change |
|---------|---------------|--------------|--------|
| **molochain.com** | PM2 Node.js (port 5000) | PM2 Node.js (port 5000) | ✅ Keep as-is |
| **admin.molochain.com** | Static placeholder | **Independent Docker service** | 🔄 Deploy |
| **cms.molochain.com** | Laravel PHP-FPM | Laravel PHP-FPM | ✅ Keep as-is |
| **mololink.molochain.com** | Docker (port 5001) | Docker (port 5001) | ✅ Keep as-is |
| **opt.molochain.com** | Static placeholder | Docker OTMS service | 🔄 Deploy |
| **auth.molochain.com** | Docker container (internal) | Docker + nginx proxy | 🔄 Expose |
| **api.molochain.com** | Static placeholder | Kong Gateway proxy | 🔄 Configure |
| **Kong Gateway** | Running (8000-8001) | Running (8000-8001) | ✅ Keep as-is |
| **Monitoring Stack** | Prometheus/Loki/Grafana | Prometheus/Loki/Grafana | ✅ Keep as-is |

### 1.2) Target Architecture Diagram

```
                         ┌─────────────────────────────────────┐
                         │        nginx (reverse proxy)        │
                         │       Plesk-managed :443/:80        │
                         └─────────────────┬───────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
         ▼                                 ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐               ┌─────────────────┐
│  molochain.com  │               │ admin.molochain │               │  mololink.com   │
│  (PM2 :5000)    │               │ (Docker :7000)  │               │  (Docker :5001) │
│  Main Platform  │               │ Central Admin   │               │  Marketplace    │
└────────┬────────┘               └────────┬────────┘               └────────┬────────┘
         │                                 │                                 │
         ▼                                 ▼                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              SHARED SERVICES LAYER                                   │
├─────────────────┬───────────────────┬──────────────────┬────────────────────────────┤
│  auth-service   │    Kong Gateway   │   PostgreSQL     │         Redis              │
│  (Docker)       │    (Docker:8000)  │   (Host:5432)    │       (Docker:6379)        │
│  JWT/SSO Auth   │    API Routing    │   Primary DB     │       Sessions/Cache       │
└─────────────────┴───────────────────┴──────────────────┴────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              AUXILIARY SERVICES                                      │
├─────────────────┬───────────────────┬──────────────────┬────────────────────────────┤
│ cms.molochain   │  opt.molochain    │   grafana.mol    │   Monitoring Stack         │
│ (Laravel/PHP)   │  (Docker OTMS)    │   (Docker)       │   Prometheus/Loki          │
└─────────────────┴───────────────────┴──────────────────┴────────────────────────────┘
```

### 1.3) Single Source of Truth Per Domain

| Domain | Source of Truth | Integration Method |
|--------|-----------------|-------------------|
| **User Auth** | auth-service (Docker) | JWT tokens, shared secrets |
| **Permissions/RBAC** | packages/shared-permissions | npm package import |
| **CMS Content** | cms.molochain.com API | REST API consumption |
| **Main Platform** | molochain-core | PM2 managed, PostgreSQL |
| **Marketplace** | mololink-docker | Docker, dedicated PostgreSQL |
| **Admin Dashboard** | admin service (Docker) | Calls APIs from other services |
| **API Gateway** | Kong | Routes all /api/* traffic |

### 1.4) What Stays As-Is

| Component | Reason |
|-----------|--------|
| molochain.com (PM2) | Core platform, stable, no issues |
| mololink (Docker) | Independent marketplace, working |
| cms.molochain.com (Laravel) | CMS backend, stable |
| Monitoring stack | Full observability, no changes needed |
| PostgreSQL (host) | Primary database, stable |
| Kong Gateway | API routing, configured |

### 1.5) What Changes

| Component | Change Required | Priority |
|-----------|-----------------|----------|
| admin.molochain.com | Deploy as independent Docker service | P0 |
| auth.molochain.com | Expose via nginx proxy to auth-service | P1 |
| opt.molochain.com | Deploy OTMS Docker service | P1 |
| api.molochain.com | Configure Kong proxy | P2 |
| ai.molochain.com | Deploy AI service or integrate | P2 |

---

## 2) MIGRATION STEPS (Safe, Step-by-Step)

### Step 1: Central Admin Service Deployment

| Item | Details |
|------|---------|
| **Step Name** | Deploy admin.molochain.com as independent Docker service |
| **Priority** | P0 (Critical) |
| **Risk Level** | Medium |

**Pre-requisites:**
- [ ] Admin service Docker image built
- [ ] Database migration scripts ready
- [ ] Environment variables configured

**Commands/Config Changes:**
```bash
# 1. Create admin service directory
mkdir -p /var/www/vhosts/molochain.com/admin-docker
cd /var/www/vhosts/molochain.com/admin-docker

# 2. Copy Docker files from Replit or create
# (Requires admin Dockerfile and docker-compose.yml)

# 3. Build and start
docker-compose build
docker-compose up -d

# 4. Update nginx proxy (Plesk)
# Add proxy_pass to http://127.0.0.1:7000
```

**Rollback Method:**
```bash
# Stop new admin container
docker-compose down

# Restore static placeholder
# (Already exists at /var/www/vhosts/molochain.com/admin.molochain.com/)
```

**Verification Checks:**
```bash
# Health check
curl -s https://admin.molochain.com/api/health

# Logs check
docker logs admin-service --tail 50

# Nginx status
nginx -t && systemctl status nginx
```

---

### Step 2: Auth Service Exposure

| Item | Details |
|------|---------|
| **Step Name** | Expose auth-service via auth.molochain.com nginx proxy |
| **Priority** | P1 (High) |
| **Risk Level** | Low |

**Pre-requisites:**
- [ ] auth-service Docker container running (already running)
- [ ] SSL certificate for auth.molochain.com (already exists)

**Commands/Config Changes:**
```bash
# 1. Get auth-service container IP
docker inspect auth-service | grep IPAddress

# 2. Edit nginx config via Plesk or direct file
# File: /etc/nginx/plesk.conf.d/vhosts/auth.molochain.com.conf
# Add location block:
# location / {
#     proxy_pass http://172.x.x.x:7010;
#     proxy_set_header Host $host;
#     proxy_set_header X-Real-IP $remote_addr;
# }

# 3. Test and reload nginx
nginx -t
systemctl reload nginx
```

**Rollback Method:**
```bash
# Remove proxy configuration
# Restore static serving
systemctl reload nginx
```

**Verification Checks:**
```bash
curl -s https://auth.molochain.com/health
curl -s https://auth.molochain.com/api/auth/status
```

---

### Step 3: OTMS Service Deployment

| Item | Details |
|------|---------|
| **Step Name** | Deploy opt.molochain.com OTMS Docker service |
| **Priority** | P1 (High) |
| **Risk Level** | Medium |

**Pre-requisites:**
- [ ] OTMS-DOCKER code ready (exists at /var/www/vhosts/molochain.com/OTMS-DOCKER/)
- [ ] Environment variables configured
- [ ] Database schema ready

**Commands/Config Changes:**
```bash
# 1. Navigate to OTMS directory
cd /var/www/vhosts/molochain.com/OTMS-DOCKER

# 2. Build and start
docker-compose build
docker-compose up -d

# 3. Update nginx proxy for opt.molochain.com
# Add proxy_pass to OTMS container port
```

**Rollback Method:**
```bash
docker-compose down
# Static placeholder remains at opt.molochain.com
```

**Verification Checks:**
```bash
curl -s https://opt.molochain.com/api/health
docker logs otms-service --tail 50
```

---

### Step 4: API Gateway Configuration

| Item | Details |
|------|---------|
| **Step Name** | Configure api.molochain.com to route through Kong |
| **Priority** | P2 (Normal) |
| **Risk Level** | Low |

**Commands/Config Changes:**
```bash
# 1. Configure Kong route via Konga UI (https://localhost:1337)
# Or via Kong Admin API:
curl -X POST http://localhost:8001/services \
  --data "name=molochain-api" \
  --data "url=http://127.0.0.1:5000/api"

curl -X POST http://localhost:8001/services/molochain-api/routes \
  --data "hosts[]=api.molochain.com"

# 2. Update nginx proxy for api.molochain.com
# proxy_pass http://127.0.0.1:8000;
```

**Rollback Method:**
```bash
curl -X DELETE http://localhost:8001/routes/{route-id}
curl -X DELETE http://localhost:8001/services/molochain-api
```

**Verification Checks:**
```bash
curl -s https://api.molochain.com/health
curl -s https://api.molochain.com/services
```

---

## 3) CLEANUP PLAN (After Verification)

### 3.1) Safe to Delete (After Backup)

| Path | Type | Reason Safe | Backup First |
|------|------|-------------|--------------|
| `/var/www/vhosts/molochain.com/mololink-docker/dist.backup/` | Build artifacts | Old build, current dist/ active | ✅ Yes |
| `/var/www/vhosts/molochain.com/mololink-docker/dist.backup.20251221-124045/` | Build artifacts | Dated backup, obsolete | ✅ Yes |
| `/var/www/vhosts/molochain.com/cms.molochain.com/app.bak/` | Laravel backup | Old app folder | ✅ Yes |
| `/var/www/vhosts/molochain.com/*.tar.gz` root backups | Compressed backups | Move to BACKUPS/ | Move only |

### 3.2) Cleanup Commands

```bash
# 1. First, create archive of items to delete
tar -czvf /var/www/vhosts/molochain.com/BACKUPS/cleanup-archive-$(date +%Y%m%d).tar.gz \
  /var/www/vhosts/molochain.com/mololink-docker/dist.backup/ \
  /var/www/vhosts/molochain.com/mololink-docker/dist.backup.20251221-124045/ \
  /var/www/vhosts/molochain.com/cms.molochain.com/app.bak/

# 2. Verify archive integrity
tar -tzvf /var/www/vhosts/molochain.com/BACKUPS/cleanup-archive-$(date +%Y%m%d).tar.gz

# 3. Move root tar.gz files to BACKUPS
mv /var/www/vhosts/molochain.com/*.tar.gz /var/www/vhosts/molochain.com/BACKUPS/

# 4. Delete after verification
rm -rf /var/www/vhosts/molochain.com/mololink-docker/dist.backup/
rm -rf /var/www/vhosts/molochain.com/mololink-docker/dist.backup.20251221-124045/
rm -rf /var/www/vhosts/molochain.com/cms.molochain.com/app.bak/
```

### 3.3) Items to Keep

| Path | Reason |
|------|--------|
| BACKUPS/ directory | Archive storage |
| All .env files | Configuration |
| All production dist/ directories | Active builds |
| logs/ directory | Audit trail |

---

## 4) DELIVERABLES

### 4.1) Prioritized Task List

#### P0 - Critical (Do First)
| ID | Task | Estimated Effort | Dependencies |
|----|------|------------------|--------------|
| P0-1 | Deploy admin.molochain.com as Docker service | 4-6 hours | Admin Dockerfile |
| P0-2 | Verify cross-service authentication working | 2 hours | Auth service |
| P0-3 | Test shared permissions across services | 1 hour | packages/shared-permissions |

#### P1 - High Priority (Do Soon)
| ID | Task | Estimated Effort | Dependencies |
|----|------|------------------|--------------|
| P1-1 | Expose auth.molochain.com via nginx | 1 hour | P0-1 complete |
| P1-2 | Deploy OTMS to opt.molochain.com | 4 hours | OTMS-DOCKER ready |
| P1-3 | Configure Kong routes for api.molochain.com | 2 hours | Kong admin access |
| P1-4 | Document all API endpoints catalog | 2 hours | - |

#### P2 - Normal Priority (Do Later)
| ID | Task | Estimated Effort | Dependencies |
|----|------|------------------|--------------|
| P2-1 | Configure ai.molochain.com service | 3 hours | AI integration decision |
| P2-2 | Cleanup duplicate artifacts | 1 hour | Backup verification |
| P2-3 | Document PostgreSQL schemas | 2 hours | DB access |
| P2-4 | Review and optimize memory usage | 2 hours | Monitoring data |
| P2-5 | Set up automated deployment pipeline | 4 hours | - |

### 4.2) Timeline Sequence (Not Time Estimates)

```
Phase 1: Foundation (Weeks 1-2)
├── P0-1: Deploy admin Docker service
├── P0-2: Verify auth integration
└── P0-3: Test shared permissions

Phase 2: Service Expansion (Weeks 3-4)
├── P1-1: Expose auth service
├── P1-2: Deploy OTMS service
├── P1-3: Configure Kong routes
└── P1-4: Document API catalog

Phase 3: Optimization (Weeks 5-6)
├── P2-1: AI service integration
├── P2-2: Cleanup artifacts
├── P2-3: Document DB schemas
├── P2-4: Memory optimization
└── P2-5: CI/CD pipeline

Phase 4: Final Review
└── Complete all verification checklists
```

### 4.3) Definition of Done Checklist

#### ✅ Infrastructure Complete
- [ ] All 11 subdomains have proper nginx configuration
- [ ] All SSL certificates valid and auto-renewing
- [ ] All Docker containers healthy
- [ ] PM2 process stable (< 5 restarts/day)
- [ ] Memory usage < 70%
- [ ] Disk usage < 70%

#### ✅ Services Complete
- [ ] molochain.com responding healthy
- [ ] admin.molochain.com deployed and functional
- [ ] mololink.molochain.com responding healthy
- [ ] cms.molochain.com responding healthy
- [ ] opt.molochain.com deployed and functional
- [ ] auth.molochain.com exposed and functional
- [ ] api.molochain.com routing through Kong

#### ✅ Integration Complete
- [ ] Cross-domain authentication working
- [ ] Shared permissions enforced across services
- [ ] Kong API Gateway routing all API traffic
- [ ] Redis session sharing working

#### ✅ Documentation Complete
- [ ] API endpoint catalog documented
- [ ] Database schema documented
- [ ] Deployment procedures documented
- [ ] Rollback procedures tested

#### ✅ Cleanup Complete
- [ ] All duplicate artifacts removed
- [ ] Old backups archived
- [ ] Unused subdomains removed or repurposed
- [ ] Log rotation configured

#### ✅ Monitoring Complete
- [ ] Prometheus collecting all metrics
- [ ] Grafana dashboards configured
- [ ] Alertmanager rules configured
- [ ] Log aggregation in Loki

---

## 5) RISK ASSESSMENT

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Service downtime during migration | High | Medium | Use blue-green deployment, keep static fallbacks |
| Database corruption | Critical | Low | Always backup before changes |
| Authentication breakage | High | Medium | Test in staging first, gradual rollout |
| Memory exhaustion | Medium | High | Address swap usage, consider RAM upgrade |
| SSL certificate expiry | Medium | Low | Auto-renewal configured |

---

## 6) NEXT IMMEDIATE ACTIONS

1. **Review this plan** with stakeholder approval
2. **Create admin-docker** directory with Dockerfile
3. **Test admin service** locally/staging before production
4. **Schedule maintenance window** for P0 tasks
5. **Backup all databases** before any migration

---

**End of PHASE 2 Execution Plan**
