# Molochain Cross-Subdomain Authentication Integration Report

**Date:** December 21, 2025  
**Server:** 31.186.24.19  
**Status:** Audit Complete - Issues Identified

---

## Evidence Sources

This report distinguishes between two types of findings:

| Source Type | Symbol | Description |
|-------------|--------|-------------|
| **Code Analysis** | 📝 | Verified in repository source files |
| **Runtime Observation** | 🔍 | Captured from live production server via SSH |

All runtime observations were captured via SSH to root@31.186.24.19 on December 21, 2025.

---

## 1. Executive Summary

This report documents the comprehensive audit of the centralized authentication system across all Molochain subdomains. The audit identified **critical configuration gaps** preventing seamless SSO (Single Sign-On) across subdomains.

### Current State: ⚠️ Partially Integrated

| Subdomain | Auth Endpoint | Status | Issues |
|-----------|--------------|--------|--------|
| auth.molochain.com | ✅ 200 OK | Working | CORS not configured for itself |
| molochain.com | ✅ 401 (Expected) | Working | Cookie domain not set |
| opt.molochain.com | ✅ 401 (Expected) | Working | Configured correctly |
| mololink.molochain.com | ✅ 401 (Expected) | Working | Missing from CORS whitelist |

---

## 2. Infrastructure Overview

### 2.1 Docker Services

| Service | Container | Port | Status |
|---------|-----------|------|--------|
| Central Auth | auth-service | 3002→7010 | ✅ Up 8+ days |
| Redis Session | redis-session | 6379 | ✅ Up 8+ days |
| Kong Gateway | kong-gateway | 8000/8001/8443 | ✅ Up 7 days (healthy) |
| OTMS | otms-service | 3009 | ✅ Up 7 days |
| Mololink | mololink-app | 5001 | ✅ Up 9 hours (healthy) |

### 2.2 Auth Service Configuration

```plaintext
PORT=3002
NODE_ENV=production
JWT_SECRET=molochain-production-jwt-secret-2024
JWT_EXPIRY=24h
CORS_ORIGIN=https://molochain.com,https://www.molochain.com,https://opt.molochain.com,https://app.molochain.com
REDIS_HOST=172.22.0.2
REDIS_PORT=6379
DATABASE_URL=postgresql://molodb:***@31.186.24.19:5432/molochaindb
```

---

## 3. Critical Issues Identified

### 🔴 Issue 1: Cookie Domain Not Configured for Cross-Subdomain SSO

📝 **Evidence Source:** Code Analysis - `server/index.ts` and `server/index.prod.ts`

**Current Configuration (server/index.ts):**
```typescript
cookie: {
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict'  // ❌ Blocks cross-subdomain sharing
}
// ❌ Missing: domain: '.molochain.com'
```

**Impact:** Session cookies are scoped to the specific subdomain where login occurs. Users must log in separately on each subdomain.

**Required Fix:**
```typescript
cookie: {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',  // Changed from 'strict' for cross-subdomain
  domain: '.molochain.com'  // Share across all subdomains
}
```

### 🔴 Issue 2: CORS Origins Missing Subdomains

🔍 **Evidence Source:** Runtime Observation - `docker exec auth-service env | grep CORS_ORIGIN`

**Current CORS Configuration (from auth-service container env):**
- ✅ molochain.com
- ✅ www.molochain.com
- ✅ opt.molochain.com
- ✅ app.molochain.com
- ❌ **MISSING: mololink.molochain.com**
- ❌ **MISSING: auth.molochain.com**
- ❌ **MISSING: admin.molochain.com**

**Verification Command:**
```bash
docker exec auth-service env | grep CORS_ORIGIN
# Output: CORS_ORIGIN=https://molochain.com,https://www.molochain.com,https://opt.molochain.com,https://app.molochain.com
```

**Impact:** API requests from mololink.molochain.com may be blocked by CORS policy.

**Required Fix (Docker env):**
```plaintext
CORS_ORIGIN=https://molochain.com,https://www.molochain.com,https://opt.molochain.com,https://app.molochain.com,https://mololink.molochain.com,https://auth.molochain.com,https://admin.molochain.com
```

