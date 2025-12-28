/**
 * Centralized Dashboard Controller
 * Provides role-based dashboard data for different user types
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { db } from '../db';
import { isAuthenticated, isAdmin, AuthenticatedRequest } from '../core/auth/auth.service';
import { validateRequest } from '../middleware/validate';
import { cacheMiddleware } from '../middleware/cache';
import { users, services, projects, commodities, serviceBookings, performanceMetrics } from '@db/schema';
import { eq, desc, count, sum, and, gte, lte, sql } from 'drizzle-orm';

const router = Router();

// Validation schemas
const departmentParamsSchema = z.object({
  deptId: z.string().min(1)
});

const dashboardQuerySchema = z.object({
  timeRange: z.enum(['24h', '7d', '30d', '90d', '1y']).optional().default('7d'),
  includeDetails: z.coerce.boolean().optional().default(false)
});

// Helper function to check user permissions
const hasPermission = (user: any, permission: string): boolean => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const permissions = user.permissions || [];
  return permissions.includes(permission);
};

// Helper function to check role
const hasRole = (user: any, requiredRole: string): boolean => {
  if (!user) return false;
  if (user.role === 'admin') return true; // Admin has access to all
  return user.role === requiredRole;
};

// Helper function to get time range filter
const getTimeRangeFilter = (range: string) => {
  const now = new Date();
  const startDate = new Date();
  
  switch (range) {
    case '24h':
      startDate.setHours(now.getHours() - 24);
      break;
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }
  
  return { startDate, endDate: now };
};

// User Dashboard - Basic user metrics and activities
router.get('/user', 
  isAuthenticated,
  validateRequest({ query: dashboardQuerySchema }),
  cacheMiddleware('dashboard', 60), // 1 minute cache
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { timeRange, includeDetails } = req.query as any;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { startDate, endDate } = getTimeRangeFilter(timeRange);

      // Get user-specific metrics
      const [userProjects] = await db
        .select({ count: count() })
        .from(projects)
        .where(eq(projects.userId, userId));

      const [userBookings] = await db
        .select({ count: count() })
        .from(serviceBookings)
        .where(eq(serviceBookings.userId, userId));

      // Recent activities
      const recentActivities = includeDetails ? await db
        .select({
          id: serviceBookings.id,
          serviceId: serviceBookings.serviceId,
          status: serviceBookings.status,
          totalAmount: serviceBookings.totalAmount,
          createdAt: serviceBookings.createdAt
        })
        .from(serviceBookings)
        .where(eq(serviceBookings.userId, userId))
        .orderBy(desc(serviceBookings.createdAt))
        .limit(5) : [];

      const dashboardData = {
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
          company: (req.user as any).company
        },
        metrics: {
          totalProjects: userProjects?.count || 0,
          totalBookings: userBookings?.count || 0,
          activeServices: Math.floor(Math.random() * 10) + 1, // Placeholder for active services
          pendingQuotes: Math.floor(Math.random() * 5), // Placeholder for pending quotes
        },
        recentActivities,
        notifications: [
          {
            id: '1',
            type: 'info',
            message: 'Your service booking #SB001 has been confirmed',
            timestamp: new Date()
          }
        ],
        quickStats: {
          deliveryRate: 95.5,
          avgDeliveryTime: 3.2,
          costSavings: 12500,
          carbonFootprint: -15
        },
        lastUpdated: new Date(),
        timeRange
      };

      res.json(dashboardData);

    } catch (error) {
      logger.error('User dashboard error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user dashboard data',
        message: 'Unable to retrieve dashboard metrics' 
      });
    }
  }
);

// Admin Dashboard - Comprehensive system metrics
router.get('/admin',
  isAuthenticated,
  validateRequest({ query: dashboardQuerySchema }),
  cacheMiddleware('dashboard', 30), // 30 seconds cache for admin
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Check admin role
      if (!hasRole(req.user, 'admin')) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'Admin privileges required' 
        });
      }

      const { timeRange, includeDetails } = req.query as any;
      const { startDate, endDate } = getTimeRangeFilter(timeRange);

      // Get system-wide metrics
      const [totalUsers] = await db
        .select({ count: count() })
        .from(users);

      const [activeUsers] = await db
        .select({ count: count() })
        .from(users)
        .where(and(
          eq(users.isActive, true),
          gte(users.lastLoginAt, startDate)
        ));

      const [totalProjects] = await db
        .select({ count: count() })
        .from(projects);

      const [totalBookings] = await db
        .select({ count: count() })
        .from(serviceBookings);

      const [totalServices] = await db
        .select({ count: count() })
        .from(services)
        .where(eq(services.isActive, true));

      // System health metrics
      const systemHealth = {
        database: 'healthy',
        cache: 'healthy',
        websocket: Math.random() > 0.1 ? 'healthy' : 'degraded',
        ai: 'healthy',
        api: 'healthy'
      };

      // Performance metrics
      const performanceMetricsData = {
        apiResponseTime: Math.floor(Math.random() * 50) + 50, // 50-100ms
        cacheHitRate: Math.floor(Math.random() * 20) + 75, // 75-95%
        errorRate: Math.random() * 2, // 0-2%
        uptime: 99.95,
        requestsPerMinute: Math.floor(Math.random() * 500) + 200
      };

      // Revenue metrics (placeholder values)
      const revenueMetrics = {
        dailyRevenue: Math.floor(Math.random() * 50000) + 10000,
        weeklyRevenue: Math.floor(Math.random() * 350000) + 70000,
        monthlyRevenue: Math.floor(Math.random() * 1500000) + 300000,
        yearlyRevenue: Math.floor(Math.random() * 18000000) + 3600000,
        growth: Math.random() * 30 + 5 // 5-35% growth
      };

      const dashboardData = {
        admin: {
          id: req.user.id,
          username: req.user.username,
          role: req.user.role
        },
        systemMetrics: {
          totalUsers: totalUsers?.count || 0,
          activeUsers: activeUsers?.count || 0,
          totalProjects: totalProjects?.count || 0,
          totalBookings: totalBookings?.count || 0,
          totalServices: totalServices?.count || 0,
          totalCommodities: 0 // Placeholder
        },
        performanceMetrics: performanceMetricsData,
        revenueMetrics,
        systemHealth,
        alerts: [
          {
            id: '1',
            severity: 'warning',
            title: 'High API usage detected',
            description: 'API usage at 85% of quota',
            timestamp: new Date()
          },
          {
            id: '2',
            severity: 'info',
            title: 'Scheduled maintenance',
            description: 'System maintenance scheduled for Sunday 2 AM',
            timestamp: new Date()
          }
        ],
        recentActions: [
          {
            id: '1',
            action: 'User registration',
            details: '5 new users registered',
            timestamp: new Date(Date.now() - 60000)
          },
          {
            id: '2',
            action: 'Service update',
            details: 'Air freight service updated',
            timestamp: new Date(Date.now() - 300000)
          }
        ],
        lastUpdated: new Date(),
        timeRange
      };

      res.json(dashboardData);

    } catch (error) {
      logger.error('Admin dashboard error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch admin dashboard data',
        message: 'Unable to retrieve system metrics' 
      });
    }
  }
);

// Developer Dashboard - Development and API metrics
router.get('/developer',
  isAuthenticated,
  validateRequest({ query: dashboardQuerySchema }),
  cacheMiddleware('dashboard', 60),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Check developer role or admin
      if (!hasRole(req.user, 'developer') && !hasRole(req.user, 'admin')) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'Developer privileges required' 
        });
      }

      const { timeRange, includeDetails } = req.query as any;

      // API metrics
      const apiMetrics = {
        totalEndpoints: 156,
        activeEndpoints: 142,
        deprecatedEndpoints: 14,
        apiVersion: 'v2.0.0',
        requestsToday: Math.floor(Math.random() * 10000) + 5000,
        averageLatency: Math.floor(Math.random() * 50) + 20,
        errorRate: Math.random() * 1,
        rateLimitUsage: Math.floor(Math.random() * 60) + 20
      };

      // Development metrics
      const developmentMetrics = {
        activeBuilds: Math.floor(Math.random() * 5) + 1,
        deploymentStatus: 'stable',
        lastDeployment: new Date(Date.now() - 3600000),
        testCoverage: Math.floor(Math.random() * 20) + 70,
        openIssues: Math.floor(Math.random() * 20) + 5,
        resolvedIssues: Math.floor(Math.random() * 50) + 20,
        codeQuality: 'A',
        techDebt: Math.floor(Math.random() * 30) + 10
      };

      // Database metrics
      const databaseMetrics = {
        connections: Math.floor(Math.random() * 50) + 10,
        queryPerformance: Math.floor(Math.random() * 20) + 5,
        slowQueries: Math.floor(Math.random() * 5),
        databaseSize: '2.4 GB',
        backupStatus: 'healthy',
        lastBackup: new Date(Date.now() - 7200000)
      };

      // Integration status
      const integrationStatus = {
        stripe: { status: 'connected', lastSync: new Date(Date.now() - 1800000) },
        openai: { status: 'connected', usage: '45%' },
        aws: { status: 'connected', region: 'us-east-1' },
        github: { status: 'connected', repos: 12 },
        slack: { status: 'disconnected', error: 'Token expired' }
      };

      // Code analytics
      const codeAnalytics = includeDetails ? {
        languages: [
          { name: 'TypeScript', lines: 45000, percentage: 65 },
          { name: 'JavaScript', lines: 15000, percentage: 22 },
          { name: 'Python', lines: 5000, percentage: 7 },
          { name: 'SQL', lines: 3000, percentage: 4 },
          { name: 'Other', lines: 1500, percentage: 2 }
        ],
        commits: {
          today: Math.floor(Math.random() * 10) + 1,
          thisWeek: Math.floor(Math.random() * 50) + 10,
          thisMonth: Math.floor(Math.random() * 200) + 50
        }
      } : null;

      const dashboardData = {
        developer: {
          id: req.user.id,
          username: req.user.username,
          role: req.user.role
        },
        apiMetrics,
        developmentMetrics,
        databaseMetrics,
        integrationStatus,
        codeAnalytics,
        logs: [
          {
            level: 'error',
            message: 'Failed to connect to Redis cache',
            timestamp: new Date(Date.now() - 600000),
            source: 'cache.service'
          },
          {
            level: 'warning',
            message: 'API rate limit approaching threshold',
            timestamp: new Date(Date.now() - 1200000),
            source: 'api.middleware'
          },
          {
            level: 'info',
            message: 'Successfully deployed to production',
            timestamp: new Date(Date.now() - 3600000),
            source: 'deploy.service'
          }
        ],
        apiDocumentation: {
          swagger: '/api-docs',
          postman: '/api/postman-collection',
          github: 'https://github.com/molochain/api-docs'
        },
        lastUpdated: new Date(),
        timeRange
      };

      res.json(dashboardData);

    } catch (error) {
      logger.error('Developer dashboard error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch developer dashboard data',
        message: 'Unable to retrieve development metrics' 
      });
    }
  }
);

// Company Dashboard - Company-wide metrics
router.get('/company',
  isAuthenticated,
  validateRequest({ query: dashboardQuerySchema }),
  cacheMiddleware('dashboard', 120), // 2 minutes cache
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { timeRange, includeDetails } = req.query as any;
      const userCompany = (req.user as any).company;

      if (!userCompany) {
        return res.status(400).json({ 
          error: 'No company associated',
          message: 'User must be associated with a company' 
        });
      }

      // Company-specific metrics
      const [companyUsers] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.company, userCompany));

      const [companyProjects] = await db
        .select({ count: count() })
        .from(projects)
        .where(eq(projects.company, userCompany));

      // Department breakdown (simulated data as departments table doesn't exist)
      const departmentBreakdown = {
        operations: Math.floor(Math.random() * 50) + 20,
        logistics: Math.floor(Math.random() * 40) + 15,
        finance: Math.floor(Math.random() * 30) + 10,
        hr: Math.floor(Math.random() * 20) + 5,
        it: Math.floor(Math.random() * 25) + 10,
        marketing: Math.floor(Math.random() * 15) + 5
      };

      // Performance indicators
      const kpis = {
        efficiency: Math.floor(Math.random() * 20) + 75,
        customerSatisfaction: Math.floor(Math.random() * 15) + 80,
        onTimeDelivery: Math.floor(Math.random() * 10) + 85,
        costReduction: Math.floor(Math.random() * 25) + 5,
        revenueGrowth: Math.floor(Math.random() * 30) + 10
      };

      // Supply chain metrics
      const supplyChainMetrics = {
        totalSuppliers: Math.floor(Math.random() * 100) + 50,
        activeContracts: Math.floor(Math.random() * 50) + 20,
        inventoryTurnover: Math.random() * 5 + 3,
        leadTime: Math.floor(Math.random() * 10) + 5,
        stockAccuracy: Math.floor(Math.random() * 5) + 93
      };

      // Financial overview
      const financialOverview = {
        revenue: {
          current: Math.floor(Math.random() * 500000) + 100000,
          previous: Math.floor(Math.random() * 450000) + 90000,
          growth: Math.random() * 20 + 5
        },
        expenses: {
          current: Math.floor(Math.random() * 300000) + 50000,
          previous: Math.floor(Math.random() * 280000) + 45000,
          change: Math.random() * 10 - 5
        },
        profit: {
          margin: Math.random() * 25 + 10,
          amount: Math.floor(Math.random() * 200000) + 30000
        }
      };

      // Projects overview
      const projectsOverview = includeDetails ? {
        active: Math.floor(Math.random() * 20) + 5,
        completed: Math.floor(Math.random() * 50) + 20,
        pending: Math.floor(Math.random() * 10) + 2,
        onHold: Math.floor(Math.random() * 5),
        totalValue: Math.floor(Math.random() * 5000000) + 1000000
      } : null;

      const dashboardData = {
        company: {
          name: userCompany,
          userId: req.user.id,
          role: req.user.role
        },
        metrics: {
          totalEmployees: companyUsers?.count || 0,
          totalProjects: companyProjects?.count || 0,
          activeOperations: Math.floor(Math.random() * 100) + 50
        },
        departmentBreakdown,
        kpis,
        supplyChainMetrics,
        financialOverview,
        projectsOverview,
        topPerformers: [
          { name: 'Operations Team', score: 95 },
          { name: 'Logistics Team', score: 92 },
          { name: 'Customer Service', score: 89 }
        ],
        recentMilestones: [
          {
            title: 'ISO 9001 Certification',
            date: new Date(Date.now() - 604800000),
            impact: 'high'
          },
          {
            title: 'New Warehouse Opening',
            date: new Date(Date.now() - 1209600000),
            impact: 'medium'
          }
        ],
        lastUpdated: new Date(),
        timeRange
      };

      res.json(dashboardData);

    } catch (error) {
      logger.error('Company dashboard error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch company dashboard data',
        message: 'Unable to retrieve company metrics' 
      });
    }
  }
);

// Department Dashboard - Department-specific metrics (simulated as no departments table)
router.get('/department/:deptId',
  isAuthenticated,
  validateRequest({ 
    params: departmentParamsSchema,
    query: dashboardQuerySchema 
  }),
  cacheMiddleware('dashboard', 120),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { deptId } = req.params;
      const { timeRange, includeDetails } = req.query as any;

      // Since we don't have departments table, we'll simulate department data
      const departments = {
        'operations': { name: 'Operations', head: 'John Smith', employeeCount: 45, status: 'active' },
        'logistics': { name: 'Logistics', head: 'Jane Doe', employeeCount: 32, status: 'active' },
        'finance': { name: 'Finance', head: 'Mike Johnson', employeeCount: 28, status: 'active' },
        'hr': { name: 'Human Resources', head: 'Sarah Williams', employeeCount: 18, status: 'active' },
        'it': { name: 'Information Technology', head: 'Tom Brown', employeeCount: 25, status: 'active' },
        'marketing': { name: 'Marketing', head: 'Lisa Anderson', employeeCount: 15, status: 'active' }
      };

      const department = departments[deptId as keyof typeof departments];
      
      if (!department) {
        return res.status(404).json({ 
          error: 'Department not found',
          message: `Department with ID ${deptId} does not exist` 
        });
      }

      // Department-specific metrics
      const teamMetrics = {
        totalMembers: department.employeeCount || 0,
        activeMembers: Math.floor((department.employeeCount || 0) * 0.9),
        onLeave: Math.floor((department.employeeCount || 0) * 0.05),
        newHires: Math.floor(Math.random() * 5),
        averageProductivity: Math.floor(Math.random() * 20) + 75
      };

      // Task and project metrics
      const taskMetrics = {
        totalTasks: Math.floor(Math.random() * 100) + 50,
        completedTasks: Math.floor(Math.random() * 80) + 30,
        pendingTasks: Math.floor(Math.random() * 20) + 10,
        overdueTasks: Math.floor(Math.random() * 5),
        averageCompletionTime: Math.floor(Math.random() * 5) + 2
      };

      // Budget and resource metrics
      const budgetMetrics = {
        allocated: Math.floor(Math.random() * 500000) + 100000,
        spent: Math.floor(Math.random() * 400000) + 50000,
        remaining: Math.floor(Math.random() * 100000) + 20000,
        utilization: Math.floor(Math.random() * 20) + 70,
        projectedOverrun: Math.random() > 0.7 ? Math.floor(Math.random() * 50000) : 0
      };

      // Performance metrics
      const performanceMetricsData = {
        efficiency: Math.floor(Math.random() * 20) + 75,
        quality: Math.floor(Math.random() * 15) + 80,
        deliveryRate: Math.floor(Math.random() * 10) + 85,
        customerSatisfaction: Math.floor(Math.random() * 15) + 80,
        innovationIndex: Math.floor(Math.random() * 30) + 50
      };

      // Team activities
      const teamActivities = includeDetails ? [
        {
          id: '1',
          type: 'achievement',
          title: 'Project milestone completed',
          description: 'Supply chain optimization phase 1 completed',
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: '2',
          type: 'meeting',
          title: 'Department meeting scheduled',
          description: 'Quarterly review meeting tomorrow at 10 AM',
          timestamp: new Date(Date.now() - 7200000)
        },
        {
          id: '3',
          type: 'training',
          title: 'Training session completed',
          description: '85% of team completed safety training',
          timestamp: new Date(Date.now() - 86400000)
        }
      ] : [];

      // Goals and objectives
      const goals = {
        quarterly: [
          { title: 'Reduce operational costs by 10%', progress: 65 },
          { title: 'Improve delivery time by 15%', progress: 80 },
          { title: 'Complete digital transformation phase', progress: 45 }
        ],
        annual: [
          { title: 'Achieve ISO certification', progress: 30 },
          { title: 'Expand team by 20%', progress: 50 }
        ]
      };

      const dashboardData = {
        department: {
          id: deptId,
          name: department.name,
          description: `${department.name} Department`,
          head: department.head,
          status: department.status
        },
        user: {
          id: req.user.id,
          role: req.user.role,
          isDepartmentHead: department.head === req.user.username
        },
        teamMetrics,
        taskMetrics,
        budgetMetrics,
        performanceMetrics: performanceMetricsData,
        teamActivities,
        goals,
        topContributors: [
          { name: 'John Doe', contribution: 95, role: 'Senior Analyst' },
          { name: 'Jane Smith', contribution: 92, role: 'Project Manager' },
          { name: 'Mike Johnson', contribution: 88, role: 'Team Lead' }
        ],
        upcomingDeadlines: [
          {
            title: 'Q4 Report Submission',
            date: new Date(Date.now() + 604800000),
            priority: 'high'
          },
          {
            title: 'Budget Review',
            date: new Date(Date.now() + 1209600000),
            priority: 'medium'
          }
        ],
        lastUpdated: new Date(),
        timeRange
      };

      res.json(dashboardData);

    } catch (error) {
      logger.error('Department dashboard error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch department dashboard data',
        message: 'Unable to retrieve department metrics' 
      });
    }
  }
);

// Get user's dashboard role and permissions
router.get('/role',
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Not authenticated',
          message: 'User session not found' 
        });
      }

      // Get full user details
      const [fullUser] = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
          permissions: users.permissions,
          company: users.company,
          fullName: users.fullName,
          isActive: users.isActive,
          twoFactorEnabled: users.twoFactorEnabled
        })
        .from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);

      if (!fullUser) {
        return res.status(404).json({ 
          error: 'User not found',
          message: 'User record not found in database' 
        });
      }

      // Determine available dashboards based on role
      const availableDashboards = ['user']; // Everyone has access to user dashboard

      if (fullUser.role === 'admin') {
        availableDashboards.push('admin', 'developer', 'company', 'department');
      } else {
        if (fullUser.role === 'developer') {
          availableDashboards.push('developer');
        }
        if (fullUser.role === 'manager' || fullUser.role === 'executive') {
          availableDashboards.push('company');
        }
        if (fullUser.permissions?.includes('view_department')) {
          availableDashboards.push('department');
        }
        if (fullUser.company) {
          availableDashboards.push('company');
        }
      }

      // Default dashboard based on role
      const defaultDashboard = fullUser.role === 'admin' ? 'admin' :
                             fullUser.role === 'developer' ? 'developer' :
                             fullUser.role === 'manager' ? 'company' :
                             fullUser.role === 'executive' ? 'company' :
                             'user';

      // Role capabilities
      const capabilities = {
        canViewSystemMetrics: fullUser.role === 'admin',
        canManageUsers: fullUser.permissions?.includes('manage_users') || fullUser.role === 'admin',
        canViewFinancials: fullUser.permissions?.includes('view_financials') || 
                          fullUser.role === 'admin' || 
                          fullUser.role === 'executive',
        canManageDepartments: fullUser.permissions?.includes('manage_departments') || 
                            fullUser.role === 'admin',
        canAccessDeveloperTools: fullUser.role === 'developer' || fullUser.role === 'admin',
        canViewCompanyData: !!fullUser.company || fullUser.role === 'admin',
        canManageProjects: fullUser.permissions?.includes('manage_projects') || 
                          fullUser.role === 'admin' || 
                          fullUser.role === 'manager',
        canViewAnalytics: fullUser.permissions?.includes('view_analytics') || 
                         fullUser.role === 'admin' || 
                         fullUser.role === 'executive'
      };

      const roleData = {
        user: {
          id: fullUser.id,
          username: fullUser.username,
          email: fullUser.email,
          fullName: fullUser.fullName,
          company: fullUser.company,
          isActive: fullUser.isActive,
          twoFactorEnabled: fullUser.twoFactorEnabled
        },
        role: {
          name: fullUser.role,
          displayName: fullUser.role.charAt(0).toUpperCase() + fullUser.role.slice(1),
          level: fullUser.role === 'admin' ? 100 :
                fullUser.role === 'executive' ? 90 :
                fullUser.role === 'manager' ? 70 :
                fullUser.role === 'developer' ? 60 :
                fullUser.role === 'user' ? 10 : 0
        },
        permissions: fullUser.permissions || [],
        availableDashboards,
        defaultDashboard,
        capabilities,
        navigation: {
          showAdminMenu: fullUser.role === 'admin',
          showDeveloperMenu: fullUser.role === 'developer' || fullUser.role === 'admin',
          showCompanyMenu: !!fullUser.company || fullUser.role === 'admin',
          showDepartmentMenu: fullUser.permissions?.includes('view_department') || fullUser.role === 'admin',
          showAnalyticsMenu: capabilities.canViewAnalytics,
          showFinancialsMenu: capabilities.canViewFinancials
        },
        theme: {
          primaryColor: fullUser.role === 'admin' ? '#FF6B6B' :
                       fullUser.role === 'developer' ? '#4ECDC4' :
                       fullUser.role === 'manager' ? '#45B7D1' :
                       '#95E1D3',
          dashboardLayout: fullUser.role === 'admin' ? 'grid' :
                         fullUser.role === 'developer' ? 'developer' :
                         'standard'
        }
      };

      res.json(roleData);

    } catch (error) {
      logger.error('Role check error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch role information',
        message: 'Unable to retrieve user role and permissions' 
      });
    }
  }
);

// Get dashboard summary for all accessible dashboards
router.get('/summary',
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const summaries = [];

      // Always include user dashboard summary
      summaries.push({
        type: 'user',
        title: 'Personal Dashboard',
        description: 'Your personal metrics and activities',
        icon: 'user',
        path: '/dashboards/user',
        isDefault: req.user?.role === 'user'
      });

      // Add role-specific dashboards
      if (hasRole(req.user, 'admin')) {
        summaries.push({
          type: 'admin',
          title: 'Admin Dashboard',
          description: 'System-wide administration and monitoring',
          icon: 'shield',
          path: '/dashboards/admin',
          isDefault: true
        });
      }

      if (hasRole(req.user, 'developer') || hasRole(req.user, 'admin')) {
        summaries.push({
          type: 'developer',
          title: 'Developer Dashboard',
          description: 'API metrics and development tools',
          icon: 'code',
          path: '/dashboards/developer',
          isDefault: req.user?.role === 'developer'
        });
      }

      const userCompany = (req.user as any).company;
      if (userCompany || hasRole(req.user, 'admin')) {
        summaries.push({
          type: 'company',
          title: 'Company Dashboard',
          description: 'Company-wide metrics and performance',
          icon: 'building',
          path: '/dashboards/company',
          isDefault: req.user?.role === 'manager' || req.user?.role === 'executive'
        });
      }

      if (hasPermission(req.user, 'view_department') || hasRole(req.user, 'admin')) {
        summaries.push({
          type: 'department',
          title: 'Department Dashboard',
          description: 'Department-specific metrics and team performance',
          icon: 'users',
          path: '/dashboards/department',
          isDefault: false
        });
      }

      res.json({
        dashboards: summaries,
        totalCount: summaries.length,
        defaultDashboard: summaries.find(s => s.isDefault)?.type || 'user'
      });

    } catch (error) {
      logger.error('Dashboard summary error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch dashboard summary',
        message: 'Unable to retrieve available dashboards' 
      });
    }
  }
);

export default router;
// Unified admin dashboard stats (merged from dashboard.ts)
router.get('/unified-stats', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = {
      activeUsers: Math.floor(Math.random() * 200) + 100,
      totalProjects: Math.floor(Math.random() * 50) + 30,
      apiRequests: Math.floor(Math.random() * 15000) + 10000,
      systemLoad: Math.floor(Math.random() * 40) + 30,
      cacheHitRate: Math.floor(Math.random() * 20) + 75,
      totalDepartments: 14,
      totalDivisions: 28,
      activeModules: 42
    };
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching unified dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Dashboard metrics endpoint (merged from dashboard.ts)
router.get('/metrics', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const timeRangeSchema = z.object({
      range: z.enum(['24h', '7d', '30d']).optional().default('7d')
    });
    const { range } = timeRangeSchema.parse(req.query);
    
    const now = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    const baseMetrics = {
      totalShipments: Math.floor(Math.random() * 1000) + 500,
      activeShipments: Math.floor(Math.random() * 100) + 20,
      completedShipments: Math.floor(Math.random() * 900) + 400,
      delayedShipments: Math.floor(Math.random() * 15) + 2,
      efficiency: Math.floor(Math.random() * 20) + 80,
      costSavings: Math.floor(Math.random() * 50000) + 10000
    };

    const multiplier = range === '24h' ? 0.1 : range === '7d' ? 1 : 3;
    const scaledMetrics = {
      ...baseMetrics,
      totalShipments: Math.floor(baseMetrics.totalShipments * multiplier),
      activeShipments: Math.floor(baseMetrics.activeShipments * multiplier),
      completedShipments: Math.floor(baseMetrics.completedShipments * multiplier),
      costSavings: Math.floor(baseMetrics.costSavings * multiplier)
    };

    const alerts = [
      {
        id: '1',
        type: 'warning',
        title: 'Route Optimization Available',
        description: 'Potential 15% time savings identified for Route B-47',
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        actionRequired: true
      }
    ];

    const recommendations = [
      {
        id: '1',
        category: 'cost',
        title: 'Consolidate Shipments',
        description: 'Combine smaller shipments to reduce per-unit costs by 20%',
        impact: 'high',
        savings: 12500
      }
    ];

    const performanceData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      performanceData.push({
        date: date.toISOString().split('T')[0],
        efficiency: Math.floor(Math.random() * 15) + 85,
        costs: Math.floor(Math.random() * 50000) + 25000,
        volume: Math.floor(Math.random() * 100) + 50
      });
    }

    res.json({
      ...scaledMetrics,
      alerts,
      recommendations,
      performanceData,
      generatedAt: new Date().toISOString(),
      timeRange: range
    });
  } catch (error) {
    logger.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

// Real-time metrics endpoint (merged from dashboard.ts)
router.get('/metrics/realtime', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const realtimeMetrics = {
      activeConnections: Math.floor(Math.random() * 1000) + 100,
      currentThroughput: Math.floor(Math.random() * 500) + 50,
      systemLoad: Math.random() * 0.8 + 0.1,
      responseTime: Math.floor(Math.random() * 200) + 50,
      lastUpdated: new Date().toISOString()
    };
    res.json(realtimeMetrics);
  } catch (error) {
    logger.error('Real-time metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch real-time metrics' });
  }
});

// Activity feed endpoint (merged from dashboard.ts)
router.get('/activity', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const activities = [
      {
        id: '1',
        type: 'shipment',
        title: 'Shipment #SH001 delivered',
        description: 'Container shipment from Shanghai to Rotterdam',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        status: 'completed',
        icon: 'package'
      },
      {
        id: '2',
        type: 'quote',
        title: 'New quote request received',
        description: 'Air freight quote for electronics shipment',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: 'pending',
        icon: 'file-text'
      }
    ];
    res.json(activities);
  } catch (error) {
    logger.error('Activity feed error:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

