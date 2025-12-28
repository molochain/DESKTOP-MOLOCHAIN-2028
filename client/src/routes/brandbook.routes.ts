import { lazy } from 'react';
import { RouteRegistry } from './RouteRegistry';

const BrandbookHome = lazy(() => import('@/pages/brandbook/BrandbookHome'));

RouteRegistry.registerCategory({
  name: 'brandbook',
  order: 5,
  routes: [
    { path: '/brandbook', component: BrandbookHome, layout: 'default', title: 'Brand Book' }
  ]
});

export const brandbookRoutes = RouteRegistry.getRoutesByCategory('brandbook');
