# Route Map Audit Report
Generated: 2024-12-07

## Overview
This document provides a complete inventory of all HTTP route registrations in the MoloChain backend.

## Route Registration Summary

### Primary Route Registration Files
| File | app.use() Calls | router.* Calls | Total |
|------|-----------------|----------------|-------|
| server/routes.ts | 42 | 75 | 117 |
| server/routes/core.routes.ts | 15 | 0 | 15 |
| server/api/admin/admin.routes.ts | 12 | 0 | 12 |

### Route Endpoint Counts by File (Top 20)
| File | Endpoint Count |
|------|----------------|
| server/routes/instagram.routes.ts | 60 |
| server/api/identity-security-management.ts | 55 |
| server/api/ecosystem/ecosystem.ts | 21 |
| server/api/ecosystem/departments.routes.ts | 21 |
| server/routes/page-modules.ts | 18 |
| server/api/services/services-enhanced.ts | 17 |
| server/routes/mololink.ts | 16 |
| server/api/security-widgets.ts | 15 |
| server/api/incident-management.ts | 15 |
| server/api/compliance-reporting.ts | 13 |
| server/api/admin/admin-cms.routes.ts | 13 |
| server/api/services/services-management.ts | 13 |
| server/routes/driveRoutes.ts | 13 |
| server/routes/guides.ts | 12 |
| server/routes/dashboards.ts | 11 |
| server/api/tracking/carrier-integration.ts | 9 |
| server/api/admin/admin-page-modules.routes.ts | 9 |
| server/api/notifications.ts | 9 |
| server/api/health/health.routes.ts | 9 |
| server/api/health/health.ts | 9 |

---

## Main Routes (server/routes.ts)

### Public API Routes
| Mount Path | Router/Handler | Line |
|------------|----------------|------|
| /api | serviceRecommendationRoutes | 223 |
| /api | optimizedServicesRoutes | 225 |
| /api | cachedServicesRoutes | 226 |
| /api | collaborationRoutes | 229 |
| /api/contact | contactAgentsRouter | 230 |
| /api/auth | twoFactorAuthRoutes | 231 |
| /api | profileRoutes | 234 |
| /api/instagram | instagramRoutes | 237 |
| /api/drive | driveRoutes | 241 |
| /api/collaborative-documents | collaborativeDocumentsRoutes | 245 |
| /api/settings | apiKeysRoutes | 248 |
| /api/dashboards | dashboardsRoutes | 251 |
| /api | identitySecurityManagementRoutes | 254 |
| /api | incidentManagementRoutes | 257 |
| /api | securityWidgetsRoutes | 260 |
| /api | notificationsRoutes | 261 |
| /api/websocket | webSocketHealthRoutes | 264 |
| /api/health-recommendations | healthRecommendationsRoutes | 279 (conditional) |

