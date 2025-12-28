# Molochain Authentication System Report

**Generated:** December 26, 2025  
**Status:** Infrastructure Audit Complete

---

## Executive Summary

The Molochain ecosystem uses a distributed authentication architecture across multiple subdomains and services. This report documents all auth-related systems, identifies current issues, and provides recommendations for consolidation.

---

## 1. Containers & Services

| Service | Port | Purpose | Auth Method | Status |
|---------|------|---------|-------------|--------|
| `molochain-admin` | 7000 | Admin dashboard | Sessions (Passport + Redis) | ✅ Healthy |
| `molochain-app` | 8080 | Mobile app | Sessions | ✅ Healthy |
| `mololink-app` | 5001 | Marketplace API | JWT | ✅ Healthy |
| `auth-service` | 3002 | Auth microservice | JWT | ✅ Healthy |
| `redis-session` | 6379 | Session store | N/A | ✅ Running |
| `konga-admin` | 1337 | API Gateway admin | Separate auth | ✅ Running |

### Container Details

#### molochain-admin
- **Location:** `/var/www/vhosts/molochain.com/admin-docker/`
- **Network:** molochain-core (172.22.0.4)
- **Redis:** Connected to `redis://172.22.0.2:6379`
- **Database:** `molochaindb` via `postgresql://molodb@31.186.24.19:5432/molochaindb`
- **Session Cookie:** `molochain.sid` with domain `.molochain.com`

#### auth-service
- **Location:** `/var/www/vhosts/molochain.com/OTMS-DOCKER/auth-service/`
- **Network:** Host network mode
- **Redis:** Connected to `redis://172.22.0.2:6379`
- **Database:** `molochain_admin` via `PLESK_DB_URL`

#### mololink-app
- **Location:** `/var/www/vhosts/molochain.com/mololink-docker/`
- **Network:** molochain-core
- **Auth:** JWT-based with hybrid authentication

---

## 2. Subdomains

| Subdomain | Current State | Expected Purpose | Issues |
|-----------|---------------|------------------|--------|
| `admin.molochain.com` | ✅ Working | Admin dashboard | None |
| `app.molochain.com` | ✅ Working | Mobile app | None |
| `mololink.molochain.com` | ✅ Working | Marketplace | None |
| `auth.molochain.com` | ❌ **Broken** | Login portal | Wrong build deployed |
| `api.molochain.com` | ✅ Working | API Gateway | None |
| `opt.molochain.com` | ✅ Working | OTMS | None |
| `cms.molochain.com` | ✅ Working | Content management | None |

### auth.molochain.com Issue Details

**Problem:** The full main application was deployed instead of a minimal auth-only SPA.

**Evidence:**
- 399 JS files (should be ~1-4)
- Title: "MOLOCHAIN - Multi-lingual Logistics Platform" (wrong)
- Contains WebSocket code trying to connect to `/ws/main`
- Calls `/api/auth/me` which returns 404

**Expected:**
- Simple 4-page SPA (Login, Register, Forgot Password, Reset Password)
- Only `index-*.js` file
- API calls to `mololink.molochain.com/api/`
- No WebSocket code

---

## 3. Databases

### User Storage

| Database | Host | Users | Used By |
|----------|------|-------|---------|
| `molochaindb` | 31.186.24.19:5432 | 3 | molochain-admin |
| `molochain_admin` | Plesk PostgreSQL | 3 | auth-service |

### User Accounts (Both Databases)

| Email | Role | Password Status |
|-------|------|-----------------|
| admin@molochain.com | admin | ✅ Reset to `Admin123!` |
| testadmin@molochain.com | admin | ✅ Reset to `Test123!` |
| testuser@molochain.com | user | Original |

### Schema Differences

**molochaindb (admin):**
- Uses `password` column for bcrypt hash

**molochain_admin (auth-service):**
- Uses `password_hash` column for bcrypt hash
- Has legacy `password` column (deprecated)

---

## 4. Session Management

### Redis Configuration

| Component | Redis URL | Purpose |
|-----------|-----------|---------|
| molochain-admin | `redis://172.22.0.2:6379` | Session store |
| auth-service | `redis://172.22.0.2:6379` | Session cache |

### Session Cookie Configuration

```javascript
{
  name: 'molochain.sid',
  domain: '.molochain.com',  // Production only
  sameSite: 'none',          // Production only
  secure: true,              // Production only
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000  // 24 hours
}
```

### Current Sessions in Redis

```
molochain:sess:UtIAY7o-efD3EnAMhmvJUmtTbsIZp2Gt
```

---

## 5. Codebase Structure

### Core Auth Files

```
server/core/auth/
├── auth.service.ts          # Main authentication logic
├── password-reset.service.ts # Password recovery
└── two-factor.service.ts    # 2FA/OTP support
```

### Middleware

```
server/middleware/
├── auth.ts                  # Session validation
├── auth-rate-limit.ts       # Rate limiting for auth endpoints
├── api-key-auth.ts          # API key authentication
├── production-auth.ts       # Production guards
├── requirePermission.ts     # RBAC permission checks
└── enhanced-csrf.ts         # CSRF protection
```

