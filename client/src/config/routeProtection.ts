/**
 * Route Protection Configuration
 * Consolidated documentation of all routes and their access levels
 * Updated: December 27, 2025 - Page cleanup: removed AI, Google Drive, API Keys, Supply Chain Heatmap
 * 
 * Access Levels:
 * - PUBLIC: No authentication required
 * - AUTH_REQUIRED: User must be logged in
 * - ADMIN_REQUIRED: User must be logged in with admin role
 */

export type AccessLevel = 'PUBLIC' | 'AUTH_REQUIRED' | 'ADMIN_REQUIRED';

export interface RouteProtection {
  path: string;
  accessLevel: AccessLevel;
  description: string;
  category: string;
}

// Comprehensive route protection map - matches actual route files
export const routeProtectionConfig: RouteProtection[] = [
  // ========== PUBLIC ROUTES ==========
  // Main/General (from main.routes.ts)
  { path: '/', accessLevel: 'PUBLIC', description: 'Home page', category: 'main' },
  { path: '/about', accessLevel: 'PUBLIC', description: 'About page', category: 'main' },
  { path: '/contact', accessLevel: 'PUBLIC', description: 'Contact page', category: 'main' },
  { path: '/success', accessLevel: 'PUBLIC', description: 'Form success page', category: 'main' },
  { path: '/careers', accessLevel: 'PUBLIC', description: 'Careers page', category: 'main' },
  { path: '/projects/:id', accessLevel: 'PUBLIC', description: 'Project details', category: 'main' },
  { path: '/partners', accessLevel: 'PUBLIC', description: 'Partners page', category: 'main' },
  { path: '/partner/:id', accessLevel: 'PUBLIC', description: 'Partner details', category: 'main' },
  
  // Services (from services.routes.ts)
  { path: '/services', accessLevel: 'PUBLIC', description: 'Services listing', category: 'services' },
  { path: '/services-hub', accessLevel: 'PUBLIC', description: 'Services hub', category: 'services' },
  { path: '/service-recommender', accessLevel: 'PUBLIC', description: 'Service recommender', category: 'services' },
  { path: '/services/:serviceId', accessLevel: 'PUBLIC', description: 'Service details', category: 'services' },
  
  // Auth (from auth.routes.ts)
  { path: '/login', accessLevel: 'PUBLIC', description: 'Login page', category: 'auth' },
  { path: '/auth/login', accessLevel: 'PUBLIC', description: 'Auth login redirect', category: 'auth' },
  { path: '/register', accessLevel: 'PUBLIC', description: 'Registration page', category: 'auth' },
  { path: '/forgot-password', accessLevel: 'PUBLIC', description: 'Password reset request', category: 'auth' },
  { path: '/reset-password', accessLevel: 'PUBLIC', description: 'Password reset', category: 'auth' },
  
  // Brandbook (from brandbook.routes.ts)
  { path: '/brandbook', accessLevel: 'PUBLIC', description: 'Brand guidelines', category: 'brandbook' },
  
  // Ecosystem - Public (from ecosystem.routes.ts)
  { path: '/terms', accessLevel: 'PUBLIC', description: 'Terms of service', category: 'ecosystem' },
  { path: '/privacy', accessLevel: 'PUBLIC', description: 'Privacy policy', category: 'ecosystem' },
  
  // ========== AUTH_REQUIRED ROUTES ==========
  // Main - Protected
  { path: '/settings', accessLevel: 'AUTH_REQUIRED', description: 'User settings', category: 'main' },
  
  // Portal (from portal.routes.ts)
  { path: '/dashboard', accessLevel: 'AUTH_REQUIRED', description: 'Main dashboard', category: 'portal' },
  { path: '/profile', accessLevel: 'AUTH_REQUIRED', description: 'User profile', category: 'portal' },
  { path: '/tracking', accessLevel: 'AUTH_REQUIRED', description: 'Tracking dashboard', category: 'portal' },
  { path: '/performance', accessLevel: 'AUTH_REQUIRED', description: 'Performance dashboard', category: 'portal' },
  { path: '/reports', accessLevel: 'AUTH_REQUIRED', description: 'Reports dashboard (API pending)', category: 'portal' },
  
  // Services - Protected
  { path: '/services-management', accessLevel: 'AUTH_REQUIRED', description: 'Service management', category: 'services' },
  
  // Ecosystem - Protected (from ecosystem.routes.ts)
  { path: '/ecosystem', accessLevel: 'AUTH_REQUIRED', description: 'Ecosystem overview', category: 'ecosystem' },
  
  // Departments (from departments.routes.ts - all require auth)
  { path: '/departments/accounting', accessLevel: 'AUTH_REQUIRED', description: 'Accounting dept', category: 'departments' },
  { path: '/departments/human-resources', accessLevel: 'AUTH_REQUIRED', description: 'HR dept', category: 'departments' },
  { path: '/departments/operations', accessLevel: 'AUTH_REQUIRED', description: 'Operations dept', category: 'departments' },
  { path: '/departments/supply-chain', accessLevel: 'AUTH_REQUIRED', description: 'Supply chain dept', category: 'departments' },
  { path: '/departments/technology-engineering', accessLevel: 'AUTH_REQUIRED', description: 'Tech dept', category: 'departments' },
  { path: '/departments/marketing-branding', accessLevel: 'AUTH_REQUIRED', description: 'Marketing dept', category: 'departments' },
  { path: '/departments/legal-risk', accessLevel: 'AUTH_REQUIRED', description: 'Legal dept', category: 'departments' },
  { path: '/departments/management', accessLevel: 'AUTH_REQUIRED', description: 'Management dept', category: 'departments' },
  { path: '/departments/strategy-development', accessLevel: 'AUTH_REQUIRED', description: 'Strategy dept', category: 'departments' },
  { path: '/departments/network-partners', accessLevel: 'AUTH_REQUIRED', description: 'Network partners', category: 'departments' },
  { path: '/departments/learning-knowledge', accessLevel: 'AUTH_REQUIRED', description: 'Learning dept', category: 'departments' },
  { path: '/departments/documents-library', accessLevel: 'AUTH_REQUIRED', description: 'Documents library', category: 'departments' },
  { path: '/departments/god-layer', accessLevel: 'AUTH_REQUIRED', description: 'God layer dept', category: 'departments' },
  { path: '/departments/rayanavabrain', accessLevel: 'AUTH_REQUIRED', description: 'Rayanava brain', category: 'departments' },
  
  // ========== ADMIN_REQUIRED ROUTES ==========
  // Admin Panel - Command Center
  { path: '/admin', accessLevel: 'ADMIN_REQUIRED', description: 'System dashboard', category: 'admin' },
  { path: '/admin/page-modules', accessLevel: 'ADMIN_REQUIRED', description: 'Page module manager', category: 'admin' },
  
  // Admin - Infrastructure
  { path: '/admin/performance', accessLevel: 'ADMIN_REQUIRED', description: 'Performance monitor', category: 'admin' },
  { path: '/admin/health', accessLevel: 'ADMIN_REQUIRED', description: 'Health monitoring', category: 'admin' },
  { path: '/admin/websocket-health', accessLevel: 'ADMIN_REQUIRED', description: 'WebSocket monitor', category: 'admin' },
  
  // Admin - Security & Access
  { path: '/admin/users', accessLevel: 'ADMIN_REQUIRED', description: 'User management', category: 'admin' },
  { path: '/admin/identity', accessLevel: 'ADMIN_REQUIRED', description: 'Identity security', category: 'admin' },
  { path: '/admin/security-settings', accessLevel: 'ADMIN_REQUIRED', description: 'Security settings', category: 'admin' },
  { path: '/admin/activity-dashboard', accessLevel: 'ADMIN_REQUIRED', description: 'Activity dashboard', category: 'admin' },
  
  // Admin - Operations
  { path: '/admin/activity', accessLevel: 'ADMIN_REQUIRED', description: 'Activity monitor', category: 'admin' },
  { path: '/admin/tracking-providers', accessLevel: 'ADMIN_REQUIRED', description: 'Tracking providers', category: 'admin' },
  { path: '/admin/communications', accessLevel: 'ADMIN_REQUIRED', description: 'Communications hub', category: 'admin' },
  
  // Admin - Integration
  { path: '/admin/mololink', accessLevel: 'ADMIN_REQUIRED', description: 'Mololink marketplace', category: 'admin' },
  
  // Admin - Intelligence
  { path: '/admin/translation-suggestions', accessLevel: 'ADMIN_REQUIRED', description: 'Translation suggestions', category: 'admin' },
  
  // Admin - Configuration
  { path: '/admin/settings', accessLevel: 'ADMIN_REQUIRED', description: 'Admin settings', category: 'admin' },
  { path: '/admin/storage', accessLevel: 'ADMIN_REQUIRED', description: 'Storage settings', category: 'admin' },
  { path: '/admin/profile', accessLevel: 'ADMIN_REQUIRED', description: 'Admin profile', category: 'admin' },
  
  // Admin - Content
  { path: '/admin/content', accessLevel: 'ADMIN_REQUIRED', description: 'Content manager', category: 'admin' },
  { path: '/admin/content/about', accessLevel: 'ADMIN_REQUIRED', description: 'About editor', category: 'admin' },
  { path: '/admin/content/services', accessLevel: 'ADMIN_REQUIRED', description: 'Services editor', category: 'admin' },
  { path: '/admin/content/branding', accessLevel: 'ADMIN_REQUIRED', description: 'Branding editor', category: 'admin' },
  
  // Admin - Developer (secured documentation)
  { path: '/admin/developer', accessLevel: 'ADMIN_REQUIRED', description: 'Developer portal', category: 'admin' },
  { path: '/admin/developer/workspace', accessLevel: 'ADMIN_REQUIRED', description: 'Developer workspace', category: 'admin' },
  { path: '/admin/developer/department', accessLevel: 'ADMIN_REQUIRED', description: 'Developer department', category: 'admin' },
  { path: '/admin/developer/api-policies', accessLevel: 'ADMIN_REQUIRED', description: 'API policies', category: 'admin' },
  { path: '/admin/developer/auth-guide', accessLevel: 'ADMIN_REQUIRED', description: 'Authentication guide', category: 'admin' },
  { path: '/admin/developer/database-schema', accessLevel: 'ADMIN_REQUIRED', description: 'Database schema', category: 'admin' },
  { path: '/admin/developer/websocket-guide', accessLevel: 'ADMIN_REQUIRED', description: 'WebSocket guide', category: 'admin' },
  
  // Admin - Guides (secured documentation)
  { path: '/admin/guides', accessLevel: 'ADMIN_REQUIRED', description: 'Guides', category: 'admin' },
  { path: '/admin/guides/:id', accessLevel: 'ADMIN_REQUIRED', description: 'Guide detail', category: 'admin' },
];

