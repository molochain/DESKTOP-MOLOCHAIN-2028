import { lazy } from 'react';
import { RouteRegistry } from './RouteRegistry';

const TermsOfService = lazy(() => import('@/pages/general/terms-of-service'));
const PrivacyPolicy = lazy(() => import('@/pages/general/privacy-policy'));

RouteRegistry.registerCategory({
  name: 'ecosystem',
  order: 6,
  routes: [
    { path: '/terms', component: TermsOfService, layout: 'default' },
    { path: '/privacy', component: PrivacyPolicy, layout: 'default' }
  ]
});

export const ecosystemRoutes = RouteRegistry.getRoutesByCategory('ecosystem');
