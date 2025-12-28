# Route Baseline Document for Regression Testing
Generated: 2024-12-07
Updated: 2024-12-07 (Phase 2 Backend Restructuring Complete)

## Purpose
This document serves as the authoritative baseline for all active HTTP routes in the MoloChain backend.
Use this for regression testing during backend restructuring to ensure no routes are broken.

---

## Quick Reference: Route Count Summary

| Category | Count |
|----------|-------|
| Extracted Domain Routes | 15 |
| Public Router Mounts | 18 |
| Admin Router Mounts | 7 |
| Admin Inline Routes | 7 |
| Analytics & AI Routes | 5 |
| Additional Feature Routes | 7 |
| **Total Routes** | ~60+ endpoints |

**Note:** Admin routes are protected by `app.use("/api/admin/*", isAuthenticated, isAdmin)` middleware guard.

---

## Section 1: Domain Registrar Architecture (Phase 2)

Routes are now organized using domain registrars in `server/registrars/`:

| Registrar | Source File | Domains Covered |
|-----------|-------------|-----------------|
| registerServiceRoutes | server/registrars/services.registrar.ts | Services, Partners, Quote, Regions, Tracking, Product Types |
| registerAdminRoutes | server/registrars/admin.registrar.ts | Admin Users, Security, Memory, Tracking Providers, Media, Settings, Branding |
| registerCollaborationRoutes | server/registrars/collaboration.registrar.ts | Collaboration, Developer Workspace, Documents |

The registrars are exported from `server/registrars/index.ts` and called in `server/routes.ts`.

---

## Section 2: Extracted Domain Routes

These routes have been extracted from inline handlers to dedicated route files:

### Projects Domain
| Method | Path | Source File | Notes |
|--------|------|-------------|-------|
| POST | `/api/projects/upload` | server/api/projects/projects.routes.ts | File upload with multer |
| GET | `/api/projects/examples` | server/api/projects/projects.routes.ts | Cached (900s) |
| GET | `/api/projects` | server/api/projects/projects.routes.ts | Cached (300s) |
| GET | `/api/projects/:id/updates` | server/api/projects/projects.routes.ts | Project updates |
| POST | `/api/projects/:id/milestones` | server/api/projects/projects.routes.ts | Add milestone |

**Mount:** `app.use("/api/projects", projectsRoutes)` in routes.ts

### Quote Domain
| Method | Path | Source File | Notes |
|--------|------|-------------|-------|
| POST | `/api/quote` | server/api/services/quote.routes.ts | Validated with quoteSchema |

**Mount:** Via services.registrar.ts at `/api/quote`

### Services Domain
| Method | Path | Source File | Notes |
|--------|------|-------------|-------|
| GET | `/api/services` | server/api/services/services-inline.routes.ts | Cached (MEDIUM TTL) |
| GET | `/api/services/:id` | server/api/services/services-inline.routes.ts | Cached (MEDIUM TTL) |
| GET | `/api/services/:id/availability/:regionCode` | server/api/services/services-inline.routes.ts | Cached (SHORT TTL) |
| GET | `/api/regions` | server/api/services/services-inline.routes.ts | Cached (VERY_LONG TTL) |
| GET | `/api/product-types` | server/api/services/services-inline.routes.ts | Cached (LONG TTL) |

**Mount:** Via services.registrar.ts at `/api`

### Partners Domain
| Method | Path | Source File | Notes |
|--------|------|-------------|-------|
| GET | `/api/partners` | server/api/partners/partners.routes.ts | Uses partnersData |
| GET | `/api/partners/:id` | server/api/partners/partners.routes.ts | Uses getPartnerById() |
| GET | `/api/partners/:id/related` | server/api/partners/partners.routes.ts | Uses getRelatedPartners() |

**Mount:** Via services.registrar.ts at `/api/partners`

### Tracking Domain
| Method | Path | Source File | Notes |
|--------|------|-------------|-------|
| GET | `/api/tracking/:trackingNumber` | server/api/services/services-inline.routes.ts | Cached (SHORT TTL) |

