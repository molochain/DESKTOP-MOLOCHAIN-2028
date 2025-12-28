/**
 * Shared Permissions Types
 * TypeScript interfaces and types for the RBAC permission system
 */

export const PERMISSION_DOMAINS = {
  USERS: 'users',
  SECURITY: 'security',
  SETTINGS: 'settings',
  CONTENT: 'content',
  OPERATIONS: 'operations',
  INTELLIGENCE: 'intelligence',
  INTEGRATIONS: 'integrations',
  INFRASTRUCTURE: 'infrastructure',
  DASHBOARD: 'dashboard',
  ANALYTICS: 'analytics',
  AUDIT: 'audit',
} as const;

export const PERMISSIONS = {
  DASHBOARD_ACCESS: 'dashboard.access',
  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_EDIT: 'dashboard.edit',
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_MANAGE: 'users.manage',
  SECURITY_VIEW: 'security.view',
  SECURITY_EDIT: 'security.edit',
  SECURITY_MANAGE: 'security.manage',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  SETTINGS_MANAGE: 'settings.manage',
  CONTENT_VIEW: 'content.view',
  CONTENT_CREATE: 'content.create',
  CONTENT_EDIT: 'content.edit',
  CONTENT_DELETE: 'content.delete',
  CONTENT_PUBLISH: 'content.publish',
  OPERATIONS_VIEW: 'operations.view',
  OPERATIONS_EDIT: 'operations.edit',
  OPERATIONS_MANAGE: 'operations.manage',
  INTELLIGENCE_VIEW: 'intelligence.view',
  INTELLIGENCE_EDIT: 'intelligence.edit',
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EDIT: 'analytics.edit',
  INTEGRATIONS_VIEW: 'integrations.view',
  INTEGRATIONS_EDIT: 'integrations.edit',
  INTEGRATIONS_MANAGE: 'integrations.manage',
  INFRASTRUCTURE_VIEW: 'infrastructure.view',
  INFRASTRUCTURE_EDIT: 'infrastructure.edit',
  INFRASTRUCTURE_MANAGE: 'infrastructure.manage',
  AUDIT_VIEW: 'audit.view',
  AUDIT_MANAGE: 'audit.manage',
  SYSTEM_ADMIN: 'system.admin',
  SYSTEM_SUPER_ADMIN: 'system.super_admin',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  ANALYST: 'analyst',
  DEVELOPER: 'developer',
  MODERATOR: 'moderator',
  EXECUTIVE: 'executive',
} as const;

export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES];

export type RolePermissionMap = Record<AdminRole, Permission[]>;

export type PermissionDomain = typeof PERMISSION_DOMAINS[keyof typeof PERMISSION_DOMAINS];
