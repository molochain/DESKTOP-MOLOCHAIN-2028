/**
 * Centralized Admin Page Registry
 * Single source of truth for all admin pages, routes, navigation, and relationships
 * Updated: December 27, 2025 - Removed unused control center pages
 */

import { lazy, LazyExoticComponent, ComponentType } from 'react';
import {
  Activity as ActivityIcon, Shield, Users, Settings, BarChart3,
  Database, Globe, Key, Monitor, Cloud,
  Building2, TrendingUp, Brain, Lock,
  Home, Server, User, MessageSquare, Store, Code, BookOpen
} from 'lucide-react';
import type { Permission } from '@shared/permissions';
import { PERMISSIONS } from '@shared/permissions';

export type AdminPageCategory = 
  | 'command-center'
  | 'infrastructure' 
  | 'security-access'
  | 'operations'
  | 'integration'
  | 'intelligence'
  | 'configuration'
  | 'content'
  | 'developer'
  | 'guides';

export interface AdminPageConfig {
  id: string;
  name: string;
  description: string;
  path: string;
  component: LazyExoticComponent<ComponentType<any>>;
  icon: any;
  category: AdminPageCategory;
  parentId?: string;
  badge?: 'PRIMARY' | 'NEW' | 'BETA' | 'CRITICAL';
  requireAuth: boolean;
  requireAdmin: boolean;
  requiredPermission?: Permission | Permission[];
  order: number;
  enabled: boolean;
}

export interface AdminCategoryConfig {
  id: AdminPageCategory;
  name: string;
  description: string;
  icon: any;
  color: string;
  order: number;
  defaultExpanded?: boolean;
}

// Category definitions
export const adminCategories: AdminCategoryConfig[] = [
  {
    id: 'command-center',
    name: 'Command Center',
    description: 'Main control dashboards and system overview',
    icon: Home,
    color: 'blue',
    order: 1,
    defaultExpanded: true
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    description: 'System health, monitoring, and performance management',
    icon: Server,
    color: 'cyan',
    order: 2,
    defaultExpanded: false
  },
  {
    id: 'security-access',
    name: 'Security & Access',
    description: 'User management, authentication, and security controls',
    icon: Shield,
    color: 'red',
    order: 3
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Business operations, departments, and workflows',
    icon: Building2,
    color: 'green',
    order: 4
  },
  {
    id: 'integration',
    name: 'Integration',
    description: 'External services and marketplace',
    icon: Store,
    color: 'purple',
    order: 5
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    description: 'Data insights and AI-powered analytics',
    icon: Brain,
    color: 'indigo',
    order: 6
  },
  {
    id: 'configuration',
    name: 'Configuration',
    description: 'System settings and platform configuration',
    icon: Settings,
    color: 'gray',
    order: 7
  },
  {
    id: 'content',
    name: 'Content',
    description: 'Website content and branding management',
    icon: Database,
    color: 'amber',
    order: 8
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'API documentation and developer tools',
    icon: Code,
    color: 'emerald',
    order: 9
  },
  {
    id: 'guides',
    name: 'Guides',
    description: 'Documentation and tutorials',
    icon: BookOpen,
    color: 'violet',
    order: 10
  }
];

