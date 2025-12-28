# Backend Domain Inventory
Generated: 2024-12-07

## Overview
This document categorizes all backend functionality by business domain to inform future restructuring.

---

## Domain Map

### 1. Authentication & Security Domain
**Base Path**: `/api/auth`, `/api/admin/security`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Two-Factor Auth | server/api/auth/two-factor-auth.ts | 5 |
| Auth Routes | server/api/auth/auth.routes.ts | 1 |
| Auth Service | server/core/auth/auth.service.ts | 9 |
| Password Reset | server/core/auth/password-reset.service.ts | 2 |
| Admin Security | server/api/admin/admin-security.ts | 6 |
| Identity Security | server/api/identity-security-management.ts | 55 |

**Total Endpoints**: ~78

---

### 2. Admin Domain
**Base Path**: `/api/admin`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| User Management | server/api/admin/admin-users.ts | 7 |
| Security | server/api/admin/admin-security.ts | 6 |
| CMS Integration | server/api/admin/admin-cms.routes.ts | 13 |
| Activity Logging | server/api/admin/admin-activity.routes.ts | 3 |
| Settings | server/api/admin/admin-settings.routes.ts | 5 |
| Analytics | server/api/admin/admin-analytics.routes.ts | 6 |
| Page Modules | server/api/admin/admin-page-modules.routes.ts | 9 |
| Memory Optimization | server/routes/admin/memory-optimization.ts | 5 |

**Total Endpoints**: ~54

---

### 3. Services Domain
**Base Path**: `/api/services`, `/api`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Cached Services | server/api/services/cached-services.ts | 2 |
| Optimized Services | server/api/services/optimized-services.ts | 7 |
| Services Enhanced | server/api/services/services-enhanced.ts | 17 |
| Services Management | server/api/services/services-management.ts | 13 |
| Service Routes | server/api/services/services.routes.ts | 4 |
| Service Recommendation | server/routes/service-recommendation.ts | 1 |

**Total Endpoints**: ~44

---

### 4. Tracking & Logistics Domain
**Base Path**: `/api/tracking`, `/api/carriers`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Tracking Routes | server/api/tracking/tracking.routes.ts | 4 |
| Tracking Providers | server/api/tracking/tracking-providers.ts | 4 |
| Carrier Integration | server/api/tracking/carrier-integration.ts | 9 |
| Supply Chain | server/routes/supply-chain.ts | 5 |

**Total Endpoints**: ~22

---

### 5. Dashboard Domain
**Base Path**: `/api/dashboards`, `/api/dashboard`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Dashboards | server/routes/dashboards.ts | 11 |
| Dashboard (legacy) | server/routes/dashboard.ts (if exists) | ? |

**Total Endpoints**: ~11

---

### 6. Ecosystem & Departments Domain
**Base Path**: `/api/ecosystem`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Ecosystem | server/api/ecosystem/ecosystem.ts | 21 |
| Departments | server/api/ecosystem/departments.routes.ts | 21 |
| Departments (route) | server/routes/departments.ts | 1 |

**Total Endpoints**: ~43

---

### 7. Instagram Marketing Domain
**Base Path**: `/api/instagram`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Instagram Routes | server/routes/instagram.routes.ts | 60 |

**Total Endpoints**: 60

---

### 8. Health & Monitoring Domain
**Base Path**: `/api/health`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Health Routes | server/api/health/health.routes.ts | 9 |
| Health Core | server/api/health/health.ts | 9 |
| Health Detailed | server/api/health/health-detailed.ts | 3 |
| Health Recommendations | server/api/health/health-recommendations.ts | 7 |
| Monitoring Service | server/core/monitoring/monitoring.service.ts | 5 |

**Total Endpoints**: ~33

---

### 9. Collaboration Domain
**Base Path**: `/api/collaboration`, `/api/collaborative-documents`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Collaboration | server/api/collaboration/collaboration.ts | 6 |
| Collaborative Docs | server/routes/collaborativeDocuments.ts | 4 |
| Developer Workspace | server/routes/developer-workspace.ts | 7 |
| Workspace Integration | server/routes/workspace-integration.ts | 6 |

**Total Endpoints**: ~23

---

### 10. Drive Integration Domain
**Base Path**: `/api/drive`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Drive Routes | server/routes/driveRoutes.ts | 13 |

**Total Endpoints**: 13

---

### 11. Analytics Domain
**Base Path**: `/api/analytics`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Analytics | server/api/analytics/analytics.ts | 6 |
| Performance | server/routes/performance.ts | 6 |
| Admin Performance | server/routes/admin-performance-metrics.ts | 8 |

