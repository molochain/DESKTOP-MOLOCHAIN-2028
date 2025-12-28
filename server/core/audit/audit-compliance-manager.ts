/**
 * Audit and Compliance Manager
 * Centralized audit logging, compliance monitoring, and reporting
 */

import { db } from '../database/db.service';
import { auditLogs, users } from '@db/schema';
import { eq, and, or, gte, lte, desc, asc, count, sql, inArray } from 'drizzle-orm';
import { logger } from '../../utils/logger';
import { identityManager } from '../identity/identity-manager.service';
import { securityPolicyEngine } from '../security/security-policy-engine';
import { accessControlManager } from '../access/access-control-manager';
import { threatDetectionEngine } from '../security/threat-detection-engine';
import EventEmitter from 'events';
import crypto from 'crypto';

export interface AuditEvent {
  id?: number;
  userId: number;
  username?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
  tags?: string[];
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'privacy' | 'data' | 'access' | 'operational';
  requirement: string;
  checkFunction: (period: { start: Date; end: Date }) => Promise<ComplianceCheckResult>;
  schedule?: string; // Cron expression
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceCheckResult {
  passed: boolean;
  score: number; // 0-100
  findings: ComplianceFinding[];
  evidence: any[];
  checkedAt: Date;
}

export interface ComplianceFinding {
  type: 'violation' | 'warning' | 'info';
  description: string;
  affectedResources: string[];
  recommendation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceReport {
  id: string;
  name: string;
  period: { start: Date; end: Date };
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'Custom';
  rules: ComplianceRule[];
  results: Map<string, ComplianceCheckResult>;
  overallScore: number;
  status: 'compliant' | 'non-compliant' | 'partial';
  generatedAt: Date;
  generatedBy: number;
  attestation?: {
    attestedBy: number;
    attestedAt: Date;
    signature: string;
  };
}

export interface AuditQuery {
  userId?: number;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  severity?: string[];
  tags?: string[];
  limit?: number;
  offset?: number;
  orderBy?: 'timestamp' | 'severity' | 'action';
  order?: 'asc' | 'desc';
}

export interface AuditStatistics {
  totalEvents: number;
  eventsByAction: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  eventsByUser: Array<{ userId: number; username: string; count: number }>;
  eventsByResource: Record<string, number>;
  timeDistribution: Array<{ hour: number; count: number }>;
  anomalies: AuditAnomaly[];
}

export interface AuditAnomaly {
  type: 'unusual_activity' | 'access_spike' | 'failed_attempts' | 'privilege_escalation';
  description: string;
  userId?: number;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
}

class AuditComplianceManager extends EventEmitter {
  private static instance: AuditComplianceManager;
  private complianceRules: Map<string, ComplianceRule> = new Map();
  private reports: Map<string, ComplianceReport> = new Map();
  private auditBuffer: AuditEvent[] = [];
  private readonly BUFFER_SIZE = 100;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds
  private anomalyDetectionEnabled = true;
  private retentionPeriodDays = 365; // Default 1 year

  private constructor() {
    super();
    this.initializeComplianceRules();
    this.startPeriodicTasks();
    this.setupThreatDetectionIntegration();
  }

  public static getInstance(): AuditComplianceManager {
    if (!AuditComplianceManager.instance) {
      AuditComplianceManager.instance = new AuditComplianceManager();
    }
    return AuditComplianceManager.instance;
  }