### Admin Routes (Protected)
| Mount Path | Router/Handler | Line |
|------------|----------------|------|
| /api/admin/* | isAuthenticated, isAdmin (middleware) | 762 |
| /api/admin/users | adminUsersRoutes | 763 |
| /api/admin/security | adminSecurityRoutes | 764 |
| /api/admin/memory | memoryOptimizationRoutes | 765 |
| /api/admin/tracking-providers | trackingProvidersRoutes | 766 |
| /api/admin/content/media | mediaRoutes | 767 |
| /api/admin/settings | settingsRoutes | 769 |
| /api/admin/branding | brandingRoutes | 770 |

### Analytics & Performance Routes
| Mount Path | Router/Handler | Line |
|------------|----------------|------|
| /api | apiDocumentationRoutes | 773 |
| /api/analytics | analyticsRoutes | 776 |
| /api/performance | performanceRoutes | 777 |
| /api/carriers | carrierIntegrationRoutes | 778 |

### AI Routes (Conditional)
| Mount Path | Router/Handler | Line |
|------------|----------------|------|
| /api/rayanava | rayanavaRoutes | 786 (if FEATURE_AI_ENABLED) |

### Additional Routes (End of File)
| Mount Path | Router/Handler | Line |
|------------|----------------|------|
| /api/missing-routes | missingRoutes | 1002 |
| /api/carrier-integration | carrierIntegrationRoutes | 1003 |
| /api/collaboration/workspace | developerWorkspaceRoutes | 1004 |
| /api/mololink | mololinkRoutes | 1005 |
| /api/guides | guidesRoutes | 1006 |
| /api/developer | developerDepartmentRoutes | 1007 |

### Inline Routes (Defined in routes.ts)
- POST /api/projects/upload (line 306)
- GET /api/projects/examples (line 342)
- GET /api/projects (line 406)
- GET /api/projects/:id/updates (line 441)
- POST /api/projects/:id/milestones (line 454)
- POST /api/quote (line 467)
- GET /api/services (line 482)
- GET /api/services/:id (line 500)
- GET /api/services/:id/availability/:regionCode (line 530)
- GET /api/regions (line 587)
- GET /api/product-types (line 645)
- GET /api/tracking (line ~680)
- GET /api/partners (line ~700)
- GET /api/partners/:id (line ~730)

---

## Core Routes (server/routes/core.routes.ts)

| Mount Path | Router/Handler |
|------------|----------------|
| /api/dashboard | dashboardRoutes |
| /api/settings | settingsRoutes |
| /api/drive | driveRoutes |
| /api/collaborative-documents | collaborativeDocumentsRoutes |
| /api/contact | contactAgentsRouter |
| /api | collaborationRoutes |
| /api | serviceRecommendationRoutes |
| /api | cachedServicesRoutes |
| /api/ecosystem | ecosystemRoutes |
| /api/mololink | mololinkRoutes |
| /api/guides | guidesRoutes |
| /api/developer-workspace | developerWorkspaceRoutes |

---

## Admin Routes (server/api/admin/admin.routes.ts)

| Mount Path | Router/Handler |
|------------|----------------|
| /api/admin/users | adminUsersRoutes |
| /api/admin/security | adminSecurityRoutes |
| /api/admin/memory | memoryOptimizationRoutes |
| /api/admin/tracking-providers | trackingProvidersRoutes |
| /api/admin | adminCMSRoutes |
| /api/admin | adminActivityRoutes |
| /api/admin | adminSettingsRoutes |
| /api/admin | adminAnalyticsRoutes |
| /api/admin | adminPageModulesRoutes |

---

## Route Files Inventory

### server/routes/ Directory (34 files)
- admin/ (subdirectory)
- admin-performance-metrics.ts
- ai-assistant.ts
- ai-chat.ts
- api-documentation.ts
- api-keys.ts
- branding.ts
- collaborativeDocuments.ts
- contact-agents.ts
- core.routes.ts
- dashboards.ts
- departments.ts
- developer-department.ts
- developer-workspace.ts
- driveRoutes.ts
- external-status.ts
- guides.ts
- instagram.routes.ts
- media.ts
- missing-routes.ts
- module-endpoints.ts
- mololink.ts
- page-modules.ts
- performance.ts
- profile.ts
- rayanava-routes.ts
- secure-system-routes.ts
- service-recommendation.ts
- settings.ts
- static.routes.ts
- supply-chain.ts
- websocket-health.ts
- websocket.routes.ts
- workspace-integration.ts

### server/api/ Directory (Organized by Domain)
- admin/ (9 files)
- analytics/ (1 file)
- auth/ (2 files)
- collaboration/ (1 file)
- commodities/ (1 file)
- ecosystem/ (2 files)
- health/ (4 files)
- investment/ (1 file)
- projects/ (1 file)
- services/ (5 files)
- tracking/ (3 files)
- websocket/ (1 file)
- compliance-reporting.ts
- identity-security-management.ts
- incident-management.ts
- notifications.ts
- security-widgets.ts

---

## Disabled/Commented Routes
- /api (servicesEnhancedRoutes) - disabled due to database timeout issues
- /api/modules (moduleAPIRouter) - module doesn't exist
- /api (moduleEndpointsRouter) - conflicts with services-simple routes

---

## Notes
1. This audit does NOT modify any files - read-only analysis
2. Duplicate registrations are documented separately in DUPLICATE_ROUTES.md
3. Route priority is determined by registration order in Express
