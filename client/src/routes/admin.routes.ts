/**
 * Admin Routes - Administration Panel Module
 * 
 * @description Frontend route definitions for the admin subdomain (admin.molochain.com)
 * @backend server/routes/admin/, server/registrars/admin.registrar.ts
 * 
 * Key Page-to-API Mappings (verified December 24, 2025):
 * - UserManagement → GET/POST /api/admin/users, GET /api/admin/users/stats
 * - SecuritySettings → GET/PUT /api/admin/security/settings, GET /api/admin/security/stats
 * - CommunicationsHub → GET/POST /api/admin/email/*, GET /api/admin/submissions/*
 * - PageModuleManager → GET/POST /api/admin/page-modules
 * - TrackingProviders → GET /api/admin/tracking-providers
 * - HealthMonitoringDashboard → GET /api/health/detailed
 * 
 * Note: Many admin pages use shared components that aggregate data from multiple APIs.
 * Control center pages are primarily navigation/UI without direct API calls.
 * 
 * Layout: AdminLayout (sidebar + header)
 * Auth: All routes require admin role except landing page
 */
import { lazy } from 'react';
import { RouteRegistry } from './RouteRegistry';
import { getRouteConfigs } from '@/config/adminPageRegistry';

// Public admin landing page (no authentication required)
const AdminLandingPage = lazy(() => import('@/pages/admin/AdminLandingPage'));

// Get all admin route configurations from the centralized registry
const adminRouteConfigs = getRouteConfigs();

// Register admin routes with RouteRegistry
RouteRegistry.registerCategory({
  name: 'admin',
  order: 5,
  routes: [
    // Public admin landing page (shown at "/" on admin subdomain)
    {
      path: '/',
      component: AdminLandingPage,
      exact: true,
      requireAuth: false,
      requireAdmin: false,
      layout: 'admin-public',
      title: 'Admin Portal',
      subdomain: 'admin'
    },
    // All authenticated admin routes from the registry
    ...adminRouteConfigs
  ]
});

export const adminRoutes = RouteRegistry.getRoutesByCategory('admin');
