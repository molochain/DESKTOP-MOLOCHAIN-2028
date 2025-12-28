/**
 * Access Control Manager
 * Centralized role-based access control and permission management
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../database/db.service';
import { users, auditLogs } from '@db/schema';
import { eq, and, or, inArray } from 'drizzle-orm';
import { logger } from '../../utils/logger';
import { identityManager } from '../identity/identity-manager.service';
import EventEmitter from 'events';
import { roleTemplateManager } from './role-template-manager';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  inherits?: string[]; // Role IDs to inherit from
  priority: number; // Higher priority overrides lower
  isSystem: boolean; // System roles cannot be deleted
  metadata?: Record<string, any>;
}

export interface Permission {
  id: string;
  resource: string;
  actions: string[];
  conditions?: AccessCondition[];
  description?: string;
}

export interface AccessCondition {
  type: 'ownership' | 'time' | 'location' | 'attribute' | 'custom';
  field?: string;
  operator?: string;
  value?: any;
  evaluator?: (context: AccessContext) => boolean;
}

export interface AccessContext {
  userId: number;
  userRole: string;
  userPermissions: string[];
  resource: string;
  action: string;
  resourceId?: string;
  resourceOwner?: number;
  requestTime: Date;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export interface AccessDecision {
  granted: boolean;
  reason?: string;
  appliedRole?: string;
  appliedPermission?: Permission;
  conditions?: AccessCondition[];
}

export interface ResourceDefinition {
  id: string;
  name: string;
  type: 'api' | 'ui' | 'data' | 'system';
  actions: string[];
  ownershipField?: string;
  parent?: string;
  children?: string[];
}

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  effect: 'allow' | 'deny';
  principals: string[]; // User IDs or role names
  resources: string[];
  actions: string[];
  conditions?: AccessCondition[];
  priority: number;
  enabled: boolean;
}

class AccessControlManager extends EventEmitter {
  private static instance: AccessControlManager;
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private resources: Map<string, ResourceDefinition> = new Map();
  private policies: Map<string, AccessPolicy> = new Map();
  private accessCache: Map<string, { decision: AccessDecision; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute

  private constructor() {
    super();
    this.initializeSystemRoles();
    this.initializeResources();
    this.startCacheCleanup();
    this.setupTemplateSync();
  }

  public static getInstance(): AccessControlManager {
    if (!AccessControlManager.instance) {
      AccessControlManager.instance = new AccessControlManager();
    }
    return AccessControlManager.instance;
  }

  private initializeSystemRoles() {
    // Super Admin - Full system access
    this.roles.set('superadmin', {
      id: 'superadmin',
      name: 'Super Administrator',
      description: 'Full system access with no restrictions',
      permissions: [
        {
          id: 'superadmin-all',
          resource: '*',
          actions: ['*']
        }
      ],
      priority: 1000,
      isSystem: true
    });

    // Admin - Administrative access
    this.roles.set('admin', {
      id: 'admin',
      name: 'Administrator',
      description: 'Administrative access to most system functions',
      permissions: [
        {
          id: 'admin-users',
          resource: 'users',
          actions: ['create', 'read', 'update', 'delete', 'manage']
        },
        {
          id: 'admin-settings',
          resource: 'settings',
          actions: ['read', 'update']
        },
        {
          id: 'admin-audit',
          resource: 'audit',
          actions: ['read', 'export']
        },
        {
          id: 'admin-security',
          resource: 'security',
          actions: ['read', 'update', 'scan']
        }
      ],
      priority: 900,
      isSystem: true
    });

    // Manager - Team and resource management
    this.roles.set('manager', {
      id: 'manager',
      name: 'Manager',
      description: 'Manage teams and resources',
      permissions: [
        {
          id: 'manager-users',
          resource: 'users',
          actions: ['read', 'update'],
          conditions: [
            {
              type: 'attribute',
              field: 'team',
              operator: 'equals',
              value: '${user.team}'
            }
          ]
        },
        {
          id: 'manager-projects',
          resource: 'projects',
          actions: ['create', 'read', 'update', 'delete']
        },
        {
          id: 'manager-reports',
          resource: 'reports',
          actions: ['read', 'create', 'export']
        }
      ],
      priority: 700,
      isSystem: true
    });

    // Moderator - Content moderation
    this.roles.set('moderator', {
      id: 'moderator',
      name: 'Moderator',
      description: 'Moderate content and user activities',
      permissions: [
        {
          id: 'moderator-content',
          resource: 'content',
          actions: ['read', 'update', 'delete', 'flag']
        },
        {
          id: 'moderator-users',
          resource: 'users',
          actions: ['read', 'suspend', 'warn']
        },
        {
          id: 'moderator-reports',
          resource: 'reports',
          actions: ['read', 'resolve']
        }
      ],
      priority: 600,
      isSystem: true
    });

    // Analyst - Read-only analytics access
    this.roles.set('analyst', {
      id: 'analyst',
      name: 'Analyst',
      description: 'View and analyze data',
      permissions: [
        {
          id: 'analyst-data',
          resource: 'analytics',
          actions: ['read', 'export']
        },
        {
          id: 'analyst-reports',
          resource: 'reports',
          actions: ['read', 'create']
        },
        {
          id: 'analyst-dashboards',
          resource: 'dashboards',
          actions: ['read', 'create', 'update'],
          conditions: [
            {
              type: 'ownership'
            }
          ]
        }
      ],
      priority: 500,
      isSystem: true
    });

    // User - Basic user access
    this.roles.set('user', {
      id: 'user',
      name: 'User',
      description: 'Standard user access',
      permissions: [
        {
          id: 'user-profile',
          resource: 'profile',
          actions: ['read', 'update'],
          conditions: [
            {
              type: 'ownership'
            }
          ]
        },
        {
          id: 'user-content',
          resource: 'content',
          actions: ['read', 'create'],
          conditions: [
            {
              type: 'ownership'
            }
          ]
        }
      ],
      priority: 100,
      isSystem: true
    });

    // Guest - Limited public access
    this.roles.set('guest', {
      id: 'guest',
      name: 'Guest',
      description: 'Limited public access',
      permissions: [
        {
          id: 'guest-public',
          resource: 'public',
          actions: ['read']
        }
      ],
      priority: 10,
      isSystem: true
    });
  }

  private initializeResources() {
    // User management resources
    this.resources.set('users', {
      id: 'users',
      name: 'User Management',
      type: 'api',
      actions: ['create', 'read', 'update', 'delete', 'manage', 'suspend', 'warn'],
      ownershipField: 'id'
    });

    // Security resources
    this.resources.set('security', {
      id: 'security',
      name: 'Security Settings',
      type: 'system',
      actions: ['read', 'update', 'scan', 'audit']
    });

    // Content resources
    this.resources.set('content', {
      id: 'content',
      name: 'Content',
      type: 'data',
      actions: ['create', 'read', 'update', 'delete', 'flag', 'publish'],
      ownershipField: 'userId'
    });

    // Analytics resources
    this.resources.set('analytics', {
      id: 'analytics',
      name: 'Analytics',
      type: 'data',
      actions: ['read', 'export', 'analyze']
    });

    // Profile resources
    this.resources.set('profile', {
      id: 'profile',
      name: 'User Profile',
      type: 'data',
      actions: ['read', 'update'],
      ownershipField: 'userId'
    });

    // API resources
    this.resources.set('api', {
      id: 'api',
      name: 'API Access',
      type: 'api',
      actions: ['read', 'write', 'delete'],
      children: ['api.auth', 'api.admin', 'api.public']
    });
  }

  private startCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.accessCache.entries()) {
        if (now - value.timestamp > this.CACHE_TTL) {
          this.accessCache.delete(key);
        }
      }
    }, 60000); // Clean every minute
  }

  // Access evaluation
  public async checkAccess(context: AccessContext): Promise<AccessDecision> {
    // Check cache first
    const cacheKey = this.getCacheKey(context);
    const cached = this.accessCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.decision;
    }

    try {
      // Super admin always has access
      if (context.userRole === 'superadmin') {
        const decision = { granted: true, reason: 'Super admin access' };
        this.cacheDecision(cacheKey, decision);
        return decision;
      }

      // Check deny policies first (explicit deny)
      const denyDecision = await this.evaluatePolicies(context, 'deny');
      if (!denyDecision.granted) {
        this.cacheDecision(cacheKey, denyDecision);
        this.auditAccess(context, denyDecision);
        return denyDecision;
      }

      // Check allow policies
      const allowDecision = await this.evaluatePolicies(context, 'allow');
      if (allowDecision.granted) {
        this.cacheDecision(cacheKey, allowDecision);
        this.auditAccess(context, allowDecision);
        return allowDecision;
      }

      // Check role-based permissions
      const roleDecision = await this.evaluateRolePermissions(context);
      this.cacheDecision(cacheKey, roleDecision);
      this.auditAccess(context, roleDecision);
      return roleDecision;
    } catch (error) {
      logger.error('Error checking access:', error);
      return { granted: false, reason: 'Access check failed' };
    }
  }

  private getCacheKey(context: AccessContext): string {
    return `${context.userId}-${context.resource}-${context.action}-${context.resourceId || ''}`;
  }

  private cacheDecision(key: string, decision: AccessDecision) {
    this.accessCache.set(key, { decision, timestamp: Date.now() });
  }

  private async evaluatePolicies(context: AccessContext, effect: 'allow' | 'deny'): Promise<AccessDecision> {
    const applicablePolicies = Array.from(this.policies.values())
      .filter(policy => 
        policy.enabled &&
        policy.effect === effect &&
        this.isPolicyApplicable(policy, context)
      )
      .sort((a, b) => b.priority - a.priority);

    for (const policy of applicablePolicies) {
      if (this.evaluateConditions(policy.conditions || [], context)) {
        return {
          granted: effect === 'allow',
          reason: `Policy ${policy.name} ${effect}`,
          conditions: policy.conditions
        };
      }
    }

    return { granted: effect === 'deny', reason: 'No matching policy' };
  }

  private isPolicyApplicable(policy: AccessPolicy, context: AccessContext): boolean {
    // Check if principal matches
    const principalMatch = policy.principals.includes(context.userRole) ||
                          policy.principals.includes(context.userId.toString()) ||
                          policy.principals.includes('*');

    if (!principalMatch) return false;

    // Check if resource matches
    const resourceMatch = policy.resources.includes(context.resource) ||
                         policy.resources.includes('*') ||
                         policy.resources.some(r => this.matchResource(r, context.resource));

    if (!resourceMatch) return false;

    // Check if action matches
    const actionMatch = policy.actions.includes(context.action) ||
                       policy.actions.includes('*');

    return actionMatch;
  }

  private matchResource(pattern: string, resource: string): boolean {
    // Support wildcard patterns
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(resource);
  }

  private async evaluateRolePermissions(context: AccessContext): Promise<AccessDecision> {
    const role = this.roles.get(context.userRole);
    if (!role) {
      return { granted: false, reason: 'Role not found' };
    }

    // Get all permissions including inherited ones
    const allPermissions = await this.getAllPermissions(role);

    for (const permission of allPermissions) {
      if (this.matchPermission(permission, context)) {
        if (this.evaluateConditions(permission.conditions || [], context)) {
          return {
            granted: true,
            reason: `Granted by role ${role.name}`,
            appliedRole: role.id,
            appliedPermission: permission,
            conditions: permission.conditions
          };
        }
      }
    }

    return { granted: false, reason: 'No matching permissions' };
  }

  private async getAllPermissions(role: Role): Promise<Permission[]> {
    const permissions = [...role.permissions];

    // Add inherited permissions
    if (role.inherits) {
      for (const inheritedRoleId of role.inherits) {
        const inheritedRole = this.roles.get(inheritedRoleId);
        if (inheritedRole) {
          const inheritedPermissions = await this.getAllPermissions(inheritedRole);
          permissions.push(...inheritedPermissions);
        }
      }
    }

    return permissions;
  }

  private matchPermission(permission: Permission, context: AccessContext): boolean {
    const resourceMatch = permission.resource === '*' ||
                         permission.resource === context.resource ||
                         this.matchResource(permission.resource, context.resource);

    if (!resourceMatch) return false;

    const actionMatch = permission.actions.includes('*') ||
                       permission.actions.includes(context.action);

    return actionMatch;
  }

  private evaluateConditions(conditions: AccessCondition[], context: AccessContext): boolean {
    if (conditions.length === 0) return true;

    for (const condition of conditions) {
      if (!this.evaluateCondition(condition, context)) {
        return false;
      }
    }

    return true;
  }

  private evaluateCondition(condition: AccessCondition, context: AccessContext): boolean {
    switch (condition.type) {
      case 'ownership':
        return context.resourceOwner === context.userId;
      
      case 'time':
        if (condition.field === 'hour') {
          const hour = new Date().getHours();
          return this.compareValue(hour, condition.operator!, condition.value);
        }
        return true;
      
      case 'location':
        if (condition.field === 'ip' && context.ipAddress) {
          return this.compareValue(context.ipAddress, condition.operator!, condition.value);
        }
        return true;
      
      case 'attribute':
        const value = (context.metadata as any)?.[condition.field!];
        return this.compareValue(value, condition.operator!, condition.value);
      
      case 'custom':
        return condition.evaluator ? condition.evaluator(context) : true;
      
      default:
        return true;
    }
  }

  private compareValue(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'not_equals':
        return actual !== expected;
      case 'greater_than':
        return actual > expected;
      case 'less_than':
        return actual < expected;
      case 'in':
        return Array.isArray(expected) && expected.includes(actual);
      case 'not_in':
        return Array.isArray(expected) && !expected.includes(actual);
      default:
        return false;
    }
  }

  private async auditAccess(context: AccessContext, decision: AccessDecision) {
    try {
      await db.insert(auditLogs).values({
        userId: context.userId,
        action: `access_${decision.granted ? 'granted' : 'denied'}`,
        resourceType: context.resource,
        resourceId: context.resourceId || 'N/A',
        details: {
          action: context.action,
          decision,
          context
        },
        ipAddress: context.ipAddress || 'unknown',
        userAgent: 'system'
      });
    } catch (error) {
      logger.error('Failed to audit access:', error);
    }
  }

  // Role management
  public createRole(role: Role): void {
    if (this.roles.has(role.id)) {
      throw new Error(`Role ${role.id} already exists`);
    }
    this.roles.set(role.id, role);
    this.emit('role_created', role);
  }

  public updateRole(roleId: string, updates: Partial<Role>): void {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }
    if (role.isSystem) {
      throw new Error(`System role ${roleId} cannot be modified`);
    }
    this.roles.set(roleId, { ...role, ...updates });
    this.clearCache(); // Clear cache when roles change
    this.emit('role_updated', { roleId, updates });
  }

  public deleteRole(roleId: string): void {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }
    if (role.isSystem) {
      throw new Error(`System role ${roleId} cannot be deleted`);
    }
    this.roles.delete(roleId);
    this.clearCache();
    this.emit('role_deleted', roleId);
  }

  // Template synchronization setup
  private setupTemplateSync() {
    // Listen for template events to update roles
    roleTemplateManager.on('template:applied', (data) => {
      logger.info(`Template ${data.template} applied to create role ${data.role}`);
    });

    roleTemplateManager.on('template:updated', (template) => {
      // Check if any roles need to be updated based on this template
      this.syncRolesFromTemplate(template.id);
    });
  }

  private async syncRolesFromTemplate(templateId: string) {
    // Find roles that were created from this template
    const rolesFromTemplate = Array.from(this.roles.values()).filter(
      role => role.metadata?.appliedFrom === templateId
    );

    if (rolesFromTemplate.length > 0) {
      const template = roleTemplateManager.getTemplate(templateId);
      if (template) {
        for (const role of rolesFromTemplate) {
          // Update role permissions from template while preserving customizations
          const updatedRole = {
            ...role,
            permissions: template.permissions,
            updatedAt: new Date()
          };
          this.roles.set(role.id, updatedRole);
          logger.info(`Synced role ${role.id} from template ${templateId}`);
        }
      }
    }
  }

  // Create role from template
  public async createRoleFromTemplate(templateId: string, options?: {
    targetRoleId?: string;
    modifications?: any;
    applyToUsers?: number[];
  }): Promise<Role> {
    const application = {
      templateId,
      ...options
    };

    const role = await roleTemplateManager.applyTemplate(application);
    this.createRole(role);

    // Apply to users if specified
    if (options?.applyToUsers && options.applyToUsers.length > 0) {
      for (const userId of options.applyToUsers) {
        await this.assignRoleToUser(userId, role.id);
      }
    }

    return role;
  }

  // Get template suggestions for a user based on their activity
  public async getTemplateSuggestions(userId: number): Promise<string[]> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) return [];

    const suggestions: string[] = [];
    const currentRole = user[0].role;

    // Suggest upgrades based on current role
    if (currentRole === 'user') {
      suggestions.push('support-agent', 'data-analyst');
    } else if (currentRole === 'support-agent') {
      suggestions.push('user-admin', 'developer');
    }

    return suggestions;
  }

  // Validate template application
  public validateTemplateApplication(templateId: string, targetRoleId?: string): {
    valid: boolean;
    conflicts: string[];
    warnings: string[];
  } {
    const template = roleTemplateManager.getTemplate(templateId);
    if (!template) {
      return { valid: false, conflicts: ['Template not found'], warnings: [] };
    }

    const conflicts: string[] = [];
    const warnings: string[] = [];

    if (targetRoleId) {
      const existingRole = this.roles.get(targetRoleId);
      if (existingRole) {
        if (existingRole.isSystem) {
          conflicts.push('Cannot modify system role');
        }
        if (existingRole.priority > template.priority) {
          warnings.push('Template has lower priority than existing role');
        }
      }
    }

    // Check for permission conflicts with other roles
    for (const permission of template.permissions) {
      if (permission.resource === '*' && permission.actions.includes('*')) {
        warnings.push('Template grants full system access');
      }
    }

    return {
      valid: conflicts.length === 0,
      conflicts,
      warnings
    };
  }

  // Helper method to assign role to user
  private async assignRoleToUser(userId: number, roleId: string): Promise<void> {
    await db.update(users)
      .set({ role: roleId, updatedAt: new Date() })
      .where(eq(users.id, userId));
    
    logger.info(`Assigned role ${roleId} to user ${userId}`);
  }

  // Get template-based statistics
  public getTemplateStatistics(): {
    rolesFromTemplates: number;
    customRoles: number;
    templateUsage: Record<string, number>;
  } {
    let rolesFromTemplates = 0;
    let customRoles = 0;
    const templateUsage: Record<string, number> = {};

    for (const role of this.roles.values()) {
      if (role.metadata?.appliedFrom) {
        rolesFromTemplates++;
        templateUsage[role.metadata.appliedFrom] = (templateUsage[role.metadata.appliedFrom] || 0) + 1;
      } else if (!role.isSystem) {
        customRoles++;
      }
    }

    return {
      rolesFromTemplates,
      customRoles,
      templateUsage
    };
  }

  public getRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  public getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  // Permission management
  public grantPermission(roleId: string, permission: Permission): void {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }
    role.permissions.push(permission);
    this.clearCache();
    this.emit('permission_granted', { roleId, permission });
  }

  public revokePermission(roleId: string, permissionId: string): void {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }
    role.permissions = role.permissions.filter(p => p.id !== permissionId);
    this.clearCache();
    this.emit('permission_revoked', { roleId, permissionId });
  }

  // Policy management
  public createPolicy(policy: AccessPolicy): void {
    if (this.policies.has(policy.id)) {
      throw new Error(`Policy ${policy.id} already exists`);
    }
    this.policies.set(policy.id, policy);
    this.clearCache();
    this.emit('policy_created', policy);
  }

  public updatePolicy(policyId: string, updates: Partial<AccessPolicy>): void {
    const policy = this.policies.get(policyId);
    if (!policy) {
      throw new Error(`Policy ${policyId} not found`);
    }
    this.policies.set(policyId, { ...policy, ...updates });
    this.clearCache();
    this.emit('policy_updated', { policyId, updates });
  }

  public deletePolicy(policyId: string): void {
    this.policies.delete(policyId);
    this.clearCache();
    this.emit('policy_deleted', policyId);
  }

  public getPolicies(): AccessPolicy[] {
    return Array.from(this.policies.values());
  }

  // Resource management
  public registerResource(resource: ResourceDefinition): void {
    this.resources.set(resource.id, resource);
    this.emit('resource_registered', resource);
  }

  public getResources(): ResourceDefinition[] {
    return Array.from(this.resources.values());
  }

  // Cache management
  private clearCache(): void {
    this.accessCache.clear();
  }

  // Express middleware
  public middleware(resource: string, action: string) {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const context: AccessContext = {
        userId: req.user.id,
        userRole: req.user.role,
        userPermissions: req.user.permissions || [],
        resource,
        action,
        resourceId: req.params.id,
        requestTime: new Date(),
        ipAddress: req.ip,
        metadata: {
          method: req.method,
          path: req.path,
          query: req.query,
          body: req.body
        }
      };

      // Check for resource ownership if needed
      const resourceDef = this.resources.get(resource);
      if (resourceDef?.ownershipField && req.params.id) {
        // This would need to be implemented based on your data access layer
        // For now, we'll skip ownership check
      }

      const decision = await this.checkAccess(context);

      if (!decision.granted) {
        logger.warn('Access denied', {
          userId: context.userId,
          resource,
          action,
          reason: decision.reason
        });
        return res.status(403).json({
          error: 'Access denied',
          reason: decision.reason
        });
      }

      next();
    };
  }

  // Helper methods for common checks
  public async canUserAccessResource(userId: number, resource: string, action: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return false;

    const context: AccessContext = {
      userId,
      userRole: user.role,
      userPermissions: user.permissions as string[] || [],
      resource,
      action,
      requestTime: new Date()
    };

    const decision = await this.checkAccess(context);
    return decision.granted;
  }

  public async getUserPermissions(userId: number): Promise<Permission[]> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return [];

    const role = this.roles.get(user.role);
    if (!role) return [];

    return this.getAllPermissions(role);
  }

  // Statistics and reporting
  public getAccessStatistics() {
    return {
      totalRoles: this.roles.size,
      systemRoles: Array.from(this.roles.values()).filter(r => r.isSystem).length,
      customRoles: Array.from(this.roles.values()).filter(r => !r.isSystem).length,
      totalPolicies: this.policies.size,
      totalResources: this.resources.size,
      cacheSize: this.accessCache.size
    };
  }
}

export const accessControlManager = AccessControlManager.getInstance();