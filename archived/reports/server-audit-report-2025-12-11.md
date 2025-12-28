# Production Server Deep Audit Report

> **Note:** This is a historical snapshot from December 11, 2025. For current server status, run a fresh audit.

**Server:** 31.186.24.19 (zen-agnesi.31-186-24-19.plesk.page)  
**Scan Timestamp:** December 11, 2025 11:02:21 +03 (HISTORICAL)  
**OS:** AlmaLinux 9.7 (Moss Jungle Cat)  
**Kernel:** Linux 5.14.0-570.46.1.el9_6.x86_64  
**Virtualization:** VMware VM  

---

## Executive Summary

| Category | Status | Score |
|----------|--------|-------|
| **Overall Health** | Good | **78/100** |
| **Security** | Good | **80/100** |
| **Docker Infrastructure** | Good | **82/100** |
| **Web Services** | Needs Attention | **68/100** |
| **Databases** | Excellent | **95/100** |
| **Backups** | Good | **85/100** |
| **SSL Certificates** | Good | **90/100** |

---

## Critical Issues Summary

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Nginx service failing to start | 🔴 HIGH | Needs fix |
| 2 | certbot-renew service failed | 🟡 MEDIUM | Needs attention |
| 3 | Dr.Web antivirus license missing | 🟡 MEDIUM | License expired |
| 4 | /var/log/messages 3.6GB | 🟡 MEDIUM | Needs rotation |
| 5 | PM2 membership-service errored | 🟡 MEDIUM | Process crashed |
| 6 | SSH root password auth enabled | 🟡 MEDIUM | Security risk |

---

## 1. System Resources (LIVE)

### Hardware Specs
| Resource | Value |
|----------|-------|
| CPU | 4 vCPUs (AMD EPYC 7452 32-Core) |
| RAM | 7.7 GB |
| Disk | 152 GB |
| Type | VMware Virtual Platform |

### Current Usage
| Resource | Used | Total | Percentage | Status |
|----------|------|-------|------------|--------|
| **CPU Load** | 0.83 | 4.0 | 21% | 🟢 Normal |
| **Memory** | 3.7 GB | 7.7 GB | 48% | 🟢 OK |
| **Swap** | 1.4 GB | 8.0 GB | 17% | 🟢 OK |
| **Disk** | 74 GB | 152 GB | 49% | 🟢 OK |
| **Inodes** | 2.1M | 79M | 3% | 🟢 OK |

### Uptime
- **26 days, 16 hours, 15 minutes**
- Load Average: 0.83, 0.66, 0.50

---

## 2. Service Status (LIVE)

### Critical Services
| Service | Status | Notes |
|---------|--------|-------|
| httpd (Apache) | 🟢 Active | Running |
| nginx | 🔴 **Activating/Failing** | Config deprecation |
| mariadb | 🟢 Active | Running 27 days |
| postgresql | 🟢 Active | Running 9 days |
| docker | 🟢 Active | Running |
| fail2ban | 🟢 Active | 12 jails |
| firewalld | 🟢 Active | Plesk zone |
| sshd | 🟢 Active | Running |
| postfix | 🟢 Active | Mail server |
| dovecot | 🟢 Active | IMAP/POP3 |

### Failed Services
| Service | Status | Issue |
|---------|--------|-------|
| certbot-renew.service | 🔴 Failed | Auto-renewal broken |

### All Running Services (38 total)
```
NetworkManager, agent360, auditd, containerd, crond, dbus-broker,
docker, dovecot, fail2ban, firewalld, grafana-server, httpd,
imunify-agent-proxy, irqbalance, mariadb, monit, named-chroot,
pc-remote, plesk-php84-fpm, plesk-ssh-terminal, plesk-task-manager,
plesk-web-socket, postfix, postgresql, redis, rsyslog, spamassassin,
sshd, sw-collectd, sw-cp-server, sw-engine, systemd-journald,
systemd-logind, systemd-udevd
```

---

## 3. Docker Containers (LIVE)

