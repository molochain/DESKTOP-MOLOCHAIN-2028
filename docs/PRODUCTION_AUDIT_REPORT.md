# Molochain Production Server Audit Report

**Server:** 31.186.24.19 (zen-agnesi.31-186-24-19.plesk.page)  
**Audit Date:** December 23, 2025  
**Last Verified:** December 23, 2025 @ 19:30 UTC  
**Operating System:** AlmaLinux (RHEL-based)  
**Control Panel:** Plesk  

---

## Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| Total Disk Usage | **84GB / 152GB (56%)** | ✅ Healthy |
| Free Space | **68GB available** | ✅ Good |
| Docker Containers | 12 containers running | ✅ All Healthy |
| PM2 Process | molochain-core (25h uptime) | ✅ Online |
| SSL Certificates | All valid (expire Jan-Mar 2026) | ⚠️ molochain.com expires Jan 4 |
| PostgreSQL Databases | 7 databases accessible | ✅ Operational |
| Active Subdomains | 11 responding (HTTP 200) | ✅ Healthy |
| Email Mailboxes | 51 configured (38 new) | ✅ Configured |

### Cleanup Completed (December 23, 2025)

| Action | Space Freed |
|--------|-------------|
| Old releases deleted (8) | ~19GB |
| Logs & cache cleaned | ~1GB |
| Archives removed | ~2.7GB |
| Backup folders cleaned | ~88MB |
| **TOTAL FREED** | **~22.8GB** |

### Releases Kept (3)
- `20251220_193805` - Rollback option (2.3GB)
- `20251220_195856` - **CURRENT ACTIVE** (3.7GB)
- `20251222_150748` - Latest backup (2.4GB)

### Issues Requiring Attention

1. **⚠️ WARNING: molochain.com SSL expires January 4, 2026** - 12 days remaining, requires Plesk GUI renewal
2. **✅ RESOLVED (Dec 23): Security fix - Hardcoded credentials removed from ecosystem.config.cjs**
3. **✅ RESOLVED: opt.molochain.com now returns HTTP 200** - OTMS service is operational
4. **✅ STABLE: PM2 molochain-core** - Using secure wrapper script, 210MB memory usage

### Security Fix Implemented (December 23, 2025)

| Issue | Previous State | Current State | Status |
|-------|----------------|---------------|--------|
| Hardcoded DB credentials | Exposed in ecosystem.config.cjs | Loaded from protected .env file | ✅ Fixed |
| Hardcoded JWT_SECRET | Exposed in ecosystem.config.cjs | Loaded from protected .env file | ✅ Fixed |
| Hardcoded SESSION_SECRET | Exposed in ecosystem.config.cjs | Loaded from protected .env file | ✅ Fixed |

**Solution Implemented:**
- Created `/var/www/molochain/run-app.sh` wrapper script that sources `.env` before starting Node
- Updated `ecosystem.config.cjs` to use wrapper script (no sensitive values in config)
- Secrets stored in `/var/www/molochain/shared/.env` with 600 permissions (root-only access)
- Old insecure config backed up to `ecosystem.config.cjs.insecure-backup`

**Optional Next Steps:**
- Consider rotating credentials (generate new JWT_SECRET, SESSION_SECRET)

---

## 1. Infrastructure Components

### 1.1 Domain & Subdomain Inventory