// Lazy loaded components - only existing pages
const SystemDashboard = lazy(() => import('@/pages/admin/dashboards/SystemDashboard'));
const PageModuleManager = lazy(() => import('@/pages/admin/management/PageModuleManager'));
const UserManagement = lazy(() => import('@/pages/admin/management/UserManagement'));
const IdentitySecurityDashboard = lazy(() => import('@/pages/admin/security/IdentitySecurityDashboard'));
const Activity = lazy(() => import('@/pages/admin/operations/Activity'));
const WebSocketHealth = lazy(() => import('@/pages/admin/dashboards/WebSocketHealth'));
const SecuritySettings = lazy(() => import('@/pages/admin/security/SecuritySettings'));
const AdminActivityDashboard = lazy(() => import('@/pages/admin/security/AdminActivityDashboard'));
const PerformanceMonitor = lazy(() => import('@/pages/admin/dashboards/PerformanceMonitor'));
const HealthMonitoringDashboard = lazy(() => import('@/pages/admin/dashboards/HealthMonitoringDashboard'));
const ContentManager = lazy(() => import('@/pages/admin/content/ContentManager'));
const AboutEditor = lazy(() => import('@/pages/admin/content/AboutEditor'));
const ServicesEditor = lazy(() => import('@/pages/admin/content/ServicesEditor'));
const BrandingEditor = lazy(() => import('@/pages/admin/content/BrandingEditor'));
const AdminSettings = lazy(() => import('@/pages/admin/settings/AdminSettings'));
const StorageSettings = lazy(() => import('@/pages/admin/settings/StorageSettings'));
const TrackingProviders = lazy(() => import('@/pages/admin/operations/TrackingProviders'));
const TranslationSuggestions = lazy(() => import('@/pages/admin/intelligence/translation-suggestions'));
const AdminProfile = lazy(() => import('@/pages/profile/AdminProfile'));
const CommunicationsHub = lazy(() => import('@/pages/admin/operations/CommunicationsHub'));
const MololinkAdmin = lazy(() => import('@/modules/mololink/MololinkMain'));

// Developer pages
const DeveloperPortal = lazy(() => import('@/pages/developer/DeveloperPortal'));
const DeveloperWorkspace = lazy(() => import('@/pages/developer/DeveloperWorkspace'));
const DeveloperDepartment = lazy(() => import('@/pages/developer/DeveloperDepartment'));
const APIPolicies = lazy(() => import('@/pages/developer/APIPolicies'));
const AuthenticationGuide = lazy(() => import('@/pages/developer/AuthenticationGuide'));
const DatabaseSchemaExplorer = lazy(() => import('@/pages/developer/DatabaseSchemaExplorer'));
const WebSocketGuide = lazy(() => import('@/pages/developer/WebSocketGuide'));

// Guides pages
const GuidesPage = lazy(() => import('@/pages/guides/index'));
const GuideDetailPage = lazy(() => import('@/pages/guides/[id]'));

