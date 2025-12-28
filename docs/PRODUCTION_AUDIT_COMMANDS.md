# Production Audit Commands

Run these commands on your production server to complete the Phase 1 infrastructure inventory.

## Prerequisites

```bash
# SSH into your production server
ssh user@your-production-server

# Become root if needed
sudo -i
```

---

## 1) Infrastructure Inventory

### Server Information

```bash
# OS and version
cat /etc/os-release
uname -a

# Server resources
free -h
df -h
nproc
uptime
```

### Plesk Version (if applicable)

```bash
# Check Plesk version
plesk version
plesk bin --version

# List Plesk domains
plesk bin domain --list
```

### Web Server Stack

```bash
# Nginx version and status
nginx -v
systemctl status nginx

# Apache version (if used)
apache2 -v || httpd -v
systemctl status apache2 || systemctl status httpd

# List enabled sites
ls -la /etc/nginx/sites-enabled/
ls -la /etc/nginx/conf.d/
```

### SSL/TLS Certificates

```bash
# List all certificates
certbot certificates

# Check certificate expiry for each domain
for domain in molochain.com admin.molochain.com cms.molochain.com opt.molochain.com mololink.molochain.com; do
  echo "=== $domain ==="
  echo | openssl s_client -servername $domain -connect $domain:443 2>/dev/null | openssl x509 -noout -dates
done
```

### Firewall Rules

```bash
# UFW (Ubuntu)
ufw status verbose

# iptables
iptables -L -n

# Firewalld (CentOS/RHEL)
firewall-cmd --list-all
```

### Open Ports

```bash
# All listening ports
ss -tulpn
netstat -tulpn

# Check specific ports
for port in 80 443 5000 3000 5432 27017; do
  echo "Port $port: $(ss -tulpn | grep :$port)"
done
```

---

## 2) Runtime & Deployment Inventory

### Docker Inventory

```bash
# List all containers (running and stopped)
docker ps -a

# List images
docker images

# List networks
docker network ls

# List volumes
docker volume ls

# Inspect specific containers (replace CONTAINER_ID)
docker inspect CONTAINER_ID

# Check Docker Compose projects
find /var/www -name "docker-compose*.yml" -exec echo "Found: {}" \;
cat /var/www/vhosts/*/docker-compose.yml 2>/dev/null
```

### PM2 Services

```bash
# List all PM2 processes
pm2 list
pm2 jlist

# Show PM2 logs
pm2 logs --lines 50

# PM2 ecosystem file
cat /var/www/vhosts/*/ecosystem.config.js 2>/dev/null
```

### Systemd Services

```bash
# List custom services
systemctl list-units --type=service --state=running | grep -E "(node|pm2|nginx|mysql|postgres)"

# Check specific service
systemctl status molochain 2>/dev/null
systemctl status molochain-admin 2>/dev/null
```

### Cron Jobs

```bash
# System cron
crontab -l
cat /etc/crontab

# User crons
for user in root www-data node; do
  echo "=== $user ==="
  crontab -u $user -l 2>/dev/null
done

# Cron.d directory
ls -la /etc/cron.d/
```

### Runtime Versions

```bash
# Node.js
node --version
which node

# PHP
php --version
which php

# Python
python3 --version
which python3

# NPM/Yarn
npm --version
yarn --version 2>/dev/null

# Composer
composer --version 2>/dev/null
```

---

## 3) Codebase Inventory

### Filesystem Scan

```bash
# List all web projects
ls -la /var/www/vhosts/

# Check each subdomain folder
for domain in molochain.com admin.molochain.com cms.molochain.com opt.molochain.com mololink.molochain.com; do
  echo "=== $domain ==="
  if [ -d "/var/www/vhosts/$domain" ]; then
    ls -la /var/www/vhosts/$domain/
    
    # Detect framework
    [ -f "/var/www/vhosts/$domain/package.json" ] && echo "Framework: Node.js" && cat /var/www/vhosts/$domain/package.json | grep -A5 '"dependencies"'
    [ -f "/var/www/vhosts/$domain/composer.json" ] && echo "Framework: PHP/Laravel" && cat /var/www/vhosts/$domain/composer.json | grep -A2 '"require"'
    [ -f "/var/www/vhosts/$domain/requirements.txt" ] && echo "Framework: Python"
  else
    echo "Directory not found"
  fi
done
```

### Identify Build vs Source

```bash
# Find dist/build directories
find /var/www/vhosts -type d \( -name "dist" -o -name "build" -o -name ".next" -o -name "public" \) 2>/dev/null

# Check for node_modules
find /var/www/vhosts -type d -name "node_modules" -maxdepth 4 2>/dev/null

# Check for .git repos
find /var/www/vhosts -type d -name ".git" -maxdepth 4 2>/dev/null
```

---

## 4) Reverse Proxy Configuration

### Nginx Virtual Hosts

