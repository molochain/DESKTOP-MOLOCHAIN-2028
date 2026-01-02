import { lazy } from 'react';
import { RouteRegistry } from './RouteRegistry';

const Services = lazy(() => import('@/pages/services/Services'));
const ServicePage = lazy(() => import('@/pages/services/ServicePage'));
const CaseStudies = lazy(() => import('@/pages/case-studies/CaseStudies'));

RouteRegistry.registerCategory({
  name: 'services',
  order: 4,
  routes: [
    { path: '/services', component: Services, layout: 'default' },
    { path: '/case-studies', component: CaseStudies, layout: 'default' },
    { path: '/services/:serviceId', component: ServicePage, layout: 'default' }
  ]
});

export const serviceRoutes = RouteRegistry.getRoutesByCategory('services');
