# Frontend Page Audit Report
**Date:** December 14, 2025
**Phase:** 1.1 - Frontend Page Audit

## Executive Summary

| Metric | Count |
|--------|-------|
| Total TSX Page Files | 162 |
| Pages with Active Routes | 106 |
| Dormant Pages (no route) | 56 |

**Note:** Counts only `.tsx` files. Index.ts barrel exports excluded.

---

## Page Files by Directory

### client/src/pages/admin/ (27 TSX)
**Active:** 27 | **Dormant:** 0

All 27 pages registered via `adminPageRegistry.ts`.

### client/src/pages/ai/ (4 TSX)
**Active:** 4 | **Dormant:** 0

All 4 pages in ecosystem.routes.ts.

### client/src/pages/auth/ (6 TSX)
**Active:** 6 | **Dormant:** 0

4 in auth.routes.ts, 2 in ecosystem.routes.ts.

### client/src/pages/blockchain/ (24 TSX)
**Active:** 0 | **Dormant:** 24

All dormant - `featureFlags.blockchainEnabled = false`

**Action:** ARCHIVE (user disabled 2024-12-10)

### client/src/pages/brandbook/ (7 TSX)
**Active:** 7 | **Dormant:** 0

All 7 in brandbook.routes.ts.

### client/src/pages/commodities/ (1 TSX)
**Active:** 0 | **Dormant:** 1

- ❌ [type].tsx - Not implemented

**Action:** REMOVE

### client/src/pages/dashboard/ (16 TSX)
**Active:** 4 | **Dormant:** 12

**Active (4):** MainDashboard, TrackingDashboard, SmartDashboardPage, reports-dashboard

**Dormant roles/ (8):**
- ❌ AdminDashboard, AnalystDashboard, CompanyDashboard, DepartmentDashboard
- ❌ DeveloperDashboard, ManagerDashboard, ModeratorDashboard, UserDashboard

**Dormant other (4):**
- ❌ AdvancedAnalytics, PerformanceDashboard, PortfolioDashboard, StakingDashboard

**Action:** CONSOLIDATE role dashboards

### client/src/pages/departments/ (2 TSX)
**Active:** 0 | **Dormant:** 2

- ❌ all-department-dashboards.tsx
- ❌ department-template.tsx

Routes use `@/departments/` not `@/pages/departments/`

**Action:** REMOVE

### client/src/pages/developer/ (10 TSX)
**Active:** 10 | **Dormant:** 0

All 10 in routes.

### client/src/pages/general/ (37 TSX)
**Active:** 34 | **Dormant:** 3

**Dormant (3):**
- ❌ CarbonFootprint
- ❌ CustomerPortal
- ❌ DocumentProcessing

**Action:** REVIEW with user

### client/src/pages/guides/ (2 TSX)
**Active:** 2 | **Dormant:** 0

### client/src/pages/investment/ (4 TSX)
**Active:** 0 | **Dormant:** 4

- ❌ InvestmentPortal, InvestmentTracking, Investor, InvestorPortal

**Action:** ARCHIVE

### client/src/pages/marketing/ (1 TSX)
**Active:** 0 | **Dormant:** 1

- ❌ InstagramDashboard

**Action:** ARCHIVE

### client/src/pages/profile/ (2 TSX)
**Active:** 2 | **Dormant:** 0

### client/src/pages/projects/ (3 TSX)
**Active:** 2 | **Dormant:** 1

- ❌ ProjectDetails (duplicate of ProjectID)

**Action:** REMOVE

### client/src/pages/services/ (5 TSX)
**Active:** 5 | **Dormant:** 0

### client/src/pages/supply-chain/ (11 TSX)
**Active:** 3 | **Dormant:** 8

**Active (3):** Commodities, CommodityTags, TrackingDemo

**Dormant (8):**
- ❌ FleetManagement, PredictiveMaintenance, RouteOptimization, ShipmentTracking
- ❌ SupplyChainAnalytics, SupplyChainHeatmap, SupplyChainRisk, WarehouseManagement

**Action:** HOLD (future features)

---

## Dormant Pages Summary (56 total)

| Priority | Category | Count | Action |
|----------|----------|-------|--------|
| P1 | blockchain/* | 24 | ARCHIVE |
| P2 | dashboard/roles/* | 8 | CONSOLIDATE |
| P3 | dashboard/* other | 4 | CONSOLIDATE |
| P4 | supply-chain/* | 8 | HOLD |
| P5 | investment/* | 4 | ARCHIVE |
| P6 | general/* | 3 | REVIEW |
| P7 | departments/* | 2 | REMOVE |
| P8 | commodities/* | 1 | REMOVE |
| P9 | projects/* | 1 | REMOVE |
| P10 | marketing/* | 1 | ARCHIVE |
| **Total** | | **56** | |

---

## Verification

| Directory | Active | Dormant | Total |
|-----------|--------|---------|-------|
| admin | 27 | 0 | 27 |
| ai | 4 | 0 | 4 |
| auth | 6 | 0 | 6 |
| blockchain | 0 | 24 | 24 |
| brandbook | 7 | 0 | 7 |
| commodities | 0 | 1 | 1 |
| dashboard | 4 | 12 | 16 |
| departments | 0 | 2 | 2 |
| developer | 10 | 0 | 10 |
| general | 34 | 3 | 37 |
| guides | 2 | 0 | 2 |
| investment | 0 | 4 | 4 |
| marketing | 0 | 1 | 1 |
| profile | 2 | 0 | 2 |
| projects | 2 | 1 | 3 |
| services | 5 | 0 | 5 |
| supply-chain | 3 | 8 | 11 |
| **TOTAL** | **106** | **56** | **162** |

---

## Phase 1.3 Actions

### Archive (29 pages)
```bash
mkdir -p archived/blockchain archived/investment archived/marketing
mv client/src/pages/blockchain/* archived/blockchain/
mv client/src/pages/investment/* archived/investment/
mv client/src/pages/marketing/InstagramDashboard.tsx archived/marketing/
```

### Remove (4 pages)
```bash
rm client/src/pages/commodities/[type].tsx
rm client/src/pages/departments/all-department-dashboards.tsx
rm client/src/pages/departments/department-template.tsx
rm client/src/pages/projects/ProjectDetails.tsx
```

### Phase 2.2 Consolidation (12 pages → 2)
- Merge 8 dashboard/roles/* → configurable RoleDashboard
- Merge 4 dashboard extras → MainDashboard widgets

### Hold for Review (11 pages)
- 8 supply-chain (future features)
- 3 general (CarbonFootprint, CustomerPortal, DocumentProcessing)