### 🟡 Issue 3: Kong Gateway Has No JWT Plugin

🔍 **Evidence Source:** Runtime Observation - `curl http://localhost:8001/plugins`

**Current State:** Kong gateway routes are configured but no authentication plugins are enabled.

**Verification Command:**
```bash
curl -s http://localhost:8001/plugins
# Output: {"data":[],"next":null}
```

**Impact:** API gateway does not validate JWT tokens at the edge. All auth validation happens at application level.

**Recommendation:** Configure Kong JWT plugin for gateway-level validation:
```bash
curl -X POST http://localhost:8001/services/mololink-service/plugins \
  --data "name=jwt" \
  --data "config.claims_to_verify=exp"
```

### 🟡 Issue 4: No Database Auth Triggers

🔍 **Evidence Source:** Runtime Observation - PostgreSQL query on molochaindb

**Verification Command:**
```sql
SELECT trigger_name, event_object_table, action_statement 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

**Current Triggers:**
```sql
-- Only 1 trigger exists (not auth-related)
update_services_updated_at | UPDATE | services | EXECUTE FUNCTION update_updated_at_column()
```

**Missing Triggers:**
- `on_user_created` - Log new user registrations
- `on_login_success` - Audit successful logins
- `on_login_failure` - Track failed login attempts
- `on_token_refresh` - Log token refresh events
- `on_password_change` - Audit password changes

**Recommended Triggers:**
```sql
-- User registration audit
CREATE OR REPLACE FUNCTION log_user_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (event_type, user_id, details, created_at)
  VALUES ('USER_CREATED', NEW.id, jsonb_build_object('email', NEW.email), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_created
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION log_user_created();
```

---

## 4. Subdomain-Specific Configuration

### 4.1 auth.molochain.com (Central Auth Service)

**Nginx Configuration:**
```nginx
server_name auth.molochain.com www.auth.molochain.com;
root "/var/www/vhosts/molochain.com/auth.molochain.com";
location / {
  proxy_pass https://127.0.0.1:7081;
}
```

**Note:** Currently proxying to Plesk (7081), not directly to auth-service Docker container (7010).

**Recommended Fix:** Create dedicated nginx config:
```nginx
upstream auth_backend {
  server 127.0.0.1:7010;
}

server {
  listen 443 ssl http2;
  server_name auth.molochain.com;
  
  location /api/auth/ {
    proxy_pass http://auth_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### 4.2 molochain.com (Main Platform)

**Auth Integration:**
- Uses session-based authentication
- Frontend hook: `use-auth.tsx`
- Calls `/api/auth/me` with `credentials: 'include'`
- Auto-refreshes every 5 minutes

**Status:** ✅ Working (local auth only)

### 4.3 opt.molochain.com (OTMS Platform)

**Docker Environment:**
```plaintext
AUTH_ENABLED=true
MOLOCHAIN_AUTH_SERVICE_URL=http://localhost:7010
```

**Kong Route:**
```json
{
  "name": "otms-route",
  "paths": ["/otms"],
  "strip_path": true,
  "service": { "port": 3009 }
}
```

**Status:** ✅ Configured correctly

### 4.4 mololink.molochain.com (Marketplace)

**Nginx Configuration:**
```nginx
upstream mololink_backend {
  server 127.0.0.1:5001;
  keepalive 32;
}

server {
  listen 443 ssl http2;
  server_name mololink.molochain.com;
  location / {
    proxy_pass http://mololink_backend;
  }
}
```

**Kong Route:**
```json
{
  "name": "mololink-route",
  "hosts": ["mololink.molochain.com"],
  "paths": ["/api", "/"],
  "strip_path": false,
  "service": { "port": 5001 }
}
```

**Status:** ⚠️ Working but missing from CORS

---

## 5. Frontend Auth Integration

### 5.1 Auth Hook (client/src/hooks/use-auth.tsx)

```typescript
// Current implementation - relative paths
const response = await fetch('/api/auth/me', {
  credentials: 'include',
  headers: { 'Accept': 'application/json' }
});
```

**For Cross-Subdomain SSO, consider:**
```typescript
const AUTH_BASE_URL = 'https://auth.molochain.com';

const response = await fetch(`${AUTH_BASE_URL}/api/auth/me`, {
  credentials: 'include',
  headers: { 'Accept': 'application/json' }
});
```

### 5.2 Protected Routes

```typescript
// client/src/lib/protected-route.tsx
if (!user) {
  return <Redirect to="/login" />;
}
```

**For SSO, consider redirecting to central auth:**
```typescript
if (!user) {
  const currentUrl = encodeURIComponent(window.location.href);
  window.location.href = `https://auth.molochain.com/login?redirect=${currentUrl}`;
}
```

---

## 6. Backend Auth Middleware

### 6.1 Production Auth (server/middleware/production-auth.ts)

**Current Implementation:**
- Session-based authentication
- User loaded from `req.session.userId`
- Public routes bypass: `/api/health`, `/api/services`, etc.

**For Cross-Subdomain SSO, add:**
```typescript
// Validate JWT from Authorization header for cross-domain requests
const authHeader = req.headers.authorization;
if (authHeader?.startsWith('Bearer ')) {
  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
}
```

---

## 7. Database Schema (Auth-Related Tables)

| Table | Columns | Purpose |
|-------|---------|---------|
| users | 19 columns | User accounts |
| refresh_tokens | 8 columns | JWT refresh tokens |
| api_keys | 9 columns | API authentication |
| admin_users | 8 columns | Admin accounts |
| password_reset_tokens | 5 columns | Password reset |
| email_verification_tokens | 4 columns | Email verification |
| user_roles | 3 columns | Role assignments |
| user_permissions | 3 columns | Permission grants |
| permissions | 4 columns | Permission definitions |
| roles | 4 columns | Role definitions |
| role_permissions | 3 columns | Role-permission mapping |
| sessions | 5 columns | Active sessions |
| audit_logs | 6 columns | Security audit |

---

## 8. Recommended Action Plan

### Phase 1: Critical Fixes (Immediate)

1. **Update Cookie Configuration**
   - File: `server/index.ts` and `server/index.prod.ts`
   - Add `domain: '.molochain.com'`
   - Change `sameSite: 'lax'`

2. **Update Auth Service CORS**
   - Add mololink.molochain.com
   - Add auth.molochain.com
   - Add admin.molochain.com

### Phase 2: Enhanced Security (Short-term)

3. **Add Database Auth Triggers**
   - Create audit_logs table if not exists
   - Add triggers for user events

4. **Configure Kong JWT Plugin**
   - Enable JWT validation at gateway level
   - Configure consumer credentials

### Phase 3: Full SSO Implementation (Medium-term)

5. **Create Central Auth UI**
   - Login page at auth.molochain.com
   - Redirect flow for all subdomains

6. **Implement Token Refresh**
   - Cross-subdomain token refresh
   - Silent token renewal

---

## 9. Testing Checklist

### Cross-Subdomain Auth Tests

- [ ] Login on molochain.com, verify session on mololink.molochain.com
- [ ] Login on auth.molochain.com, verify session on opt.molochain.com
- [ ] Logout on one subdomain, verify logout on all subdomains
- [ ] Token refresh works across subdomains
- [ ] CORS allows requests from all subdomains
- [ ] Cookies set with `.molochain.com` domain

### API Endpoint Tests

- [ ] POST /api/auth/login - Returns session cookie with correct domain
- [ ] GET /api/auth/me - Works from all subdomains
- [ ] POST /api/auth/logout - Clears session on all subdomains
- [ ] POST /api/auth/refresh - Refreshes token across subdomains

---

## 10. Conclusion

The Molochain authentication infrastructure has solid foundations with all necessary services running. However, **critical configuration gaps** prevent true cross-subdomain SSO:

1. Cookie domain not configured
2. CORS missing subdomains
3. No gateway-level JWT validation
4. No auth audit triggers

Implementing the recommended fixes will enable seamless SSO across auth.molochain.com, molochain.com, opt.molochain.com, and mololink.molochain.com.

---

**Report Generated:** December 21, 2025  
**Next Audit Scheduled:** January 21, 2026
