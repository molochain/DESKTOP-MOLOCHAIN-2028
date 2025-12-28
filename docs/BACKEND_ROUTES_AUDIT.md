# Backend Routes Audit Report
**Date:** December 14, 2025
**Phase:** 1.2 - Backend Routes Audit

## Executive Summary

| Metric | Count |
|--------|-------|
| Total Route Files | 73 |
| Active (mounted) | 50 |
| Disabled (imported, not mounted) | 5 |
| Dormant (never imported) | 18 |

---

## Methodology

Three-pass audit approach:
1. **Pass 1 - Import Trace:** Scan routes.ts, index.ts, registrars for imports
2. **Pass 2 - Mount Verification:** Check app.use, registrar calls, setup functions
3. **Pass 3 - Dormant Detection:** Files with zero imports = dormant

---

## File Inventory

### server/routes/ (35 files)

| File | Status | Evidence |
|------|--------|----------|
| admin/email-settings.routes.ts | ACTIVE | routes.ts line 87 |
| admin/form-submissions.routes.ts | ACTIVE | routes.ts line 86 |
| admin/memory-optimization.ts | ACTIVE | admin.registrar |
| admin-performance-metrics.ts | ACTIVE | index.ts line 30 |
| ai-assistant.ts | DORMANT | No imports found |
| ai-chat.ts | DORMANT | No imports found |
| api-documentation.ts | ACTIVE | routes.ts line 51 |
| api-keys.ts | ACTIVE | routes.ts line 48 |
| branding.ts | ACTIVE | admin.registrar |
| collaborativeDocuments.ts | ACTIVE | collaboration.registrar |
| contact-agents.ts | ACTIVE | routes.ts line 50 |
| dashboards.ts | ACTIVE | routes.ts line 69 |
| departments.ts | DISABLED | Imported line 40, never mounted |
| developer-department.ts | ACTIVE | routes.ts line 68 |
| developer-workspace.ts | ACTIVE | collaboration.registrar |
| driveRoutes.ts | ACTIVE | routes.ts line 49 |
| external-status.ts | ACTIVE | Function registerExternalStatusRoutes called |
| guides.ts | ACTIVE | routes.ts line 62 |
| instagram.routes.ts | ACTIVE | routes.ts line 77 |
| media.ts | ACTIVE | admin.registrar |
| missing-routes.ts | ACTIVE | routes.ts line 55 |
| module-endpoints.ts | DISABLED | Imported line 45, commented out line 624 |
| mololink.ts | ACTIVE | routes.ts line 61 |
| page-modules.ts | ACTIVE | routes.ts line 73 |
| performance.ts | ACTIVE | routes.ts line 56 |
| profile.ts | ACTIVE | routes.ts line 82 |
| rayanava-routes.ts | ACTIVE | Conditional dynamic import |
| secure-system-routes.ts | ACTIVE | routes.ts line 83 |
| service-recommendation.ts | ACTIVE | services.registrar |
| settings.ts | ACTIVE | admin.registrar |
| static.routes.ts | DORMANT | No imports found |
| supply-chain.ts | ACTIVE | routes.ts line 76 |
| websocket-health.ts | DORMANT | No imports (duplicate of api/ version) |
| websocket.routes.ts | DORMANT | No imports (replaced by UnifiedWSManager) |
| workspace-integration.ts | DORMANT | No imports found |

**Counts:** 27 Active, 2 Disabled, 6 Dormant = 35

### server/api/ (38 files)

