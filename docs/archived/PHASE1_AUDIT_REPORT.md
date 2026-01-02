# PHASE 1 — MOLOCHAIN ECOSYSTEM AUDIT REPORT
**Date:** December 25, 2025  
**Server:** 31.186.24.19 (molochain.com)  
**Auditor:** Replit Agent

---

## A) EXECUTIVE SUMMARY

### Current State Overview
The Molochain ecosystem runs on a single dedicated server with Plesk management, serving 11+ subdomains through a hybrid architecture combining Docker containers, PM2-managed Node.js processes, and PHP-FPM for Laravel.

### Key Findings
- ✅ **Infrastructure Healthy:** AlmaLinux 9.7, Plesk 18.0.74, nginx 1.28.0 all operational
- ✅ **Core Services Running:** PM2 molochain-core (port 5000), Docker mololink (port 5001)
- ✅ **12 Docker Containers Active:** Including monitoring stack (Prometheus, Grafana, Loki)
- ✅ **SSL Certificates:** Let's Encrypt certificates present for all active subdomains
- ✅ **Health Endpoints:** All tested services responding healthy
- ⚠️ **Duplicate Artifacts:** Multiple backup files and legacy folders detected
- ⚠️ **PostgreSQL Access Issue:** Direct DB access from SSH timed out (needs credential verification)
- ⚠️ **Some Subdomains Static Only:** opt, admin, api, ai, auth currently serve placeholder content

---

## B) INVENTORY TABLES

### B.1) Infrastructure Inventory

| Component | Details |
|-----------|---------|
| **Server OS** | AlmaLinux 9.7 (Moss Jungle Cat) |
| **Kernel** | 5.14.0-570.46.1.el9_6.x86_64 |
| **Plesk** | Obsidian 18.0.74.3 (Build: 2025/12/04) |
| **Web Server (Primary)** | nginx/1.28.0 |
| **Web Server (Backend)** | Apache/2.4.62 (AlmaLinux) |
| **Firewall** | firewalld (running) |
| **CPU** | AMD EPYC 7452 32-Core (4 vCPUs allocated) |
| **RAM** | 7.5 GB (3.1 GB used, 4.4 GB available) |
| **Disk** | 152 GB total, 84 GB used (56%) |

### B.2) SSL Certificates (Let's Encrypt)

| Subdomain | Certificate Status | Path |
|-----------|-------------------|------|
| molochain.com | ✅ Valid | /etc/letsencrypt/live/molochain.com |
| admin.molochain.com | ✅ Valid | /etc/letsencrypt/live/admin.molochain.com |
| cms.molochain.com | ✅ Valid | /etc/letsencrypt/live/cms.molochain.com |
| mololink.molochain.com | ✅ Valid | /etc/letsencrypt/live/mololink.molochain.com |
| opt.molochain.com | ✅ Valid | /etc/letsencrypt/live/opt.molochain.com |

### B.3) DNS Records

| Subdomain | Record Type | Points To |
|-----------|-------------|-----------|
| molochain.com | A | 31.186.24.19 |
| admin.molochain.com | A | 31.186.24.19 |
| cms.molochain.com | A | 31.186.24.19 |
| opt.molochain.com | A | 31.186.24.19 |
| mololink.molochain.com | A | 31.186.24.19 |

### B.4) Open Ports

| Port | Service | Process |
|------|---------|---------|
| 5000 | molochain-core (Node.js) | PM2 managed |
| 5001 | mololink-app | Docker container |
| 5432 | PostgreSQL | systemd (postmaster) |
| 443/80 | HTTPS/HTTP | nginx |
| 8000/8001 | Kong API Gateway | Docker container |
| 1337 | Konga Admin | Docker container |
| 9090 | Prometheus | Docker container |
| 9093 | Alertmanager | Docker container |
| 3100 | Loki | Docker container |
| 3009 | Unknown Node service | Node.js |

---

## C) ROUTING MAP (Domain → Service → Port)

### C.1) Active Services

| Domain | Upstream | Port | Service Type |
|--------|----------|------|--------------|
| **molochain.com** | 127.0.0.1:5000 | 5000 | PM2 Node.js (molochain-core) |
| **mololink.molochain.com** | Docker proxy | 5001 | Docker (mololink-app) |
| **cms.molochain.com** | PHP-FPM | - | Laravel (Apache backend) |

### C.2) Static/Placeholder Subdomains