```bash
# Export all nginx configs
mkdir -p /tmp/nginx-audit
for conf in /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*.conf; do
  echo "=== $conf ===" >> /tmp/nginx-audit/all-configs.txt
  cat $conf >> /tmp/nginx-audit/all-configs.txt
  echo "" >> /tmp/nginx-audit/all-configs.txt
done

# Show proxy passes
grep -r "proxy_pass" /etc/nginx/ 2>/dev/null

# Show upstream definitions
grep -A5 "upstream" /etc/nginx/conf.d/*.conf 2>/dev/null
```

### Create Routing Map

```bash
# Generate routing table
echo "Domain,Upstream,Port" > /tmp/nginx-audit/routing-map.csv
grep -h "server_name\|proxy_pass" /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*.conf 2>/dev/null | \
  paste - - | \
  sed 's/server_name/\n/g' | \
  grep proxy_pass
```

---

## 5) Database Inventory

### PostgreSQL

```bash
# Check PostgreSQL status
systemctl status postgresql

# List databases
sudo -u postgres psql -c "\l"

# List users
sudo -u postgres psql -c "\du"

# Check database sizes
sudo -u postgres psql -c "SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) FROM pg_database;"
```

### MySQL/MariaDB

```bash
# Check MySQL status
systemctl status mysql || systemctl status mariadb

# List databases
mysql -u root -p -e "SHOW DATABASES;"

# List users
mysql -u root -p -e "SELECT user, host FROM mysql.user;"

# Database sizes
mysql -u root -p -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.TABLES GROUP BY table_schema;"
```

### Backup Status

```bash
# Check for backup scripts
ls -la /etc/cron.d/*backup* 2>/dev/null
ls -la /var/backups/

# Check Plesk backups
ls -la /var/lib/psa/dumps/ 2>/dev/null

# Check recent backups
find /var/backups -type f -mtime -7 -ls 2>/dev/null
```

---

## 6) Observability & Health

### Health Endpoints

```bash
# Test health endpoints
for domain in molochain.com admin.molochain.com opt.molochain.com; do
  echo "=== $domain ==="
  curl -s "https://$domain/api/health" | head -c 500
  echo ""
done
```

### Logs Location

```bash
# Nginx logs
ls -la /var/log/nginx/

# Application logs
find /var/www/vhosts -name "*.log" -type f 2>/dev/null | head -20

# PM2 logs
ls -la ~/.pm2/logs/ 2>/dev/null

# Systemd/journal logs
journalctl -u nginx --since "1 hour ago" | tail -50
```

### Error Hotspots

```bash
# Recent 502 errors
grep -i "502" /var/log/nginx/*.log | tail -20

# Recent 404 errors (top 10 paths)
grep "404" /var/log/nginx/access.log | awk '{print $7}' | sort | uniq -c | sort -rn | head -10

# Application crashes
grep -i "error\|exception\|crash" /var/www/vhosts/*/logs/*.log 2>/dev/null | tail -50
```

### Resource Usage

```bash
# Current memory/CPU snapshot
htop -b -n1 | head -30

# Top processes by CPU
ps aux --sort=-%cpu | head -15

# Top processes by memory
ps aux --sort=-%mem | head -15

# Disk I/O
iostat -x 1 5
```

---

## 7) DNS Verification

Run these from your local machine (not the server):

```bash
# A records
for domain in molochain.com admin.molochain.com cms.molochain.com opt.molochain.com mololink.molochain.com; do
  echo "=== $domain ==="
  dig +short A $domain
  dig +short AAAA $domain
  dig +short CNAME $domain
done

# MX records
dig +short MX molochain.com

# NS records
dig +short NS molochain.com
```

---

## Output Collection Script

Run this to collect all outputs into a single file:

```bash
#!/bin/bash
OUTPUT_FILE="/tmp/molochain-audit-$(date +%Y%m%d-%H%M%S).txt"

echo "=== MOLOCHAIN Production Audit ===" > $OUTPUT_FILE
echo "Date: $(date)" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Add each command output...
echo "=== OS Info ===" >> $OUTPUT_FILE
cat /etc/os-release >> $OUTPUT_FILE

echo "=== Docker Containers ===" >> $OUTPUT_FILE
docker ps -a >> $OUTPUT_FILE 2>&1

echo "=== PM2 Processes ===" >> $OUTPUT_FILE
pm2 jlist >> $OUTPUT_FILE 2>&1

echo "=== Nginx Configs ===" >> $OUTPUT_FILE
grep -r "proxy_pass" /etc/nginx/ >> $OUTPUT_FILE 2>&1

echo "=== Database List ===" >> $OUTPUT_FILE
sudo -u postgres psql -c "\l" >> $OUTPUT_FILE 2>&1

echo ""
echo "Audit saved to: $OUTPUT_FILE"
echo "Download with: scp user@server:$OUTPUT_FILE ."
```

---

## Next Steps

After running these commands:

1. Save all outputs to files
2. Share the collected data for analysis
3. Identify any UNKNOWN items that couldn't be verified
4. Proceed to Phase 2 target architecture planning
