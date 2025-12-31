import { Logger } from 'winston';
import { z } from 'zod';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  schedule?: string;
  triggerEvents?: string[];
  steps: WorkflowStep[];
  retryConfig?: {
    attempts: number;
    backoffMs: number;
  };
}

export interface WorkflowStep {
  id: string;
  name: string;
  handler: string;
  inputSchema?: z.ZodSchema;
  outputSchema?: z.ZodSchema;
  timeout?: number;
}

export class WorkflowRegistry {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  register(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
    this.logger.info('Workflow registered', { id: workflow.id, name: workflow.name });
  }

  get(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  getRegisteredWorkflows(): { id: string; name: string; schedule?: string }[] {
    return Array.from(this.workflows.values()).map(w => ({
      id: w.id,
      name: w.name,
      schedule: w.schedule
    }));
  }

  getSchedules(): { workflowId: string; schedule: string }[] {
    return Array.from(this.workflows.values())
      .filter(w => w.schedule)
      .map(w => ({ workflowId: w.id, schedule: w.schedule! }));
  }

  registerBuiltInWorkflows(): void {
    this.register({
      id: 'cms-sync',
      name: 'CMS Content Sync',
      description: 'Synchronize content from Laravel CMS to local cache',
      schedule: '*/5 * * * *',
      triggerEvents: ['cms.content.updated', 'cms.service.created'],
      steps: [
        { id: 'fetch-cms', name: 'Fetch CMS Data', handler: 'cmsSyncHandler' },
        { id: 'update-cache', name: 'Update Local Cache', handler: 'cacheUpdateHandler' },
        { id: 'notify', name: 'Send Notification', handler: 'notifyHandler' }
      ],
      retryConfig: { attempts: 3, backoffMs: 5000 }
    });

    this.register({
      id: 'database-backup',
      name: 'Database Backup',
      description: 'Automated PostgreSQL database backup',
      schedule: '0 2 * * *',
      steps: [
        { id: 'create-backup', name: 'Create Backup', handler: 'backupHandler' },
        { id: 'upload-backup', name: 'Upload to Storage', handler: 'uploadHandler' },
        { id: 'cleanup-old', name: 'Cleanup Old Backups', handler: 'cleanupHandler' },
        { id: 'notify', name: 'Send Notification', handler: 'notifyHandler' }
      ],
      retryConfig: { attempts: 2, backoffMs: 10000 }
    });

    this.register({
      id: 'health-monitoring',
      name: 'System Health Monitoring',
      description: 'Monitor all microservices and containers health',
      schedule: '* * * * *',
      triggerEvents: ['system.health.check'],
      steps: [
        { id: 'check-containers', name: 'Check Docker Containers', handler: 'containerHealthHandler' },
        { id: 'check-services', name: 'Check Service Endpoints', handler: 'serviceHealthHandler' },
        { id: 'check-database', name: 'Check Database Connection', handler: 'databaseHealthHandler' },
        { id: 'aggregate-metrics', name: 'Aggregate Metrics', handler: 'metricsHandler' },
        { id: 'alert-if-needed', name: 'Send Alerts', handler: 'alertHandler' }
      ]
    });

    this.register({
      id: 'cache-warmup',
      name: 'Cache Warmup',
      description: 'Pre-warm application caches for optimal performance',
      schedule: '*/30 * * * *',
      triggerEvents: ['cache.invalidated', 'deployment.completed'],
      steps: [
        { id: 'warmup-api', name: 'Warm API Cache', handler: 'apiCacheWarmupHandler' },
        { id: 'warmup-cms', name: 'Warm CMS Cache', handler: 'cmsCacheWarmupHandler' },
        { id: 'warmup-session', name: 'Warm Session Cache', handler: 'sessionCacheWarmupHandler' }
      ]
    });

    this.register({
      id: 'sales-operations',
      name: 'Sales & Operations Automation',
      description: 'AI-powered sales and operations workflow (Rayanava)',
      schedule: '0 8 * * 1-5',
      triggerEvents: ['sales.lead.created', 'sales.opportunity.updated'],
      steps: [
        { id: 'business-intel', name: 'Business Intelligence', handler: 'businessIntelHandler' },
        { id: 'lead-qualification', name: 'Lead Qualification', handler: 'leadQualificationHandler' },
        { id: 'ops-monitoring', name: 'Operations Monitoring', handler: 'opsMonitoringHandler' },
        { id: 'email-notifications', name: 'Email Notifications', handler: 'emailNotificationHandler' }
      ],
      retryConfig: { attempts: 3, backoffMs: 15000 }
    });

    this.register({
      id: 'log-rotation',
      name: 'Log Rotation & Cleanup',
      description: 'Rotate and cleanup old log files',
      schedule: '0 0 * * *',
      steps: [
        { id: 'rotate-logs', name: 'Rotate Log Files', handler: 'logRotationHandler' },
        { id: 'compress-old', name: 'Compress Old Logs', handler: 'logCompressionHandler' },
        { id: 'cleanup', name: 'Delete Expired Logs', handler: 'logCleanupHandler' }
      ]
    });

    this.register({
      id: 'performance-optimization',
      name: 'Performance Optimization',
      description: 'Automated performance tuning and optimization',
      schedule: '*/15 * * * *',
      triggerEvents: ['performance.degraded', 'memory.high'],
      steps: [
        { id: 'analyze-metrics', name: 'Analyze Performance Metrics', handler: 'performanceAnalysisHandler' },
        { id: 'optimize-memory', name: 'Optimize Memory Usage', handler: 'memoryOptimizationHandler' },
        { id: 'optimize-db', name: 'Optimize Database Queries', handler: 'dbOptimizationHandler' }
      ]
    });

    this.register({
      id: 'user-onboarding',
      name: 'User Onboarding Workflow',
      description: 'Automated user onboarding and welcome sequence',
      triggerEvents: ['user.registered', 'user.verified'],
      steps: [
        { id: 'send-welcome', name: 'Send Welcome Email', handler: 'welcomeEmailHandler' },
        { id: 'setup-defaults', name: 'Setup Default Preferences', handler: 'defaultsHandler' },
        { id: 'assign-role', name: 'Assign Default Role', handler: 'roleAssignmentHandler' },
        { id: 'create-workspace', name: 'Create User Workspace', handler: 'workspaceHandler' }
      ]
    });

    this.register({
      id: 'notification-digest',
      name: 'Notification Digest',
      description: 'Compile and send daily notification digest',
      schedule: '0 9 * * *',
      steps: [
        { id: 'collect-notifications', name: 'Collect Pending Notifications', handler: 'collectNotificationsHandler' },
        { id: 'compile-digest', name: 'Compile Digest', handler: 'compileDigestHandler' },
        { id: 'send-emails', name: 'Send Email Digests', handler: 'sendDigestHandler' }
      ]
    });

    this.register({
      id: 'security-audit',
      name: 'Security Audit',
      description: 'Automated security checks and compliance audit',
      schedule: '0 3 * * *',
      triggerEvents: ['security.alert', 'auth.failed.multiple'],
      steps: [
        { id: 'scan-vulnerabilities', name: 'Scan Vulnerabilities', handler: 'vulnerabilityScanHandler' },
        { id: 'check-permissions', name: 'Check Permission Violations', handler: 'permissionAuditHandler' },
        { id: 'review-logs', name: 'Review Audit Logs', handler: 'auditLogReviewHandler' },
        { id: 'generate-report', name: 'Generate Report', handler: 'securityReportHandler' }
      ],
      retryConfig: { attempts: 2, backoffMs: 30000 }
    });
  }
}