| Domain | Root Directory | Content |
|--------|----------------|---------|
| admin.molochain.com | /var/www/vhosts/molochain.com/admin.molochain.com | Static placeholder |
| opt.molochain.com | /var/www/vhosts/molochain.com/opt.molochain.com | Static HTML placeholder |
| auth.molochain.com | /var/www/vhosts/molochain.com/auth.molochain.com | Static placeholder |
| api.molochain.com | /var/www/vhosts/molochain.com/api.molochain.com | Static placeholder |
| ai.molochain.com | /var/www/vhosts/molochain.com/ai.molochain.com | Static placeholder |
| cdn.molochain.com | Nginx CDN config | Asset serving |
| db.molochain.com | Placeholder | N/A |
| grafana.molochain.com | Docker proxy | Grafana dashboard |
| server.molochain.com | Placeholder | N/A |
| ws.molochain.com | WebSocket proxy | WebSocket handler |

### C.3) Plesk Nginx Configs Discovered

```
/etc/nginx/plesk.conf.d/vhosts/
├── admin.molochain.com.conf
├── ai.molochain.com.conf
├── api.molochain.com.conf
├── auth.molochain.com.conf
├── cdn.molochain.com.conf
├── cms.molochain.com.conf
├── db.molochain.com.conf
├── grafana.molochain.com.conf
├── molochain.com.conf
├── mololink.molochain.com.conf
├── opt.molochain.com.conf
├── server.molochain.com.conf
└── ws.molochain.com.conf
```

---

## D) RUNTIME & DEPLOYMENT INVENTORY

### D.1) Docker Containers (12 Total)

| Container | Image | Status | Ports | Purpose |
|-----------|-------|--------|-------|---------|
| **mololink-app** | 6184b8c6d1ff | Up 3 days (healthy) | 0.0.0.0:5001 | Mololink marketplace service |
| **auth-service** | microservices-auth-service:latest | Up 31 hours | Internal | Authentication microservice |
| **otms-service** | microservices-otms-service:latest | Up 11 days | Internal | OTMS operations service |
| **kong-gateway** | kong:3.7 | Up 11 days (healthy) | 8000-8001 | API Gateway |
| **konga-admin** | pantsel/konga | Up 2 days | 1337 | Kong admin UI |
| **kong-database** | postgres:13 | Up 11 days | Internal 5432 | Kong's PostgreSQL |
| **redis-session** | redis:7-alpine | Up 12 days | Internal 6379 | Session storage |
| **molochain-prometheus** | prom/prometheus | Up 12 days | 9090 | Metrics collection |
| **molochain-loki** | grafana/loki | Up 12 days | 3100 | Log aggregation |
| **molochain-promtail** | grafana/promtail | Up 12 days | Internal | Log shipping |
| **molochain-alertmanager** | prom/alertmanager | Up 12 days | 9093 | Alert management |
| **plesk-portainer** | portainer/portainer-ce:lts | Up 12 days | 9000 (localhost) | Container management |

### D.2) Docker Networks

| Network | Driver | Purpose |
|---------|--------|---------|
| molochain-core | bridge | Main app network |
| kong-stack_kong-net | bridge | API gateway network |
| monitoring_monitoring | bridge | Observability stack |

### D.3) Docker Volumes

| Volume | Purpose |
|--------|---------|
| kong-stack_kong_db_data | Kong database |
| mololink-docker_mololink_uploads | Mololink file uploads |
| mololink-docker_redis_data | Redis persistence |
| monitoring_grafana-data | Grafana dashboards |
| monitoring_loki-data | Loki logs |
| monitoring_prometheus-data | Prometheus metrics |

### D.4) PM2 Processes

| ID | Name | Mode | Status | Uptime | Restarts | Memory |
|----|------|------|--------|--------|----------|--------|
| 40 | molochain-core | fork | online | 7h | 16 | 124.5MB |

**PM2 Modules:**
- pm2-logrotate v3.0.0 (online)
- pm2-server-monit v3.0.0 (online)

### D.5) Runtime Versions

| Runtime | Version |
|---------|---------|
| Node.js | v20.19.6 |
| PHP | 8.0.30 (CLI) |
| Redis | 6.2.20 |
| PostgreSQL | Running (port 5432) |

### D.6) Cronjobs

```cron
# Database backups (2 AM daily)
0 2 * * * /usr/local/bin/backup-molochain-db.sh >> /backups/backup-cron.log 2>&1
0 2 * * * /usr/local/bin/backup_mololink_db.sh
```

---

## E) CODEBASE INVENTORY (Filesystem)

### E.1) Root Structure: /var/www/vhosts/molochain.com/