// All admin pages configuration - only functional pages with real backend
export const adminPages: AdminPageConfig[] = [
  // Command Center
  {
    id: 'system-dashboard',
    name: 'System Dashboard',
    description: 'Main admin control panel with system overview',
    path: '/admin',
    component: SystemDashboard,
    icon: Home,
    category: 'command-center',
    badge: 'PRIMARY',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.DASHBOARD_ACCESS,
    order: 1,
    enabled: true
  },
  {
    id: 'page-modules',
    name: 'Page Module Manager',
    description: 'Manage page modules and components',
    path: '/admin/page-modules',
    component: PageModuleManager,
    icon: Monitor,
    category: 'command-center',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.SETTINGS_MANAGE,
    order: 2,
    enabled: true
  },

  // Infrastructure
  {
    id: 'performance',
    name: 'Performance Monitor',
    description: 'Memory, CPU, and resource optimization',
    path: '/admin/performance',
    component: PerformanceMonitor,
    icon: TrendingUp,
    category: 'infrastructure',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.INFRASTRUCTURE_VIEW,
    order: 1,
    enabled: true
  },
  {
    id: 'health',
    name: 'Health Monitoring',
    description: 'System health checks and diagnostics',
    path: '/admin/health',
    component: HealthMonitoringDashboard,
    icon: ActivityIcon,
    category: 'infrastructure',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.INFRASTRUCTURE_VIEW,
    order: 2,
    enabled: true
  },
  {
    id: 'websocket-health',
    name: 'WebSocket Monitor',
    description: 'Real-time connection monitoring',
    path: '/admin/websocket-health',
    component: WebSocketHealth,
    icon: Cloud,
    category: 'infrastructure',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.INFRASTRUCTURE_VIEW,
    order: 3,
    enabled: true
  },

  // Security & Access
  {
    id: 'user-management',
    name: 'User Management',
    description: 'Manage users, roles, and permissions',
    path: '/admin/users',
    component: UserManagement,
    icon: Users,
    category: 'security-access',
    badge: 'PRIMARY',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: [PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE],
    order: 1,
    enabled: true
  },
  {
    id: 'identity-security',
    name: 'Identity Security',
    description: 'Identity and access management',
    path: '/admin/identity',
    component: IdentitySecurityDashboard,
    icon: Key,
    category: 'security-access',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.SECURITY_VIEW,
    order: 2,
    enabled: true
  },
  {
    id: 'security-settings',
    name: 'Security Settings',
    description: 'Security configuration and policies',
    path: '/admin/security-settings',
    component: SecuritySettings,
    icon: Lock,
    category: 'security-access',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.SECURITY_EDIT,
    order: 3,
    enabled: true
  },
  {
    id: 'admin-activity-dashboard',
    name: 'Activity Dashboard',
    description: 'View all admin actions and audit logs',
    path: '/admin/activity-dashboard',
    component: AdminActivityDashboard,
    icon: ActivityIcon,
    category: 'security-access',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.AUDIT_VIEW,
    order: 4,
    enabled: true
  },

  // Operations
  {
    id: 'activity',
    name: 'Activity Monitor',
    description: 'System and user activity tracking',
    path: '/admin/activity',
    component: Activity,
    icon: ActivityIcon,
    category: 'operations',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.OPERATIONS_VIEW,
    order: 1,
    enabled: true
  },
  {
    id: 'tracking-providers',
    name: 'Tracking Providers',
    description: 'Shipping carrier integrations',
    path: '/admin/tracking-providers',
    component: TrackingProviders,
    icon: Globe,
    category: 'operations',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.OPERATIONS_EDIT,
    order: 2,
    enabled: true
  },
  {
    id: 'communications-hub',
    name: 'Communications Hub',
    description: 'Manage form submissions and email settings',
    path: '/admin/communications',
    component: CommunicationsHub,
    icon: MessageSquare,
    category: 'operations',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.OPERATIONS_MANAGE,
    order: 3,
    enabled: true
  },

  // Integration
  {
    id: 'mololink-admin',
    name: 'MOLOLINK Marketplace',
    description: 'Internal marketplace and business network',
    path: '/admin/mololink',
    component: MololinkAdmin,
    icon: Store,
    category: 'integration',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.INTEGRATIONS_VIEW,
    order: 1,
    enabled: true
  },

  // Intelligence
  {
    id: 'translation-suggestions',
    name: 'Translation Suggestions',
    description: 'AI-powered translation recommendations',
    path: '/admin/translation-suggestions',
    component: TranslationSuggestions,
    icon: Brain,
    category: 'intelligence',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.INTELLIGENCE_VIEW,
    order: 1,
    enabled: true
  },

  // Configuration
  {
    id: 'admin-settings',
    name: 'Admin Settings',
    description: 'Administrative settings and preferences',
    path: '/admin/settings',
    component: AdminSettings,
    icon: Settings,
    category: 'configuration',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.SETTINGS_EDIT,
    order: 1,
    enabled: true
  },
  {
    id: 'storage-settings',
    name: 'Storage Settings',
    description: 'Storage configuration and management',
    path: '/admin/storage',
    component: StorageSettings,
    icon: Database,
    category: 'configuration',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.SETTINGS_EDIT,
    order: 2,
    enabled: true
  },
  {
    id: 'admin-profile',
    name: 'Admin Profile',
    description: 'Administrator profile and settings',
    path: '/admin/profile',
    component: AdminProfile,
    icon: User,
    category: 'configuration',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.DASHBOARD_ACCESS,
    order: 99,
    enabled: true
  },

  // Content
  {
    id: 'content-manager',
    name: 'Content Manager',
    description: 'Website content management',
    path: '/admin/content',
    component: ContentManager,
    icon: Database,
    category: 'content',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.CONTENT_VIEW,
    order: 1,
    enabled: true
  },
  {
    id: 'about-editor',
    name: 'About Editor',
    description: 'Edit about page content',
    path: '/admin/content/about',
    component: AboutEditor,
    icon: Database,
    category: 'content',
    parentId: 'content-manager',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.CONTENT_EDIT,
    order: 10,
    enabled: true
  },
  {
    id: 'services-editor',
    name: 'Services Editor',
    description: 'Edit services page content',
    path: '/admin/content/services',
    component: ServicesEditor,
    icon: Database,
    category: 'content',
    parentId: 'content-manager',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.CONTENT_EDIT,
    order: 11,
    enabled: true
  },
  {
    id: 'branding-editor',
    name: 'Branding Editor',
    description: 'Edit branding and visual identity',
    path: '/admin/content/branding',
    component: BrandingEditor,
    icon: Database,
    category: 'content',
    parentId: 'content-manager',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.CONTENT_EDIT,
    order: 12,
    enabled: true
  },

  // Developer
  {
    id: 'developer-portal',
    name: 'Developer Portal',
    description: 'Main developer hub and documentation',
    path: '/admin/developer',
    component: DeveloperPortal,
    icon: Code,
    category: 'developer',
    badge: 'PRIMARY',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.DASHBOARD_ACCESS,
    order: 1,
    enabled: true
  },
  {
    id: 'developer-workspace',
    name: 'Developer Workspace',
    description: 'Development tools and testing',
    path: '/admin/developer/workspace',
    component: DeveloperWorkspace,
    icon: Code,
    category: 'developer',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.DASHBOARD_ACCESS,
    order: 2,
    enabled: true
  },
  {
    id: 'developer-department',
    name: 'Developer Department',
    description: 'Developer team dashboard',
    path: '/admin/developer/department',
    component: DeveloperDepartment,
    icon: Code,
    category: 'developer',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.DASHBOARD_ACCESS,
    order: 3,
    enabled: true
  },
  {
    id: 'api-policies',
    name: 'API Policies',
    description: 'API usage policies and documentation',
    path: '/admin/developer/api-policies',
    component: APIPolicies,
    icon: Code,
    category: 'developer',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.DASHBOARD_ACCESS,
    order: 4,
    enabled: true
  },
  {
    id: 'authentication-guide',
    name: 'Authentication Guide',
    description: 'Authentication integration documentation',
    path: '/admin/developer/auth-guide',
    component: AuthenticationGuide,
    icon: Code,
    category: 'developer',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.DASHBOARD_ACCESS,
    order: 5,
    enabled: true
  },
  {
    id: 'database-schema',
    name: 'Database Schema',
    description: 'Database schema explorer',
    path: '/admin/developer/database-schema',
    component: DatabaseSchemaExplorer,
    icon: Database,
    category: 'developer',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.DASHBOARD_ACCESS,
    order: 6,
    enabled: true
  },
  {
    id: 'websocket-guide',
    name: 'WebSocket Guide',
    description: 'WebSocket integration documentation',
    path: '/admin/developer/websocket-guide',
    component: WebSocketGuide,
    icon: Code,
    category: 'developer',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.DASHBOARD_ACCESS,
    order: 7,
    enabled: true
  },

  // Guides
  {
    id: 'guides',
    name: 'Guides',
    description: 'Documentation and tutorials',
    path: '/admin/guides',
    component: GuidesPage,
    icon: BookOpen,
    category: 'guides',
    badge: 'PRIMARY',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.CONTENT_VIEW,
    order: 1,
    enabled: true
  },
  {
    id: 'guide-detail',
    name: 'Guide Detail',
    description: 'Individual guide view',
    path: '/admin/guides/:id',
    component: GuideDetailPage,
    icon: BookOpen,
    category: 'guides',
    parentId: 'guides',
    requireAuth: true,
    requireAdmin: true,
    requiredPermission: PERMISSIONS.CONTENT_VIEW,
    order: 2,
    enabled: true
  }
];

