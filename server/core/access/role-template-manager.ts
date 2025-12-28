/**
 * Role Template Manager
 * Provides pre-defined role templates and permission presets for quick security setup
 */

import { EventEmitter } from 'events';
import { Role, Permission, AccessCondition } from './access-control-manager';
import { logger } from '../../utils/logger';
import { db } from '../database/db.service';
import { auditLogs } from '@db/schema';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'security' | 'business' | 'development' | 'compliance' | 'custom';
  permissions: Permission[];
  inherits?: string[];
  priority: number;
  isEditable: boolean;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    author?: string;
    organization?: string;
    department?: string;
    projectId?: string;
    expiresAt?: Date;
    tags?: string[];
  };
}

export interface PermissionPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  permissions: Permission[];
  dependencies?: string[]; // Other preset IDs required
  conflicts?: string[]; // Preset IDs that conflict
}

export interface SetupWizardConfig {
  organizationType: 'startup' | 'enterprise' | 'government' | 'nonprofit' | 'educational';
  departments?: string[];
  projectId?: string;
  userCount?: number;
  complianceRequirements?: string[];
  securityLevel: 'basic' | 'standard' | 'high' | 'maximum';
}

export interface TemplateApplication {
  templateId: string;
  targetRoleId?: string; // If updating existing role
  modifications?: {
    addPermissions?: Permission[];
    removePermissions?: string[]; // Permission IDs
    priority?: number;
    metadata?: Record<string, any>;
  };
  applyToUsers?: number[]; // User IDs to assign the role
}

export interface TemplateExport {
  version: string;
  exportDate: Date;
  templates: RoleTemplate[];
  presets: PermissionPreset[];
  metadata: {
    organization?: string;
    description?: string;
    author?: string;
  };
}

class RoleTemplateManager extends EventEmitter {
  private static instance: RoleTemplateManager;
  private templates: Map<string, RoleTemplate> = new Map();
  private presets: Map<string, PermissionPreset> = new Map();
  private customTemplates: Map<string, RoleTemplate> = new Map();
  private templateHistory: Map<string, RoleTemplate[]> = new Map(); // Version history
  private readonly TEMPLATE_DIR = path.join(process.cwd(), 'config', 'security', 'templates');
  
  private constructor() {
    super();
    this.initializeTemplates();
    this.initializePresets();
    this.loadCustomTemplates();
  }

  public static getInstance(): RoleTemplateManager {
    if (!RoleTemplateManager.instance) {
      RoleTemplateManager.instance = new RoleTemplateManager();
    }
    return RoleTemplateManager.instance;
  }

