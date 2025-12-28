/**
 * MoloChain Client Module Index
 * Central registry for all client-side modules and components
 * Updated: December 27, 2025 - Cleaned stale references after page cleanup
 */

// Core Application
export { default as App } from './App';

// Pages - Organized by Feature (only existing pages)
export const Pages = {
  // Authentication
  auth: {
    Login: () => import('./pages/auth/Login'),
    Register: () => import('./pages/auth/Register'),
    RequestPasswordReset: () => import('./pages/auth/RequestPasswordReset'),
    ResetPassword: () => import('./pages/auth/ResetPassword')
  },
  
  // Dashboard
  dashboard: {
    Main: () => import('./pages/dashboard/MainDashboard'),
    Tracking: () => import('./pages/dashboard/TrackingDashboard'),
    Performance: () => import('./pages/dashboard/PerformanceDashboard'),
    Reports: () => import('./pages/dashboard/reports-dashboard')
  },
  
  // Admin
  admin: {
    Landing: () => import('./pages/admin/AdminLandingPage'),
    SystemDashboard: () => import('./pages/admin/dashboards/SystemDashboard'),
    PerformanceMonitor: () => import('./pages/admin/dashboards/PerformanceMonitor'),
    HealthMonitoring: () => import('./pages/admin/dashboards/HealthMonitoringDashboard'),
    WebSocketHealth: () => import('./pages/admin/dashboards/WebSocketHealth'),
    UserManagement: () => import('./pages/admin/management/UserManagement'),
    PageModuleManager: () => import('./pages/admin/management/PageModuleManager')
  },
  
  // Services
  services: {
    Catalog: () => import('./pages/services/Services'),
    Hub: () => import('./pages/services/ServicesHub'),
    Page: () => import('./pages/services/ServicePage'),
    Recommender: () => import('./pages/services/ServiceRecommender'),
    Management: () => import('./pages/services/ServiceManagement')
  },
  
  // General
  general: {
    Home: () => import('./pages/general/Home'),
    About: () => import('./pages/general/About'),
    Contact: () => import('./pages/general/Contact'),
    Ecosystem: () => import('./pages/general/Ecosystem'),
    Settings: () => import('./pages/general/Settings'),
    Partners: () => import('./pages/general/Partners'),
    Privacy: () => import('./pages/general/privacy-policy'),
    Terms: () => import('./pages/general/terms-of-service')
  },
  
  // Developer
  developer: {
    Portal: () => import('./pages/developer/DeveloperPortal'),
    Workspace: () => import('./pages/developer/DeveloperWorkspace'),
    Department: () => import('./pages/developer/DeveloperDepartment'),
    APIPolicies: () => import('./pages/developer/APIPolicies'),
    AuthGuide: () => import('./pages/developer/AuthenticationGuide'),
    DatabaseExplorer: () => import('./pages/developer/DatabaseSchemaExplorer'),
    WebSocketGuide: () => import('./pages/developer/WebSocketGuide')
  },
  
  // Profile
  profile: {
    User: () => import('./pages/profile/UserProfile'),
    Admin: () => import('./pages/profile/AdminProfile')
  },
  
  // Brandbook
  brandbook: {
    Home: () => import('./pages/brandbook/BrandbookHome')
  }
};

// Component Registry
export const Components = {
  // UI Components
  ui: {
    Button: () => import('./components/ui/button'),
    Card: () => import('./components/ui/card'),
    Dialog: () => import('./components/ui/dialog'),
    Form: () => import('./components/ui/form'),
    Input: () => import('./components/ui/input'),
    Select: () => import('./components/ui/select'),
    Table: () => import('./components/ui/table'),
    Tabs: () => import('./components/ui/tabs')
  },
  
  // Layout Components
  layout: {
    Navigation: () => import('./components/layout/Navigation'),
    Footer: () => import('./components/layout/Footer'),
    PortalLayout: () => import('./components/portal/PortalLayout')
  },
  
  // Admin Components
  admin: {
    Sidebar: () => import('./components/admin/AdminSidebar'),
    HealthWidget: () => import('./components/admin/HealthRecommendationsWidget'),
    PerformancePanel: () => import('./components/admin/SystemPerformancePanel'),
    TranslationPanel: () => import('./components/admin/TranslationSuggestionPanel')
  },
  
  // Dashboard Components
  dashboard: {
    WebSocketMonitor: () => import('./components/dashboard/WebSocketMonitor'),
    SystemMonitor: () => import('./components/dashboard/SystemMonitorWidget')
  },
  
  // Service Components
  services: {
    ServiceCatalog: () => import('./components/services/ServiceCatalog'),
    ServiceDetail: () => import('./components/services/ServiceDetailEnhanced'),
    ServiceSearch: () => import('./components/services/ServiceSearch'),
    ServiceBooking: () => import('./components/services/ServiceBookingForm')
  }
};

// Service Modules
export const Services = {
  api: () => import('./services/api'),
  auth: () => import('./services/auth'),
  websocket: () => import('./services/websocket'),
  collaboration: () => import('./services/collaborationService'),
  translation: () => import('./services/translationSuggestion')
};

// Hooks Registry
export const Hooks = {
  useAuth: () => import('./hooks/useAuth'),
  useWebSocket: () => import('./hooks/useWebSocket'),
  useAgentStatus: () => import('./hooks/useAgentStatus'),
  useToast: () => import('./hooks/use-toast')
};

// Context Providers
export const Contexts = {
  AuthContext: () => import('./contexts/AuthContext'),
  ThemeContext: () => import('./contexts/ThemeContext'),
  ProjectUpdateContext: () => import('./contexts/ProjectUpdateContext')
};

// Utility Functions
export const Utils = {
  animations: () => import('./lib/animations'),
  queryClient: () => import('./lib/queryClient'),
  utils: () => import('./lib/utils'),
  exportUtils: () => import('./utils/exportUtils')
};

// Routes Configuration (matches routeProtection.ts)
export const Routes = {
  public: [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/services',
    '/services/:serviceId',
    '/contact',
    '/about',
    '/terms',
    '/privacy',
    '/brandbook',
    '/partners',
    '/careers'
  ],
  authenticated: [
    '/dashboard',
    '/profile',
    '/settings',
    '/tracking',
    '/performance',
    '/reports',
    '/ecosystem',
    '/services-management',
    '/departments/*'
  ],
  admin: [
    '/admin/*',
    '/developer/*',
    '/guides/*'
  ]
};

// Module Configuration
export const ClientModules = {
  app: {
    name: 'MoloChain Client',
    version: '2.1.0',
    framework: 'React 18',
    bundler: 'Vite',
    styling: 'Tailwind CSS'
  },
  
  features: {
    services: true,
    analytics: true,
    realtime: true,
    departments: true,
    cms: true
  },
  
  optimization: {
    codeSplitting: true,
    lazyLoading: true,
    caching: true,
    compression: true
  },
  
  ui: {
    darkMode: true,
    responsive: true,
    animations: true,
    microInteractions: true
  }
};

// Export main client configuration
export default {
  pages: Pages,
  components: Components,
  services: Services,
  hooks: Hooks,
  contexts: Contexts,
  utils: Utils,
  routes: Routes,
  config: ClientModules
};
