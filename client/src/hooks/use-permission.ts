import { useMemo } from 'react';
import { useUser } from './use-user';
import type { Permission, AdminRole } from '@/lib/permissions';
import {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  getUserPermissions,
  canAccessPage as libCanAccessPage,
  isAdmin as libIsAdmin,
  isSuperAdmin as libIsSuperAdmin,
} from '@/lib/permissions';
import type { AdminPageConfig } from '@/config/adminPageRegistry';

export interface UsePermissionReturn {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canAccessPage: (page: AdminPageConfig) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  userRole: AdminRole | string | null;
  permissions: Permission[];
  isLoading: boolean;
}

export function usePermission(): UsePermissionReturn {
  const { user, isLoading } = useUser();

  const userRole = useMemo(() => {
    if (!user || !user.role) {
      return null;
    }
    return user.role;
  }, [user]);

  const permissions = useMemo(() => {
    if (!userRole) {
      return [];
    }
    return getUserPermissions(userRole);
  }, [userRole]);

  const hasPermission = useMemo(() => {
    return (permission: Permission): boolean => {
      if (!userRole) {
        return false;
      }
      return checkPermission(userRole, permission);
    };
  }, [userRole]);

  const hasAnyPermission = useMemo(() => {
    return (perms: Permission[]): boolean => {
      if (!userRole) {
        return false;
      }
      if (perms.length === 0) {
        return true;
      }
      return checkAnyPermission(userRole, perms);
    };
  }, [userRole]);

  const hasAllPermissions = useMemo(() => {
    return (perms: Permission[]): boolean => {
      if (!userRole) {
        return false;
      }
      if (perms.length === 0) {
        return true;
      }
      return checkAllPermissions(userRole, perms);
    };
  }, [userRole]);

  const canAccessPage = useMemo(() => {
    return (page: AdminPageConfig): boolean => {
      if (!userRole) {
        return false;
      }
      return libCanAccessPage(page, userRole);
    };
  }, [userRole]);

  const isAdmin = useMemo(() => {
    if (!userRole) {
      return false;
    }
    return libIsAdmin(userRole);
  }, [userRole]);

  const isSuperAdmin = useMemo(() => {
    if (!userRole) {
      return false;
    }
    return libIsSuperAdmin(userRole);
  }, [userRole]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessPage,
    isAdmin,
    isSuperAdmin,
    userRole,
    permissions,
    isLoading,
  };
}

export type { Permission, AdminRole } from '@/lib/permissions';
