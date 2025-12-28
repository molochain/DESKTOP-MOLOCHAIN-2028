/**
 * Mololink Routes - Professional Network & Marketplace Module
 * 
 * @description Frontend route definitions for the Mololink subdomain (mololink.molochain.com)
 * @backend server/routes/mololink.ts - API endpoints at /api/mololink/*
 * @registrar server/registrars/ecosystem.registrar.ts
 * 
 * Route-to-API Mapping (verified December 24, 2025):
 * - /mololink/companies → GET /api/mololink/companies
 * - /mololink/company/:id → GET /api/mololink/companies/:id
 * - /mololink/marketplace → GET /api/mololink/marketplace/listings, /marketplace/auctions
 * - /mololink/profile → GET/PUT /api/mololink/profile (auth required)
 * - /mololink/search → GET /api/mololink/search
 * - /mololink/network → GET /api/mololink/connections (auth required)
 * 
 * Note: Some pages (/mololink/jobs, /mololink/solutions, /mololink/resources, 
 * /mololink/pricing) are static content without API dependencies.
 */
import { lazy } from 'react';
import { RouteRegistry } from './RouteRegistry';

const MololinkMain = lazy(() => import('@/modules/mololink/MololinkMain'));
const MololinkHome = lazy(() => import('@/modules/mololink/pages/home'));
const MololinkMarketplace = lazy(() => import('@/modules/mololink/pages/marketplace'));
const MololinkCompanies = lazy(() => import('@/modules/mololink/pages/companies'));
const MololinkCompanyProfile = lazy(() => import('@/modules/mololink/pages/company-profile'));
const MololinkJobs = lazy(() => import('@/modules/mololink/pages/jobs'));
const MololinkNetwork = lazy(() => import('@/modules/mololink/pages/network'));
const MololinkMessaging = lazy(() => import('@/modules/mololink/pages/messaging'));
const MololinkProfile = lazy(() => import('@/modules/mololink/pages/profile'));
const MololinkExplorer = lazy(() => import('@/modules/mololink/pages/explorer'));
const MololinkSearch = lazy(() => import('@/modules/mololink/pages/search'));
const MololinkNotifications = lazy(() => import('@/modules/mololink/pages/notifications'));
const MololinkSolutions = lazy(() => import('@/modules/mololink/pages/solutions'));
const MololinkResources = lazy(() => import('@/modules/mololink/pages/resources'));
const MololinkPricing = lazy(() => import('@/modules/mololink/pages/pricing'));

RouteRegistry.registerCategory({
  name: 'mololink',
  order: 7,
  routes: [
    { path: '/mololink', component: MololinkMain, layout: 'default' },
    { path: '/mololink/home', component: MololinkHome, requireAuth: true, layout: 'default' },
    { path: '/mololink/marketplace', component: MololinkMarketplace, requireAuth: true, layout: 'default' },
    { path: '/mololink/companies', component: MololinkCompanies, layout: 'default' },
    { path: '/mololink/company/:id', component: MololinkCompanyProfile, layout: 'default' },
    { path: '/mololink/jobs', component: MololinkJobs, layout: 'default' },
    { path: '/mololink/network', component: MololinkNetwork, requireAuth: true, layout: 'default' },
    { path: '/mololink/messaging', component: MololinkMessaging, requireAuth: true, layout: 'default' },
    { path: '/mololink/profile', component: MololinkProfile, requireAuth: true, layout: 'default' },
    { path: '/mololink/explorer', component: MololinkExplorer, requireAuth: true, layout: 'default' },
    { path: '/mololink/search', component: MololinkSearch, layout: 'default' },
    { path: '/mololink/notifications', component: MololinkNotifications, requireAuth: true, layout: 'default' },
    { path: '/solutions', component: MololinkSolutions, layout: 'default', subdomain: 'mololink' },
    { path: '/resources', component: MololinkResources, layout: 'default', subdomain: 'mololink' },
    { path: '/pricing', component: MololinkPricing, layout: 'default', subdomain: 'mololink' }
  ]
});

export const mololinkRoutes = RouteRegistry.getRoutesByCategory('mololink');
