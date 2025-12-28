# Target Architecture - MOLOCHAIN Containerized Admin System

## Overview

This document describes the target architecture for containerizing the admin system as an independent service while maintaining integration with the existing ecosystem.

---

## Current State (AS-IS)

```
┌─────────────────────────────────────────────────────────────┐
│                    MONOLITH (Express + React)               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Port 5000                            ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ ││
│  │  │  Admin   │  │  Public  │  │   Auth   │  │   CMS   │ ││
│  │  │  Routes  │  │  Routes  │  │  Routes  │  │  Proxy  │ ││
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ ││
│  │       │              │              │              │     ││
│  │       └──────────────┴──────────────┴──────────────┘     ││
│  │                          │                               ││
│  │                 ┌────────▼────────┐                     ││
│  │                 │  PostgreSQL DB  │                     ││
│  │                 │  (Neon/Local)   │                     ││
│  │                 └─────────────────┘                     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Characteristics:**
- Single Express server handling all routes
- Shared authentication middleware
- Direct database access from all routes
- Tight coupling between admin and public services

---

## Target State (TO-BE) - Phase 1: Gateway Isolation

```
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Port 5000                            ││
│  │  ┌──────────────────┐  ┌──────────────────────────────┐││
│  │  │  Admin Gateway   │  │      Public Gateway          │││
│  │  │  /api/admin/*    │  │  /api/*, /api/cms/*          │││
│  │  │  - Rate Limit    │  │  - Standard Limits           │││
│  │  │  - Audit Log     │  │  - Cache Layer               │││
│  │  │  - Security HDR  │  │                              │││
│  │  └────────┬─────────┘  └─────────────┬────────────────┘││
│  │           │                          │                  ││
│  │           ▼                          ▼                  ││
│  │  ┌──────────────────┐  ┌──────────────────────────────┐││
│  │  │  Admin Service   │  │      Public Service          │││
│  │  │  (Registrar)     │  │      (Registrars)            │││
│  │  └────────┬─────────┘  └─────────────┬────────────────┘││
│  └───────────┼──────────────────────────┼──────────────────┘│
│              │                          │                    │
│              └──────────┬───────────────┘                    │
│                         ▼                                    │
│              ┌─────────────────────┐                        │
│              │    Shared Auth      │                        │
│              │    (@molochain/     │                        │
│              │     shared-auth)    │                        │
│              └──────────┬──────────┘                        │
│                         ▼                                    │
│              ┌─────────────────────┐                        │
│              │   PostgreSQL DB     │                        │
│              └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

**Benefits:**
- Logical separation of admin and public traffic
- Independent rate limiting for admin operations
- Enhanced security headers for admin routes
- Request correlation for debugging
- Preparation for physical separation

---

## Target State (TO-BE) - Phase 2: Containerized Admin

```
┌──────────────────────────────────────────────────────────────────────┐
│                         REVERSE PROXY (Nginx)                         │
│                         *.molochain.com                               │
└───────────────┬──────────────────┬───────────────────┬───────────────┘
                │                  │                   │
                ▼                  ▼                   ▼
┌───────────────────────┐ ┌───────────────────┐ ┌─────────────────────┐
│    admin.molochain    │ │   molochain.com   │ │  cms.molochain.com  │
│    Container: Admin   │ │  Container: Main  │ │  Container: Laravel │
│    Port: 7000         │ │  Port: 5000       │ │  Port: 8000         │
│                       │ │                   │ │                     │
│  ┌─────────────────┐  │ │ ┌───────────────┐ │ │ ┌─────────────────┐ │
│  │ Admin API       │  │ │ │ Public API    │ │ │ │ CMS API         │ │
│  │ Admin Frontend  │  │ │ │ Auth Routes   │ │ │ │ Content API     │ │
│  │ RBAC System     │  │ │ │ WebSocket     │ │ │ │ Media API       │ │
│  │ Audit Logs      │  │ │ │               │ │ │ │                 │ │
│  └────────┬────────┘  │ │ └───────┬───────┘ │ │ └────────┬────────┘ │
└───────────┼───────────┘ └─────────┼─────────┘ └──────────┼──────────┘
            │                       │                      │
            └───────────────────────┼──────────────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │      Shared Services          │
                    │  ┌─────────┐  ┌─────────────┐ │
                    │  │  Auth   │  │   Redis     │ │
                    │  │ Service │  │   Cache     │ │
                    │  └────┬────┘  └──────┬──────┘ │
                    │       │              │        │
                    │       ▼              │        │
                    │  ┌─────────────────────────┐  │
                    │  │      PostgreSQL         │  │
                    │  │   (Shared Database)     │  │
                    │  └─────────────────────────┘  │
                    └───────────────────────────────┘
```

**Container Specifications:**

| Container | Base Image | Port | Resources |
|-----------|------------|------|-----------|
| admin | node:20-alpine | 7000 | 512MB RAM, 0.5 CPU |
| main | node:20-alpine | 5000 | 1GB RAM, 1 CPU |
| cms | php:8.2-fpm | 8000 | 512MB RAM, 0.5 CPU |
| auth | node:20-alpine | 7010 | 256MB RAM, 0.25 CPU |
| redis | redis:alpine | 6379 | 128MB RAM |
| postgres | postgres:15 | 5432 | 1GB RAM, 1 CPU |

---

## Shared Packages Architecture

```
packages/
├── @molochain/shared-permissions    # Permission constants & functions
│   ├── PERMISSIONS                  # All permission strings
│   ├── ADMIN_ROLES                  # Role definitions
│   ├── ROLE_PERMISSIONS             # Role-to-permission mapping
│   ├── hasPermission()              # Permission check function
│   └── Types: Permission, AdminRole
│
├── @molochain/shared-auth           # Auth interfaces & constants
│   ├── SESSION_DURATION_*           # Session timing constants
│   ├── AUTH_COOKIE_NAME             # Cookie configuration
│   ├── AUTH_ERRORS                  # Error code constants
│   └── Types: User, AuthenticatedRequest, SessionConfig
│
└── @molochain/shared-audit          # Audit logging utilities
    ├── AUDIT_EVENT_TYPES            # 30+ event type constants
    ├── AUDIT_ENTITY_TYPES           # Entity type definitions
    ├── SENSITIVE_FIELDS             # Fields to redact
    ├── sanitizeAuditDetails()       # Data sanitization
    └── Types: AuditLogData, AuditFilters
```

**Package Usage:**

```typescript
// In Admin Container
import { PERMISSIONS, hasPermission } from '@molochain/shared-permissions';
import { AuditLogData } from '@molochain/shared-audit';

// In Main Container
import { PERMISSIONS } from '@molochain/shared-permissions';
import { User, AuthenticatedRequest } from '@molochain/shared-auth';

// In Auth Service
import { SessionConfig, AUTH_COOKIE_NAME } from '@molochain/shared-auth';
import { AUDIT_EVENT_TYPES } from '@molochain/shared-audit';
```

---

## API Gateway Configuration

### Admin Gateway Features

```typescript
// server/gateway/admin-gateway.ts
const adminGateway = createAdminGateway({
  rateLimit: {
    enabled: true,
    roleBasedLimits: true
  },
  circuitBreaker: {
    enabled: true,
    threshold: 5,
    timeout: 30000
  },
  logging: {
    correlationId: true,
    requestBody: true,
    responseTime: true
  },
  security: {
    strictCSP: true,
    adminHeaders: true
  }
});
```

### Rate Limiting Tiers

| Role | Requests/15min (Prod) | Requests/15min (Dev) |
|------|----------------------|---------------------|
| super_admin | 500 | 5000 |
| admin | 200 | 2000 |
| developer | 200 | 2000 |
| manager | 150 | 1500 |
| analyst | 150 | 1500 |
| moderator | 150 | 1500 |
| executive | 150 | 1500 |

---

## Migration Steps

### Phase 1: Gateway Isolation (Current)
1. Create modular packages (DONE)
2. Implement API gateway pattern (DONE - components ready, NOT integrated)
3. Add request correlation IDs (DONE - in gateway middleware)
4. Enable enhanced security headers (DONE - in gateway middleware)
5. Deploy to staging for testing (PENDING - requires gateway integration)

**IMPORTANT**: Gateway components are created in `server/gateway/` but NOT yet integrated into `routes.ts`. 
This is intentional - integration is planned for Phase 2 after staging validation.

To integrate (Phase 2):
```typescript
// In server/routes.ts
import { createAdminGateway } from './gateway';
app.use('/api/admin', createAdminGateway());
```

### Phase 2: Shared Auth Service
1. Extract auth routes to standalone service
2. Implement JWT-based token exchange
3. Configure cross-subdomain session sharing
4. Test SSO flows

### Phase 3: Admin Container
1. Create Dockerfile for admin service
2. Configure environment variables
3. Set up container networking
4. Deploy behind reverse proxy
5. Test all admin functionality

### Phase 4: Full Separation
1. Migrate remaining admin dependencies
2. Configure independent database schema
3. Set up container orchestration
4. Implement health checks and monitoring
5. Configure auto-scaling rules

---

## Rollback Procedures

### Gateway Rollback
```bash
# Remove gateway middleware from routes.ts
# Restart application
npm run dev
```

### Container Rollback
```bash
# Stop admin container
docker stop molochain-admin

# Switch DNS/proxy to monolith
# Update nginx config to route admin.molochain.com → main:5000/api/admin
nginx -t && nginx -s reload
```

---

## Definition of Done

### Gateway Isolation (Phase 1)
- [ ] Gateway middleware applied to admin routes
- [ ] Correlation IDs in all admin requests
- [ ] Rate limiting working per role
- [ ] Security headers present on responses
- [ ] No regression in existing functionality

### Containerization (Phase 2+)
- [x] Docker infrastructure created (`docker/` directory)
- [x] Dockerfiles for admin, main, and auth services
- [x] docker-compose.yml for production deployment
- [x] docker-compose.dev.yml for development environment
- [x] Entrypoint scripts with dependency checks
- [x] Nginx reverse proxy configuration
- [x] Environment configuration templates
- [ ] Admin container running independently (requires deployment)
- [ ] Auth service handling cross-container sessions (requires deployment)
- [ ] Database migrations work across services (requires testing)
- [ ] Health endpoints responding (requires deployment)
- [ ] Logs aggregated to central location
- [ ] Monitoring dashboards configured
- [ ] Runbook for operations team

---

## Docker Infrastructure (Implemented)

The Docker configuration has been created in the `docker/` directory:

```
docker/
├── Dockerfile.admin      # Admin microservice (port 7000)
├── Dockerfile.main       # Main platform (port 5000)
├── Dockerfile.auth       # Auth service (port 7010)
├── docker-compose.yml    # Production orchestration
├── docker-compose.dev.yml # Development with hot-reload
├── entrypoint-admin.sh   # Admin startup script
├── entrypoint-main.sh    # Main startup script
├── entrypoint-auth.sh    # Auth startup script
├── .env.example          # Environment template
├── README.md             # Docker documentation
├── nginx/
│   └── nginx.conf        # Reverse proxy configuration
└── init-scripts/
    └── 01-init.sql       # Database initialization
```

### Quick Start

```bash
# Development
cd docker
docker-compose -f docker-compose.dev.yml up -d

# Production
cp .env.example .env
# Edit .env with production values
docker-compose up -d --build
```

---

## Appendix: Docker Compose Reference

```yaml
version: '3.8'

services:
  admin:
    build:
      context: .
      dockerfile: Dockerfile.admin
    ports:
      - "7000:7000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - AUTH_SERVICE_URL=http://auth:7010
    depends_on:
      - postgres
      - auth
    networks:
      - molochain-internal
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  auth:
    build:
      context: .
      dockerfile: Dockerfile.auth
    ports:
      - "7010:7010"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - postgres
      - redis
    networks:
      - molochain-internal

  main:
    build:
      context: .
      dockerfile: Dockerfile.main
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - AUTH_SERVICE_URL=http://auth:7010
    depends_on:
      - postgres
      - auth
    networks:
      - molochain-internal
      - molochain-external

  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    networks:
      - molochain-internal

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - molochain-internal

volumes:
  postgres_data:
  redis_data:

networks:
  molochain-internal:
    driver: bridge
  molochain-external:
    driver: bridge
```
