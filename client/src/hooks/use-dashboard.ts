import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from './use-user';
import { useAuth } from './use-auth';
import { useState, useEffect, useMemo } from 'react';
import {
  DashboardRole,
  DashboardPermissions,
  UserDashboardData,
  AdminDashboardData,
  DeveloperDashboardData,
  CompanyDashboardData,
  DepartmentDashboardData,
  DashboardConfig,
  MultipleDashboardsResponse,
  DashboardDataResponse,
} from '@/types/dashboards';

// Permission definitions for each role
const rolePermissions: Record<DashboardRole, DashboardPermissions> = {
  admin: {
    canViewAnalytics: true,
    canViewUsers: true,
    canManageContent: true,
    canViewReports: true,
    canAccessDeveloperTools: true,
    canManageDepartments: true,
    canViewFinancials: true,
    canManageProjects: true,
    canAccessGodLayer: true,
    canViewSystemHealth: true,
    canManageIntegrations: true,
  },
  manager: {
    canViewAnalytics: true,
    canViewUsers: true,
    canManageContent: true,
    canViewReports: true,
    canAccessDeveloperTools: false,
    canManageDepartments: true,
    canViewFinancials: true,
    canManageProjects: true,
    canAccessGodLayer: false,
    canViewSystemHealth: true,
    canManageIntegrations: false,
  },
  developer: {
    canViewAnalytics: true,
    canViewUsers: false,
    canManageContent: false,
    canViewReports: true,
    canAccessDeveloperTools: true,
    canManageDepartments: false,
    canViewFinancials: false,
    canManageProjects: true,
    canAccessGodLayer: false,
    canViewSystemHealth: true,
    canManageIntegrations: true,
  },
  analyst: {
    canViewAnalytics: true,
    canViewUsers: true,
    canManageContent: false,
    canViewReports: true,
    canAccessDeveloperTools: false,
    canManageDepartments: false,
    canViewFinancials: true,
    canManageProjects: false,
    canAccessGodLayer: false,
    canViewSystemHealth: true,
    canManageIntegrations: false,
  },
  moderator: {
    canViewAnalytics: false,
    canViewUsers: true,
    canManageContent: true,
    canViewReports: false,
    canAccessDeveloperTools: false,
    canManageDepartments: false,
    canViewFinancials: false,
    canManageProjects: false,
    canAccessGodLayer: false,
    canViewSystemHealth: false,
    canManageIntegrations: false,
  },
  user: {
    canViewAnalytics: false,
    canViewUsers: false,
    canManageContent: false,
    canViewReports: false,
    canAccessDeveloperTools: false,
    canManageDepartments: false,
    canViewFinancials: false,
    canManageProjects: false,
    canAccessGodLayer: false,
    canViewSystemHealth: false,
    canManageIntegrations: false,
  },
  company: {
    canViewAnalytics: true,
    canViewUsers: true,
    canManageContent: false,
    canViewReports: true,
    canAccessDeveloperTools: false,
    canManageDepartments: true,
    canViewFinancials: true,
    canManageProjects: true,
    canAccessGodLayer: false,
    canViewSystemHealth: true,
    canManageIntegrations: false,
  },
  department: {
    canViewAnalytics: true,
    canViewUsers: false,
    canManageContent: false,
    canViewReports: true,
    canAccessDeveloperTools: false,
    canManageDepartments: false,
    canViewFinancials: true,
    canManageProjects: true,
    canAccessGodLayer: false,
    canViewSystemHealth: false,
    canManageIntegrations: false,
  },
};