  private initializeTemplates() {
    // System Administrator Template
    this.templates.set('system-admin', {
      id: 'system-admin',
      name: 'System Administrator',
      description: 'Full system access with no restrictions',
      category: 'system',
      permissions: [
        {
          id: 'system-admin-all',
          resource: '*',
          actions: ['*'],
          description: 'Full system access'
        }
      ],
      priority: 1000,
      isEditable: false,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Security Officer Template
    this.templates.set('security-officer', {
      id: 'security-officer',
      name: 'Security Officer',
      description: 'Manages security policies, threat detection, and incident response',
      category: 'security',
      permissions: [
        {
          id: 'security-policies',
          resource: 'security.policies',
          actions: ['create', 'read', 'update', 'delete'],
          description: 'Manage security policies'
        },
        {
          id: 'security-threats',
          resource: 'security.threats',
          actions: ['read', 'analyze', 'respond', 'report'],
          description: 'Handle security threats'
        },
        {
          id: 'security-audit',
          resource: 'audit',
          actions: ['read', 'export', 'analyze'],
          description: 'Access audit logs'
        },
        {
          id: 'security-users',
          resource: 'users',
          actions: ['read', 'suspend', 'investigate'],
          description: 'Investigate user activities'
        },
        {
          id: 'security-incidents',
          resource: 'security.incidents',
          actions: ['create', 'read', 'update', 'escalate'],
          description: 'Manage security incidents'
        }
      ],
      priority: 950,
      isEditable: true,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // User Administrator Template
    this.templates.set('user-admin', {
      id: 'user-admin',
      name: 'User Administrator',
      description: 'Manages user accounts, roles, and permissions',
      category: 'system',
      permissions: [
        {
          id: 'user-management',
          resource: 'users',
          actions: ['create', 'read', 'update', 'delete', 'activate', 'deactivate'],
          description: 'Full user management'
        },
        {
          id: 'role-management',
          resource: 'roles',
          actions: ['create', 'read', 'update', 'assign'],
          description: 'Manage user roles'
        },
        {
          id: 'permission-management',
          resource: 'permissions',
          actions: ['read', 'assign', 'revoke'],
          description: 'Manage user permissions'
        },
        {
          id: 'user-audit',
          resource: 'audit.users',
          actions: ['read', 'export'],
          description: 'View user audit logs'
        }
      ],
      priority: 800,
      isEditable: true,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Auditor Template
    this.templates.set('auditor', {
      id: 'auditor',
      name: 'Auditor',
      description: 'Read-only access to all logs, reports, and compliance data',
      category: 'compliance',
      permissions: [
        {
          id: 'audit-logs',
          resource: 'audit.*',
          actions: ['read', 'export'],
          description: 'Access all audit logs'
        },
        {
          id: 'audit-reports',
          resource: 'reports.*',
          actions: ['read', 'generate', 'export'],
          description: 'Generate and view reports'
        },
        {
          id: 'audit-compliance',
          resource: 'compliance.*',
          actions: ['read', 'analyze'],
          description: 'View compliance status'
        },
        {
          id: 'audit-users',
          resource: 'users',
          actions: ['read'],
          description: 'View user information'
        },
        {
          id: 'audit-security',
          resource: 'security.logs',
          actions: ['read'],
          description: 'View security logs'
        }
      ],
      priority: 600,
      isEditable: true,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Developer Template
    this.templates.set('developer', {
      id: 'developer',
      name: 'Developer',
      description: 'Access to development tools, APIs, and testing resources',
      category: 'development',
      permissions: [
        {
          id: 'dev-api',
          resource: 'api.*',
          actions: ['read', 'test', 'debug'],
          description: 'API access and testing'
        },
        {
          id: 'dev-logs',
          resource: 'logs.application',
          actions: ['read', 'analyze'],
          description: 'View application logs'
        },
        {
          id: 'dev-database',
          resource: 'database.dev',
          actions: ['read', 'write', 'migrate'],
          description: 'Development database access'
        },
        {
          id: 'dev-deploy',
          resource: 'deployment.staging',
          actions: ['deploy', 'rollback', 'monitor'],
          description: 'Staging deployment'
        },
        {
          id: 'dev-monitoring',
          resource: 'monitoring.dev',
          actions: ['read', 'configure'],
          description: 'Development monitoring'
        }
      ],
      priority: 500,
      isEditable: true,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Support Agent Template
    this.templates.set('support-agent', {
      id: 'support-agent',
      name: 'Support Agent',
      description: 'Limited access for user assistance and basic troubleshooting',
      category: 'business',
      permissions: [
        {
          id: 'support-users',
          resource: 'users',
          actions: ['read', 'reset-password', 'unlock'],
          description: 'Basic user support'
        },
        {
          id: 'support-tickets',
          resource: 'support.tickets',
          actions: ['create', 'read', 'update', 'close'],
          description: 'Manage support tickets'
        },
        {
          id: 'support-knowledge',
          resource: 'knowledge.base',
          actions: ['read', 'create', 'update'],
          description: 'Knowledge base management'
        },
        {
          id: 'support-communication',
          resource: 'communication.users',
          actions: ['send', 'read'],
          description: 'User communication'
        }
      ],
      priority: 400,
      isEditable: true,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Data Analyst Template
    this.templates.set('data-analyst', {
      id: 'data-analyst',
      name: 'Data Analyst',
      description: 'Access to analytics, reporting, and data visualization tools',
      category: 'business',
      permissions: [
        {
          id: 'analyst-data',
          resource: 'analytics.*',
          actions: ['read', 'analyze', 'export'],
          description: 'Full analytics access'
        },
        {
          id: 'analyst-reports',
          resource: 'reports',
          actions: ['create', 'read', 'update', 'schedule', 'export'],
          description: 'Report management'
        },
        {
          id: 'analyst-dashboards',
          resource: 'dashboards',
          actions: ['create', 'read', 'update', 'share'],
          description: 'Dashboard management'
        },
        {
          id: 'analyst-database',
          resource: 'database.readonly',
          actions: ['read', 'query'],
          description: 'Read-only database access'
        },
        {
          id: 'analyst-visualization',
          resource: 'visualization',
          actions: ['create', 'read', 'update', 'export'],
          description: 'Data visualization tools'
        }
      ],
      priority: 450,
      isEditable: true,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Compliance Officer Template
    this.templates.set('compliance-officer', {
      id: 'compliance-officer',
      name: 'Compliance Officer',
      description: 'Manages compliance policies, audits, and regulatory requirements',
      category: 'compliance',
      permissions: [
        {
          id: 'compliance-policies',
          resource: 'compliance.policies',
          actions: ['create', 'read', 'update', 'approve'],
          description: 'Manage compliance policies'
        },
        {
          id: 'compliance-audit',
          resource: 'compliance.audit',
          actions: ['schedule', 'execute', 'review', 'report'],
          description: 'Compliance auditing'
        },
        {
          id: 'compliance-reports',
          resource: 'compliance.reports',
          actions: ['create', 'read', 'submit', 'export'],
          description: 'Compliance reporting'
        },
        {
          id: 'compliance-training',
          resource: 'compliance.training',
          actions: ['create', 'assign', 'track', 'report'],
          description: 'Compliance training management'
        },
        {
          id: 'compliance-incidents',
          resource: 'compliance.incidents',
          actions: ['investigate', 'report', 'remediate'],
          description: 'Compliance incident management'
        }
      ],
      priority: 650,
      isEditable: true,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Guest Template
    this.templates.set('guest', {
      id: 'guest',
      name: 'Guest',
      description: 'Minimal read-only access for visitors',
      category: 'system',
      permissions: [
        {
          id: 'guest-public',
          resource: 'public.*',
          actions: ['read'],
          description: 'Public content access'
        },
        {
          id: 'guest-help',
          resource: 'help',
          actions: ['read'],
          description: 'Help documentation'
        }
      ],
      priority: 100,
      isEditable: true,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  private initializePresets() {
    // User Management Permissions
    this.presets.set('user-management', {
      id: 'user-management',
      name: 'User Management Permissions',
      description: 'Complete set of user management permissions',
      category: 'management',
      permissions: [
        {
          id: 'preset-user-crud',
          resource: 'users',
          actions: ['create', 'read', 'update', 'delete'],
          description: 'User CRUD operations'
        },
        {
          id: 'preset-user-status',
          resource: 'users.status',
          actions: ['activate', 'deactivate', 'suspend', 'unlock'],
          description: 'User status management'
        },
        {
          id: 'preset-user-roles',
          resource: 'users.roles',
          actions: ['assign', 'revoke', 'view'],
          description: 'User role management'
        },
        {
          id: 'preset-user-permissions',
          resource: 'users.permissions',
          actions: ['grant', 'revoke', 'view'],
          description: 'User permission management'
        }
      ]
    });

    // Security Configuration Permissions
    this.presets.set('security-config', {
      id: 'security-config',
      name: 'Security Configuration Permissions',
      description: 'Permissions for configuring security settings',
      category: 'security',
      permissions: [
        {
          id: 'preset-security-policies',
          resource: 'security.policies',
          actions: ['create', 'read', 'update', 'delete', 'enforce'],
          description: 'Security policy management'
        },
        {
          id: 'preset-security-rules',
          resource: 'security.rules',
          actions: ['create', 'read', 'update', 'delete', 'test'],
          description: 'Security rule configuration'
        },
        {
          id: 'preset-security-threats',
          resource: 'security.threats',
          actions: ['monitor', 'analyze', 'block', 'report'],
          description: 'Threat management'
        },
        {
          id: 'preset-security-2fa',
          resource: 'security.2fa',
          actions: ['enable', 'disable', 'configure', 'reset'],
          description: 'Two-factor authentication'
        }
      ]
    });

    // Audit and Compliance Permissions
    this.presets.set('audit-compliance', {
      id: 'audit-compliance',
      name: 'Audit and Compliance Permissions',
      description: 'Permissions for audit and compliance activities',
      category: 'compliance',
      permissions: [
        {
          id: 'preset-audit-logs',
          resource: 'audit.logs',
          actions: ['read', 'export', 'analyze', 'archive'],
          description: 'Audit log management'
        },
        {
          id: 'preset-audit-reports',
          resource: 'audit.reports',
          actions: ['generate', 'read', 'export', 'schedule'],
          description: 'Audit reporting'
        },
        {
          id: 'preset-compliance-policies',
          resource: 'compliance.policies',
          actions: ['create', 'read', 'update', 'enforce'],
          description: 'Compliance policy management'
        },
        {
          id: 'preset-compliance-assessment',
          resource: 'compliance.assessment',
          actions: ['execute', 'review', 'approve', 'report'],
          description: 'Compliance assessment'
        }
      ]
    });

    // System Configuration Permissions
    this.presets.set('system-config', {
      id: 'system-config',
      name: 'System Configuration Permissions',
      description: 'Permissions for system configuration and settings',
      category: 'system',
      permissions: [
        {
          id: 'preset-system-settings',
          resource: 'system.settings',
          actions: ['read', 'update', 'reset'],
          description: 'System settings'
        },
        {
          id: 'preset-system-integrations',
          resource: 'system.integrations',
          actions: ['create', 'read', 'update', 'delete', 'test'],
          description: 'Integration management'
        },
        {
          id: 'preset-system-backup',
          resource: 'system.backup',
          actions: ['create', 'restore', 'schedule', 'download'],
          description: 'Backup management'
        },
        {
          id: 'preset-system-maintenance',
          resource: 'system.maintenance',
          actions: ['schedule', 'execute', 'monitor'],
          description: 'System maintenance'
        }
      ]
    });

    // Data Access Permissions
    this.presets.set('data-access', {
      id: 'data-access',
      name: 'Data Access Permissions',
      description: 'Permissions for data access and manipulation',
      category: 'data',
      permissions: [
        {
          id: 'preset-data-read',
          resource: 'data.*',
          actions: ['read', 'search', 'filter'],
          description: 'Data read access'
        },
        {
          id: 'preset-data-write',
          resource: 'data.*',
          actions: ['create', 'update', 'delete'],
          description: 'Data write access'
        },
        {
          id: 'preset-data-export',
          resource: 'data.export',
          actions: ['csv', 'json', 'pdf', 'excel'],
          description: 'Data export'
        },
        {
          id: 'preset-data-import',
          resource: 'data.import',
          actions: ['upload', 'validate', 'process'],
          description: 'Data import'
        }
      ]
    });

    // API Management Permissions
    this.presets.set('api-management', {
      id: 'api-management',
      name: 'API Management Permissions',
      description: 'Permissions for API configuration and management',
      category: 'development',
      permissions: [
        {
          id: 'preset-api-keys',
          resource: 'api.keys',
          actions: ['create', 'read', 'revoke', 'rotate'],
          description: 'API key management'
        },
        {
          id: 'preset-api-endpoints',
          resource: 'api.endpoints',
          actions: ['read', 'test', 'monitor'],
          description: 'API endpoint access'
        },
        {
          id: 'preset-api-rate-limits',
          resource: 'api.rate-limits',
          actions: ['configure', 'override', 'monitor'],
          description: 'Rate limit management'
        },
        {
          id: 'preset-api-webhooks',
          resource: 'api.webhooks',
          actions: ['create', 'read', 'update', 'delete', 'test'],
          description: 'Webhook management'
        }
      ]
    });

    // Report Generation Permissions
    this.presets.set('report-generation', {
      id: 'report-generation',
      name: 'Report Generation Permissions',
      description: 'Permissions for creating and managing reports',
      category: 'reporting',
      permissions: [
        {
          id: 'preset-report-create',
          resource: 'reports',
          actions: ['create', 'customize', 'save'],
          description: 'Report creation'
        },
        {
          id: 'preset-report-schedule',
          resource: 'reports.schedule',
          actions: ['create', 'update', 'delete', 'execute'],
          description: 'Report scheduling'
        },
        {
          id: 'preset-report-share',
          resource: 'reports.sharing',
          actions: ['share', 'publish', 'email'],
          description: 'Report sharing'
        },
        {
          id: 'preset-report-templates',
          resource: 'reports.templates',
          actions: ['create', 'read', 'update', 'delete'],
          description: 'Report templates'
        }
      ]
    });
  }

  private async loadCustomTemplates() {
    try {
      await fs.mkdir(this.TEMPLATE_DIR, { recursive: true });
      const files = await fs.readdir(this.TEMPLATE_DIR);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(this.TEMPLATE_DIR, file), 'utf-8');
          const template = JSON.parse(content) as RoleTemplate;
          this.customTemplates.set(template.id, template);
        }
      }
      
      logger.info(`Loaded ${this.customTemplates.size} custom templates`);
    } catch (error) {
      logger.error('Failed to load custom templates:', error);
    }
  }

  // Template Management Methods
  public getAllTemplates(): RoleTemplate[] {
    return [
      ...Array.from(this.templates.values()),
      ...Array.from(this.customTemplates.values())
    ];
  }

  public getTemplate(id: string): RoleTemplate | undefined {
    return this.templates.get(id) || this.customTemplates.get(id);
  }

  public getTemplatesByCategory(category: string): RoleTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  public async createCustomTemplate(template: Omit<RoleTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoleTemplate> {
    const newTemplate: RoleTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0'
    };

    this.customTemplates.set(newTemplate.id, newTemplate);
    await this.saveTemplate(newTemplate);
    
    this.emit('template:created', newTemplate);
    logger.info(`Created custom template: ${newTemplate.id}`);
    
    return newTemplate;
  }

  public async cloneTemplate(templateId: string, modifications?: Partial<RoleTemplate>): Promise<RoleTemplate> {
    const original = this.getTemplate(templateId);
    if (!original) {
      throw new Error(`Template ${templateId} not found`);
    }

    const cloned: RoleTemplate = {
      ...original,
      ...modifications,
      id: `clone-${Date.now()}`,
      name: modifications?.name || `${original.name} (Clone)`,
      category: 'custom',
      isEditable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0'
    };

    this.customTemplates.set(cloned.id, cloned);
    await this.saveTemplate(cloned);
    
    this.emit('template:cloned', { original: templateId, clone: cloned.id });
    logger.info(`Cloned template ${templateId} to ${cloned.id}`);
    
    return cloned;
  }

  public async updateTemplate(id: string, updates: Partial<RoleTemplate>): Promise<RoleTemplate> {
    const template = this.customTemplates.get(id);
    if (!template) {
      throw new Error(`Custom template ${id} not found`);
    }

    if (!template.isEditable) {
      throw new Error(`Template ${id} is not editable`);
    }

    // Save version history
    const history = this.templateHistory.get(id) || [];
    history.push({ ...template });
    this.templateHistory.set(id, history);

    // Update template
    const updated: RoleTemplate = {
      ...template,
      ...updates,
      id, // Preserve ID
      updatedAt: new Date(),
      version: this.incrementVersion(template.version)
    };

    this.customTemplates.set(id, updated);
    await this.saveTemplate(updated);
    
    this.emit('template:updated', updated);
    logger.info(`Updated template: ${id}`);
    
    return updated;
  }

  public async deleteTemplate(id: string): Promise<void> {
    const template = this.customTemplates.get(id);
    if (!template) {
      throw new Error(`Custom template ${id} not found`);
    }

    this.customTemplates.delete(id);
    await fs.unlink(path.join(this.TEMPLATE_DIR, `${id}.json`));
    
    this.emit('template:deleted', id);
    logger.info(`Deleted template: ${id}`);
  }

  // Preset Management Methods
  public getAllPresets(): PermissionPreset[] {
    return Array.from(this.presets.values());
  }

  public getPreset(id: string): PermissionPreset | undefined {
    return this.presets.get(id);
  }

  public getPresetsByCategory(category: string): PermissionPreset[] {
    return this.getAllPresets().filter(p => p.category === category);
  }

  public combinePresets(presetIds: string[]): Permission[] {
    const combined: Map<string, Permission> = new Map();
    
    for (const id of presetIds) {
      const preset = this.presets.get(id);
      if (preset) {
        for (const permission of preset.permissions) {
          const existing = combined.get(permission.id);
          if (existing) {
            // Merge actions
            const mergedActions = Array.from(new Set([...existing.actions, ...permission.actions]));
            combined.set(permission.id, { ...permission, actions: mergedActions });
          } else {
            combined.set(permission.id, permission);
          }
        }
      }
    }
    
    return Array.from(combined.values());
  }

  // Template Application Methods
  public async applyTemplate(application: TemplateApplication): Promise<Role> {
    const template = this.getTemplate(application.templateId);
    if (!template) {
      throw new Error(`Template ${application.templateId} not found`);
    }

    let permissions = [...template.permissions];
    
    // Apply modifications if provided
    if (application.modifications) {
      if (application.modifications.addPermissions) {
        permissions.push(...application.modifications.addPermissions);
      }
      if (application.modifications.removePermissions) {
        permissions = permissions.filter(p => 
          !application.modifications!.removePermissions!.includes(p.id)
        );
      }
    }

    const role: Role = {
      id: application.targetRoleId || `role-${Date.now()}`,
      name: template.name,
      description: template.description,
      permissions,
      inherits: template.inherits,
      priority: application.modifications?.priority ?? template.priority,
      isSystem: false,
      metadata: {
        ...template.metadata,
        ...application.modifications?.metadata,
        appliedFrom: template.id,
        appliedAt: new Date()
      }
    };

    this.emit('template:applied', { template: template.id, role: role.id });
    logger.info(`Applied template ${template.id} to create role ${role.id}`);
    
    return role;
  }

  public validateTemplate(template: RoleTemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.name || template.name.trim().length === 0) {
      errors.push('Template name is required');
    }

    if (!template.permissions || template.permissions.length === 0) {
      errors.push('Template must have at least one permission');
    }

    for (const permission of template.permissions) {
      if (!permission.resource) {
        errors.push(`Permission ${permission.id} missing resource`);
      }
      if (!permission.actions || permission.actions.length === 0) {
        errors.push(`Permission ${permission.id} missing actions`);
      }
    }

    if (template.priority < 0 || template.priority > 1000) {
      errors.push('Priority must be between 0 and 1000');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Setup Wizard Methods
  public async runSetupWizard(config: SetupWizardConfig): Promise<{
    roles: Role[];
    assignments: Map<string, string[]>; // Role ID -> User IDs
  }> {
    const roles: Role[] = [];
    const assignments = new Map<string, string[]>();

    // Select templates based on organization type
    const selectedTemplates = this.selectTemplatesForOrganization(config);

    // Apply security level adjustments
    const adjustedTemplates = this.adjustTemplatesForSecurityLevel(selectedTemplates, config.securityLevel);

    // Create roles from templates
    for (const template of adjustedTemplates) {
      const role = await this.applyTemplate({
        templateId: template.id,
        modifications: {
          metadata: {
            organizationType: config.organizationType,
            securityLevel: config.securityLevel,
            setupWizard: true
          }
        }
      });
      roles.push(role);
    }

    // Add department-specific roles if needed
    if (config.departments && config.departments.length > 0) {
      const deptRoles = await this.createDepartmentRoles(config.departments, config.securityLevel);
      roles.push(...deptRoles);
    }

    // Add compliance-specific roles
    if (config.complianceRequirements && config.complianceRequirements.length > 0) {
      const complianceRoles = await this.createComplianceRoles(config.complianceRequirements);
      roles.push(...complianceRoles);
    }

    this.emit('wizard:completed', { config, roles });
    logger.info(`Setup wizard completed: Created ${roles.length} roles`);

    return { roles, assignments };
  }

  private selectTemplatesForOrganization(config: SetupWizardConfig): RoleTemplate[] {
    const templates: RoleTemplate[] = [];

    switch (config.organizationType) {
      case 'startup':
        templates.push(
          this.templates.get('system-admin')!,
          this.templates.get('developer')!,
          this.templates.get('data-analyst')!
        );
        break;
      case 'enterprise':
        templates.push(
          this.templates.get('system-admin')!,
          this.templates.get('security-officer')!,
          this.templates.get('user-admin')!,
          this.templates.get('auditor')!,
          this.templates.get('compliance-officer')!,
          this.templates.get('data-analyst')!,
          this.templates.get('support-agent')!
        );
        break;
      case 'government':
        templates.push(
          this.templates.get('system-admin')!,
          this.templates.get('security-officer')!,
          this.templates.get('auditor')!,
          this.templates.get('compliance-officer')!,
          this.templates.get('user-admin')!
        );
        break;
      case 'nonprofit':
        templates.push(
          this.templates.get('user-admin')!,
          this.templates.get('data-analyst')!,
          this.templates.get('support-agent')!
        );
        break;
      case 'educational':
        templates.push(
          this.templates.get('user-admin')!,
          this.templates.get('support-agent')!,
          this.templates.get('data-analyst')!
        );
        break;
    }

    return templates.filter(Boolean);
  }

  private adjustTemplatesForSecurityLevel(
    templates: RoleTemplate[],
    securityLevel: string
  ): RoleTemplate[] {
    return templates.map(template => {
      const adjusted = { ...template };

      switch (securityLevel) {
        case 'maximum':
          // Add additional restrictions and audit requirements
          adjusted.permissions = adjusted.permissions.map(p => ({
            ...p,
            conditions: [
              ...(p.conditions || []),
              {
                type: 'custom' as const,
                evaluator: () => true // Placeholder for additional checks
              }
            ]
          }));
          break;
        case 'high':
          // Add moderate restrictions
          adjusted.priority = Math.min(adjusted.priority - 50, 0);
          break;
        case 'standard':
          // Keep default settings
          break;
        case 'basic':
          // Relax some restrictions
          adjusted.priority = Math.min(adjusted.priority + 50, 1000);
          break;
      }

      return adjusted;
    });
  }

  private async createDepartmentRoles(departments: string[], securityLevel: string): Promise<Role[]> {
    const roles: Role[] = [];

    for (const dept of departments) {
      const deptRole: Role = {
        id: `dept-${dept.toLowerCase().replace(/\s+/g, '-')}`,
        name: `${dept} Team Member`,
        description: `Default role for ${dept} department`,
        permissions: this.getDepartmentPermissions(dept),
        priority: 300,
        isSystem: false,
        metadata: {
          department: dept,
          securityLevel
        }
      };
      roles.push(deptRole);
    }

    return roles;
  }

  private getDepartmentPermissions(department: string): Permission[] {
    // Return department-specific permissions based on department name
    const basePermissions: Permission[] = [
      {
        id: `dept-${department}-read`,
        resource: `department.${department.toLowerCase()}`,
        actions: ['read'],
        description: `Read access to ${department} resources`
      }
    ];

    // Add specific permissions based on department type
    if (department.toLowerCase().includes('engineering') || department.toLowerCase().includes('development')) {
      basePermissions.push(...this.getPreset('api-management')?.permissions || []);
    } else if (department.toLowerCase().includes('finance') || department.toLowerCase().includes('accounting')) {
      basePermissions.push(...this.getPreset('report-generation')?.permissions || []);
    } else if (department.toLowerCase().includes('hr') || department.toLowerCase().includes('human')) {
      basePermissions.push(...this.getPreset('user-management')?.permissions || []);
    }

    return basePermissions;
  }

  private async createComplianceRoles(requirements: string[]): Promise<Role[]> {
    const roles: Role[] = [];

    for (const requirement of requirements) {
      if (requirement.toLowerCase().includes('gdpr')) {
        roles.push(this.createGDPRRole());
      }
      if (requirement.toLowerCase().includes('hipaa')) {
        roles.push(this.createHIPAARole());
      }
      if (requirement.toLowerCase().includes('sox')) {
        roles.push(this.createSOXRole());
      }
      if (requirement.toLowerCase().includes('pci')) {
        roles.push(this.createPCIRole());
      }
    }

    return roles;
  }

  private createGDPRRole(): Role {
    return {
      id: 'gdpr-officer',
      name: 'GDPR Data Protection Officer',
      description: 'Ensures GDPR compliance and data protection',
      permissions: [
        {
          id: 'gdpr-data-access',
          resource: 'data.personal',
          actions: ['read', 'export', 'delete'],
          description: 'Personal data management'
        },
        {
          id: 'gdpr-consent',
          resource: 'consent',
          actions: ['read', 'update', 'audit'],
          description: 'Consent management'
        },
        {
          id: 'gdpr-audit',
          resource: 'audit.gdpr',
          actions: ['read', 'report', 'export'],
          description: 'GDPR audit trails'
        }
      ],
      priority: 700,
      isSystem: false,
      metadata: {
        compliance: 'GDPR'
      }
    };
  }

  private createHIPAARole(): Role {
    return {
      id: 'hipaa-officer',
      name: 'HIPAA Compliance Officer',
      description: 'Manages HIPAA compliance for healthcare data',
      permissions: [
        {
          id: 'hipaa-phi',
          resource: 'data.health',
          actions: ['read', 'audit'],
          description: 'Protected Health Information access'
        },
        {
          id: 'hipaa-access-control',
          resource: 'access.health',
          actions: ['configure', 'audit', 'report'],
          description: 'Healthcare data access control'
        },
        {
          id: 'hipaa-audit',
          resource: 'audit.hipaa',
          actions: ['read', 'report', 'investigate'],
          description: 'HIPAA audit and investigation'
        }
      ],
      priority: 750,
      isSystem: false,
      metadata: {
        compliance: 'HIPAA'
      }
    };
  }

  private createSOXRole(): Role {
    return {
      id: 'sox-officer',
      name: 'SOX Compliance Officer',
      description: 'Ensures Sarbanes-Oxley compliance',
      permissions: [
        {
          id: 'sox-financial',
          resource: 'data.financial',
          actions: ['read', 'audit', 'report'],
          description: 'Financial data oversight'
        },
        {
          id: 'sox-controls',
          resource: 'controls.financial',
          actions: ['configure', 'test', 'certify'],
          description: 'Financial control testing'
        },
        {
          id: 'sox-audit',
          resource: 'audit.sox',
          actions: ['read', 'report', 'certify'],
          description: 'SOX audit and certification'
        }
      ],
      priority: 725,
      isSystem: false,
      metadata: {
        compliance: 'SOX'
      }
    };
  }

  private createPCIRole(): Role {
    return {
      id: 'pci-officer',
      name: 'PCI DSS Compliance Officer',
      description: 'Manages PCI DSS compliance for payment card data',
      permissions: [
        {
          id: 'pci-cardholder',
          resource: 'data.payment',
          actions: ['audit', 'secure'],
          description: 'Cardholder data protection'
        },
        {
          id: 'pci-network',
          resource: 'network.payment',
          actions: ['configure', 'monitor', 'audit'],
          description: 'Payment network security'
        },
        {
          id: 'pci-audit',
          resource: 'audit.pci',
          actions: ['read', 'report', 'assess'],
          description: 'PCI compliance assessment'
        }
      ],
      priority: 700,
      isSystem: false,
      metadata: {
        compliance: 'PCI-DSS'
      }
    };
  }

  // Import/Export Methods
  public async exportTemplates(templateIds?: string[]): Promise<TemplateExport> {
    const templatesToExport = templateIds
      ? templateIds.map(id => this.getTemplate(id)).filter(Boolean) as RoleTemplate[]
      : this.getAllTemplates();

    const export_: TemplateExport = {
      version: '1.0.0',
      exportDate: new Date(),
      templates: templatesToExport,
      presets: this.getAllPresets(),
      metadata: {
        organization: 'MoloChain',
        description: 'Role templates and permission presets export',
        author: 'System'
      }
    };

    return export_;
  }

  public async importTemplates(data: TemplateExport): Promise<{
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const template of data.templates) {
      try {
        // Validate template
        const validation = this.validateTemplate(template);
        if (!validation.valid) {
          errors.push(`Template ${template.id}: ${validation.errors.join(', ')}`);
          skipped++;
          continue;
        }

        // Check for conflicts
        if (this.templates.has(template.id)) {
          errors.push(`Template ${template.id} is a system template and cannot be imported`);
          skipped++;
          continue;
        }

        // Import as custom template
        this.customTemplates.set(template.id, {
          ...template,
          category: 'custom',
          isEditable: true,
          updatedAt: new Date()
        });
        await this.saveTemplate(template);
        imported++;
      } catch (error: any) {
        errors.push(`Failed to import ${template.id}: ${error.message}`);
        skipped++;
      }
    }

    logger.info(`Template import completed: ${imported} imported, ${skipped} skipped`);
    return { imported, skipped, errors };
  }

  // Helper Methods
  private async saveTemplate(template: RoleTemplate): Promise<void> {
    const filePath = path.join(this.TEMPLATE_DIR, `${template.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(template, null, 2));
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.').map(Number);
    parts[2] = (parts[2] || 0) + 1;
    return parts.join('.');
  }

  // Public API for getting summary statistics
  public getStatistics(): {
    totalTemplates: number;
    systemTemplates: number;
    customTemplates: number;
    totalPresets: number;
    categories: Record<string, number>;
  } {
    const allTemplates = this.getAllTemplates();
    const categories: Record<string, number> = {};
    
    for (const template of allTemplates) {
      categories[template.category] = (categories[template.category] || 0) + 1;
    }

    return {
      totalTemplates: allTemplates.length,
      systemTemplates: this.templates.size,
      customTemplates: this.customTemplates.size,
      totalPresets: this.presets.size,
      categories
    };
  }
}

// Export singleton instance
export const roleTemplateManager = RoleTemplateManager.getInstance();