| Domain | Type | Root Path | Service | Port | Status |
|--------|------|-----------|---------|------|--------|
| molochain.com | Main site | /var/www/vhosts/molochain.com/httpdocs | PM2 Node.js | 5000 | ✅ Healthy |
| www.molochain.com | Redirect | → molochain.com | - | - | ✅ Working |
| admin.molochain.com | Admin panel | /var/www/vhosts/molochain.com/admin.molochain.com | Plesk Apache proxy | 7081 | ✅ Healthy |
| api.molochain.com | API endpoint | /var/www/vhosts/molochain.com/api.molochain.com | Plesk Apache proxy | 7081 | ✅ Healthy |
| auth.molochain.com | Auth service | /var/www/vhosts/molochain.com/auth.molochain.com | Plesk Apache proxy | 7081 | ✅ Healthy |
| app.molochain.com | Application | Nginx config | Direct proxy to :5000 | 5000 | ✅ Healthy |
| cms.molochain.com | Laravel CMS | /var/www/vhosts/molochain.com/cms.molochain.com/public | PHP-FPM 8.4 | 7081 | ✅ Healthy |
| cdn.molochain.com | Static assets | /var/www/vhosts/molochain.com/cdn.molochain.com | Nginx direct | - | ✅ Healthy |
| db.molochain.com | Database admin | /var/www/vhosts/molochain.com/db.molochain.com | Plesk Apache proxy | 7081 | ✅ Healthy |
| grafana.molochain.com | Monitoring | /var/www/vhosts/molochain.com/grafana.molochain.com | Plesk Apache proxy | 7081 | ✅ Healthy |
| mololink.molochain.com | Mololink app | Docker container | mololink-app | 5001 | ✅ Healthy |
| opt.molochain.com | OTMS Dashboard | /var/www/vhosts/molochain.com/opt.molochain.com | Plesk Apache proxy | 7081 | ✅ Healthy |
| server.molochain.com | Server info | /var/www/vhosts/molochain.com/server.molochain.com | Plesk Apache proxy | 7081 | ✅ Healthy |
| ws.molochain.com | WebSocket | /var/www/vhosts/molochain.com/ws.molochain.com | Plesk Apache proxy | 7081 | ✅ Healthy |
| ai.molochain.com | AI services | /var/www/vhosts/molochain.com/ai.molochain.com | Plesk Apache proxy | 7081 | ✅ Healthy |

**Additional Domains on Server:**
| Domain | Status |
|--------|--------|
| molops.com | Hosted |
| soorchico.com | Hosted |
| turkat.com | Hosted |

---

### 1.2 Nginx Configuration Files

| Config File | Location | Purpose |
|-------------|----------|---------|
| app.molochain.com.conf | /etc/nginx/conf.d/ | Direct proxy to PM2 app :5000 |
| mololink.molochain.com.conf | /etc/nginx/conf.d/ | Proxy to Docker mololink :5001 |
| cdn.molochain.com.conf | /etc/nginx/conf.d/ | CDN static files |
| rate-limit.conf | /etc/nginx/conf.d/ | Rate limiting rules |
| websocket-upgrade-map.conf | /etc/nginx/conf.d/ | WebSocket upgrade handling |
| brotli.conf | /etc/nginx/conf.d/ | Brotli compression |
| ssl.conf | /etc/nginx/conf.d/ | SSL settings |
| vhost_nginx.conf | /var/www/vhosts/system/molochain.com/conf/ | Custom API & WebSocket proxy |

**Plesk-Managed Vhosts:** All subdomain configs in `/etc/nginx/plesk.conf.d/vhosts/` are symlinks to `/var/www/vhosts/system/<domain>/conf/nginx.conf`

---

## 2. Docker Infrastructure

### 2.1 Running Containers

| Container Name | Image | Status | Ports | Purpose |
|---------------|-------|--------|-------|---------|
| mololink-app | mololink-service:latest | Up 24h (healthy) | 5001:5001 | Mololink application |
| auth-service | microservices-auth-service:latest | Up 25h | - | Authentication microservice |
| otms-service | microservices-otms-service:latest | Up 9d | - | OTMS microservice |
| kong-gateway | kong:3.7 | Up 9d (healthy) | 8000-8001:8000-8001 | API Gateway |
| kong-database | postgres:13 | Up 9d | 5432 (internal) | Kong database |
| konga-admin | pantsel/konga | Up 10h | 1337:1337 | Kong admin UI |
| redis-session | redis:7-alpine | Up 10d | 6379 (internal) | Session cache |
| molochain-prometheus | prom/prometheus:latest | Up 10d | 9090:9090 | Metrics |
| molochain-alertmanager | prom/alertmanager:latest | Up 10d | 9093:9093 | Alerting |
| molochain-loki | grafana/loki:latest | Up 10d | 3100:3100 | Log aggregation |
| molochain-promtail | grafana/promtail:latest | Up 10d | - | Log shipping |
| plesk-portainer | portainer/portainer-ce:lts | Up 10d | 9000 (localhost) | Container management |

### 2.2 Docker Images