// Helper functions
export function getRoutesByAccessLevel(level: AccessLevel): RouteProtection[] {
  return routeProtectionConfig.filter(route => route.accessLevel === level);
}

export function getPublicRoutes(): RouteProtection[] {
  return getRoutesByAccessLevel('PUBLIC');
}

export function getProtectedRoutes(): RouteProtection[] {
  return [...getRoutesByAccessLevel('AUTH_REQUIRED'), ...getRoutesByAccessLevel('ADMIN_REQUIRED')];
}

export function getAdminRoutes(): RouteProtection[] {
  return getRoutesByAccessLevel('ADMIN_REQUIRED');
}

export function getRouteProtection(path: string): RouteProtection | undefined {
  return routeProtectionConfig.find(route => route.path === path);
}

export function isPublicRoute(path: string): boolean {
  const route = getRouteProtection(path);
  return route?.accessLevel === 'PUBLIC';
}

export function isProtectedRoute(path: string): boolean {
  const route = getRouteProtection(path);
  return route?.accessLevel === 'AUTH_REQUIRED' || route?.accessLevel === 'ADMIN_REQUIRED';
}

export function isAdminRoute(path: string): boolean {
  const route = getRouteProtection(path);
  return route?.accessLevel === 'ADMIN_REQUIRED';
}

// Route protection summary
export function getRouteProtectionSummary() {
  const publicRoutes = getPublicRoutes();
  const authRoutes = getRoutesByAccessLevel('AUTH_REQUIRED');
  const adminRoutes = getAdminRoutes();
  
  return {
    total: routeProtectionConfig.length,
    public: publicRoutes.length,
    authRequired: authRoutes.length,
    adminRequired: adminRoutes.length,
    byCategory: {
      main: routeProtectionConfig.filter(r => r.category === 'main').length,
      services: routeProtectionConfig.filter(r => r.category === 'services').length,
      auth: routeProtectionConfig.filter(r => r.category === 'auth').length,
      brandbook: routeProtectionConfig.filter(r => r.category === 'brandbook').length,
      portal: routeProtectionConfig.filter(r => r.category === 'portal').length,
      ecosystem: routeProtectionConfig.filter(r => r.category === 'ecosystem').length,
      departments: routeProtectionConfig.filter(r => r.category === 'departments').length,
      admin: routeProtectionConfig.filter(r => r.category === 'admin').length,
    }
  };
}