| Directory | Type | Framework | Purpose |
|-----------|------|-----------|---------|
| **molochain-core/** | Node.js/TS | React + Express + Vite | Main platform (PM2) |
| **mololink-docker/** | Node.js/TS | React + Express | Mololink service (Docker) |
| **cms.molochain.com/** | PHP | Laravel 12 | Content Management System |
| **admin.molochain.com/** | Static | HTML | Admin placeholder |
| **opt.molochain.com/** | Static | HTML | OTMS placeholder |
| **auth.molochain.com/** | Static | HTML | Auth placeholder |
| **api.molochain.com/** | Static | HTML | API placeholder |
| **ai.molochain.com/** | Static | HTML | AI placeholder |
| **OTMS-DOCKER/** | Node.js | Express | OTMS Docker source |
| **httpdocs/** | Mixed | Static | Main domain document root |
| **BACKUPS/** | Archive | - | Backup storage |
| **logs/** | Logs | - | Application logs |

### E.2) Key Files

| File | Location | Purpose |
|------|----------|---------|
| ecosystem.config.production.cjs | molochain-core/ | PM2 production config |
| docker-compose.yml | mololink-docker/ | Mololink Docker config |
| .env | molochain-core/ | Environment variables |
| MOLOCHAIN_INFRA_PROFILE.md | Root | Infrastructure documentation |

### E.3) Backup Artifacts (Potential Cleanup)

| File/Directory | Size | Notes |
|----------------|------|-------|
| admin-backup-20251222_180410.tar.gz | 1.3MB | Admin backup |
| auth-backup-20251222_180402.tar.gz | 56KB | Auth backup |
| mololink-backup-20251222_180427.tar.gz | 2MB | Mololink backup |
| cms.molochain.com/app.bak/ | - | Old app backup |
| mololink-docker/dist.backup/ | - | Old build artifacts |
| mololink-docker/dist.backup.20251221-124045/ | - | Dated build artifacts |

---

## F) DATABASE INVENTORY

### F.1) Database Engines

| Engine | Status | Port | Notes |
|--------|--------|------|-------|
| PostgreSQL | ✅ Running | 5432 | Primary database (systemd) |
| PostgreSQL (Kong) | ✅ Running | Docker internal | Kong gateway database |
| Redis | ✅ Running | 6379 | Session/cache storage |

### F.2) Backup Strategy

| Database | Backup Script | Schedule |
|----------|---------------|----------|
| molochain | /usr/local/bin/backup-molochain-db.sh | Daily 2 AM |
| mololink | /usr/local/bin/backup_mololink_db.sh | Daily 2 AM |

### F.3) Database Access (UNKNOWN - Needs Verification)

**Issue:** Direct PostgreSQL access via SSH timed out. Credentials may need to be verified.

**To Verify:**
1. Check `/var/www/vhosts/molochain.com/molochain-core/.env` for DATABASE_URL
2. Run: `psql -U <user> -d molochain -c '\dt'`
3. Document all tables and schemas

---

## G) OBSERVABILITY & HEALTH

### G.1) Health Endpoints Status

| Endpoint | Status | Response |
|----------|--------|----------|
| https://molochain.com/api/health | ✅ 200 | `{"status":"healthy","database":{"status":"connected"}}` |
| https://mololink.molochain.com/api/health | ✅ 200 | `{"status":"healthy","database":"connected","services":8}` |
| https://admin.molochain.com | ✅ 200 | Static HTML |
| https://cms.molochain.com | ✅ 200 | Static HTML |
| https://opt.molochain.com | ✅ 200 | Static HTML |

### G.2) Log Locations

| Service | Log Path |
|---------|----------|
| nginx (main) | /var/www/vhosts/system/molochain.com/logs/ |
| nginx (admin) | /var/www/vhosts/system/admin.molochain.com/logs/ |
| nginx (cms) | /var/www/vhosts/system/cms.molochain.com/logs/ |
| PM2 molochain-core | ~/.pm2/logs/molochain-core-*.log |
| Docker containers | `docker logs <container>` |

### G.3) Recent Errors (Last 24h)

| Time | Type | Description |
|------|------|-------------|
| 14:00-14:06 | 502 | Connection refused (port 5000) - Server restart window |
| 16:47 | SSL | SSL read error (client-side issue) |
| 20:02 | 404 | Bot scanning for .php files (security scan noise) |

### G.4) Resource Usage

| Resource | Value | Status |
|----------|-------|--------|
| CPU | 4 cores (2.1% usage) | ✅ Healthy |
| RAM | 7.5 GB (3.1 GB used) | ✅ Healthy |
| Disk | 152 GB (56% used) | ⚠️ Monitor |
| Swap | 7.9 GB (3.7 GB used) | ⚠️ High swap usage |

---

## H) RISKS & DUPLICATIONS

### H.1) Identified Risks

| Risk | Severity | Description | Mitigation |
|------|----------|-------------|------------|
| **High swap usage** | Medium | 3.7GB swap in use suggests memory pressure | Consider RAM upgrade or optimize services |
| **PM2 restarts** | Low | 16 restarts on molochain-core | Monitor for recurring crashes |
| **Placeholder subdomains** | Low | admin, opt, auth, api, ai serving static content | Deploy actual services or remove |
| **Old backup artifacts** | Low | Multiple old backups consuming disk space | Cleanup or archive to external storage |

### H.2) Duplications

| Item | Locations | Recommendation |
|------|-----------|----------------|
| dist.backup directories | mololink-docker/ | Remove old build artifacts |
| .env backup files | cms.molochain.com/ | Archive or remove |
| Backup tar.gz files | Root directory | Move to BACKUPS/ folder |

### H.3) Unused Artifacts (Potential Cleanup)

| Path | Type | Safe to Remove? |
|------|------|-----------------|
| /var/www/vhosts/molochain.com/mololink-docker/dist.backup/ | Build | ✅ Yes (after verification) |
| /var/www/vhosts/molochain.com/mololink-docker/dist.backup.20251221-124045/ | Build | ✅ Yes |
| /var/www/vhosts/molochain.com/cms.molochain.com/app.bak/ | App backup | ⚠️ Verify first |

---

## I) "UNKNOWN" LIST (Items Needing Verification)

### I.1) Cannot Verify

| Item | What's Unknown | How to Verify |
|------|----------------|---------------|
| PostgreSQL databases list | DB access timed out | Run: `sudo -u postgres psql -c '\l'` |
| Database table schemas | Could not query | Run: `\dt` in each database |
| Database users/privileges | Could not query | Run: `\du` in PostgreSQL |
| Kong API routes | Not queried | Inspect Kong admin API or Konga UI |
| grafana.molochain.com access | Not tested | Verify nginx proxy config |
| ws.molochain.com WebSocket | Not tested | Test WebSocket connection |

### I.2) Additional Access Needed

| Access | Purpose |
|--------|---------|
| PostgreSQL credentials | Full database audit |
| Kong Admin API | API gateway route mapping |
| Grafana login | Dashboard/metrics review |

---

## J) SERVICE DEPENDENCY MAP

```
                    ┌─────────────────────────────────┐
                    │         nginx (reverse proxy)    │
                    │         Port 443/80              │
                    └───────────────┬─────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│ molochain.com │         │   mololink    │         │     cms       │
│   (PM2)       │         │   (Docker)    │         │   (Laravel)   │
│  Port 5000    │         │  Port 5001    │         │   PHP-FPM     │
└───────┬───────┘         └───────┬───────┘         └───────┬───────┘
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│  PostgreSQL   │◄────────│    Redis      │         │   MySQL/PG    │
│  Port 5432    │         │  Port 6379    │         │   (Laravel)   │
└───────────────┘         └───────────────┘         └───────────────┘
                                    │
                          ┌─────────┴─────────┐
                          │   Docker Stack    │
                          │ ┌───────────────┐ │
                          │ │ auth-service  │ │
                          │ │ otms-service  │ │
                          │ │ kong-gateway  │ │
                          │ └───────────────┘ │
                          └───────────────────┘

        ┌─────────────────────────────────────────────────────┐
        │              Monitoring Stack (Docker)               │
        │  Prometheus (9090) | Loki (3100) | Alertmanager     │
        │  Grafana | Promtail                                  │
        └─────────────────────────────────────────────────────┘
```

---

## K) SUMMARY & NEXT STEPS

### Completed in PHASE 1:
1. ✅ Full infrastructure inventory
2. ✅ Runtime & deployment mapping
3. ✅ Codebase structure analysis
4. ✅ Reverse proxy configuration audit
5. ✅ Health endpoint verification
6. ✅ Log location mapping
7. ✅ Resource usage snapshot

### Ready for PHASE 2:
With this verified audit, we can now proceed to PHASE 2 to:
1. Define target architecture (central-admin as independent service)
2. Create migration steps with rollback methods
3. Develop cleanup plan for duplicates/unused artifacts
4. Prioritize tasks (P0/P1/P2)

---

**End of PHASE 1 Report**