### Container Status
| Container | Status | Uptime | CPU | Memory |
|-----------|--------|--------|-----|--------|
| auth-service | 🟢 Running | 14h | 0.35% | 22.8 MB |
| redis-session | 🟢 Running | 15h | 0.50% | 2.7 MB |
| **otms-service** | 🟢 Running | **15 min** | 0% | 48 MB |
| kong-gateway | 🟢 Healthy | 22h | 0.69% | 318 MB |
| kong-database | 🟢 Running | 22h | 0.32% | 21.5 MB |
| konga-admin | 🟢 Running | 14h | 0% | 18.8 MB |
| molochain-prometheus | 🟢 Running | 8d | 0.02% | 29.2 MB |
| molochain-loki | 🟢 Running | 8d | 0.36% | 81.7 MB |
| molochain-alertmanager | 🟢 Running | 8d | 0.09% | 22.2 MB |
| molochain-promtail | 🟢 Running | 8d | 0.44% | 27.7 MB |
| plesk-portainer | 🟢 Running | 8d | 0% | 18.7 MB |
| otms-dashboard-frontend | ⚫ Exited | 13d ago | - | - |
| otms-dashboard | ⚫ Exited | 13d ago | - | - |
| kong-migrations | ⚫ Exited | 2w ago | - | - |
| kong-migration | ⚫ Exited | 2mo ago | - | - |

**Note:** otms-service is now running (recovered from restart loop)

### Docker Disk Usage
| Type | Total | Active | Size | Reclaimable |
|------|-------|--------|------|-------------|
| Images | 34 | 14 | 5.22 GB | 4.1 GB (78%) |
| Containers | 15 | 11 | 1.51 GB | 458 KB |
| Volumes | 13 | 7 | 248 MB | 93 MB (37%) |
| Build Cache | 92 | 0 | 558 MB | 67 MB |

### Docker Networks
- bridge, host, none (default)
- kong-stack_kong-net
- microservices_molochain-network
- molochain-core
- monitoring_monitoring
- otms-net

---

## 4. PM2 Processes (LIVE)

### Root User
| Name | Status | PID | Uptime | Memory |
|------|--------|-----|--------|--------|
| mololink-service | 🟢 Online | 3853195 | 13h | 62.7 MB |
| pm2-logrotate | 🟢 Online | 3822176 | - | 71.6 MB |
| pm2-server-monit | 🟢 Online | 3822167 | - | 61.5 MB |

### afsadm User
| Name | Status | Restarts | Memory |
|------|--------|----------|--------|
| molochain-prod | 🟢 Online | 0 | 182.2 MB |
| membership-service | 🔴 **Errored** | 15 | 0 |
| admin-service | ⚫ Stopped | 639 | 0 |
| cms-service | ⚫ Stopped | 0 | 0 |
| github-app | ⚫ Stopped | 0 | 0 |
| websocket-gateway (x2) | ⚫ Stopped | 695+ | 0 |
| pm2-logrotate | 🟢 Online | 0 | 57.3 MB |

---

## 5. SSL Certificates (LIVE CHECK)

| Domain | Expires | Days Left | Status |
|--------|---------|-----------|--------|
| molochain.com | Jan 4, 2026 | 24 | 🟢 Valid |
| www.molochain.com | Jan 4, 2026 | 24 | 🟢 Valid |
| cms.molochain.com | Jan 4, 2026 | 24 | 🟢 Valid |
| mololink.molochain.com | Jan 4, 2026 | 24 | 🟢 Valid |
| api.molochain.com | Jan 4, 2026 | 24 | 🟢 Valid |
| app.molochain.com | Jan 4, 2026 | 24 | 🟢 Valid |
| admin.molochain.com | Jan 4, 2026 | 24 | 🟢 Valid |
| opt.molochain.com | Jan 4, 2026 | 24 | 🟢 Valid |
| grafana.molochain.com | Jan 4, 2026 | 24 | 🟢 Valid |
| auth.molochain.com | Mar 8, 2026 | 87 | 🟢 Valid |

**Warning:** certbot-renew service has failed - manual renewal may be needed before Jan 4.

---

## 6. Security Assessment (LIVE)

### Firewall Configuration
**Status:** 🟢 Active (Plesk zone)

