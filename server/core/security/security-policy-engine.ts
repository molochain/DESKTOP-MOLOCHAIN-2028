/**
 * Security Policy Engine
 * Centralized security configuration and enforcement
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';
import { identityManager } from '../identity/identity-manager.service';
import { securityMonitor } from '../../middleware/advanced-security';
import { threatDetectionEngine } from './threat-detection-engine';
import EventEmitter from 'events';
import crypto from 'crypto';

export interface SecurityRule {
  id: string;
  name: string;
  type: 'allow' | 'deny' | 'conditional';
  resource: string;
  conditions: SecurityCondition[];
  actions: string[];
  priority: number;
  enabled: boolean;
}

export interface SecurityCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'regex' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
  logic?: 'and' | 'or';
}

export interface ThreatIndicator {
  type: 'ip' | 'user_agent' | 'pattern' | 'behavior';
  value: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  addedAt: Date;
  expiresAt?: Date;
}

export interface SecurityProfile {
  name: string;
  description: string;
  rules: SecurityRule[];
  threatIndicators: ThreatIndicator[];
  responseActions: ResponseAction[];
  alertThresholds: AlertThreshold[];
}

export interface ResponseAction {
  trigger: string;
  action: 'block' | 'alert' | 'log' | 'challenge' | 'rate_limit';
  parameters?: any;
}

export interface AlertThreshold {
  metric: string;
  threshold: number;
  window: number; // in milliseconds
  action: string;
}

export interface SecurityMetrics {
  requestsAnalyzed: number;
  threatsDetected: number;
  threatsBlocked: number;
  falsePositives: number;
  averageResponseTime: number;
  ruleEvaluations: number;
}

class SecurityPolicyEngine extends EventEmitter {
  private static instance: SecurityPolicyEngine;
  private profiles: Map<string, SecurityProfile> = new Map();
  private activeProfile: string = 'default';
  private rules: Map<string, SecurityRule> = new Map();
  private threatIndicators: Map<string, ThreatIndicator> = new Map();
  private metrics: SecurityMetrics = {
    requestsAnalyzed: 0,
    threatsDetected: 0,
    threatsBlocked: 0,
    falsePositives: 0,
    averageResponseTime: 0,
    ruleEvaluations: 0
  };
  private requestHistory: Map<string, number[]> = new Map();

  private constructor() {
    super();
    this.initializeDefaultProfile();
    this.startMonitoring();
  }

  public static getInstance(): SecurityPolicyEngine {
    if (!SecurityPolicyEngine.instance) {
      SecurityPolicyEngine.instance = new SecurityPolicyEngine();
    }
    return SecurityPolicyEngine.instance;
  }

  private initializeDefaultProfile() {
    const defaultProfile: SecurityProfile = {
      name: 'default',
      description: 'Default security profile with balanced protection',
      rules: [
        {
          id: 'block-sql-injection',
          name: 'Block SQL Injection',
          type: 'deny',
          resource: '*',
          conditions: [
            {
              field: 'body',
              operator: 'regex',
              value: '(\\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\\b)',
              logic: 'or'
            }
          ],
          actions: ['block', 'log'],
          priority: 100,
          enabled: true
        },
        {
          id: 'block-xss',
          name: 'Block XSS Attempts',
          type: 'deny',
          resource: '*',
          conditions: [
            {
              field: 'body',
              operator: 'regex',
              value: '<script[^>]*>.*?</script>',
              logic: 'or'
            },
            {
              field: 'body',
              operator: 'contains',
              value: 'javascript:',
              logic: 'or'
            }
          ],
          actions: ['block', 'log'],
          priority: 99,
          enabled: true
        },
        {
          id: 'rate-limit-auth',
          name: 'Rate Limit Authentication',
          type: 'conditional',
          resource: '/api/auth/*',
          conditions: [
            {
              field: 'rate',
              operator: 'greater_than',
              value: 5
            }
          ],
          actions: ['rate_limit'],
          priority: 90,
          enabled: true
        },
        {
          id: 'protect-admin',
          name: 'Protect Admin Routes',
          type: 'conditional',
          resource: '/api/admin/*',
          conditions: [
            {
              field: 'role',
              operator: 'not_equals',
              value: 'admin'
            }
          ],
          actions: ['deny'],
          priority: 95,
          enabled: true
        }
      ],
      threatIndicators: [],
      responseActions: [
        {
          trigger: 'sql_injection_detected',
          action: 'block',
          parameters: { duration: 3600000 } // 1 hour
        },
        {
          trigger: 'xss_detected',
          action: 'block',
          parameters: { duration: 1800000 } // 30 minutes
        },
        {
          trigger: 'rate_limit_exceeded',
          action: 'rate_limit',
          parameters: { multiplier: 0.5 }
        }
      ],
      alertThresholds: [
        {
          metric: 'failed_auth_attempts',
          threshold: 10,
          window: 300000, // 5 minutes
          action: 'alert_admin'
        },
        {
          metric: 'threat_detections',
          threshold: 5,
          window: 60000, // 1 minute
          action: 'escalate_security'
        }
      ]
    };

    this.profiles.set('default', defaultProfile);
    this.loadProfile('default');

    // Strict profile for high-security environments
    const strictProfile: SecurityProfile = {
      ...defaultProfile,
      name: 'strict',
      description: 'Strict security profile with maximum protection',
      rules: [
        ...defaultProfile.rules,
        {
          id: 'whitelist-ips',
          name: 'IP Whitelist Only',
          type: 'conditional',
          resource: '*',
          conditions: [
            {
              field: 'ip',
              operator: 'not_in',
              value: [] // To be configured
            }
          ],
          actions: ['deny'],
          priority: 110,
          enabled: false // Disabled by default
        }
      ]
    };

    this.profiles.set('strict', strictProfile);
  }

  private startMonitoring() {
    // Clean up old request history every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, timestamps] of this.requestHistory.entries()) {
        const recent = timestamps.filter(t => now - t < 60000);
        if (recent.length === 0) {
          this.requestHistory.delete(key);
        } else {
          this.requestHistory.set(key, recent);
        }
      }
    }, 60000);

    // Check threat indicators expiration every 5 minutes
    setInterval(() => {
      const now = new Date();
      for (const [id, indicator] of this.threatIndicators.entries()) {
        if (indicator.expiresAt && indicator.expiresAt < now) {
          this.threatIndicators.delete(id);
          this.emit('threat_indicator_expired', indicator);
        }
      }
    }, 300000);
  }

  private loadProfile(profileName: string) {
    const profile = this.profiles.get(profileName);
    if (!profile) {
      throw new Error(`Security profile '${profileName}' not found`);
    }

    // Clear existing rules
    this.rules.clear();
    
    // Load rules from profile
    for (const rule of profile.rules) {
      this.rules.set(rule.id, rule);
    }

    // Load threat indicators
    for (const indicator of profile.threatIndicators) {
      const id = crypto.randomBytes(16).toString('hex');
      this.threatIndicators.set(id, indicator);
    }

    this.activeProfile = profileName;
    this.emit('profile_loaded', { profileName, profile });
  }

  // Rule evaluation
  public async evaluateRequest(req: Request & { user?: any }, res: Response): Promise<{
    allowed: boolean;
    rule?: SecurityRule;
    reason?: string;
  }> {
    const startTime = Date.now();
    this.metrics.requestsAnalyzed++;

    try {
      // Check for SQL injection attempts
      if (req.body) {
        const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        const sqlThreat = threatDetectionEngine.detectSQLInjection(bodyStr);
        if (sqlThreat) {
          this.metrics.threatsDetected++;
          this.metrics.threatsBlocked++;
          logger.error('SQL injection detected', { threat: sqlThreat, path: req.path });
          return { allowed: false, reason: 'SQL injection detected' };
        }
      }
      
      // Check for XSS attempts
      if (req.body) {
        const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        const xssThreat = threatDetectionEngine.detectXSSAttempt(bodyStr);
        if (xssThreat) {
          this.metrics.threatsDetected++;
          this.metrics.threatsBlocked++;
          logger.error('XSS attempt detected', { threat: xssThreat, path: req.path });
          return { allowed: false, reason: 'XSS attempt detected' };
        }
      }
      
      // Get user risk score if authenticated
      if (req.user?.id) {
        const riskScore = await threatDetectionEngine.calculateUserRiskScore(req.user.id);
        
        // Block critical risk users
        if (riskScore.riskLevel === 'critical') {
          this.metrics.threatsDetected++;
          this.metrics.threatsBlocked++;
          this.emit('critical_risk_blocked', { userId: req.user.id, riskScore });
          return { allowed: false, reason: `Critical risk level: ${riskScore.totalScore}` };
        }
        
        // Apply stricter rules for high-risk users
        if (riskScore.riskLevel === 'high') {
          // Add high-risk flag to evaluate with stricter rules
          req.user.highRisk = true;
        }
      }
      
      // Get sorted rules by priority
      const sortedRules = Array.from(this.rules.values())
        .filter(rule => rule.enabled)
        .sort((a, b) => b.priority - a.priority);

      for (const rule of sortedRules) {
        this.metrics.ruleEvaluations++;
        
        // Check if rule applies to this resource
        if (!this.matchesResource(req.path, rule.resource)) {
          continue;
        }

        // Evaluate conditions
        const conditionMet = this.evaluateConditions(req, rule.conditions);
        
        if (conditionMet) {
          // Execute actions
          const result = await this.executeActions(req, res, rule);
          
          if (rule.type === 'deny' || (rule.type === 'conditional' && !result.allowed)) {
            this.metrics.threatsDetected++;
            this.metrics.threatsBlocked++;
            
            // Update response time metric
            const responseTime = Date.now() - startTime;
            this.updateAverageResponseTime(responseTime);
            
            return {
              allowed: false,
              rule,
              reason: `Blocked by rule: ${rule.name}`
            };
          }
        }
      }

      // Check threat indicators
      const threatDetected = this.checkThreatIndicators(req);
      if (threatDetected) {
        this.metrics.threatsDetected++;
        this.metrics.threatsBlocked++;
        
        return {
          allowed: false,
          reason: `Threat indicator detected: ${threatDetected.description}`
        };
      }

      // Update response time metric
      const responseTime = Date.now() - startTime;
      this.updateAverageResponseTime(responseTime);

      return { allowed: true };
    } catch (error) {
      logger.error('Error evaluating security rules:', error);
      return { allowed: true }; // Fail open for now, could be configured
    }
  }

  private matchesResource(path: string, pattern: string): boolean {
    if (pattern === '*') return true;
    
    // Convert wildcard pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  private evaluateConditions(req: Request & { user?: any }, conditions: SecurityCondition[]): boolean {
    if (conditions.length === 0) return true;

    let result = this.evaluateCondition(req, conditions[0]);
    
    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateCondition(req, condition);
      
      if (condition.logic === 'or') {
        result = result || conditionResult;
      } else {
        result = result && conditionResult;
      }
    }

    return result;
  }

  private evaluateCondition(req: Request & { user?: any }, condition: SecurityCondition): boolean {
    let fieldValue: any;

    // Extract field value based on field name
    switch (condition.field) {
      case 'ip':
        fieldValue = req.ip;
        break;
      case 'user_agent':
        fieldValue = req.get('User-Agent');
        break;
      case 'role':
        fieldValue = req.user?.role;
        break;
      case 'body':
        fieldValue = JSON.stringify(req.body);
        break;
      case 'query':
        fieldValue = JSON.stringify(req.query);
        break;
      case 'rate':
        fieldValue = this.getRequestRate(req.ip || 'unknown');
        break;
      default:
        fieldValue = (req as any)[condition.field];
    }

    // Evaluate based on operator
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).includes(condition.value);
      case 'regex':
        return new RegExp(condition.value, 'i').test(String(fieldValue));
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      default:
        return false;
    }
  }

  private getRequestRate(ip: string): number {
    const timestamps = this.requestHistory.get(ip) || [];
    const now = Date.now();
    const recentRequests = timestamps.filter(t => now - t < 60000); // Last minute
    
    // Update history
    recentRequests.push(now);
    this.requestHistory.set(ip, recentRequests);
    
    return recentRequests.length;
  }

  private async executeActions(req: Request & { user?: any }, res: Response, rule: SecurityRule): Promise<{ allowed: boolean }> {
    let allowed = true;

    for (const action of rule.actions) {
      switch (action) {
        case 'block':
          allowed = false;
          this.emit('request_blocked', { rule, request: req.path, ip: req.ip });
          break;
        case 'log':
          logger.warn(`Security rule triggered: ${rule.name}`, {
            rule: rule.id,
            path: req.path,
            ip: req.ip,
            user: req.user?.id
          });
          break;
        case 'deny':
          allowed = false;
          break;
        case 'rate_limit':
          // Implement rate limiting logic
          const rate = this.getRequestRate(req.ip || 'unknown');
          if (rate > 10) { // Configurable threshold
            allowed = false;
          }
          break;
      }
    }

    return { allowed };
  }

  private checkThreatIndicators(req: Request): ThreatIndicator | null {
    for (const indicator of this.threatIndicators.values()) {
      switch (indicator.type) {
        case 'ip':
          if (req.ip === indicator.value) {
            return indicator;
          }
          break;
        case 'user_agent':
          if (req.get('User-Agent') === indicator.value) {
            return indicator;
          }
          break;
        case 'pattern':
          const pattern = new RegExp(indicator.value, 'i');
          if (pattern.test(JSON.stringify(req.body)) || 
              pattern.test(JSON.stringify(req.query))) {
            return indicator;
          }
          break;
      }
    }
    return null;
  }

  private updateAverageResponseTime(newTime: number) {
    const currentAvg = this.metrics.averageResponseTime;
    const totalRequests = this.metrics.requestsAnalyzed;
    
    this.metrics.averageResponseTime = 
      (currentAvg * (totalRequests - 1) + newTime) / totalRequests;
  }

  // Rule management
  public addRule(rule: SecurityRule): void {
    this.rules.set(rule.id, rule);
    this.emit('rule_added', rule);
  }

  public updateRule(ruleId: string, updates: Partial<SecurityRule>): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      this.rules.set(ruleId, { ...rule, ...updates });
      this.emit('rule_updated', { ruleId, updates });
    }
  }

  public deleteRule(ruleId: string): void {
    this.rules.delete(ruleId);
    this.emit('rule_deleted', ruleId);
  }

  public getRules(): SecurityRule[] {
    return Array.from(this.rules.values());
  }

  // Threat indicator management
  public addThreatIndicator(indicator: ThreatIndicator): string {
    const id = crypto.randomBytes(16).toString('hex');
    this.threatIndicators.set(id, {
      ...indicator,
      addedAt: new Date()
    });
    this.emit('threat_indicator_added', { id, indicator });
    return id;
  }

  public removeThreatIndicator(id: string): void {
    this.threatIndicators.delete(id);
    this.emit('threat_indicator_removed', id);
  }

  public getThreatIndicators(): Array<{ id: string; indicator: ThreatIndicator }> {
    return Array.from(this.threatIndicators.entries()).map(([id, indicator]) => ({
      id,
      indicator
    }));
  }

  // Profile management
  public createProfile(profile: SecurityProfile): void {
    this.profiles.set(profile.name, profile);
    this.emit('profile_created', profile);
  }

  public switchProfile(profileName: string): void {
    this.loadProfile(profileName);
  }

  public getProfiles(): SecurityProfile[] {
    return Array.from(this.profiles.values());
  }

  public getCurrentProfile(): SecurityProfile | undefined {
    return this.profiles.get(this.activeProfile);
  }

  // Metrics and reporting
  public getMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  public resetMetrics(): void {
    this.metrics = {
      requestsAnalyzed: 0,
      threatsDetected: 0,
      threatsBlocked: 0,
      falsePositives: 0,
      averageResponseTime: 0,
      ruleEvaluations: 0
    };
  }

  public reportFalsePositive(ruleId: string): void {
    this.metrics.falsePositives++;
    const rule = this.rules.get(ruleId);
    if (rule) {
      logger.info(`False positive reported for rule: ${rule.name}`);
      this.emit('false_positive_reported', { ruleId, rule });
    }
  }

  // Middleware function for Express
  public middleware() {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
      const evaluation = await this.evaluateRequest(req, res);
      
      if (!evaluation.allowed) {
        logger.warn('Request blocked by security policy', {
          path: req.path,
          ip: req.ip,
          reason: evaluation.reason,
          rule: evaluation.rule?.id
        });
        
        return res.status(403).json({
          error: 'Access denied',
          reason: evaluation.reason
        });
      }
      
      next();
    };
  }

  // Handle threat detection events from the threat engine
  private setupThreatDetectionIntegration(): void {
    threatDetectionEngine.on('threat_detected', (threat) => {
      this.metrics.threatsDetected++;
      this.emit('threat_detected', threat);
    });
    
    threatDetectionEngine.on('threat_mitigated', (threat) => {
      this.emit('threat_mitigated', threat);
    });
    
    threatDetectionEngine.on('critical_risk', (data) => {
      logger.error('Critical risk detected by threat engine', data);
      this.emit('critical_risk', data);
    });
  }
  
  // Integration with Identity Manager
  public async evaluateIdentityContext(context: any): Promise<boolean> {
    // Evaluate security rules specific to identity operations
    const identityRules = Array.from(this.rules.values())
      .filter(rule => rule.resource.includes('identity') || rule.resource === '*');

    for (const rule of identityRules) {
      const mockReq = {
        ip: context.ipAddress,
        get: (header: string) => header === 'User-Agent' ? context.userAgent : undefined,
        user: { role: context.role },
        path: '/identity/operation',
        body: {},
        query: {}
      } as any;

      const conditionMet = this.evaluateConditions(mockReq, rule.conditions);
      if (conditionMet && rule.type === 'deny') {
        return false;
      }
    }

    return true;
  }
}

export const securityPolicyEngine = SecurityPolicyEngine.getInstance();