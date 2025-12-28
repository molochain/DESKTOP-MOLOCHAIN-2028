/**
 * Admin System Modular Architecture Configuration
 * Uses the centralized admin page registry for consistency
 */

import { 
  getAdminModules, 
  categoryColors,
  getPageByPath,
  getPageById,
  adminCategories,
  adminPages,
  type AdminPageConfig,
  type AdminCategoryConfig
} from './adminPageRegistry';

// Re-export types for backward compatibility
export interface AdminModule {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  badge?: string;
  sections: AdminSection[];
}

export interface AdminSection {
  id: string;
  name: string;
  path: string;
  icon: any;
  description: string;
  requiresAdmin?: boolean;
  badge?: string;
}

// Get modules from centralized registry
export const adminModules: AdminModule[] = getAdminModules();

// Helper function to get all admin routes
export const getAllAdminRoutes = (): string[] => {
  return adminPages
    .filter(page => page.enabled)
    .map(page => page.path);
};

// Helper function to get module by section path
export const getModuleByPath = (path: string): AdminModule | undefined => {
  return adminModules.find(module => 
    module.sections.some(section => section.path === path)
  );
};

// Helper function to get section by path
export const getSectionByPath = (path: string): AdminSection | undefined => {
  for (const module of adminModules) {
    const section = module.sections.find(s => s.path === path);
    if (section) return section;
  }
  return undefined;
};

// Module color mapping for consistent theming
export const moduleColors: Record<string, string> = {
  'command-center': categoryColors['command-center'],
  'infrastructure': categoryColors['infrastructure'],
  'security-access': categoryColors['security-access'],
  'operations': categoryColors['operations'],
  'integration': categoryColors['integration'],
  'intelligence': categoryColors['intelligence'],
  'configuration': categoryColors['configuration'],
  'content': categoryColors['content'],
  // Legacy mappings for backward compatibility
  'core-system': categoryColors['infrastructure'],
  'analytics-intelligence': categoryColors['intelligence']
};

// Export utility functions from registry
export { 
  getPageByPath, 
  getPageById, 
  adminCategories,
  adminPages,
  categoryColors
};

// Re-export types
export type { AdminPageConfig, AdminCategoryConfig };
