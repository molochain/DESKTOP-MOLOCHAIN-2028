# Phase 1 Codebase Inventory - MOLOCHAIN Ecosystem

## Executive Summary

This document provides a comprehensive inventory of the MOLOCHAIN codebase as visible from the Replit development environment.

### Key Findings
- **Architecture**: Monolithic full-stack TypeScript application with modular route registrars
- **Framework**: Express.js backend + React 18 frontend (Vite bundler)
- **Database**: PostgreSQL via Drizzle ORM (Neon-backed development DB)
- **Authentication**: Passport.js with session-based auth + optional 2FA
- **RBAC System**: 7 admin roles, 40+ fine-grained permissions
- **API Pattern**: RESTful with domain-based route organization

---

## A) Inventory Tables

### Infrastructure (Replit Environment)

| Component | Value |
|-----------|-------|
| Runtime | Node.js 20.x |
| Package Manager | npm |
| Database | Neon PostgreSQL |
| Build Tool | Vite 5.x |
| TypeScript | 5.x |
| Web Server | Express.js |
| Port | 5000 (exposed) |

### Runtime Services

| Service | Technology | Status |
|---------|------------|--------|
| Backend API | Express.js | Running |
| Frontend | React + Vite | Running |
| WebSocket | Socket.IO + WS | Active |
| Session Store | memorystore | Active |
| Cache | NodeCache (in-memory) | Active |

### Codebase Structure

```
/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # Route pages
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # Utilities
│   │   └── config/            # Client config
│   └── index.html
├── server/                    # Express backend
│   ├── api/                   # API route handlers
│   ├── core/                  # Core services
│   │   ├── auth/              # Authentication
│   │   ├── audit/             # Audit compliance
│   │   ├── cache/             # Caching service
│   │   ├── database/          # DB service
│   │   ├── identity/          # Identity management
│   │   ├── monitoring/        # Health monitoring
│   │   └── security/          # Security services
│   ├── gateway/               # API Gateway (NEW)
│   ├── middleware/            # Express middleware
│   ├── registrars/            # Route registrars
│   ├── routes/                # Route handlers
│   ├── services/              # Business services
│   ├── utils/                 # Utilities
│   ├── websocket/             # WebSocket manager
│   └── routes.ts              # Main route config
├── shared/                    # Shared types/schemas
│   ├── schema.ts              # Drizzle DB schema
│   └── permissions.ts         # RBAC permissions
├── packages/                  # Modular packages (NEW)
│   ├── shared-permissions/    # Permission package
│   ├── shared-auth/           # Auth package
│   └── shared-audit/          # Audit package
└── docs/                      # Documentation
```

---

## B) Routing Map (Domain → Service → Port)

### Domain Registrars

| Registrar | Routes Prefix | Middleware |
|-----------|---------------|------------|
| Admin | `/api/admin/*` | isAuthenticated, isAdmin, auditLogger |
| Services | `/api/services` | cacheMiddleware |
| Analytics | `/api/analytics` | isAuthenticated |
| Collaboration | `/api/collaboration` | isAuthenticated |
| Security | `/api/security` | isAuthenticated, isAdmin |
| Ecosystem | `/api/ecosystem` | public |

### Admin Routes (Protected)

| Route | Handler File | Permission Required |
|-------|--------------|---------------------|
| `/api/admin/users` | admin-users.ts | USERS_VIEW, USERS_MANAGE |
| `/api/admin/security` | admin-security.ts | SECURITY_VIEW, SECURITY_MANAGE |
| `/api/admin/settings` | settings.routes.ts | SETTINGS_VIEW, SETTINGS_MANAGE |
| `/api/admin/audit-logs` | audit-logs.ts | AUDIT_VIEW |
| `/api/admin/memory` | memory-optimization.ts | INFRASTRUCTURE_VIEW |
| `/api/admin/tracking-providers` | tracking-providers.ts | OPERATIONS_VIEW |
| `/api/admin/content/media` | media.routes.ts | CONTENT_MANAGE |
| `/api/admin/branding` | branding.routes.ts | SETTINGS_MANAGE |
| `/api/admin/email` | email-settings.routes.ts | SETTINGS_MANAGE |
| `/api/admin/submissions` | form-submissions.routes.ts | CONTENT_VIEW |

### Public Routes

| Route | Handler | Purpose |
|-------|---------|---------|
| `/api/health` | routes.ts | Health check |
| `/api/services` | services-inline.routes.ts | Service catalog |
| `/api/partners` | partners.routes.ts | Partner list |
| `/api/cms/*` | CMS proxy | Laravel CMS integration |
| `/api/contact/agents` | contact-agents.ts | Contact form |

