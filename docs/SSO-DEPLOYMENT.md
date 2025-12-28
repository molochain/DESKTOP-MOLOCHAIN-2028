# Cross-Subdomain SSO Deployment Guide

## Overview

This guide covers deploying the cross-subdomain SSO configuration to production. The SSO system enables seamless authentication across all MoloChain subdomains using shared session cookies.

## Prerequisites

- SSH access to production server
- PM2 and Docker installed on production
- Valid SSL certificates for all subdomains

## Configuration Summary

### Cookie Settings (Production)
| Setting | Value |
|---------|-------|
| Cookie Name | `molochain.sid` |
| Domain | `.molochain.com` |
| SameSite | `None` |
| Secure | `true` |
| HttpOnly | `true` |

### CORS Allowed Origins
All 9 subdomains are configured:
- `https://molochain.com`
- `https://www.molochain.com`
- `https://admin.molochain.com`
- `https://app.molochain.com`
- `https://api.molochain.com`
- `https://auth.molochain.com`
- `https://opt.molochain.com`
- `https://mololink.molochain.com`
- `https://cms.molochain.com`

## Deployment Steps

### Option 1: Using Deployment Script

```bash
# From development machine (syncs and restarts)
./scripts/deploy-sso-update.sh

# Or on production server directly
./scripts/deploy-sso-update.sh --local
```

### Option 2: Manual Deployment

#### Step 1: Sync Configuration Files

```bash
# Copy PM2 config
scp ecosystem.config.production.cjs root@molochain.com:/var/www/molochain/current/

# Copy Docker config
scp docker/docker-compose.yml root@molochain.com:/var/www/vhosts/molochain.com/admin-docker/
```

#### Step 2: Restart PM2 Services

```bash
ssh root@molochain.com
cd /var/www/molochain/current
pm2 reload ecosystem.config.production.cjs --update-env
pm2 save
pm2 status
```

#### Step 3: Restart Docker Services

```bash
cd /var/www/vhosts/molochain.com/admin-docker
docker-compose up -d --force-recreate
docker ps
```

## Validation

### Test 1: Health Check

```bash
# Main app
curl -s https://molochain.com/api/health | jq '.status'
# Expected: "healthy"

# Admin app
curl -s https://admin.molochain.com/api/health | jq '.status'
# Expected: "healthy"
```

### Test 2: Login and Cookie Verification

```bash
# Login and capture cookies
curl -v -X POST https://molochain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@molochain.com","password":"YOUR_PASSWORD"}' \
  -c cookies.txt 2>&1 | grep -E "Set-Cookie|molochain.sid"
```

**Expected Response Headers:**
```
Set-Cookie: molochain.sid=s%3A...; Domain=.molochain.com; Path=/; HttpOnly; Secure; SameSite=None
```

### Test 3: Cross-Subdomain Session Persistence

```bash
# Check session on main domain
curl -s https://molochain.com/api/auth/me -b cookies.txt | jq '.authenticated'
# Expected: true

# Check session on admin subdomain
curl -s https://admin.molochain.com/api/auth/me -b cookies.txt | jq '.authenticated'
# Expected: true
```

### Test 4: Browser Validation

1. Open Chrome/Firefox DevTools (F12)
2. Go to Application > Cookies
3. Login at `https://molochain.com/login`
4. Verify cookie `molochain.sid`:
   - Domain: `.molochain.com` (note the leading dot)
   - Secure: ✓
   - SameSite: None
   - HttpOnly: ✓
5. Navigate to `https://admin.molochain.com`
6. Verify you remain authenticated (no re-login required)

## Troubleshooting

### Cookie Not Shared Across Subdomains

**Symptoms:** User must re-login when switching subdomains

**Solutions:**
1. Verify cookie domain starts with `.` (dot prefix)
2. Ensure `SameSite=None` and `Secure=true` are set
3. Check all subdomains use HTTPS
4. Verify CORS includes the origin subdomain

### CORS Errors

**Symptoms:** Browser console shows CORS policy errors

**Solutions:**
1. Check `ALLOWED_ORIGINS` environment variable includes all subdomains
2. Verify credentials are allowed (`Access-Control-Allow-Credentials: true`)
3. Ensure preflight OPTIONS requests are handled

### Session Not Persisting

**Symptoms:** User is logged out after page refresh

**Solutions:**
1. Verify `SESSION_SECRET` is consistent across all services
2. Check session store (memory/Redis) is properly configured
3. Ensure cookie `maxAge` is set appropriately

## Files Modified

| File | Purpose |
|------|---------|
| `config.ts` | Runtime SSO configuration |
| `server/core/auth/auth.service.ts` | Session & cookie handling |
| `packages/shared-auth/index.ts` | Shared auth utilities |
| `ecosystem.config.production.cjs` | PM2 production config |
| `docker/docker-compose.yml` | Docker production config |

## Security Notes

1. **SameSite=None requires Secure=true** - This is a browser security requirement
2. **HTTPS Required** - All subdomains must use valid SSL certificates
3. **CSRF Protection** - Enabled and configured with matching cookie settings
4. **Session Secret** - Must be consistent across all services sharing sessions