**Total Endpoints**: ~20

---

### 12. Incident & Compliance Domain
**Base Path**: `/api`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Incident Management | server/api/incident-management.ts | 15 |
| Compliance Reporting | server/api/compliance-reporting.ts | 13 |
| Security Widgets | server/api/security-widgets.ts | 15 |

**Total Endpoints**: ~43

---

### 13. Notifications Domain
**Base Path**: `/api/notifications`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Notifications | server/api/notifications.ts | 9 |

**Total Endpoints**: 9

---

### 14. Investment Domain
**Base Path**: `/api/investment`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Investment Routes | server/api/investment/investment.routes.ts | 9 |

**Total Endpoints**: 9

---

### 15. Commodities Domain
**Base Path**: `/api/commodities`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Commodities Routes | server/api/commodities/commodities.routes.ts | 4 |

**Total Endpoints**: 4

---

### 16. Projects Domain
**Base Path**: `/api/projects`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Projects Routes | server/api/projects/projects.routes.ts | 5 |

**Total Endpoints**: 5

**Note:** Projects routes were extracted from inline handlers in routes.ts to a dedicated route file during Phase 2 restructuring (December 2025).

---

### 17. MOLOLINK Domain
**Base Path**: `/api/mololink`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| MOLOLINK Routes | server/routes/mololink.ts | 16 |

**Total Endpoints**: 16

---

### 18. Guides & Documentation Domain
**Base Path**: `/api/guides`, `/api/api-documentation`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Guides | server/routes/guides.ts | 12 |
| API Documentation | server/routes/api-documentation.ts | 3 |

**Total Endpoints**: ~15

---

### 19. Page Modules Domain
**Base Path**: `/api/pages`, `/api/modules`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Page Modules | server/routes/page-modules.ts | 18 |
| Module Endpoints | server/routes/module-endpoints.ts | 8 |

**Total Endpoints**: ~26

---

### 20. WebSocket Domain
**Base Path**: `/api/websocket`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| WebSocket Health | server/api/websocket/websocket-health.routes.ts | 8 |
| WebSocket Routes | server/routes/websocket.routes.ts | (unknown) |
| WebSocket Health (route) | server/routes/websocket-health.ts | 2 |

**Total Endpoints**: ~10

---

### 21. AI Domain (Conditional)
**Base Path**: `/api/rayanava`, `/api/ai`

| Subdomain | Files | Endpoints |
|-----------|-------|-----------|
| Rayanava Routes | server/routes/rayanava-routes.ts | 9 |
| AI Assistant | server/routes/ai-assistant.ts | 3 |
| AI Chat | server/routes/ai-chat.ts | 1 |

**Total Endpoints**: ~13 (when enabled)

---

## Summary

| Domain | Estimated Endpoints | Primary Files |
|--------|---------------------|---------------|
| Identity Security | 78 | identity-security-management.ts |
| Instagram Marketing | 60 | instagram.routes.ts |
| Admin | 54 | admin/*.ts |
| Services | 44 | services/*.ts |
| Ecosystem | 43 | ecosystem/*.ts |
| Incident & Compliance | 43 | incident-management.ts, compliance-reporting.ts |
| Health | 33 | health/*.ts |
| Page Modules | 26 | page-modules.ts |
| Collaboration | 23 | collaboration/*.ts |
| Tracking | 22 | tracking/*.ts |
| Analytics | 20 | analytics.ts, performance.ts |
| MOLOLINK | 16 | mololink.ts |
| Guides | 15 | guides.ts |
| Drive | 13 | driveRoutes.ts |
| AI | 13 | rayanava-routes.ts |
| Dashboard | 11 | dashboards.ts |
| WebSocket | 10 | websocket-*.ts |
| Projects | 5 | projects.routes.ts |
| Investment | 9 | investment.routes.ts |
| Notifications | 9 | notifications.ts |
| Commodities | 4 | commodities.routes.ts |

**Total Estimated Endpoints**: ~550+

---

## Recommended Domain Consolidation (Future Phase)

### Tier 1: Keep Separate (High Activity)
- auth/
- admin/
- services/
- tracking/
- ecosystem/

### Tier 2: Merge into Parent (Medium Activity)
- health/ → into monitoring/
- analytics/ → into monitoring/
- collaboration/ → into workspace/

### Tier 3: Evaluate for Deprecation (Low Activity)
- ai-assistant.ts
- ai-chat.ts
- missing-routes.ts