  private initializeComplianceRules() {
    // Security compliance rules
    this.complianceRules.set('password-policy', {
      id: 'password-policy',
      name: 'Password Policy Compliance',
      description: 'Verify password policies are enforced',
      category: 'security',
      requirement: 'All users must have strong passwords and change them regularly',
      checkFunction: async (period) => this.checkPasswordPolicy(period),
      enabled: true,
      severity: 'high'
    });

    this.complianceRules.set('mfa-adoption', {
      id: 'mfa-adoption',
      name: 'Multi-Factor Authentication Adoption',
      description: 'Check MFA adoption rate',
      category: 'security',
      requirement: 'At least 80% of users should have MFA enabled',
      checkFunction: async (period) => this.checkMFAAdoption(period),
      enabled: true,
      severity: 'high'
    });

    this.complianceRules.set('access-review', {
      id: 'access-review',
      name: 'Access Rights Review',
      description: 'Verify access rights are appropriate',
      category: 'access',
      requirement: 'User access rights must be reviewed quarterly',
      checkFunction: async (period) => this.checkAccessReview(period),
      enabled: true,
      severity: 'medium'
    });

    this.complianceRules.set('audit-integrity', {
      id: 'audit-integrity',
      name: 'Audit Log Integrity',
      description: 'Verify audit logs are complete and unmodified',
      category: 'operational',
      requirement: 'Audit logs must be tamper-proof and complete',
      checkFunction: async (period) => this.checkAuditIntegrity(period),
      enabled: true,
      severity: 'critical'
    });

    this.complianceRules.set('data-retention', {
      id: 'data-retention',
      name: 'Data Retention Policy',
      description: 'Verify data retention policies are followed',
      category: 'data',
      requirement: 'Data must be retained according to policy and deleted when required',
      checkFunction: async (period) => this.checkDataRetention(period),
      enabled: true,
      severity: 'medium'
    });

    this.complianceRules.set('privilege-escalation', {
      id: 'privilege-escalation',
      name: 'Privilege Escalation Monitoring',
      description: 'Detect unauthorized privilege escalations',
      category: 'security',
      requirement: 'No unauthorized privilege escalations should occur',
      checkFunction: async (period) => this.checkPrivilegeEscalation(period),
      enabled: true,
      severity: 'critical'
    });
  }

  private startPeriodicTasks() {
    // Flush audit buffer periodically
    setInterval(() => {
      this.flushAuditBuffer();
    }, this.FLUSH_INTERVAL);

    // Check for anomalies every minute
    setInterval(() => {
      if (this.anomalyDetectionEnabled) {
        this.detectAnomalies();
      }
    }, 60000);

    // Clean old audit logs daily
    setInterval(() => {
      this.cleanOldAuditLogs();
    }, 24 * 60 * 60 * 1000);
  }

  private setupThreatDetectionIntegration(): void {
    // Listen for threat detection events
    threatDetectionEngine.on('threat_detected', async (threat) => {
      await this.logAudit({
        userId: threat.userId || 0,
        action: 'threat_detected',
        resourceType: 'security',
        resourceId: threat.id,
        details: {
          threatType: threat.type,
          severity: threat.severity,
          indicators: threat.indicators,
          riskScore: threat.riskScore
        },
        ipAddress: threat.ipAddress || 'unknown',
        userAgent: threat.userAgent || 'unknown',
        severity: threat.severity === 'critical' ? 'critical' : threat.severity === 'high' ? 'error' : 'warning',
        tags: ['threat', threat.type]
      });
    });
    
    threatDetectionEngine.on('threat_mitigated', async (data) => {
      await this.logAudit({
        userId: 0,
        action: 'threat_mitigated',
        resourceType: 'security',
        resourceId: data.threatId,
        details: data,
        ipAddress: 'system',
        userAgent: 'threat-detection-engine',
        severity: 'info',
        tags: ['threat', 'mitigation']
      });
    });
    
    threatDetectionEngine.on('account_locked', async (data) => {
      await this.logAudit({
        userId: data.userId || 0,
        action: 'account_locked',
        resourceType: 'identity',
        resourceId: data.target,
        details: data,
        ipAddress: 'system',
        userAgent: 'threat-detection-engine',
        severity: 'warning',
        tags: ['security', 'lockout']
      });
    });
    
    threatDetectionEngine.on('security_alert', async (data) => {
      await this.logAudit({
        userId: 0,
        action: 'security_alert',
        resourceType: 'security',
        resourceId: data.target,
        details: data,
        ipAddress: 'system',
        userAgent: 'threat-detection-engine',
        severity: 'error',
        tags: ['alert', 'security']
      });
    });
  }

  // Audit logging
  public async logAudit(event: Omit<AuditEvent, 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date(),
      severity: event.severity || 'info'
    };

    // Add to buffer for batch insertion
    this.auditBuffer.push(auditEvent);

    // Flush if buffer is full
    if (this.auditBuffer.length >= this.BUFFER_SIZE) {
      await this.flushAuditBuffer();
    }

