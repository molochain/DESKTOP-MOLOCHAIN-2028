import { lazy } from 'react';
import { RouteRegistry } from './RouteRegistry';

// Main pages from general
const Home = lazy(() => import('@/pages/general/Home'));
const About = lazy(() => import('@/pages/general/About'));
const Contact = lazy(() => import('@/pages/general/Contact'));
const Success = lazy(() => import('@/pages/general/Success'));
const Partners = lazy(() => import('@/pages/general/Partners'));
const PartnerDetail = lazy(() => import('@/pages/general/PartnerDetail'));
const NotFound = lazy(() => import('@/pages/general/not-found'));
const Settings = lazy(() => import('@/pages/general/Settings'));
const Careers = lazy(() => import('@/pages/general/Careers'));

// Projects
const ProjectPage = lazy(() => import('@/pages/projects/ProjectID'));

// Register main routes (public-facing website)
// Note: Guides pages moved to Admin (/admin/guides/*)
// Note: SupplyChainHeatmap removed - tracking available in separate service
RouteRegistry.registerCategory({
  name: 'main',
  order: 1,
  routes: [
    { path: '/', component: Home, exact: true, layout: 'default', subdomain: 'public' },
    { path: '/about', component: About, layout: 'default', subdomain: 'public' },
    { path: '/contact', component: Contact, layout: 'default', subdomain: 'public' },
    { path: '/success', component: Success, layout: 'default', subdomain: 'public' },
    { path: '/careers', component: Careers, layout: 'default', subdomain: 'public' },
    { path: '/jobs', component: Careers, layout: 'default', subdomain: 'public' },
    { path: '/projects/:id', component: ProjectPage, layout: 'default', subdomain: 'public' },
    { path: '/partners', component: Partners, layout: 'default', subdomain: 'public' },
    { path: '/partner/:id', component: PartnerDetail, layout: 'default', subdomain: 'public' },
    { path: '/settings', component: Settings, requireAuth: true, layout: 'default', subdomain: 'public' },
    { path: '*', component: NotFound, layout: 'default' }
  ]
});

export const mainRoutes = RouteRegistry.getRoutesByCategory('main');