| Repository | Tag | Size | Created |
|------------|-----|------|---------|
| mololink-service | latest | 3.35GB | Dec 21, 2025 |
| node | 20-alpine | 135MB | Dec 18, 2025 |
| microservices-otms-service | latest | 177MB | Dec 8, 2025 |
| microservices-auth-service | latest | 156MB | Dec 2, 2025 |
| redis | 7-alpine | 41.4MB | Nov 3, 2025 |
| portainer/portainer-ce | lts | 186MB | Sep 25, 2025 |
| postgres | 13 | 438MB | Sep 23, 2025 |
| prom/prometheus | latest | 313MB | Sep 21, 2025 |
| grafana/loki | latest | 123MB | Sep 11, 2025 |
| grafana/promtail | latest | 198MB | Sep 11, 2025 |
| prom/alertmanager | latest | 72.3MB | Mar 7, 2025 |
| kong | 3.7 | 299MB | Jun 21, 2024 |
| pantsel/konga | latest | 409MB | May 16, 2020 |

### 2.3 Docker Space Usage

| Type | Total | Active | Size | Reclaimable |
|------|-------|--------|------|-------------|
| Images | 14 | 12 | 8.98GB | **5.76GB (64%)** |
| Containers | 12 | 12 | 1.53GB | 0B |
| Volumes | 11 | 8 | 201MB | 93.4MB (46%) |
| Build Cache | 0 | 0 | 0B | 0B |

### 2.4 Docker Networks

| Network | Driver | Purpose |
|---------|--------|---------|
| molochain-core | bridge | Main app network |
| kong-stack_kong-net | bridge | Kong services |
| monitoring_monitoring | bridge | Prometheus/Loki stack |
| bridge | bridge | Default |
| host | host | Host networking |

### 2.5 Docker Volumes

| Volume Name | Size | Purpose |
|-------------|------|---------|
| monitoring_prometheus-data | 43.6MB | Prometheus metrics |
| kong-stack_kong_db_data | 52.3MB | Kong PostgreSQL |
| microservices_kong_data | 52.2MB | Kong config |
| monitoring_grafana-data | 41.2MB | Grafana dashboards |
| monitoring_loki-data | 11.2MB | Loki logs |
| mololink-docker_mololink_uploads | 0B | Mololink uploads |
| mololink-docker_redis_data | 0B | Redis data |

---

## 3. PM2 Process Manager

### 3.1 Running Processes

| Name | Script | Status | Restarts | Memory | Uptime |
|------|--------|--------|----------|--------|--------|
| molochain-core | dist/index.js | Online | **19** ⚠️ | 138.8MB | ~24h |

### 3.2 Ecosystem Configuration

```javascript
// /var/www/vhosts/molochain.com/molochain-core/ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'molochain-prod',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      DATABASE_URL: 'postgresql://molodb:***@127.0.0.1:5432/molochaindb',
      DB_POOL_SIZE: 20,
      CORS_ORIGINS: 'https://molochain.com,https://www.molochain.com,https://cms.molochain.com'
    }
  }]
};
```

### 3.3 PM2 Systemd Service
- Service: `pm2-afsadm.service`
- Status: Active (running)
- User: afsadm (root-level)

---

## 4. Databases

### 4.1 PostgreSQL Databases (localhost:5432)

| Database | Owner | Encoding | Permissions | Purpose |
|----------|-------|----------|-------------|---------|
| molochaindb | postgres | UTF8 | molochain1, molodb | Main application |
| molochain_db | molochain | UTF8 | molochain | Legacy/alternative |
| mololinkdb | molodb | UTF8 | molodb | Mololink service |
| otms_db | postgres | UTF8 | postgres, otms_app, molodb | OTMS service |
| postgres | postgres | UTF8 | postgres | System |
| template0 | postgres | UTF8 | postgres | Template |
| template1 | postgres | UTF8 | postgres | Template |

### 4.2 Database Users

- `postgres` (superuser)
- `molochain`
- `molochain1`
- `molodb`
- `otms_app`

### 4.3 Kong Database (Docker)
- Container: kong-database
- Image: postgres:13
- Port: 5432 (internal to kong-net)
- Volume: kong-stack_kong_db_data

### 4.4 MariaDB
- Service: mariadb.service (Active)
- Status: Running but not actively used

---

## 5. Listening Ports & Services

### 5.1 Port Mapping