### Frontend Auth Pages

```
client/src/pages/auth/
├── Login.tsx                # Login page with navbar
├── Register.tsx             # Registration page
├── RequestPasswordReset.tsx # Forgot password
├── ResetPassword.tsx        # Reset password form
├── api-keys-management.tsx  # API key management
└── identity-management.tsx  # Identity management
```

### API Routes

```
server/api/auth/
└── two-factor-auth.ts       # 2FA endpoints

server/routes/
├── api-keys.ts              # API key CRUD
└── profile.ts               # User profile endpoints
```

### Security Components

```
server/core/security/
├── threat-detection-engine.ts
├── security-policy-engine.ts
└── incident-response-manager.ts

server/core/identity/
└── identity-manager.service.ts

server/core/websocket/security/
├── ws-auth.ts               # WebSocket authentication
└── audit-logger.ts          # Security event logging
```

---

## 6. Authentication Mechanisms

### Session-Based (Primary)

**Used by:** admin, app subdomains

```
User → Login → Passport.js validates → Session created in Redis
                                     → Cookie set (molochain.sid)
                                     → Redirect to dashboard
```

### JWT-Based

**Used by:** auth-service, mololink, mobile apps

```
User → Login → Credentials validated → JWT issued
                                    → Refresh token stored (hashed)
                                    → Client stores tokens
```

### API Key Authentication

**Used by:** External integrations, CMS sync

```
Client → Request with X-API-Key header → Validate against database
                                       → Rate limit checked
                                       → Request processed
```

### Two-Factor Authentication

**Status:** Implemented but optional

```
User → Login → Password validated → 2FA check
                                  → If enabled: OTP required
                                  → If disabled: Session created
```

---

## 7. CORS Configuration

### auth-service CORS Origins

```
CORS_ORIGIN=https://molochain.com,
            https://www.molochain.com,
            https://admin.molochain.com,
            https://opt.molochain.com,
            https://app.molochain.com,
            https://api.molochain.com,
            https://mololink.molochain.com,
            https://cms.molochain.com,
            https://auth.molochain.com
```

---

## 8. Known Issues

### Critical

| # | Issue | Impact | Status |
|---|-------|--------|--------|
| 1 | auth.molochain.com wrong build | Users can't login via auth portal | ❌ Unresolved |

### Medium

| # | Issue | Impact | Status |
|---|-------|--------|--------|
| 2 | Dual databases for users | Data sync complexity | ⚠️ Acknowledged |
| 3 | Mixed auth (sessions vs JWT) | Architectural inconsistency | ⚠️ By design |
| 4 | Default passwords active | Security risk | ⚠️ Should change |

### Resolved (December 26, 2025)

| # | Issue | Resolution |
|---|-------|------------|
| 1 | auth-service bcrypt errors | Migrated password to password_hash |
| 2 | Redis not connected in auth-service | Updated redis-cache module |
| 3 | Session stores not synced | Both now use Docker Redis |
| 4 | CORS missing admin subdomain | Added to CORS_ORIGIN |

---

## 9. Recommendations

### Immediate Actions

1. **Fix auth.molochain.com deployment**
   - Build minimal auth-only SPA
   - Deploy to `/var/www/vhosts/molochain.com/auth.molochain.com/`

2. **Change default passwords**
   - admin@molochain.com: Change from `Admin123!`
   - testadmin@molochain.com: Change from `Test123!`

### Short-Term (1-2 weeks)

3. **Consolidate user databases**
   - Merge `molochaindb` and `molochain_admin` users
   - Create sync mechanism or single source of truth

4. **Implement unified SSO portal**
   - Build auth.molochain.com as identity provider
   - Support session + JWT token exchange

### Long-Term

5. **Migrate to single auth approach**
   - Consider OAuth2/OpenID Connect
   - Centralize all auth through auth-service

6. **Add monitoring and alerting**
   - Failed login attempts
   - Session anomalies
   - Token refresh failures

---

## 10. Health Monitoring

A health monitoring script was deployed at:
```
/var/www/vhosts/molochain.com/scripts/container-health-monitor.sh
```

**Cron Schedule:** Every 5 minutes

**Monitors:**
- molochain-admin
- molochain-app
- redis-session
- auth-service
- mololink-app

**Logs:**
- `/var/log/container-health.log`
- `/tmp/container-alerts.log`

---

## Appendix A: File Locations

### Production Server

| Component | Path |
|-----------|------|
| Admin Docker | `/var/www/vhosts/molochain.com/admin-docker/` |
| Auth Service | `/var/www/vhosts/molochain.com/OTMS-DOCKER/auth-service/` |
| Mololink Docker | `/var/www/vhosts/molochain.com/mololink-docker/` |
| Auth Subdomain | `/var/www/vhosts/molochain.com/auth.molochain.com/` |
| Main Site | `/var/www/vhosts/molochain.com/httpdocs/` |
| Scripts | `/var/www/vhosts/molochain.com/scripts/` |
| Backups | `/var/www/vhosts/molochain.com/backups/` |

### This Repository