### Authentication Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/auth/logout` | POST | User logout |
| `/api/auth/me` | GET | Current user info |
| `/api/auth/2fa/generate` | POST | 2FA setup |
| `/api/auth/2fa/verify` | POST | 2FA verification |
| `/api/auth/forgot-password` | POST | Password reset |

---

## C) Dependency Map

### External Services

| Service | URL | Purpose | Integration |
|---------|-----|---------|-------------|
| Laravel CMS | cms.molochain.com | Content management | API proxy |
| OTMS | opt.molochain.com | Operations | API client |
| Auth Service | auth.molochain.com | SSO (planned) | JWT tokens |

### Internal Dependencies

```
Authentication Chain:
  Request → isAuthenticated → isAdmin → requirePermission → Route Handler

Audit Chain:
  Request → auditLogger → Route Handler → Response → logAdminAction

Permission Chain:
  shared/permissions.ts → server/middleware/requirePermission.ts
                       → client/src/hooks/use-permission.ts
                       → client/src/components/admin/PermissionGuard.tsx
```

### Database Schema (Key Tables)

| Table | Purpose | Relations |
|-------|---------|-----------|
| users | User accounts | Has many: auditLogs, refreshTokens |
| refreshTokens | JWT refresh tokens | Belongs to: users |
| auditLogs | General audit trail | Belongs to: users |
| adminActivityLogs | Admin action audit | Belongs to: users |
| passwordResetTokens | Password reset | Belongs to: users |

---

## D) Risks & Duplications

### Identified Duplications

1. **Auth Middleware Variants**:
   - `server/middleware/auth.ts` - Basic auth middleware
   - `server/middleware/production-auth.ts` - Production-specific
   - `server/core/auth/auth.service.ts` - Main auth service
   
   **Risk**: Inconsistent behavior between environments

2. **Permission Checking**:
   - `requirePermission` in middleware/requirePermission.ts
   - `requirePermission` in middleware/production-auth.ts
   
   **Risk**: Different implementations, potential bypass

3. **Audit Logging**:
   - `server/middleware/auditLogger.ts` - Admin actions
   - `server/core/audit/audit-compliance-manager.ts` - General audit
   
   **Risk**: Inconsistent audit coverage

### Unused/Legacy Files

| File/Directory | Status | Recommendation |
|----------------|--------|----------------|
| server/tests/*.test.ts | Test files | Keep but organize |
| Various .backup files | Old backups | Review and clean |

---

## E) UNKNOWN List

Items that require production server access to verify:

| Item | Required Access | Verification Method |
|------|-----------------|---------------------|
| Docker containers | SSH to production | `docker ps -a` |
| Nginx configuration | Server filesystem | `/etc/nginx/conf.d/` |
| SSL certificates | Server filesystem | `certbot certificates` |
| PM2 processes | SSH to production | `pm2 list` |
| Systemd services | SSH to production | `systemctl list-units` |
| DNS records | DNS provider | `dig molochain.com` |
| Firewall rules | Server root | `iptables -L` or `ufw status` |
| Plesk configuration | Plesk panel | Admin interface |
| CMS database | MySQL access | `mysql -u root -p` |

---

## F) Frontend-to-Backend Call Map

### Admin Dashboard Components

| Component | Endpoint(s) Called | Data Fetched |
|-----------|-------------------|--------------|
| AdminActivityDashboard | `/api/admin/audit-logs`, `/api/admin/audit-logs/summary` | Audit logs, statistics |
| AdminUsers | `/api/admin/users`, `/api/admin/users/stats` | User list, user stats |
| AdminSecurity | `/api/admin/security/settings`, `/api/admin/security/stats` | Security config, login stats |
| AdminSettings | `/api/admin/settings` | App settings |
| SystemPerformancePanel | `/api/admin/stats`, `/api/admin/health` | System metrics |

### Public Components

| Component | Endpoint(s) Called | Data Fetched |
|-----------|-------------------|--------------|
| Home | `/api/cms/home-sections`, `/api/cms/services` | CMS content |
| Services | `/api/services`, `/api/cms/services` | Service catalog |
| Partners | `/api/partners` | Partner list |
| Contact | `/api/contact/agents` | Contact agents |

---

## Next Steps

1. **Production Audit**: Run SSH commands from `PRODUCTION_AUDIT_COMMANDS.md`
2. **Complete Inventory**: Verify Docker/Nginx/SSL on production
3. **Architecture Decision**: Finalize containerization approach
4. **Migration Plan**: Create step-by-step migration with rollback procedures