**Mount:** Via services.registrar.ts at `/api` (included in servicesInlineRoutes)

**Note:** `server/api/tracking/tracking.routes.ts` exists but is marked @deprecated and NOT used. The active tracking endpoint is in services-inline.routes.ts.

---

## Section 3: Public Router Mounts

These routers are mounted with `app.use()` in `server/routes.ts` or via registrars.

| Mount Path | Router Variable | Source File |
|------------|-----------------|-------------|
| `/api` | serviceRecommendationRoutes | server/routes/service-recommendation.ts |
| `/api` | optimizedServicesRoutes | server/api/services/optimized-services.ts |
| `/api` | cachedServicesRoutes | server/api/services/cached-services.ts |
| `/api` | collaborationRoutes | server/api/collaboration/collaboration.ts |
| `/api/contact` | contactAgentsRouter | server/routes/contact-agents.ts |
| `/api/auth` | twoFactorAuthRoutes | server/api/auth/two-factor-auth.ts |
| `/api` | profileRoutes | server/routes/profile.ts |
| `/api/instagram` | instagramRoutes | server/routes/instagram.routes.ts |
| `/api/drive` | driveRoutes | server/routes/driveRoutes.ts |
| `/api/collaborative-documents` | collaborativeDocumentsRoutes | server/routes/collaborativeDocuments.ts |
| `/api/settings` | apiKeysRoutes | server/routes/api-keys.ts |
| `/api/dashboards` | dashboardsRoutes | server/routes/dashboards.ts |
| `/api` | identitySecurityManagementRoutes | server/api/identity-security-management.ts |
| `/api` | incidentManagementRoutes | server/api/incident-management.ts |
| `/api` | securityWidgetsRoutes | server/api/security-widgets.ts |
| `/api` | notificationsRoutes | server/api/notifications.ts |
| `/api/websocket` | webSocketHealthRoutes | server/api/websocket/websocket-health.routes.ts |
| `/api/health-recommendations` | healthRecommendationsRoutes | server/api/health/health-recommendations.ts (conditional) |

### Routers Without Prefix (mounted at root)
| Router Variable | Source File | Notes |
|-----------------|-------------|-------|
| pageModulesRoutes | server/routes/page-modules.ts | Contains its own paths |
| supplyChainRoutes | server/routes/supply-chain.ts | Contains its own paths |
| missingRoutes | server/routes/missing-routes.ts | Fallback handlers |
| secureSystemRoutes | server/routes/secure-system-routes.ts | Protected endpoints |

---

## Section 4: Admin Router Mounts (Protected)

All admin routes require `isAuthenticated` and `isAdmin` middleware.
Routes are mounted via `admin.registrar.ts`.

| Mount Path | Router Variable | Source File |
|------------|-----------------|-------------|
| `/api/admin/users` | adminUsersRoutes | server/api/admin/admin-users.ts |
| `/api/admin/security` | adminSecurityRoutes | server/api/admin/admin-security.ts |
| `/api/admin/memory` | memoryOptimizationRoutes | server/routes/admin/memory-optimization.ts |
| `/api/admin/tracking-providers` | trackingProvidersRoutes | server/api/tracking/tracking-providers.ts |
| `/api/admin/content/media` | mediaRoutes | server/routes/media.ts |
| `/api/admin/settings` | settingsRoutes | server/routes/settings.ts |
| `/api/admin/branding` | brandingRoutes | server/routes/branding.ts |

---

## Section 5: Admin Inline Routes

These admin routes remain inline in `server/routes.ts` (TODO: extract in future phase).

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/admin/cache/stats` | Returns cache statistics |
| POST | `/api/admin/cache/clear` | Clears cache (type param) |
| GET | `/api/admin/stats` | System statistics |
| GET | `/api/admin/health` | System health check |
| GET | `/api/admin/logs` | System logs |
| GET | `/api/admin/websocket-health` | WebSocket health (admin) |

### Public Health Endpoint
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/health/websocket` | Limited info for security |

---

## Section 6: Analytics & AI Routes

