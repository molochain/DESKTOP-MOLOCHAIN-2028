# Molochain-Core Production Deployment Guide

## Server Requirements

Your Plesk server meets all requirements:
- **OS**: AlmaLinux 9.7
- **CPU**: 4 cores (AMD EPYC)
- **RAM**: 7.5GB
- **Node.js**: v20.19.6
- **PostgreSQL**: 13.22
- **Nginx**: Via Plesk

## Quick Deployment

### 1. Initial Setup (First Time Only)

```bash
# SSH to your server
ssh root@your-server-ip

# Navigate to project
cd /var/www/vhosts/molochain.com/molochain-core

# Install PM2 globally
npm install -g pm2

# Install dependencies
npm ci

# Create logs directory
mkdir -p logs

# Make build script executable
chmod +x scripts/build-production.sh
```

### 2. Configure Environment

Create/update `.env` file with production settings:

```bash
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000

# Database (local PostgreSQL)
DATABASE_URL=postgresql://molodb:YOUR_PASSWORD@127.0.0.1:5432/molochaindb
DB_POOL_SIZE=20
DB_STATEMENT_TIMEOUT=60000
DB_IDLE_TIMEOUT=10000

# Add your other environment variables here
# JWT_SECRET=your-secret-key
# SESSION_SECRET=your-session-secret
EOF
```

### 3. Build and Deploy

```bash
# Run the production build
./scripts/build-production.sh
```

This script will:
1. Create a backup of the current build
2. Build the frontend with code splitting and compression
3. Bundle the backend with esbuild
4. Copy static files to httpdocs
5. Restart the Node.js app via PM2

### 4. Configure Nginx in Plesk

In Plesk → molochain.com → Apache & nginx Settings:

**Additional nginx directives** (add to the site config):

```nginx
# Upstream for Node.js backend
upstream molochain_backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

# Static assets with long cache
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
}

# Pre-compressed files
location ~* \.(js|css|html|json|xml|svg)$ {
    gzip_static on;
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
}

# API routes - proxy to Node.js
location /api/ {
    proxy_pass http://molochain_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
    
    # Optional: Rate limiting (add zone to nginx.conf first)
    # limit_req zone=api_limit burst=20 nodelay;
}

# WebSocket
location /ws {
    proxy_pass http://molochain_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 86400;
}

# Socket.io
location /socket.io/ {
    proxy_pass http://molochain_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}

# SPA fallback
location / {
    try_files $uri $uri/ /index.html;
}
```

### 5. PM2 Startup Configuration

```bash
# Save PM2 process list
pm2 save

# Generate startup script
pm2 startup

# Follow the instructions output by the above command
```

## Daily Operations

### Deploy Updates

```bash
cd /var/www/vhosts/molochain.com/molochain-core
git pull origin main
./scripts/build-production.sh
```

### Monitor Application

```bash
# View status
pm2 status

# View logs
pm2 logs molochain-core

# View real-time metrics
pm2 monit
```

### Restart Application

```bash
# Graceful reload (zero downtime)
pm2 reload molochain-core

# Hard restart
pm2 restart molochain-core
```

## Performance Optimizations

### 1. Frontend Optimizations (Included)

- **Code Splitting**: Vendor chunks separated for better caching
- **Compression**: Gzip and Brotli pre-compressed files
- **Minification**: JS/CSS minified with Terser
- **Tree Shaking**: Unused code removed
- **Long-term Caching**: Assets use content hashing

### 2. Backend Optimizations (Included)

- **Cluster Mode**: PM2 runs Node.js in cluster mode (4 instances)
- **Memory Limits**: Each instance limited to 1.5GB
- **Graceful Restart**: Zero-downtime deployments
- **Connection Pooling**: 20 DB connections per instance

### 3. Database Optimizations

Run the optimization script during a maintenance window:

```bash
psql -U molodb -d molochaindb -f scripts/db-optimize.sql
```

Key settings for your 7.5GB RAM server:
- `shared_buffers`: 1.8GB
- `effective_cache_size`: 5GB
- `work_mem`: 64MB
- `max_connections`: 120

### 4. Nginx Caching (Optional)

Add proxy caching for API responses:

```nginx
# In http block (nginx.conf)
proxy_cache_path /var/cache/nginx/molochain levels=1:2 keys_zone=molochain_cache:10m max_size=1g inactive=60m;

# In location /api/ block
proxy_cache molochain_cache;
proxy_cache_valid 200 5m;
proxy_cache_bypass $http_cache_control;
add_header X-Cache-Status $upstream_cache_status;
```

## Monitoring Setup

### PM2 Keymetrics (Optional)

```bash
pm2 link YOUR_PRIVATE_KEY YOUR_PUBLIC_KEY
```

### Log Rotation

PM2 includes log rotation. Configure in `ecosystem.config.production.cjs` or use logrotate:

```bash
cat > /etc/logrotate.d/molochain << 'EOF'
/var/www/vhosts/molochain.com/molochain-core/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 root root
}
EOF
```

### Health Check Endpoint

Add to your monitoring system:
```
https://molochain.com/api/health
```

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs molochain-core --lines 100

# Check if port is in use
lsof -i :5000

# Check Node.js errors
node dist/index.js
```

### High Memory Usage

```bash
# Check PM2 memory
pm2 monit

# Reduce cluster instances if needed
# Edit ecosystem.config.production.cjs: instances: 2
pm2 reload ecosystem.config.production.cjs
```

### Database Connection Issues

```bash
# Test connection
psql -U molodb -d molochaindb -c "SELECT 1;"

# Check active connections
psql -U molodb -d molochaindb -c "SELECT count(*) FROM pg_stat_activity;"

# Check if pool is exhausted
pm2 logs molochain-core | grep -i "connection"
```

### Nginx Issues

```bash
# Test config
nginx -t

# Reload nginx
systemctl reload nginx

# Check nginx logs
tail -f /var/log/nginx/error.log
```

## Rollback

If a deployment fails:

```bash
# List backups
ls -la /var/www/vhosts/molochain.com/BACKUPS/

# Restore from backup
cd /var/www/vhosts/molochain.com
rm -rf httpdocs/*
tar -xzf BACKUPS/httpdocs-TIMESTAMP.tar.gz -C httpdocs/

# Restart app
pm2 reload molochain-core
```

## Security Checklist

- [ ] SSL certificate configured (Let's Encrypt via Plesk)
- [ ] Database password is strong
- [ ] `.env` file has restrictive permissions (`chmod 600 .env`)
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Rate limiting enabled for API endpoints
- [ ] Security headers configured in Nginx
- [ ] Regular backups scheduled