// Helper functions
export function getPageById(id: string): AdminPageConfig | undefined {
  return adminPages.find(page => page.id === id);
}

export function getPageByPath(path: string): AdminPageConfig | undefined {
  return adminPages.find(page => page.path === path);
}

export function getPagesByCategory(category: AdminPageCategory): AdminPageConfig[] {
  return adminPages
    .filter(page => page.category === category && page.enabled)
    .sort((a, b) => a.order - b.order);
}

export function getCategoryById(id: AdminPageCategory): AdminCategoryConfig | undefined {
  return adminCategories.find(cat => cat.id === id);
}

export function getChildPages(parentId: string): AdminPageConfig[] {
  return adminPages
    .filter(page => page.parentId === parentId && page.enabled)
    .sort((a, b) => a.order - b.order);
}

export function getTopLevelPages(category: AdminPageCategory): AdminPageConfig[] {
  return adminPages
    .filter(page => page.category === category && !page.parentId && page.enabled)
    .sort((a, b) => a.order - b.order);
}

export function getAllEnabledPages(): AdminPageConfig[] {
  return adminPages.filter(page => page.enabled);
}

export function getAllRoutes(): { path: string; component: any; requireAuth: boolean; requireAdmin: boolean }[] {
  return adminPages
    .filter(page => page.enabled)
    .map(page => ({
      path: page.path,
      component: page.component,
      requireAuth: page.requireAuth,
      requireAdmin: page.requireAdmin
    }));
}

