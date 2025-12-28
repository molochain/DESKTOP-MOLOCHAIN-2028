import { lazy } from 'react';
import { RouteRegistry } from './RouteRegistry';

// Ecosystem pages from general
const Ecosystem = lazy(() => import('@/pages/general/Ecosystem'));

// Legal pages from general
const TermsOfService = lazy(() => import('@/pages/general/terms-of-service'));
const PrivacyPolicy = lazy(() => import('@/pages/general/privacy-policy'));

// Register ecosystem routes
// Note: Developer pages moved to Admin (/admin/developer/*)
// Note: Deleted pages (no backend): GodLayer, RayanavabrainGodLayer, Achievements, VisionsManagement, IdentityManagement, RayanavaAI
// Note: PerformanceMonitoring moved to Admin (/admin/performance-monitoring)
// Note: Removed pages (December 27, 2025): AI Hub, Rayanava, RayanavaAnalytics, GoogleDrive*, APIKeysManagement (duplicates/not user-facing)
RouteRegistry.registerCategory({
  name: 'ecosystem',
  order: 6,
  routes: [
    { path: '/ecosystem', component: Ecosystem, requireAuth: true, layout: 'default' },
    { path: '/terms', component: TermsOfService, layout: 'default' },
    { path: '/privacy', component: PrivacyPolicy, layout: 'default' }
  ]
});

export const ecosystemRoutes = RouteRegistry.getRoutesByCategory('ecosystem');