| Component | Path |
|-----------|------|
| Auth Service | `server/core/auth/` |
| Auth Pages | `client/src/pages/auth/` |
| Middleware | `server/middleware/` |
| Security | `server/core/security/` |

---

## Appendix B: Environment Variables

### auth-service (.env)

```env
NODE_ENV=production
PORT=3002
PLESK_DB_URL=postgresql://...
REDIS_HOST=172.22.0.2
REDIS_PORT=6379
REDIS_URL=redis://172.22.0.2:6379
JWT_SECRET=***
CORS_ORIGIN=https://molochain.com,...
```

### molochain-admin

```env
DATABASE_URL=postgresql://molodb:***@31.186.24.19:5432/molochaindb
REDIS_URL=redis://172.22.0.2:6379
SESSION_SECRET=***
NODE_ENV=production
```

---

## Appendix C: SSO Implementation (December 2025)

### Overview

Single Sign-On (SSO) has been implemented for web applications using shared session cookies with domain `.molochain.com`. This allows users to log in once at `auth.molochain.com` and be authenticated across all participating subdomains.

### SSO Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        auth.molochain.com                       │
│                     (Login/Register Portal)                     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              auth-frontend SPA                           │   │
│  │  - Login, Register, Forgot Password, Reset Password     │   │
│  │  - Calls mololink.molochain.com/api/auth/*              │   │
│  │  - Validates returnUrl against trusted domains          │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
                                │
                                │ POST /api/auth/login
                                │ (credentials: include)
                                ▼
┌────────────────────────────────────────────────────────────────┐
│                    mololink.molochain.com                       │
│                     (Auth API Provider)                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Sets sso.sid cookie:                                    │   │
│  │  - domain: .molochain.com                               │   │
│  │  - httpOnly: true                                       │   │
│  │  - secure: true (production)                            │   │
│  │  - sameSite: none (production)                          │   │
│  │  - maxAge: 7 days                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
                                │
                                │ Cookie shared via .molochain.com
                                ▼
┌────────────────────────────────────────────────────────────────┐
│                   All Participating Services                    │
│  - mololink.molochain.com  (reads sso.sid or Bearer token)     │
│  - opt.molochain.com       (needs update to read sso.sid)      │
│  - app.molochain.com       (needs update to read sso.sid)      │
└────────────────────────────────────────────────────────────────┘
```

### SSO Cookie Configuration

```javascript
// Cookie name: sso.sid
// Value: JWT token (same as Bearer token)
{
  domain: '.molochain.com',  // Shared across all subdomains
  path: '/',
  httpOnly: true,            // Not accessible via JavaScript
  secure: true,              // HTTPS only (production)
  sameSite: 'none',          // Cross-site requests allowed
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
}
```

### auth-frontend SPA

**Location:** `auth-frontend/` in this repository

**Pages:**
- `/login` - User login with email/password
- `/register` - New user registration
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset with token

**API Calls:** All authentication requests go to `https://mololink.molochain.com/api/auth/`

**Trusted Domains for Redirect:**
- molochain.com
- www.molochain.com
- mololink.molochain.com
- opt.molochain.com
- app.molochain.com
- admin.molochain.com
- auth.molochain.com

### Deployment Instructions

#### 1. Deploy auth-frontend to auth.molochain.com

```bash
# Build the auth-frontend
cd auth-frontend
npm install
npm run build

# Deploy to production
scp -r dist/* user@molochain.com:/var/www/vhosts/molochain.com/auth.molochain.com/
```

#### 2. Update mololink-app Container

```bash
# Copy updated server.js to production
scp mololink-docker/server.js user@molochain.com:/var/www/vhosts/molochain.com/mololink-docker/

# Restart the container
ssh user@molochain.com "docker restart mololink-app"
```

#### 3. Update OTMS Service (opt.molochain.com)

The OTMS service needs to be updated to read the `sso.sid` cookie. Add this to the auth middleware:

```javascript
// Parse sso.sid cookie for SSO authentication
function parseCookies(req) {
  const cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.split('=');
      cookies[name.trim()] = decodeURIComponent(rest.join('='));
    });
  }
  return cookies;
}

// Update auth middleware to check sso.sid cookie
function authMiddleware(req, res, next) {
  let token = req.headers.authorization?.split(" ")[1];
  
  // Fallback to SSO cookie
  if (!token) {
    const cookies = parseCookies(req);
    token = cookies['sso.sid'];
  }
  
  // Verify token...
}
```

### Mobile App Compatibility

Mobile apps continue to use JWT Bearer tokens via the `Authorization` header. The SSO cookie is only for web browsers. Both authentication methods are supported by the updated mololink auth middleware.

### Services Not Participating in SSO

- `admin.molochain.com` - Uses separate session (`molochain.sid`) and Redis store for enhanced security
- Mobile apps - Continue using JWT Bearer tokens

### Testing SSO

1. Open `https://auth.molochain.com/login`
2. Login with valid credentials
3. Redirect to `https://mololink.molochain.com`
4. Verify user is authenticated (check sso.sid cookie in browser dev tools)
5. Navigate to `https://opt.molochain.com` (after OTMS update)
6. Verify user is still authenticated

---

*Report generated by Molochain Infrastructure Audit*