// Navigation structure generator
export function getNavigationGroups() {
  return adminCategories
    .sort((a, b) => a.order - b.order)
    .map(category => ({
      name: category.name,
      icon: category.icon,
      defaultExpanded: category.defaultExpanded,
      items: getTopLevelPages(category.id).map(page => ({
        name: page.name,
        path: page.path,
        icon: page.icon,
        badge: page.badge,
        requiredPermission: page.requiredPermission,
        children: getChildPages(page.id).map(child => ({
          name: child.name,
          path: child.path,
          icon: child.icon,
          badge: child.badge,
          requiredPermission: child.requiredPermission
        }))
      }))
    }))
    .filter(group => group.items.length > 0);
}

// Route config generator for RouteRegistry
export function getRouteConfigs() {
  return adminPages
    .filter(page => page.enabled)
    .sort((a, b) => a.order - b.order)
    .map(page => ({
      path: page.path,
      component: page.component,
      requireAuth: page.requireAuth,
      requireAdmin: page.requireAdmin,
      requiredPermission: page.requiredPermission,
      layout: 'admin' as const,
      title: page.name,
      category: 'admin',
      subdomain: 'admin' as const
    }));
}

// Module structure generator (for backward compatibility)
export function getAdminModules() {
  return adminCategories
    .sort((a, b) => a.order - b.order)
    .map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      sections: getPagesByCategory(category.id).map(page => ({
        id: page.id,
        name: page.name,
        path: page.path,
        icon: page.icon,
        description: page.description,
        requiresAdmin: page.requireAdmin,
        requiredPermission: page.requiredPermission,
        badge: page.badge
      }))
    }))
    .filter(module => module.sections.length > 0);
}

// Color mapping for modules
export const categoryColors: Record<AdminPageCategory, string> = {
  'command-center': 'from-blue-500 to-blue-600',
  'infrastructure': 'from-cyan-500 to-cyan-600',
  'security-access': 'from-red-500 to-red-600',
  'operations': 'from-green-500 to-green-600',
  'integration': 'from-purple-500 to-purple-600',
  'intelligence': 'from-indigo-500 to-indigo-600',
  'configuration': 'from-gray-500 to-gray-600',
  'content': 'from-amber-500 to-amber-600',
  'developer': 'from-emerald-500 to-emerald-600',
  'guides': 'from-violet-500 to-violet-600'
};

// Page relationship utilities
export function getRelatedPages(pageId: string): AdminPageConfig[] {
  const page = getPageById(pageId);
  if (!page) return [];
  return getPagesByCategory(page.category).filter(p => p.id !== pageId);
}

export function getBreadcrumbs(path: string): { name: string; path: string }[] {
  const page = getPageByPath(path);
  if (!page) return [{ name: 'Admin', path: '/admin' }];
  
  const breadcrumbs: { name: string; path: string }[] = [
    { name: 'Admin', path: '/admin' }
  ];
  
  if (page.parentId) {
    const parent = getPageById(page.parentId);
    if (parent) {
      breadcrumbs.push({ name: parent.name, path: parent.path });
    }
  }
  
  breadcrumbs.push({ name: page.name, path: page.path });
  return breadcrumbs;
}