**Open Ports:**
```
22/tcp, 21/tcp, 25/tcp, 53/tcp, 53/udp, 80/tcp, 110/tcp, 143/tcp,
443/tcp, 443/udp, 465/tcp, 587/tcp, 993/tcp, 995/tcp, 3007/tcp,
5000/tcp, 8443/tcp, 8443/udp, 8447/tcp, 8880/tcp, 49152-65535/tcp
```

### Fail2Ban Status
| Metric | Value |
|--------|-------|
| Active Jails | 12 |
| Currently Failed (SSH) | 5 |
| Total Failed (SSH) | 45,647 |
| Total Banned (SSH) | 6,573 |
| Currently Banned | 0 |

**Jails:** ssh, recidive, plesk-apache, plesk-apache-badbot, plesk-dovecot, plesk-panel, plesk-postfix, plesk-proftpd, plesk-roundcube, plesk-wordpress, plesk-one-week-ban, plesk-permanent-ban

### SSH Security
| Setting | Current | Recommendation |
|---------|---------|----------------|
| Root Login | Allowed | Use keys only |
| Password Auth | Enabled | Disable |
| Port | 22 | Consider changing |

### User Accounts with Sudo
| User | Sudo Access | Risk Level |
|------|-------------|------------|
| afsadm | NOPASSWD ALL | 🟡 High |
| molochain1 | NOPASSWD ALL | 🟡 High |

### Recent Failed Login Attempts (Today)
```
92.118.39.180 (root), 27.71.16.87 (root), 103.112.245.93 (root),
117.72.35.203 (root), 46.226.123.65 (root), 92.118.39.100 (root),
160.251.204.85 (root), 92.118.39.84 (root), 45.148.10.121 (AdminGPON),
204.76.203.83 (user)
```
**Verdict:** Active brute force attempts, but Fail2Ban is blocking effectively.

---

## 7. Databases (LIVE)

### MariaDB 10.5
| Property | Value |
|----------|-------|
| Status | 🟢 Active |
| Uptime | 27 days |
| Databases | apsc, molochain_cms, mysql, performance_schema, phpmyadmin, psa, roundcubemail |

### PostgreSQL
| Property | Value |
|----------|-------|
| Status | 🟢 Active |
| Uptime | 9 days |
| Used By | Kong Gateway, OTMS, Auth services |

---

## 8. Hosted Domains (16)

```
molochain.com          admin.molochain.com    ai.molochain.com
api.molochain.com      app.molochain.com      auth.molochain.com
cdn.molochain.com      cms.molochain.com      db.molochain.com
grafana.molochain.com  mololink.molochain.com opt.molochain.com
server.molochain.com   ws.molochain.com       soorchico.com
Turkat.com
```

---

## 9. Web Server Configuration

### Nginx
**Status:** 🔴 Failing to start

**Error:**
```
nginx: [warn] the "listen ... http2" directive is deprecated, 
use the "http2" directive instead in /etc/nginx/conf.d/cdn.molochain.com.conf:2
```

**Config Test:** Syntax OK but service not starting

### Apache (httpd)
**Status:** 🟢 Active
**Config Test:** Syntax OK

---

## 10. Disk & Log Analysis

### Log File Sizes
| File | Size | Status |
|------|------|--------|
| /var/log/messages | **3.6 GB** | 🔴 Needs rotation |
| /var/log/plesk | 668 MB | 🟡 Large |
| /var/log/secure | 128 MB | OK |
| /var/log/monit.log | 72 MB | OK |
| /var/log/imunify360 | 62 MB | OK |
| /var/log/cron | 54 MB | OK |

### Large Backup Files
| File | Size |
|------|------|
| backup_user-data_2511290001_2511300001.tzst | 2.2 GB |
| backup_user-data_2511290001.tzst | 1.1 GB |
| backup_user-data_2511211308.tzst | 870 MB |
| backup_user-data_2511150002.tzst | 868 MB |

---

## 11. Backups (LIVE)

### Plesk Automated Backups
- **Location:** /var/lib/psa/dumps/
- **Latest:** Dec 11, 2025
- **Frequency:** Daily
- **Status:** 🟢 Active

### Custom Database Backup
- **Script:** /usr/local/bin/backup-molochain-db.sh
- **Schedule:** Daily at 2:00 AM
- **Database:** molochaindb (PostgreSQL)
- **Retention:** 30 days

