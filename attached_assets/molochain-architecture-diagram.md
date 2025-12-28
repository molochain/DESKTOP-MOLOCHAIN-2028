# Molochain Microservice Architecture Diagrams

## 1. Microservice Architecture Diagram
**FigJam URL:** [View in FigJam](https://www.figma.com/online-whiteboard/create-diagram/d9d8c136-3527-4229-aa16-1c2746f32ee3)
**Previous URL:** https://www.figma.com/online-whiteboard/create-diagram/6ebece93-e04d-40a2-80d5-4bce320ad282

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MOLOCHAIN ECOSYSTEM                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│   │  Web Browser │     │  Mobile App  │     │   Admin UI   │            │
│   └──────┬───────┘     └──────┬───────┘     └──────┬───────┘            │
│          │                    │                    │                     │
│          ▼                    ▼                    ▼                     │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │                    NGINX REVERSE PROXY                       │       │
│   │                   (SSL/TLS Termination)                      │       │
│   └─────────────────────────────────────────────────────────────┘       │
│          │                    │                    │                     │
│          ▼                    ▼                    ▼                     │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│   │molochain.com │     │api.molochain │     │admin.molochain│           │
│   │   (Public)   │     │   (Mobile)   │     │   (Admin)    │            │
│   │              │     │              │     │              │            │
│   │ - Home       │     │ - REST API   │     │ - Dashboard  │            │
│   │ - Login      │     │ - Auth       │     │ - Users      │            │
│   │ - Dashboard  │     │ - Tracking   │     │ - Settings   │            │
│   │ - Analytics  │     │              │     │              │            │
│   └──────┬───────┘     └──────┬───────┘     └──────┬───────┘            │
│          │                    │                    │                     │
│          └────────────────────┼────────────────────┘                     │
│                               ▼                                          │
│                    ┌──────────────────────┐                              │
│                    │   Express.js Server  │                              │
│                    │   (Node.js + TS)     │                              │
│                    │                      │                              │
│                    │  - API Routes        │                              │
│                    │  - Auth Middleware   │                              │
│                    │  - WebSocket         │                              │
│                    └──────────┬───────────┘                              │
│                               │                                          │
│              ┌────────────────┼────────────────┐                         │
│              ▼                ▼                ▼                         │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│   │  PostgreSQL  │  │   Redis      │  │  WebSocket   │                  │
│   │  (Neon DB)   │  │   (Cache)    │  │   Server     │                  │
│   └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                      EXTERNAL MICROSERVICES                              │
│                                                                          │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│   │ mololink.    │  │ opt.molochain│  │cms.molochain │                  │
│   │ molochain.com│  │    .com      │  │    .com      │                  │
│   │              │  │              │  │              │                  │
│   │ Marketplace  │  │    OTMS      │  │     CMS      │                  │
│   │ Auction      │  │  Tracking    │  │   Content    │                  │
│   └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. Route Flow Diagram
**FigJam URL:** [View in FigJam](https://www.figma.com/online-whiteboard/create-diagram/a64ab37a-a187-40f4-ad0e-f8e934926c52)
**Previous URL:** https://www.figma.com/online-whiteboard/create-diagram/1b7f162b-a8dc-4649-838f-7b6e26503444

## Production Server Details

| Component | Value |
|-----------|-------|
| **Server IP** | 31.186.24.19 |
| **Hostname** | zen-agnesi.31-186-24-19.plesk.page |
| **OS** | AlmaLinux 9.7 |
| **Memory** | 7.5GB (4.7GB used) |
| **Disk** | 152GB (119GB used - 79%) |
| **Node.js Process** | PM2 molochain-core |
| **Web Server** | NGINX |
| **Database** | PostgreSQL (15 tables) |
| **SSL** | Let's Encrypt (expires March 2026) |

## Subdomain Configuration

| Subdomain | Purpose | NGINX Config |
|-----------|---------|--------------|
| molochain.com | Main site + Portal | molochain.com.conf |
| admin.molochain.com | Admin panel | admin.molochain.com.conf |
| api.molochain.com | Mobile API | (shared with main) |
| app.molochain.com | Legacy app subdomain | app.molochain.com.conf |
| mololink.molochain.com | Marketplace | mololink.molochain.com.conf |
| cdn.molochain.com | CDN/Assets | cdn.molochain.com.conf |
| ws.molochain.com | WebSocket | ws.molochain.com.conf |

## Deployment Structure

```
/var/www/molochain/
├── current -> releases/20251220_113244 (symlink)
├── releases/
│   └── 20251220_113244/
│       ├── index.js (1.5MB bundled)
│       ├── public/
│       │   └── assets/
│       ├── openapi.json
│       ├── package.json
│       ├── ecosystem.config.production.cjs
│       └── node_modules/
├── shared/
│   └── .env
├── backups/
├── logs/
└── ecosystem.config.cjs
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐        ┌──────────────┐        ┌──────────────┐      │
│   │   Browser    │───────▶│   Express    │───────▶│  PostgreSQL  │      │
│   │   (Client)   │        │   Server     │        │   (Users)    │      │
│   └──────────────┘        └──────────────┘        └──────────────┘      │
│          │                       │                                       │
│          │    POST /api/auth/login                                       │
│          │    ──────────────────▶                                        │
│          │                       │                                       │
│          │    Response:          │                                       │
│          │    {                  │                                       │
│          │      authenticated,   │                                       │
│          │      email,           │                                       │
│          │      id,              │                                       │
│          │      role             │ ◀── User data at root level          │
│          │    }                  │     (not nested under .user)          │
│          │    ◀──────────────────                                        │
│          │                                                               │
│          │    + Set-Cookie:                                              │
│          │      - Session cookie                                         │
│          │      - Refresh token (HTTP-only, SHA-256 hashed)             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Route Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ROUTE PRECEDENCE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Priority 1: Public Routes (order: 1)                                   │
│   ├── /login, /register, /forgot-password                               │
│   └── Layout: PublicLayout                                               │
│                                                                          │
│   Priority 2: Admin Routes (order: 2)                                    │
│   ├── /admin/*, subdomain: 'admin'                                       │
│   └── Layout: AdminLayout, requireAuth: true                             │
│                                                                          │
│   Priority 3: Portal Routes (order: 3)                                   │
│   ├── /dashboard, /profile, /tracking, /analytics...                    │
│   ├── subdomain: 'public' (molochain.com)                                │
│   └── Layout: PortalLayout, requireAuth: true                            │
│                                                                          │
│   Priority 4: Marketing Routes (order: 4)                                │
│   ├── /, /about, /services, /contact                                     │
│   └── Layout: PublicLayout                                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```