    // Emit event for real-time monitoring
    this.emit('audit_logged', auditEvent);

    // Check for critical events
    if (auditEvent.severity === 'critical') {
      this.handleCriticalEvent(auditEvent);
    }
  }

  private async flushAuditBuffer(): Promise<void> {
    if (this.auditBuffer.length === 0) return;

    const eventsToFlush = [...this.auditBuffer];
    this.auditBuffer = [];

    try {
      const validEvents = eventsToFlush.filter(event => event.userId && event.userId > 0);
      
      if (validEvents.length === 0) {
        return;
      }

      await db.insert(auditLogs).values(
        validEvents.map(event => ({
          userId: event.userId,
          action: event.action,
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          details: event.details,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          createdAt: event.timestamp
        }))
      );
    } catch (error) {
      logger.error('Failed to flush audit buffer:', error);
    }
  }

  private handleCriticalEvent(event: AuditEvent): void {
    logger.error('Critical audit event', event);
    this.emit('critical_event', event);
    
    // Could trigger additional actions like:
    // - Send alerts to administrators
    // - Lock down affected resources
    // - Trigger incident response
  }

  // Audit querying
  public async queryAuditLogs(query: AuditQuery): Promise<AuditEvent[]> {
    try {
      let dbQuery = db.select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        resourceType: auditLogs.resourceType,
        resourceId: auditLogs.resourceId,
        details: auditLogs.details,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        timestamp: auditLogs.createdAt
      }).from(auditLogs);

      // Apply filters
      const conditions = [];
      if (query.userId) {
        conditions.push(eq(auditLogs.userId, query.userId));
      }
      if (query.action) {
        conditions.push(eq(auditLogs.action, query.action));
      }
      if (query.resourceType) {
        conditions.push(eq(auditLogs.resourceType, query.resourceType));
      }
      if (query.resourceId) {
        conditions.push(eq(auditLogs.resourceId, query.resourceId));
      }
      if (query.startDate) {
        conditions.push(gte(auditLogs.createdAt, query.startDate));
      }
      if (query.endDate) {
        conditions.push(lte(auditLogs.createdAt, query.endDate));
      }

      if (conditions.length > 0) {
        dbQuery = dbQuery.where(and(...conditions)) as any;
      }

      // Apply ordering
      if (query.orderBy === 'timestamp') {
        dbQuery = dbQuery.orderBy(
          query.order === 'asc' ? asc(auditLogs.createdAt) : desc(auditLogs.createdAt)
        ) as any;
      }

      // Apply pagination
      if (query.limit) {
        dbQuery = dbQuery.limit(query.limit) as any;
      }
      if (query.offset) {
        dbQuery = dbQuery.offset(query.offset) as any;
      }

      const results = await dbQuery;
      
      // Enrich with usernames
      const userIds = [...new Set(results.map(r => r.userId))];
      const usersData = await db.select({
        id: users.id,
        username: users.username
      }).from(users).where(inArray(users.id, userIds));
      
      const userMap = new Map(usersData.map(u => [u.id, u.username]));
      