---

## 12. Recent Errors (Last Hour)

| Time | Error |
|------|-------|
| 11:03 | Nginx service failed to start (multiple times) |
| 11:03 | Dr.Web license key not found |
| 11:03 | Dr.Web Plesk authorization failed |

---

## 13. Pending Updates

| Package | Current | Available |
|---------|---------|-----------|
| kernel | 5.14.0-570 | 5.14.0-611.11.1 |
| kernel-core | 5.14.0-570 | 5.14.0-611.11.1 |
| kernel-modules | 5.14.0-570 | 5.14.0-611.11.1 |
| kernel-tools | 5.14.0-570 | 5.14.0-611.11.1 |

---

## Priority Action Items

### 🔴 CRITICAL (Today)

1. **Fix Nginx Service**
   ```bash
   # Edit /etc/nginx/conf.d/cdn.molochain.com.conf
   # Change: listen 443 ssl http2;
   # To: listen 443 ssl;
   #     http2 on;
   systemctl restart nginx
   ```

2. **Fix certbot-renew**
   ```bash
   systemctl status certbot-renew
   journalctl -u certbot-renew
   certbot renew --dry-run
   ```

3. **Rotate Large Log File**
   ```bash
   logrotate -vf /etc/logrotate.d/syslog
   # Or truncate if urgent:
   cat /dev/null > /var/log/messages
   ```

### 🟡 HIGH (This Week)

4. **Fix PM2 membership-service**
   ```bash
   su - afsadm
   pm2 logs membership-service --lines 50
   pm2 restart membership-service
   ```

5. **Dr.Web Antivirus License**
   - License key missing at /opt/drweb/drweb32.key
   - Contact vendor or disable service

6. **Harden SSH**
   ```bash
   # Edit /etc/ssh/sshd_config
   PermitRootLogin prohibit-password
   PasswordAuthentication no
   ```

7. **Remove NOPASSWD from sudo**
   ```bash
   # Edit /etc/sudoers.d/afsadm and /etc/sudoers.d/molochain1
   # Remove NOPASSWD
   ```

### 🟢 MEDIUM (This Month)

8. **Apply Kernel Updates**
   ```bash
   dnf update kernel -y
   reboot  # Schedule maintenance window
   ```

9. **Clean Stopped Containers**
   ```bash
   docker container prune -f
   docker image prune -f
   ```

10. **Clean Stopped PM2 Processes**
    ```bash
    pm2 delete admin-service cms-service github-app websocket-gateway
    ```

---

## Infrastructure Grade Card

| Component | Grade | Notes |
|-----------|-------|-------|
| **Hardware Resources** | A | 4 vCPUs, 7.7GB RAM, adequate |
| **Operating System** | A- | AlmaLinux 9.7, kernel updates pending |
| **Security (Firewall)** | A | Firewalld + Fail2Ban active |
| **Security (SSH)** | B- | Root password auth enabled |
| **Security (Users)** | B- | NOPASSWD sudo access |
| **Web Server** | C | Nginx failing, Apache running |
| **Databases** | A | MariaDB + PostgreSQL healthy |
| **Docker** | A- | 11/15 containers running |
| **PM2 Processes** | B | 1 errored, several stopped |
| **SSL/TLS** | A- | Valid until Jan 2026, renewal service broken |
| **Backups** | A | Daily automated + custom scripts |
| **Monitoring** | A | Full Prometheus/Grafana/Loki stack |
| **Disk Usage** | B+ | 49% used, log rotation needed |

---

## Overall Server Health: **78/100 (B+)**

### Summary
Your production server is **generally healthy** with good infrastructure, active security protections, and comprehensive monitoring. The main issues requiring attention are:

1. **Nginx service not running** - Quick fix needed
2. **Log file growth** - Rotation needed
3. **SSH hardening** - Security improvement opportunity
4. **Certbot renewal** - Ensure auto-renewal works before Jan 4

With these fixes applied, the server would achieve an **A- (88/100)** rating.

---

*Deep Scan Completed: December 11, 2025 11:02:21 +03*  
*Data Source: Live SSH connection to 31.186.24.19*  
*Next Recommended Audit: January 11, 2026*
