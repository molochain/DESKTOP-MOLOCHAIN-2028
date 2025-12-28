/**
 * Client-side Permission Utilities
 * Provides permission checking and filtering for the admin panel
 */

import type { Permission, AdminRole } from '@shared/permissions';
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission as sharedHasPermission,
  hasAnyPermission as sharedHasAnyPermission,
  hasAllPermissions as sharedHasAllPermissions,
  getRolePermissions,
  isValidAdminRole,
} from '@shared/permissions';

import type { AdminPageConfig } from '@/config/adminPageRegistry';

/**
 * Get all permissions for a user role
 */
export function getUserPermissions(role: AdminRole | string): Permission[] {
  if (!isValidAdminRole(role)) {
    return [];
  }
  return getRolePermissions(role);
}

/**
 * Check if a user role has a specific permission
 */
export function checkPermission(userRole: AdminRole | string, permission: Permission): boolean {
  return sharedHasPermission(userRole, permission);
}

/**
 * Check if a user role has any of the specified permissions
 */
export function checkAnyPermission(userRole: AdminRole | string, permissions: Permission[]): boolean {
  return sharedHasAnyPermission(userRole, permissions);
}

/**
 * Check if a user role has all of the specified permissions
 */
export function checkAllPermissions(userRole: AdminRole | string, permissions: Permission[]): boolean {
  return sharedHasAllPermissions(userRole, permissions);
}

/**
 * Filter admin pages by user permissions
 * Returns only pages that the user has permission to access
 */
export function filterPagesByPermission(
  pages: AdminPageConfig[],
  userRole: AdminRole | string
): AdminPageConfig[] {
  if (!userRole) {
    return [];
  }

  // Super admin sees all pages
  const userPermissions = getUserPermissions(userRole);
  if (userPermissions.includes(PERMISSIONS.SYSTEM_SUPER_ADMIN)) {
    return pages.filter(page => page.enabled);
  }

  return pages.filter(page => {
    // Page must be enabled
    if (!page.enabled) {
      return false;
    }

    // If page has no required permission, allow access (default behavior)
    if (!page.requiredPermission) {
      return true;
    }

    // Check if user has the required permission
    if (Array.isArray(page.requiredPermission)) {
      // If array of permissions, user needs at least one
      return sharedHasAnyPermission(userRole, page.requiredPermission);
    }

    // Single permission check
    return sharedHasPermission(userRole, page.requiredPermission);
  });
}

/**
 * Check if user can access a specific page
 */
export function canAccessPage(
  page: AdminPageConfig,
  userRole: AdminRole | string
): boolean {
  if (!page.enabled) {
    return false;
  }

  if (!userRole) {
    return false;
  }

  // Super admin can access all pages
  const userPermissions = getUserPermissions(userRole);
  if (userPermissions.includes(PERMISSIONS.SYSTEM_SUPER_ADMIN)) {
    return true;
  }

  // If no required permission, allow access
  if (!page.requiredPermission) {
    return true;
  }

  // Check permissions
  if (Array.isArray(page.requiredPermission)) {
    return sharedHasAnyPermission(userRole, page.requiredPermission);
  }

  return sharedHasPermission(userRole, page.requiredPermission);
}

/**
 * Get navigation groups filtered by user permissions
 */
export function getPermittedNavigationGroups(
  pages: AdminPageConfig[],
  userRole: AdminRole | string
) {
  const permittedPages = filterPagesByPermission(pages, userRole);
  
  // Group pages by category
  const groupedPages = permittedPages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {} as Record<string, AdminPageConfig[]>);

  return groupedPages;
}

/**
 * Check if user has admin-level access
 */
export function isAdmin(userRole: AdminRole | string): boolean {
  const adminRoles: AdminRole[] = ['super_admin', 'admin'];
  return adminRoles.includes(userRole as AdminRole);
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(userRole: AdminRole | string): boolean {
  return userRole === 'super_admin';
}

// Re-export types and constants for convenience
export type { Permission, AdminRole } from '@shared/permissions';
export { PERMISSIONS, ROLE_PERMISSIONS } from '@shared/permissions';