      return results.map(r => ({
        ...r,
        username: userMap.get(r.userId),
        severity: this.determineSeverity(r.action)
      } as AuditEvent));
    } catch (error) {
      logger.error('Failed to query audit logs:', error);
      throw error;
    }
  }

  private determineSeverity(action: string): 'info' | 'warning' | 'error' | 'critical' {
    if (action.includes('delete') || action.includes('remove')) return 'warning';
    if (action.includes('fail') || action.includes('denied')) return 'error';
    if (action.includes('escalat') || action.includes('breach')) return 'critical';
    return 'info';
  }

  // Compliance checking
  private async checkPasswordPolicy(period: { start: Date; end: Date }): Promise<ComplianceCheckResult> {
    const findings: ComplianceFinding[] = [];
    const evidence: any[] = [];

    // Check users without recent password changes
    const [usersCount] = await db.select({ count: count() }).from(users);
    const totalUsers = usersCount.count;

    // Simulate checking password age (would need password history table)
    const usersWithOldPasswords = Math.floor(totalUsers * 0.1); // Simulated
    
    if (usersWithOldPasswords > 0) {
      findings.push({
        type: 'warning',
        description: `${usersWithOldPasswords} users have passwords older than 90 days`,
        affectedResources: [`${usersWithOldPasswords} users`],
        recommendation: 'Enforce password rotation policy',
        severity: 'medium'
      });
    }

    // Check password complexity settings
    const identityPolicies = identityManager.getPolicy('default');
    if (!identityPolicies?.passwordPolicy.requireSpecialChars) {
      findings.push({
        type: 'violation',
        description: 'Password policy does not require special characters',
        affectedResources: ['Password Policy'],
        recommendation: 'Enable special character requirement',
        severity: 'high'
      });
    }

    const score = findings.length === 0 ? 100 : Math.max(0, 100 - (findings.length * 20));

    return {
      passed: findings.filter(f => f.type === 'violation').length === 0,
      score,
      findings,
      evidence,
      checkedAt: new Date()
    };
  }

  private async checkMFAAdoption(period: { start: Date; end: Date }): Promise<ComplianceCheckResult> {
    const findings: ComplianceFinding[] = [];
    const evidence: any[] = [];

    const [totalUsers] = await db.select({ count: count() }).from(users).where(eq(users.isActive, true));
    const [mfaUsers] = await db.select({ count: count() }).from(users)
      .where(and(eq(users.isActive, true), eq(users.twoFactorEnabled, true)));

    const adoptionRate = totalUsers.count > 0 ? (mfaUsers.count / totalUsers.count) * 100 : 0;

    evidence.push({
      totalUsers: totalUsers.count,
      mfaEnabledUsers: mfaUsers.count,
      adoptionRate: `${adoptionRate.toFixed(2)}%`
    });

    if (adoptionRate < 80) {
      findings.push({
        type: 'violation',
        description: `MFA adoption rate is ${adoptionRate.toFixed(2)}%, below the required 80%`,
        affectedResources: [`${totalUsers.count - mfaUsers.count} users without MFA`],
        recommendation: 'Enforce MFA for all users or high-privilege accounts',
        severity: 'high'
      });
    }

    // Check admin MFA
    const [adminUsers] = await db.select({ count: count() }).from(users)
      .where(and(eq(users.role, 'admin'), eq(users.isActive, true)));
    const [adminMFA] = await db.select({ count: count() }).from(users)
      .where(and(
        eq(users.role, 'admin'),
        eq(users.isActive, true),
        eq(users.twoFactorEnabled, true)
      ));

    if (adminUsers.count > adminMFA.count) {
      findings.push({
        type: 'violation',
        description: `${adminUsers.count - adminMFA.count} admin users do not have MFA enabled`,
        affectedResources: ['Admin accounts'],
        recommendation: 'Require MFA for all administrative accounts',
        severity: 'critical'
      });
    }

    const score = Math.min(100, adoptionRate + (adminMFA.count === adminUsers.count ? 20 : 0));

    return {
      passed: findings.filter(f => f.type === 'violation').length === 0,
      score,
      findings,
      evidence,
      checkedAt: new Date()
    };
  }

  private async checkAccessReview(period: { start: Date; end: Date }): Promise<ComplianceCheckResult> {
    const findings: ComplianceFinding[] = [];
    const evidence: any[] = [];

    // Check for stale admin accounts
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const staleAdmins = await db.select({
      id: users.id,
      username: users.username,
      lastLoginAt: users.lastLoginAt
    }).from(users)
      .where(and(
        eq(users.role, 'admin'),
        or(
          lte(users.lastLoginAt, threeMonthsAgo),
          eq(users.lastLoginAt, null)
        )
      ));

    if (staleAdmins.length > 0) {
      findings.push({
        type: 'warning',
        description: `${staleAdmins.length} admin accounts have not logged in for over 3 months`,
        affectedResources: staleAdmins.map(a => a.username),
        recommendation: 'Review and potentially deactivate stale admin accounts',
        severity: 'medium'
      });
      evidence.push({ staleAdmins });
    }

    // Check for excessive permissions
    const roles = accessControlManager.getRoles();
    const customRoles = roles.filter(r => !r.isSystem);
    
    for (const role of customRoles) {
      if (role.permissions.some(p => p.resource === '*' && p.actions.includes('*'))) {
        findings.push({
          type: 'warning',
          description: `Role "${role.name}" has wildcard permissions`,
          affectedResources: [role.id],
          recommendation: 'Review and restrict wildcard permissions',
          severity: 'medium'
        });
      }
    }

    const score = Math.max(0, 100 - (findings.length * 15));

    return {
      passed: true, // Access review warnings don't fail compliance
      score,
      findings,
      evidence,
      checkedAt: new Date()
    };
  }

  private async checkAuditIntegrity(period: { start: Date; end: Date }): Promise<ComplianceCheckResult> {
    const findings: ComplianceFinding[] = [];
    const evidence: any[] = [];

    // Check for gaps in audit logs
    const logs = await db.select({
      id: auditLogs.id,
      createdAt: auditLogs.createdAt
    }).from(auditLogs)
      .where(and(
        gte(auditLogs.createdAt, period.start),
        lte(auditLogs.createdAt, period.end)
      ))
      .orderBy(asc(auditLogs.id));

    // Check for ID gaps (potential deleted logs)
    let previousId = logs[0]?.id || 0;
    let gaps = 0;
    for (let i = 1; i < logs.length; i++) {
      if (logs[i].id - previousId > 1) {
        gaps++;
      }
      previousId = logs[i].id;
    }

    if (gaps > 0) {
      findings.push({
        type: 'violation',
        description: `Found ${gaps} gaps in audit log sequence`,
        affectedResources: ['Audit logs'],
        recommendation: 'Investigate potential audit log tampering',
        severity: 'critical'
      });
    }

    evidence.push({
      totalLogs: logs.length,
      period: { start: period.start, end: period.end },
      gaps
    });

    const score = gaps === 0 ? 100 : Math.max(0, 100 - (gaps * 25));

    return {
      passed: gaps === 0,
      score,
      findings,
      evidence,
      checkedAt: new Date()
    };
  }

  private async checkDataRetention(period: { start: Date; end: Date }): Promise<ComplianceCheckResult> {
    const findings: ComplianceFinding[] = [];
    const evidence: any[] = [];

    // Check if old audit logs are being retained
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - this.retentionPeriodDays);

    const [oldLogs] = await db.select({ count: count() }).from(auditLogs)
      .where(lte(auditLogs.createdAt, retentionDate));

    if (oldLogs.count > 0) {
      findings.push({
        type: 'info',
        description: `${oldLogs.count} audit logs are older than retention period`,
        affectedResources: ['Audit logs'],
        recommendation: 'Archive or delete logs according to retention policy',
        severity: 'low'
      });
    }

    evidence.push({
      retentionPeriodDays: this.retentionPeriodDays,
      oldLogsCount: oldLogs.count
    });

    const score = 100; // Data retention is informational

    return {
      passed: true,
      score,
      findings,
      evidence,
      checkedAt: new Date()
    };
  }

  private async checkPrivilegeEscalation(period: { start: Date; end: Date }): Promise<ComplianceCheckResult> {
    const findings: ComplianceFinding[] = [];
    const evidence: any[] = [];

    // Check for role changes in audit logs
    const roleChanges = await this.queryAuditLogs({
      action: 'role_change',
      startDate: period.start,
      endDate: period.end
    });

    // Look for suspicious patterns
    const userRoleChanges = new Map<number, number>();
    for (const change of roleChanges) {
      const count = userRoleChanges.get(change.userId) || 0;
      userRoleChanges.set(change.userId, count + 1);
    }

    // Flag users with multiple role changes
    for (const [userId, count] of userRoleChanges.entries()) {
      if (count > 2) {
        findings.push({
          type: 'warning',
          description: `User ${userId} had ${count} role changes in the period`,
          affectedResources: [`User ${userId}`],
          recommendation: 'Review role change history for potential abuse',
          severity: 'medium'
        });
      }
    }

    // Check for direct database modifications (bypassing API)
    const suspiciousChanges = roleChanges.filter(log => 
      !log.details?.changedBy || log.details.changedBy === log.userId
    );

    if (suspiciousChanges.length > 0) {
      findings.push({
        type: 'violation',
        description: `${suspiciousChanges.length} role changes appear to be self-escalations`,
        affectedResources: suspiciousChanges.map(c => `User ${c.userId}`),
        recommendation: 'Investigate potential privilege escalation attempts',
        severity: 'critical'
      });
    }

    evidence.push({
      totalRoleChanges: roleChanges.length,
      suspiciousChanges: suspiciousChanges.length
    });

    const score = suspiciousChanges.length === 0 ? 100 : Math.max(0, 100 - (suspiciousChanges.length * 30));

    return {
      passed: suspiciousChanges.length === 0,
      score,
      findings,
      evidence,
      checkedAt: new Date()
    };
  }

  // Anomaly detection
  private async detectAnomalies(): Promise<void> {
    const anomalies: AuditAnomaly[] = [];
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check for unusual activity patterns
    const recentLogs = await this.queryAuditLogs({
      startDate: oneHourAgo,
      endDate: now
    });

    // Group by user
    const userActivity = new Map<number, AuditEvent[]>();
    for (const log of recentLogs) {
      const logs = userActivity.get(log.userId) || [];
      logs.push(log);
      userActivity.set(log.userId, logs);
    }

    // Detect anomalies
    for (const [userId, logs] of userActivity.entries()) {
      // High volume of actions
      if (logs.length > 100) {
        anomalies.push({
          type: 'access_spike',
          description: `User ${userId} performed ${logs.length} actions in the last hour`,
          userId,
          timestamp: now,
          severity: 'medium',
          details: { actionCount: logs.length }
        });
      }

      // Failed attempts
      const failedAttempts = logs.filter(l => l.action.includes('failed'));
      if (failedAttempts.length > 5) {
        anomalies.push({
          type: 'failed_attempts',
          description: `User ${userId} had ${failedAttempts.length} failed attempts`,
          userId,
          timestamp: now,
          severity: 'high',
          details: { failedCount: failedAttempts.length }
        });
      }

      // Privilege escalation attempts
      const privActions = logs.filter(l => 
        l.action === 'role_change' || l.action === 'permission_change'
      );
      if (privActions.length > 0) {
        anomalies.push({
          type: 'privilege_escalation',
          description: `User ${userId} attempted privilege changes`,
          userId,
          timestamp: now,
          severity: 'critical',
          details: { actions: privActions }
        });
      }
    }

    // Emit anomalies
    for (const anomaly of anomalies) {
      this.emit('anomaly_detected', anomaly);
      logger.warn('Anomaly detected', anomaly);
    }
  }

  // Compliance reporting
  public async generateComplianceReport(
    name: string,
    framework: ComplianceReport['framework'],
    period: { start: Date; end: Date },
    ruleIds?: string[]
  ): Promise<ComplianceReport> {
    const reportId = crypto.randomBytes(16).toString('hex');
    const results = new Map<string, ComplianceCheckResult>();

    // Get applicable rules
    const rulesToCheck = ruleIds 
      ? Array.from(this.complianceRules.values()).filter(r => ruleIds.includes(r.id))
      : Array.from(this.complianceRules.values()).filter(r => r.enabled);

    // Run compliance checks
    for (const rule of rulesToCheck) {
      try {
        const result = await rule.checkFunction(period);
        results.set(rule.id, result);
      } catch (error) {
        logger.error(`Failed to check compliance rule ${rule.id}:`, error);
        results.set(rule.id, {
          passed: false,
          score: 0,
          findings: [{
            type: 'violation',
            description: 'Failed to execute compliance check',
            affectedResources: [],
            recommendation: 'Fix the compliance check function',
            severity: 'high'
          }],
          evidence: [],
          checkedAt: new Date()
        });
      }
    }

    // Calculate overall score
    const scores = Array.from(results.values()).map(r => r.score);
    const overallScore = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : 0;

    // Determine status
    const violations = Array.from(results.values())
      .flatMap(r => r.findings)
      .filter(f => f.type === 'violation');
    
    let status: ComplianceReport['status'];
    if (violations.length === 0) {
      status = 'compliant';
    } else if (violations.filter(v => v.severity === 'critical').length > 0) {
      status = 'non-compliant';
    } else {
      status = 'partial';
    }

    const report: ComplianceReport = {
      id: reportId,
      name,
      period,
      framework,
      rules: rulesToCheck,
      results,
      overallScore,
      status,
      generatedAt: new Date(),
      generatedBy: 0 // Would be set from context
    };

    this.reports.set(reportId, report);
    this.emit('report_generated', report);

    return report;
  }

  public async attestReport(reportId: string, userId: number): Promise<void> {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    const signature = crypto
      .createHash('sha256')
      .update(JSON.stringify({
        reportId,
        userId,
        timestamp: new Date().toISOString()
      }))
      .digest('hex');

    report.attestation = {
      attestedBy: userId,
      attestedAt: new Date(),
      signature
    };

    await this.logAudit({
      userId,
      action: 'report_attested',
      resourceType: 'compliance_report',
      resourceId: reportId,
      details: { reportName: report.name, signature },
      ipAddress: 'system',
      userAgent: 'system',
      severity: 'info'
    });
  }

  // Statistics and analytics
  public async getAuditStatistics(period: { start: Date; end: Date }): Promise<AuditStatistics> {
    const logs = await this.queryAuditLogs({
      startDate: period.start,
      endDate: period.end
    });

    // Calculate statistics
    const eventsByAction: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const eventsByResource: Record<string, number> = {};
    const userEvents = new Map<number, number>();
    const hourlyDistribution = new Array(24).fill(0);

    for (const log of logs) {
      // By action
      eventsByAction[log.action] = (eventsByAction[log.action] || 0) + 1;
      
      // By severity
      eventsBySeverity[log.severity] = (eventsBySeverity[log.severity] || 0) + 1;
      
      // By resource
      eventsByResource[log.resourceType] = (eventsByResource[log.resourceType] || 0) + 1;
      
      // By user
      userEvents.set(log.userId, (userEvents.get(log.userId) || 0) + 1);
      
      // By hour
      const hour = log.timestamp.getHours();
      hourlyDistribution[hour]++;
    }

    // Get top users
    const eventsByUser = Array.from(userEvents.entries())
      .map(([userId, count]) => ({ userId, username: '', count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Detect anomalies in the period
    const anomalies: AuditAnomaly[] = [];
    
    // Check for unusual patterns
    for (const [userId, count] of userEvents.entries()) {
      if (count > logs.length * 0.3) { // User responsible for >30% of activity
        anomalies.push({
          type: 'unusual_activity',
          description: `User ${userId} generated ${count} events (${(count/logs.length*100).toFixed(1)}% of total)`,
          userId,
          timestamp: new Date(),
          severity: 'medium',
          details: { eventCount: count, percentage: count/logs.length*100 }
        });
      }
    }

    return {
      totalEvents: logs.length,
      eventsByAction,
      eventsBySeverity,
      eventsByUser,
      eventsByResource,
      timeDistribution: hourlyDistribution.map((count, hour) => ({ hour, count })),
      anomalies
    };
  }

  // Cleanup and maintenance
  private async cleanOldAuditLogs(): Promise<void> {
    try {
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - this.retentionPeriodDays);

      // Archive old logs before deletion (in production, would export to cold storage)
      const oldLogs = await this.queryAuditLogs({
        endDate: retentionDate,
        limit: 1000
      });

      if (oldLogs.length > 0) {
        logger.info(`Archiving ${oldLogs.length} old audit logs`);
        // In production: export to S3, archive storage, etc.
      }

      // Delete old logs
      await db.delete(auditLogs).where(lte(auditLogs.createdAt, retentionDate));
      
      logger.info('Cleaned old audit logs');
    } catch (error) {
      logger.error('Failed to clean old audit logs:', error);
    }
  }

  // Configuration
  public setRetentionPeriod(days: number): void {
    this.retentionPeriodDays = days;
  }

  public enableAnomalyDetection(enabled: boolean): void {
    this.anomalyDetectionEnabled = enabled;
  }

  public addComplianceRule(rule: ComplianceRule): void {
    this.complianceRules.set(rule.id, rule);
    this.emit('rule_added', rule);
  }

  public removeComplianceRule(ruleId: string): void {
    this.complianceRules.delete(ruleId);
    this.emit('rule_removed', ruleId);
  }

  public getComplianceRules(): ComplianceRule[] {
    return Array.from(this.complianceRules.values());
  }

  public getReports(): ComplianceReport[] {
    return Array.from(this.reports.values());
  }
}

export const auditComplianceManager = AuditComplianceManager.getInstance();