// Dashboard configurations
const dashboardConfigs: DashboardConfig[] = [
  {
    role: 'admin',
    path: '/dashboard/admin',
    component: 'AdminDashboard',
    title: 'Admin Dashboard',
    description: 'System administration and management',
    icon: 'Shield',
    features: ['system-metrics', 'user-management', 'compliance', 'logs'],
  },
  {
    role: 'user',
    path: '/dashboard/user',
    component: 'UserDashboard',
    title: 'User Dashboard',
    description: 'Personal workspace and activities',
    icon: 'User',
    features: ['activities', 'projects', 'notifications'],
  },
  {
    role: 'developer',
    path: '/dashboard/developer',
    component: 'DeveloperDashboard',
    title: 'Developer Dashboard',
    description: 'Development tools and metrics',
    icon: 'Code',
    features: ['api-usage', 'deployments', 'documentation'],
  },
  {
    role: 'company',
    path: '/dashboard/company',
    component: 'CompanyDashboard',
    title: 'Company Dashboard',
    description: 'Company-wide metrics and management',
    icon: 'Building',
    features: ['metrics', 'departments', 'financial-overview'],
  },
  {
    role: 'department',
    path: '/dashboard/department',
    component: 'DepartmentDashboard',
    title: 'Department Dashboard',
    description: 'Department operations and team management',
    icon: 'Users',
    features: ['team', 'tasks', 'resources', 'budget'],
  },
  {
    role: 'manager',
    path: '/dashboard/manager',
    component: 'ManagerDashboard',
    title: 'Manager Dashboard',
    description: 'Team and project management',
    icon: 'Briefcase',
    features: ['teams', 'projects', 'reports', 'analytics'],
  },
  {
    role: 'analyst',
    path: '/dashboard/analyst',
    component: 'AnalystDashboard',
    title: 'Analyst Dashboard',
    description: 'Data analysis and reporting',
    icon: 'ChartBar',
    features: ['analytics', 'reports', 'insights'],
  },
  {
    role: 'moderator',
    path: '/dashboard/moderator',
    component: 'ModeratorDashboard',
    title: 'Moderator Dashboard',
    description: 'Content moderation and user management',
    icon: 'Eye',
    features: ['content', 'users', 'reports'],
  },
];