| Mount Path | Router Variable | Source File | Notes |
|------------|-----------------|-------------|-------|
| `/api` | apiDocumentationRoutes | server/routes/api-documentation.ts | |
| `/api/analytics` | analyticsRoutes | server/api/analytics/analytics.ts | |
| `/api/performance` | performanceRoutes | server/routes/performance.ts | |
| `/api/carriers` | carrierIntegrationRoutes | server/api/tracking/carrier-integration.ts | DEPRECATED - use /api/carrier-integration |
| `/api/rayanava` | rayanavaRoutes | server/routes/rayanava-routes.ts | Conditional (AI) |

**Note:** `/api/carriers` is deprecated but maintained for backwards compatibility. Use `/api/carrier-integration` instead (see Section 7).

---

## Section 7: Additional Feature Routes

| Mount Path | Router Variable | Source File | Notes |
|------------|-----------------|-------------|-------|
| `/api/missing-routes` | missingRoutes | server/routes/missing-routes.ts | |
| `/api/carrier-integration` | carrierIntegrationRoutes | server/api/tracking/carrier-integration.ts | CANONICAL - preferred path for carrier APIs |
| `/api/collaboration/workspace` | developerWorkspaceRoutes | server/routes/developer-workspace.ts | Via collaboration.registrar.ts |
| `/api/mololink` | mololinkRoutes | server/routes/mololink.ts | |
| `/api/guides` | guidesRoutes | server/routes/guides.ts | |
| `/api/developer` | developerDepartmentRoutes | server/routes/developer-department.ts | |
| (root) | ecosystemRoutes | server/api/ecosystem/ecosystem.ts | |

---

## Section 8: Static File Serving

| Path | Directory |
|------|-----------|
| `/uploads` | attached_assets/uploads |
| `/projects` | attached_assets/projects |

---

## Section 9: Initial Setup Routes

These are initialized early in the `registerRoutes()` function:

1. `setupInvestmentRoutes(app)` - server/api/investment/investment.routes.ts
2. `setupAuth(app)` - Authentication setup
3. `setupApiDocs(app)` - Swagger documentation at `/api/docs`

---

## Section 10: Disabled/Commented Routes

These routes are currently disabled and should NOT be restored without review:

| Mount Path | Router | Reason |
|------------|--------|--------|
| `/api` | servicesEnhancedRoutes | Database timeout issues |
| `/api/modules` | moduleAPIRouter | Module doesn't exist |
| `/api` | moduleEndpointsRouter | Conflicts with services-simple routes |

---

## Regression Testing Checklist

### Critical Paths (Must Work)
- [ ] `GET /api/services` - Returns list of services
- [ ] `GET /api/regions` - Returns list of regions
- [ ] `GET /api/partners` - Returns list of partners
- [ ] `GET /api/product-types` - Returns product types
- [ ] `POST /api/quote` - Accepts quote request
- [ ] `GET /api/tracking/:trackingNumber` - Returns tracking info
- [ ] `GET /api/projects` - Lists projects
- [ ] `GET /api/dashboards/*` - Dashboard data (authenticated)

### Admin Paths (Admin Auth Required)
- [ ] `GET /api/admin/stats` - System statistics
- [ ] `GET /api/admin/health` - System health
- [ ] `GET /api/admin/cache/stats` - Cache statistics
- [ ] `POST /api/admin/cache/clear` - Clear cache

### AI-Dependent Paths (Conditional)
- [ ] `GET /api/health-recommendations/*` - AI health features
- [ ] `GET /api/rayanava/*` - Rayanava AI integration

---

## Notes

1. Routes are now organized via domain registrars in `server/registrars/`
2. Extracted routes live in `server/api/{domain}/{domain}.routes.ts`
3. Cached routes use CACHE_TTL constants: SHORT=60s, MEDIUM=300s, LONG=1800s, VERY_LONG=86400s
4. Protected routes use `isAuthenticated` and `isAdmin` middleware from `server/core/auth/auth.service.ts`
5. Line number references removed - use source file locations instead