| Port | Protocol | Service | Process |
|------|----------|---------|---------|
| 22 | TCP | SSH | sshd |
| 25 | TCP | SMTP | postfix |
| 53 | TCP/UDP | DNS | named-chroot |
| 80 | TCP | HTTP | nginx |
| 110 | TCP | POP3 | dovecot |
| 143 | TCP | IMAP | dovecot |
| 443 | TCP/UDP | HTTPS/QUIC | nginx |
| 465 | TCP | SMTPS | postfix |
| 587 | TCP | Submission | postfix |
| 993 | TCP | IMAPS | dovecot |
| 995 | TCP | POP3S | dovecot |
| 1337 | TCP | Konga Admin | docker-proxy |
| 3100 | TCP | Loki | docker-proxy |
| 5000 | TCP | **Molochain App** | node (PM2) |
| 5001 | TCP | **Mololink App** | docker-proxy |
| 8000-8001 | TCP | Kong Gateway | docker-proxy |
| 8443 | TCP/UDP | Plesk | sw-cp-server |
| 8447 | TCP | Plesk | - |
| 8880 | TCP | Mailconfig | - |
| 9000 | TCP | Portainer | docker-proxy (localhost) |
| 9090 | TCP | Prometheus | docker-proxy |
| 9093 | TCP | Alertmanager | docker-proxy |

### 5.2 Firewall Configuration (firewalld)

**Allowed Ports:**
- Standard: 22, 21, 25, 53, 80, 110, 143, 443, 465, 587, 993, 995
- Plesk: 8443, 8447, 8880
- Custom: **5000 (molochain-core)**, **3007** (unused?)
- Ephemeral: 49152-65535

---

## 6. SSL Certificates

| Domain | Issuer | Valid From | Expires | Days Remaining | Status |
|--------|--------|------------|---------|----------------|--------|
| molochain.com | Let's Encrypt | Oct 6, 2025 | **Jan 4, 2026** | **12 days** | ⚠️ Renew Soon |
| admin.molochain.com | Let's Encrypt | Dec 23, 2025 | Mar 23, 2026 | 90 days | ✅ OK |
| auth.molochain.com | Let's Encrypt | Dec 8, 2025 | Mar 8, 2026 | 75 days | ✅ OK |
| cms.molochain.com | Let's Encrypt | Dec 23, 2025 | Mar 23, 2026 | 90 days | ✅ OK |
| opt.molochain.com | Let's Encrypt | Dec 23, 2025 | Mar 23, 2026 | 90 days | ✅ OK |
| mololink.molochain.com | Let's Encrypt | Dec 23, 2025 | Mar 23, 2026 | 90 days | ✅ OK |

**Certificate Locations:**
- Plesk-managed: `/usr/local/psa/var/certificates/`
- Let's Encrypt (custom): `/etc/letsencrypt/live/<domain>/`

---

## 7. Disk Usage Analysis

### 7.1 Overall Disk Status

```
Filesystem                  Size  Used  Avail Use%
/dev/mapper/almalinux-root  152G  106G   46G  70%
```

### 7.2 Directory Breakdown

| Directory | Size | Purpose |
|-----------|------|---------|
| /var/www/vhosts/molochain.com/molochain-core/ | **4.3GB** | Main application |
| /var/www/vhosts/molochain.com/archives/ | **2.7GB** | Old cleanup archives |
| /var/www/vhosts/molochain.com/httpdocs/ | **2.4GB** | Public web root |
| /var/www/vhosts/molochain.com/OTMS-DOCKER/ | 894MB | OTMS microservices |
| /var/www/vhosts/molochain.com/BACKUPS/ | 506MB | Manual backups |
| /var/www/vhosts/molochain.com/cms.molochain.com/ | 189MB | Laravel CMS |
| /var/www/vhosts/molochain.com/mololink-docker/ | 157MB | Mololink source |
| /var/www/vhosts/molochain.com/backups/ | 150MB | Additional backups |
| /var/www/vhosts/molochain.com/logs/ | 50MB | Application logs |

### 7.3 Node Modules (Cleanup Candidates)

| Location | Size | Status |
|----------|------|--------|
| molochain-core/node_modules | **2.3GB** | Required |
| httpdocs/node_modules | **2.2GB** | Check if needed |
| cms.molochain.com/node_modules | 67MB | Required |
| **Total** | **~4.5GB** | |

### 7.4 Cleanup Candidates

