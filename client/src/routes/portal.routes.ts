import { lazy } from 'react';
import { RouteRegistry } from './RouteRegistry';

const MainDashboard = lazy(() => import('@/pages/dashboard/MainDashboard'));
const UserProfile = lazy(() => import('@/pages/profile/UserProfile'));
const TrackingDashboard = lazy(() => import('@/pages/dashboard/TrackingDashboard'));
const PerformanceDashboard = lazy(() => import('@/pages/dashboard/PerformanceDashboard'));
const ReportsDashboard = lazy(() => import('@/pages/dashboard/reports-dashboard'));
const Settings = lazy(() => import('@/pages/general/Settings'));

RouteRegistry.registerCategory({
  name: 'portal',
  order: 3,
  routes: [
    { 
      path: '/dashboard', 
      component: MainDashboard, 
      requireAuth: true, 
      layout: 'portal',
      subdomain: 'public',
      title: 'Dashboard'
    },
    { 
      path: '/profile', 
      component: UserProfile, 
      requireAuth: true, 
      layout: 'portal',
      subdomain: 'public',
      title: 'My Profile'
    },
    { 
      path: '/tracking', 
      component: TrackingDashboard, 
      requireAuth: true, 
      layout: 'portal',
      subdomain: 'public',
      title: 'Tracking Dashboard'
    },
    { 
      path: '/performance', 
      component: PerformanceDashboard, 
      requireAuth: true, 
      layout: 'portal',
      subdomain: 'public',
      title: 'Performance Dashboard'
    },
    { 
      path: '/reports', 
      component: ReportsDashboard, 
      requireAuth: true, 
      layout: 'portal',
      subdomain: 'public',
      title: 'Reports Dashboard'
    },
    { 
      path: '/settings', 
      component: Settings, 
      requireAuth: true, 
      layout: 'portal',
      subdomain: 'public',
      title: 'Settings'
    }
  ]
});

export const portalRoutes = RouteRegistry.getRoutesByCategory('portal');
