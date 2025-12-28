import { lazy } from 'react';
import { RouteRegistry } from './RouteRegistry';

const Services = lazy(() => import('@/pages/services/Services'));
const ServicesHub = lazy(() => import('@/pages/services/ServicesHub'));
const ServiceManagement = lazy(() => import('@/pages/services/ServiceManagement'));
const ServiceRecommender = lazy(() => import('@/pages/services/ServiceRecommender'));
const ServicePage = lazy(() => import('@/pages/services/ServicePage'));

RouteRegistry.registerCategory({
  name: 'services',
  order: 4,
  routes: [
    { path: '/services', component: Services, layout: 'default' },
    { path: '/services-hub', component: ServicesHub, layout: 'default' },
    { path: '/services-management', component: ServiceManagement, requireAuth: true, layout: 'default' },
    { path: '/service-recommender', component: ServiceRecommender, layout: 'default' },
    { path: '/services/:serviceId', component: ServicePage, layout: 'default' }
  ]
});

export const serviceRoutes = RouteRegistry.getRoutesByCategory('services');