| Item | Size | Risk | Recommendation |
|------|------|------|----------------|
| archives/2025-11-29_cleanup | **2.7GB** | Low | Delete after verification |
| httpdocs/node_modules | 2.2GB | Medium | Verify if httpdocs app is active |
| Docker reclaimable images | 5.76GB | Low | Run `docker system prune` |
| BACKUPS/*.zip older than 30d | ~400MB | Low | Archive to external storage |
| httpdocs-backup-* directories | ~85MB | Low | Delete after verification |
| .env.backup-* files | ~10MB | Low | Delete old backups |

---

## 8. Environment Files

### 8.1 Production Environment Files

| Location | Purpose |
|----------|---------|
| /var/www/vhosts/molochain.com/httpdocs/.env | Main website |
| /var/www/vhosts/molochain.com/molochain-core/.env | PM2 application |
| /var/www/vhosts/molochain.com/mololink-docker/.env | Mololink Docker |
| /var/www/vhosts/molochain.com/cms.molochain.com/.env | Laravel CMS |
| /var/www/vhosts/molochain.com/OTMS-DOCKER/service/.env | OTMS service |
| /var/www/vhosts/molochain.com/OTMS-DOCKER/auth-service/.env | Auth service |

### 8.2 Environment File Backups (Cleanup Candidates)

| File | Created | Recommendation |
|------|---------|----------------|
| molochain-core/.env.backup-2025-12-03-* | Dec 3 | Delete after 30 days |
| OTMS-DOCKER/auth-service/.env.backup-* | Various | Keep most recent, delete others |
| cms.molochain.com/.env.bak-* | Nov-Dec | Keep most recent |

---

## 9. Cron Jobs

| Schedule | User | Command | Purpose |
|----------|------|---------|---------|
| 0 2 * * * | root | /usr/local/bin/backup-molochain-db.sh | PostgreSQL backup |
| 0 2 * * * | root | /usr/local/bin/backup_mololink_db.sh | Mololink DB backup |

---

## 10. Health Check Results

| Endpoint | Status | Response Time |
|----------|--------|---------------|
| https://molochain.com/api/health | ✅ HTTP 200 | Fast |
| https://mololink.molochain.com/api/health | ✅ HTTP 200 | Fast |
| https://cms.molochain.com/api/health | ✅ HTTP 200 | Fast |
| https://opt.molochain.com | ✅ HTTP 200 | Fast |
| https://auth.molochain.com | ✅ HTTP 200 | Fast |
| https://admin.molochain.com | ✅ HTTP 200 | Fast |

**Last Verified:** December 23, 2025 14:36 UTC

---

## 11. Error Analysis

### 11.1 Recent Nginx Errors (Dec 20, 2025)

```
Connection refused to upstream http://127.0.0.1:5000
```

**Analysis:** These errors occurred when molochain-core was temporarily down. The application has since recovered (now has 19 restarts total).

### 11.2 opt.molochain.com Status

**✅ RESOLVED** - As of December 23, 2025 14:36 UTC, opt.molochain.com is returning HTTP 200.

**Previous Issue:** HTTP 502 (Bad Gateway) - The OTMS frontend was temporarily inaccessible.

**Resolution:** Service has been restored and is now operational.

---

## 12. Security Observations

### 12.1 Positive Findings
- ✅ SSL/TLS on all public endpoints
- ✅ HTTP/2 and QUIC enabled
- ✅ Rate limiting configured
- ✅ Fail2ban active
- ✅ Firewall (firewalld) running
- ✅ No exposed database ports externally

### 12.2 Areas for Improvement
- ⚠️ Secrets visible in ecosystem.config.cjs (should use env vars)
- ⚠️ Multiple .env backup files with potential sensitive data
- ⚠️ Kong admin (Konga) exposed on port 1337
- ⚠️ Prometheus/Alertmanager exposed (9090, 9093)

---

## 13. Recommended Actions

### 🔴 Critical (Do Immediately)

| Priority | Action | Command/Steps |
|----------|--------|---------------|
| P0 | Fix opt.molochain.com 502 | Check OTMS container, Apache proxy |
| P0 | Renew molochain.com SSL | `certbot renew` or Plesk SSL renewal |

### ⚠️ High Priority (This Week)

| Priority | Action | Estimated Savings |
|----------|--------|-------------------|
| P1 | Run Docker cleanup | `docker system prune -a` | 5.76GB |
| P1 | Delete archives/2025-11-29_cleanup | `rm -rf` | 2.7GB |
| P1 | Investigate PM2 19 restarts | Check logs, memory usage | - |

### 📋 Medium Priority (Next 2 Weeks)

| Priority | Action | Estimated Savings |
|----------|--------|-------------------|
| P2 | Audit httpdocs/node_modules | If unused, delete | 2.2GB |
| P2 | Clean old backup files | BACKUPS/, backups/ | ~150MB |
| P2 | Delete .env.backup-* files | Find & remove | ~10MB |
| P2 | Restrict monitoring ports | Firewall or auth | Security |

### 📝 Low Priority (Maintenance)

| Priority | Action |
|----------|--------|
| P3 | Document database purposes |
| P3 | Set up log rotation for custom logs |
| P3 | Review unused Docker volumes |
| P3 | Audit firewall port 3007 usage |

---

## 14. Cleanup Execution Plan

> ⚠️ **IMPORTANT:** Always verify contents before deletion. Create backups of critical data before running cleanup commands.

### Phase 1: Docker Cleanup

```bash
# ⚠️ WARNING: This removes ALL unused images, not just dangling ones
# First, preview what will be removed:
docker system df -v

# Only remove dangling images (safer):
docker image prune -f

# If you're certain no unused images are needed:
# docker system prune -a --force
# Note: --volumes flag would also remove unused volumes - use with caution!
```

**Estimated savings:** ~5.76GB (images only)

### Phase 2: Backup Archives Cleanup

```bash
# 1. ALWAYS verify contents first - check for any needed files
ls -la /var/www/vhosts/molochain.com/archives/2025-11-29_cleanup/
du -sh /var/www/vhosts/molochain.com/archives/2025-11-29_cleanup/

# 2. Create a manifest before deletion
find /var/www/vhosts/molochain.com/archives/2025-11-29_cleanup/ -type f > /tmp/archive_manifest.txt

# 3. If confirmed safe to delete (2.7GB):
rm -rf /var/www/vhosts/molochain.com/archives/2025-11-29_cleanup/

# 4. Clean old httpdocs backups (verify dates first)
ls -la /var/www/vhosts/molochain.com/httpdocs-backup-*
rm -rf /var/www/vhosts/molochain.com/httpdocs-backup-*
```

### Phase 3: Environment File Cleanup

```bash
# Remove old .env backups (keep most recent)
find /var/www/vhosts/molochain.com -name ".env.backup-*" -mtime +30 -delete
find /var/www/vhosts/molochain.com -name ".env.bak-*" -mtime +30 -delete
```

### Phase 4: Node Modules Audit

> ⚠️ **CAUTION:** Do NOT delete node_modules if the directory is used for active builds or development. Only delete if the application is serving pre-built static files.

```bash
# 1. Check if httpdocs is actively using Node.js
cat /var/www/vhosts/molochain.com/httpdocs/package.json

# 2. Check if there's a build script or if this is just static serving
ls -la /var/www/vhosts/molochain.com/httpdocs/dist/

# 3. Compare package.json with molochain-core to see if duplicate dependencies
diff /var/www/vhosts/molochain.com/httpdocs/package.json \
     /var/www/vhosts/molochain.com/molochain-core/package.json

# 4. ONLY if confirmed httpdocs is static-only serving:
# rm -rf /var/www/vhosts/molochain.com/httpdocs/node_modules
```

---

## 15. Monitoring & Alerting

### Current Stack
- **Prometheus:** http://server:9090
- **Alertmanager:** http://server:9093
- **Loki:** http://server:3100 (log aggregation)
- **Grafana:** https://grafana.molochain.com
- **Portainer:** http://localhost:9000

### Recommended Alerts
1. SSL certificate expiry (< 14 days)
2. Disk usage > 80%
3. PM2 process restarts > 5/hour
4. HTTP 5xx errors > 10/minute
5. Container health check failures

---

## 16. Email Infrastructure (molochain.com)

### 16.1 Mail Server Settings

| Setting | Value |
|---------|-------|
| IMAP Server | mail.molochain.com:993 (SSL) |
| SMTP Server | mail.molochain.com:465 (SSL) |
| Webmail | https://webmail.molochain.com |
| Management | Plesk control panel |
| Mail Storage | /var/qmail/mailnames/molochain.com/ |

### 16.2 Mailbox Inventory (51 total)

**Created December 23, 2025:** 38 new mailboxes added to support all public-facing email addresses.

| Category | Mailboxes | Count |
|----------|-----------|-------|
| Original | afsin, agents, billing, doc, hr, info, investors, molo, molochain, noreply, opt, sales, support | 13 |
| Legal/Compliance | legal, privacy | 2 |
| Regional Offices | istanbul, dubai, london, shanghai, rotterdam, newyork, casablanca, durban | 8 |
| Departments | customs, logistics, special, clients | 4 |
| Admin/Internal | admin, security, tech, content, marketing, dev, management, finance, operations | 9 |
| Customer Service | customer.service, brand | 2 |
| Agents | myilmaz, akaya, aalmaktoum, salfahim, jwilson, etaylor, lwei, zmin, mjohnson, jsmith, hbenali, tmotsepe, jdevries | 13 |

### 16.3 Email Forwarding Structure

All mailboxes retain their own inbox; forwarding creates copies for centralized management.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          HUB INBOXES                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ support@molochain.com                                                    │
│   ◄── istanbul, dubai, london, shanghai, rotterdam, newyork,           │
│       casablanca, durban, customer.service                              │
├─────────────────────────────────────────────────────────────────────────┤
│ operations@molochain.com                                                 │
│   ◄── customs, logistics, special, clients                             │
├─────────────────────────────────────────────────────────────────────────┤
│ admin@molochain.com                                                      │
│   ◄── security, tech, content, dev, management, finance                │
├─────────────────────────────────────────────────────────────────────────┤
│ legal@molochain.com                                                      │
│   ◄── privacy                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ marketing@molochain.com                                                  │
│   ◄── brand                                                             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    REGIONAL OFFICE CHAINS                               │
├─────────────────────────────────────────────────────────────────────────┤
│ istanbul@  ◄── myilmaz, akaya                                           │
│ dubai@     ◄── aalmaktoum, salfahim                                     │
│ london@    ◄── jwilson, etaylor                                         │
│ shanghai@  ◄── lwei, zmin                                               │
│ rotterdam@ ◄── mjohnson, jsmith, jdevries                               │
│ casablanca@◄── hbenali                                                  │
│ durban@    ◄── tmotsepe                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 16.4 Email Management Commands

```bash
# List all mailboxes
ls /var/qmail/mailnames/molochain.com/

# Check mailbox info
plesk bin mail --info user@molochain.com

# Add forwarding to existing mailbox
plesk bin mail -u user@molochain.com -forwarding true -forwarding-addresses "add:target@molochain.com"

# Remove forwarding
plesk bin mail -u user@molochain.com -forwarding-addresses "del:target@molochain.com"

# Create new mailbox
plesk bin mail --create user@molochain.com -passwd "SecurePassword123" -mailbox true
```

---

## 17. Appendices

### A. Key File Locations

| Purpose | Location |
|---------|----------|
| Main app source | /var/www/vhosts/molochain.com/molochain-core/ |
| Public web root | /var/www/vhosts/molochain.com/httpdocs/ |
| CMS Laravel | /var/www/vhosts/molochain.com/cms.molochain.com/ |
| Mololink Docker | /var/www/vhosts/molochain.com/mololink-docker/ |
| OTMS services | /var/www/vhosts/molochain.com/OTMS-DOCKER/ |
| Monitoring stack | /var/www/vhosts/molochain.com/monitoring/ |
| Custom Nginx | /etc/nginx/conf.d/ |
| Plesk vhost configs | /etc/nginx/plesk.conf.d/vhosts/ |
| PM2 ecosystem | /var/www/vhosts/molochain.com/molochain-core/ecosystem.config.cjs |
| Backup scripts | /usr/local/bin/backup-*.sh |

### B. Service Management Commands

```bash
# PM2
pm2 status
pm2 restart molochain-core
pm2 logs molochain-core

# Docker
docker ps -a
docker logs <container-name>
docker-compose -f /path/to/docker-compose.yml restart

# Nginx
nginx -t && systemctl reload nginx

# PostgreSQL
sudo -u postgres psql -c "\l"
```

### C. Quick Diagnostics

```bash
# Check all services health
curl -s https://molochain.com/api/health | jq
curl -s https://mololink.molochain.com/api/health | jq
curl -s https://cms.molochain.com/api/health | jq
curl -s https://opt.molochain.com/v1/health

# Check disk
df -h /

# Check Docker
docker system df

# Check PM2
pm2 status
```

---

**Report Generated:** December 23, 2025  
**Next Audit Recommended:** January 23, 2026