| File | Status | Evidence |
|------|--------|----------|
| admin/admin-activity.routes.ts | DORMANT | No imports |
| admin/admin-analytics.routes.ts | DORMANT | No imports |
| admin/admin-page-modules.routes.ts | DORMANT | No imports |
| admin/admin-security.ts | ACTIVE | admin.registrar |
| admin/admin-settings.routes.ts | DORMANT | No imports |
| admin/admin-users.ts | ACTIVE | admin.registrar |
| analytics/analytics.ts | ACTIVE | routes.ts line 52 |
| auth/auth.routes.ts | DORMANT | No imports (2FA used instead) |
| auth/two-factor-auth.ts | ACTIVE | routes.ts line 47 |
| cms/cms-public.routes.ts | ACTIVE | routes.ts line 88 |
| collaboration/collaboration.ts | ACTIVE | collaboration.registrar |
| commodities/commodities.routes.ts | DORMANT | No imports |
| ecosystem/departments.routes.ts | DORMANT | No imports (duplicate) |
| ecosystem/ecosystem.ts | ACTIVE | routes.ts line 60 |
| health/health-detailed.ts | DORMANT | No imports |
| health/health-recommendations.ts | ACTIVE | Conditional dynamic import |
| health/health.routes.ts | DISABLED | Imported line 46, never mounted |
| health/health.ts | DORMANT | No imports |
| investment/investment.routes.ts | ACTIVE | setupInvestmentRoutes called |
| otms/otms-public.routes.ts | ACTIVE | routes.ts line 89 |
| partners/partners.routes.ts | ACTIVE | services.registrar |
| projects/projects.routes.ts | ACTIVE | routes.ts line 85 |
| services/cached-services.ts | ACTIVE | services.registrar |
| services/optimized-services.ts | ACTIVE | services.registrar |
| services/quote.routes.ts | ACTIVE | services.registrar |
| services/services-enhanced.ts | DISABLED | Imported, commented out |
| services/services-inline.routes.ts | ACTIVE | services.registrar |
| services/services-management.ts | DISABLED | Imported, commented out |
| services/services.routes.ts | DORMANT | No imports |
| tracking/carrier-integration.ts | ACTIVE | routes.ts line 57 |
| tracking/tracking-providers.ts | ACTIVE | admin.registrar |
| tracking/tracking.routes.ts | DORMANT | No imports |
| websocket/websocket-health.routes.ts | ACTIVE | routes.ts line 84 |
| compliance-reporting.ts | DORMANT | No imports |
| identity-security-management.ts | ACTIVE | routes.ts line 78 |
| incident-management.ts | ACTIVE | routes.ts line 79 |
| notifications.ts | ACTIVE | routes.ts line 81 |
| security-widgets.ts | ACTIVE | routes.ts line 80 |

**Counts:** 23 Active, 3 Disabled, 12 Dormant = 38

---

## Summary by Status

| Status | server/routes/ | server/api/ | Total |
|--------|----------------|-------------|-------|
| Active | 27 | 23 | 50 |
| Disabled | 2 | 3 | 5 |
| Dormant | 6 | 12 | 18 |
| **Total** | **35** | **38** | **73** |

---

## Phase 1.3 Actions

### Remove Duplicates (4 files)
```bash
rm server/routes/websocket-health.ts
rm server/api/ecosystem/departments.routes.ts
rm server/api/health/health.ts
rm server/api/services/services.routes.ts
rm server/api/tracking/tracking.routes.ts
```

### Archive Dormant (9 files)
```bash
mkdir -p archived/backend/{ai,admin,other}
mv server/routes/ai-assistant.ts archived/backend/ai/
mv server/routes/ai-chat.ts archived/backend/ai/
mv server/routes/websocket.routes.ts archived/backend/other/
mv server/routes/workspace-integration.ts archived/backend/other/
mv server/routes/static.routes.ts archived/backend/other/
mv server/api/admin/admin-activity.routes.ts archived/backend/admin/
mv server/api/admin/admin-analytics.routes.ts archived/backend/admin/
mv server/api/commodities/commodities.routes.ts archived/backend/other/
mv server/api/compliance-reporting.ts archived/backend/other/
```

### Clean Dead Imports (5 files)
Remove from routes.ts:
- Line 40: departmentsRouter (never mounted)
- Line 45: moduleEndpointsRouter (disabled)
- Line 46: healthRoutes (never mounted)
- Line 63: servicesManagementRoutes (disabled)
- Line 65: servicesEnhancedRoutes (disabled)

### Review Before Action (5 files)
- api/admin/admin-page-modules.routes.ts
- api/admin/admin-settings.routes.ts
- api/auth/auth.routes.ts
- api/health/health-detailed.ts
- api/health/health.routes.ts

---

## Phase 3 Target

| Current | Target | Reduction |
|---------|--------|-----------|
| 73 route files | 55 route files | 25% |
