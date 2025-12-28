import { lazy } from 'react';
import { RouteRegistry } from './RouteRegistry';

// Department Dashboards (only existing departments)
const AccountingDashboard = lazy(() => import('@/departments/accounting/pages/Dashboard'));
const HRDashboard = lazy(() => import('@/departments/human-resources/pages/Dashboard'));
const OperationsDashboard = lazy(() => import('@/departments/operations/pages/Dashboard'));
const SupplyChainDashboard = lazy(() => import('@/departments/supply-chain/pages/Dashboard'));
const TechnologyDashboard = lazy(() => import('@/departments/technology-engineering/pages/Dashboard'));
const MarketingDashboard = lazy(() => import('@/departments/marketing-branding/pages/Dashboard'));
const LegalDashboard = lazy(() => import('@/departments/legal-risk/pages/Dashboard'));
const ManagementDashboard = lazy(() => import('@/departments/management/pages/Dashboard'));
const StrategyDashboard = lazy(() => import('@/departments/strategy-development/pages/Dashboard'));
const NetworkPartnersDashboard = lazy(() => import('@/departments/network-partners/pages/Dashboard'));
const LearningKnowledgeDashboard = lazy(() => import('@/departments/learning-knowledge/pages/Dashboard'));
const DocumentsLibraryDashboard = lazy(() => import('@/departments/documents-library/pages/Dashboard'));
const GodLayerDashboard = lazy(() => import('@/departments/god-layer/pages/Dashboard'));
const RayanavabrainDashboard = lazy(() => import('@/departments/rayanavabrain/pages/Dashboard'));

// Register department routes
RouteRegistry.registerCategory({
  name: 'departments',
  order: 3,
  routes: [
    { path: '/departments/accounting', component: AccountingDashboard, requireAuth: true, layout: 'default' },
    { path: '/departments/human-resources', component: HRDashboard, requireAuth: true, layout: 'default' },
    { path: '/departments/operations', component: OperationsDashboard, requireAuth: true, layout: 'default' },
    { path: '/departments/supply-chain', component: SupplyChainDashboard, requireAuth: true, layout: 'default' },
    { path: '/departments/technology-engineering', component: TechnologyDashboard, requireAuth: true, layout: 'default' },
    { path: '/departments/marketing-branding', component: MarketingDashboard, requireAuth: true, layout: 'default' },
    { path: '/departments/legal-risk', component: LegalDashboard, requireAuth: true, layout: 'default' },
    { path: '/departments/management', component: ManagementDashboard, requireAuth: true, layout: 'default' },
    { path: '/departments/strategy-development', component: StrategyDashboard, requireAuth: true, layout: 'default' },
    { path: '/departments/network-partners', component: NetworkPartnersDashboard, requireAuth: true, layout: 'default' },
    { path: '/departments/learning-knowledge', component: LearningKnowledgeDashboard, requireAuth: true, layout: 'default' },
    { path: '/departments/documents-library', component: DocumentsLibraryDashboard, requireAuth: true, layout: 'default' },
    { path: '/departments/god-layer', component: GodLayerDashboard, requireAuth: true, layout: 'default' },
    { path: '/departments/rayanavabrain', component: RayanavabrainDashboard, requireAuth: true, layout: 'default' }
  ]
});

export const departmentRoutes = RouteRegistry.getRoutesByCategory('departments');