export function useDashboard() {
  const queryClient = useQueryClient();
  const userHook = useUser();
  const authHook = useAuth();
  
  // Use the auth hook if available, otherwise fall back to user hook
  const user = authHook?.user || userHook?.user;
  const isLoading = authHook?.isLoading || userHook?.isLoading;
  
  const [currentDashboard, setCurrentDashboard] = useState<DashboardRole | null>(null);
  const [availableDashboards, setAvailableDashboards] = useState<DashboardConfig[]>([]);

  // Determine user role and available dashboards
  const userRole = useMemo(() => {
    if (!user) return null;
    
    // Handle both possible user object structures
    const role = (user as any).role || 'user';
    return role as DashboardRole;
  }, [user]);

  // Get permissions for current role
  const permissions = useMemo(() => {
    if (!userRole) return null;
    return rolePermissions[userRole];
  }, [userRole]);

  // Set default dashboard based on user role
  useEffect(() => {
    if (userRole && !currentDashboard) {
      setCurrentDashboard(userRole);
      
      // Determine available dashboards based on user role
      const available = dashboardConfigs.filter(config => {
        // Admin can access all dashboards
        if (userRole === 'admin') return true;
        
        // Managers can access user, analyst, and moderator dashboards
        if (userRole === 'manager') {
          return ['manager', 'user', 'analyst', 'moderator'].includes(config.role);
        }
        
        // Company users can access department dashboards
        if (userRole === 'company') {
          return ['company', 'department', 'user'].includes(config.role);
        }
        
        // Others can only access their own and user dashboard
        return config.role === userRole || config.role === 'user';
      });
      
      setAvailableDashboards(available);
    }
  }, [userRole, currentDashboard]);

  // Fetch dashboard data based on current dashboard
  const { data: dashboardData, isLoading: dataLoading, error: dataError, refetch } = useQuery({
    queryKey: ['dashboard-data', currentDashboard],
    queryFn: async () => {
      if (!currentDashboard) return null;
      
      try {
        const response = await fetch(`/api/dashboards/${currentDashboard}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            // If endpoint doesn't exist, return mock data
            return generateMockDashboardData(currentDashboard);
          }
          throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        }
        
        const result: DashboardDataResponse = await response.json();
        return result.data;
      } catch (error) {
        // Return mock data as fallback
        return generateMockDashboardData(currentDashboard);
      }
    },
    enabled: !!currentDashboard && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  // Switch dashboard mutation
  const switchDashboardMutation = useMutation({
    mutationFn: async (newDashboard: DashboardRole) => {
      // Check if user has permission to switch to this dashboard
      const canSwitch = availableDashboards.some(d => d.role === newDashboard);
      if (!canSwitch) {
        throw new Error('You do not have permission to access this dashboard');
      }
      
      setCurrentDashboard(newDashboard);
      return newDashboard;
    },
    onSuccess: (newDashboard) => {
      // Invalidate and refetch data for the new dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard-data', newDashboard] });
    },
  });

  // Get available dashboards for the user
  const { data: availableResponse } = useQuery({
    queryKey: ['available-dashboards', userRole],
    queryFn: async () => {
      try {
        const response = await fetch('/api/dashboards/available', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          // Return local available dashboards
          return {
            availableDashboards,
            defaultDashboard: userRole,
            currentDashboard,
          } as MultipleDashboardsResponse;
        }
        
        return response.json() as Promise<MultipleDashboardsResponse>;
      } catch {
        return {
          availableDashboards,
          defaultDashboard: userRole,
          currentDashboard,
        } as MultipleDashboardsResponse;
      }
    },
    enabled: !!userRole,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Helper function to check specific permissions
  const hasPermission = (permission: keyof DashboardPermissions): boolean => {
    if (!permissions) return false;
    return permissions[permission] === true;
  };

  // Helper function to check multiple permissions
  const hasAllPermissions = (perms: (keyof DashboardPermissions)[]): boolean => {
    return perms.every(perm => hasPermission(perm));
  };

  const hasAnyPermission = (perms: (keyof DashboardPermissions)[]): boolean => {
    return perms.some(perm => hasPermission(perm));
  };

  return {
    // User and role data
    user,
    userRole,
    permissions,
    
    // Dashboard state
    currentDashboard,
    dashboardData,
    availableDashboards: availableResponse?.availableDashboards || availableDashboards,
    
    // Loading states
    isLoading: isLoading || dataLoading,
    isLoadingUser: isLoading,
    isLoadingData: dataLoading,
    
    // Errors
    error: dataError,
    
    // Actions
    switchDashboard: switchDashboardMutation.mutateAsync,
    refreshDashboard: refetch,
    
    // Permission helpers
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    
    // Dashboard config helpers
    getDashboardConfig: (role: DashboardRole) => 
      dashboardConfigs.find(c => c.role === role),
    getDashboardPath: (role?: DashboardRole) => {
      const targetRole = role || currentDashboard;
      return dashboardConfigs.find(c => c.role === targetRole)?.path || '/dashboard';
    },
  };
}

// Helper function to generate mock dashboard data
function generateMockDashboardData(role: DashboardRole): any {
  const baseData = {
    dashboardId: `dashboard-${role}`,
    role,
    lastAccessed: new Date(),
    preferences: {
      theme: 'dark' as const,
      defaultView: 'overview',
      widgets: ['metrics', 'activities', 'notifications'],
      layout: 'grid' as const,
      notifications: {
        email: true,
        push: true,
        inApp: true,
      },
    },
    permissions: rolePermissions[role],
  };

  switch (role) {
    case 'admin':
      return {
        ...baseData,
        systemMetrics: {
          cpuUsage: 45,
          memoryUsage: 62,
          diskUsage: 78,
          networkIO: 234,
          uptime: 999999,
          activeConnections: 142,
        },
        userStats: {
          totalUsers: 1523,
          activeUsers: 234,
          newUsersToday: 12,
          usersByRole: {
            admin: 5,
            user: 1200,
            moderator: 50,
            manager: 100,
            analyst: 68,
            developer: 100,
            company: 0,
            department: 0,
          },
        },
        recentLogs: [],
        alerts: [],
        departments: [],
        complianceStatus: [],
      } as AdminDashboardData;
      
    case 'user':
      return {
        ...baseData,
        recentActivities: [],
        projects: [],
        notifications: [],
        quickLinks: [],
      } as UserDashboardData;
      
    case 'developer':
      return {
        ...baseData,
        apiUsage: {
          totalRequests: 125000,
          errorRate: 0.02,
          avgResponseTime: 123,
          topEndpoints: [],
          rateLimitStatus: {
            limit: 10000,
            remaining: 8765,
            resetAt: new Date(),
          },
        },
        deployments: [],
        buildStatus: [],
        codeMetrics: {
          linesOfCode: 50000,
          coverage: 78,
          technicalDebt: 120,
          codeQuality: 85,
        },
        integrations: [],
        documentation: [],
      } as DeveloperDashboardData;
      
    case 'company':
      return {
        ...baseData,
        companyMetrics: {
          revenue: 5000000,
          growth: 15,
          employeeCount: 250,
          customerCount: 1500,
          projectCount: 45,
        },
        departments: [],
        employees: {
          total: 250,
          byDepartment: {},
          byRole: {},
          newHires: 5,
          turnoverRate: 0.08,
        },
        financialOverview: {
          revenue: 5000000,
          expenses: 3500000,
          profit: 1500000,
          budget: 6000000,
          forecast: 5500000,
        },
        projects: [],
        partnerships: [],
      } as CompanyDashboardData;
      
    case 'department':
      return {
        ...baseData,
        departmentName: 'Engineering',
        departmentId: 'dept-001',
        teamMembers: [],
        departmentMetrics: {
          productivity: 85,
          efficiency: 78,
          taskCompletion: 92,
          budgetUtilization: 68,
        },
        tasks: [],
        resources: [],
        budget: {
          total: 500000,
          allocated: 350000,
          spent: 280000,
          remaining: 220000,
        },
      } as DepartmentDashboardData;
      
    default:
      return baseData;
  }
}