/**
 * Identity and Security Management API Routes
 * Provides endpoints for the unified management dashboard
 */

import { Router, Request, Response, NextFunction } from 'express';
import { identityManager } from '../core/identity/identity-manager.service';
import { securityPolicyEngine } from '../core/security/security-policy-engine';
import { accessControlManager } from '../core/access/access-control-manager';
import { auditComplianceManager } from '../core/audit/audit-compliance-manager';
import { threatDetectionEngine } from '../core/security/threat-detection-engine';
import { roleTemplateManager } from '../core/access/role-template-manager';
import { requireAuth, requireRole } from '../middleware/auth';
import { logger } from '../utils/logger';
import { z } from 'zod';

const router = Router();

// Middleware to ensure admin access for all management endpoints
const requireAdminAccess = [requireAuth, requireRole(['admin', 'superadmin'])];

// ============================================================================
// Identity Management Routes
// ============================================================================

// Get identity statistics
router.get('/identity/statistics', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const stats = await identityManager.getIdentityStatistics();
    res.json(stats);
  } catch (error) {
    logger.error('Failed to get identity statistics:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

// Create new user
router.post('/identity/users', requireAdminAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const createUserSchema = z.object({
      username: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(8),
      role: z.string().optional().default('user'),
      permissions: z.array(z.string()).optional(),
      enableTwoFactor: z.boolean().optional()
    });

    const userData = createUserSchema.parse(req.body);
    
    const context = {
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'unknown'
    };

    const newUser = await identityManager.createUser(userData, context);
    
    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error: any) {
    logger.error('Failed to create user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update user status
router.patch('/identity/users/:userId/status', requireAdminAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { isActive, reason } = req.body;

    const context = {
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'unknown'
    };

    if (!isActive) {
      await identityManager.revokeUserAccess(userId, reason || 'Admin action', context);
    } else {
      await identityManager.reactivateUser(userId, reason || 'Admin action', context);
    }

    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to update user status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enable 2FA for user
router.post('/identity/users/:userId/2fa/enable', requireAdminAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const context = {
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'unknown'
    };

    const result = await identityManager.enableTwoFactor(userId, context);
    
    res.json({
      success: true,
      qrCode: result.qrCode,
      recoveryCodes: result.recoveryCodes
    });
  } catch (error: any) {
    logger.error('Failed to enable 2FA:', error);
    res.status(500).json({ error: error.message });
  }
});

// Change user role
router.patch('/identity/users/:userId/role', requireAdminAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { role } = req.body;

    const context = {
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'unknown'
    };

    await identityManager.changeUserRole(userId, role, context);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to change user role:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user permissions
router.patch('/identity/users/:userId/permissions', requireAdminAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { permissions } = req.body;

    const context = {
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'unknown'
    };

    await identityManager.updatePermissions(userId, permissions, context);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to update permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update identity policy
router.patch('/identity/policies/:policyName', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { policyName } = req.params;
    const policy = req.body;

    identityManager.updatePolicy(policyName, policy);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to update identity policy:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// Security Policy Routes
// ============================================================================

// Get security metrics
router.get('/security/metrics', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const metrics = securityPolicyEngine.getMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error('Failed to get security metrics:', error);
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

// Get security rules
router.get('/security/rules', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const rules = securityPolicyEngine.getRules();
    res.json(rules);
  } catch (error) {
    logger.error('Failed to get security rules:', error);
    res.status(500).json({ error: 'Failed to retrieve rules' });
  }
});

// Update security rule
router.patch('/security/rules/:ruleId', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;
    const updates = req.body;

    securityPolicyEngine.updateRule(ruleId, updates);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to update security rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add security rule
router.post('/security/rules', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const rule = req.body;
    securityPolicyEngine.addRule(rule);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to add security rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete security rule
router.delete('/security/rules/:ruleId', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;
    securityPolicyEngine.deleteRule(ruleId);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to delete security rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get threat indicators
router.get('/security/threats', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const threats = securityPolicyEngine.getThreatIndicators();
    res.json(threats);
  } catch (error) {
    logger.error('Failed to get threat indicators:', error);
    res.status(500).json({ error: 'Failed to retrieve threats' });
  }
});

// Add threat indicator
router.post('/security/threats', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const indicator = req.body;
    const id = securityPolicyEngine.addThreatIndicator(indicator);
    
    res.json({ success: true, id });
  } catch (error: any) {
    logger.error('Failed to add threat indicator:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove threat indicator
router.delete('/security/threats/:id', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    securityPolicyEngine.removeThreatIndicator(id);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to remove threat indicator:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get security profiles
router.get('/security/profiles', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const profiles = securityPolicyEngine.getProfiles();
    res.json(profiles);
  } catch (error) {
    logger.error('Failed to get security profiles:', error);
    res.status(500).json({ error: 'Failed to retrieve profiles' });
  }
});

// Switch security profile
router.post('/security/profiles/switch', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { profileName } = req.body;
    securityPolicyEngine.switchProfile(profileName);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to switch security profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// Access Control Routes
// ============================================================================

// Get all roles
router.get('/access/roles', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const roles = accessControlManager.getRoles();
    res.json(roles);
  } catch (error) {
    logger.error('Failed to get roles:', error);
    res.status(500).json({ error: 'Failed to retrieve roles' });
  }
});

// Create role
router.post('/access/roles', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const role = req.body;
    accessControlManager.createRole(role);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to create role:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update role
router.patch('/access/roles/:roleId', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const updates = req.body;

    accessControlManager.updateRole(roleId, updates);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to update role:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete role
router.delete('/access/roles/:roleId', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    accessControlManager.deleteRole(roleId);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to delete role:', error);
    res.status(500).json({ error: error.message });
  }
});

// Grant permission to role
router.post('/access/roles/:roleId/permissions', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const permission = req.body;

    accessControlManager.grantPermission(roleId, permission);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to grant permission:', error);
    res.status(500).json({ error: error.message });
  }
});

// Revoke permission from role
router.delete('/access/roles/:roleId/permissions/:permissionId', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { roleId, permissionId } = req.params;
    accessControlManager.revokePermission(roleId, permissionId);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to revoke permission:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get access policies
router.get('/access/policies', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const policies = accessControlManager.getPolicies();
    res.json(policies);
  } catch (error) {
    logger.error('Failed to get access policies:', error);
    res.status(500).json({ error: 'Failed to retrieve policies' });
  }
});

// Create access policy
router.post('/access/policies', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const policy = req.body;
    accessControlManager.createPolicy(policy);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to create access policy:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check access
router.post('/access/check', requireAuth, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { resource, action } = req.body;
    
    const context = {
      userId: req.user?.id,
      userRole: req.user?.role,
      userPermissions: req.user?.permissions || [],
      resource,
      action,
      requestTime: new Date(),
      ipAddress: req.ip
    };

    const decision = await accessControlManager.checkAccess(context);
    
    res.json(decision);
  } catch (error: any) {
    logger.error('Failed to check access:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get access statistics
router.get('/access/statistics', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const stats = accessControlManager.getAccessStatistics();
    res.json(stats);
  } catch (error) {
    logger.error('Failed to get access statistics:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

// ============================================================================
// Audit and Compliance Routes
// ============================================================================

// Query audit logs
router.get('/audit/logs', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const query = {
      userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
      action: req.query.action as string,
      resourceType: req.query.resourceType as string,
      resourceId: req.query.resourceId as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      orderBy: req.query.orderBy as any,
      order: req.query.order as any
    };

    const logs = await auditComplianceManager.queryAuditLogs(query);
    
    res.json(logs);
  } catch (error: any) {
    logger.error('Failed to query audit logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get audit statistics
router.get('/audit/statistics', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date();

    const stats = await auditComplianceManager.getAuditStatistics({ start: startDate, end: endDate });
    
    res.json(stats);
  } catch (error: any) {
    logger.error('Failed to get audit statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get compliance reports
router.get('/compliance/reports', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const reports = auditComplianceManager.getReports();
    res.json(reports);
  } catch (error) {
    logger.error('Failed to get compliance reports:', error);
    res.status(500).json({ error: 'Failed to retrieve reports' });
  }
});

// Generate compliance report
router.post('/compliance/reports/generate', requireAdminAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { name, framework, startDate, endDate, ruleIds } = req.body;

    const report = await auditComplianceManager.generateComplianceReport(
      name,
      framework,
      { start: new Date(startDate), end: new Date(endDate) },
      ruleIds
    );
    
    res.json(report);
  } catch (error: any) {
    logger.error('Failed to generate compliance report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Attest compliance report
router.post('/compliance/reports/:reportId/attest', requireAdminAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { reportId } = req.params;
    await auditComplianceManager.attestReport(reportId, req.user?.id);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to attest report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get compliance rules
router.get('/compliance/rules', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const rules = auditComplianceManager.getComplianceRules();
    res.json(rules);
  } catch (error) {
    logger.error('Failed to get compliance rules:', error);
    res.status(500).json({ error: 'Failed to retrieve rules' });
  }
});

// Add compliance rule
router.post('/compliance/rules', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const rule = req.body;
    auditComplianceManager.addComplianceRule(rule);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to add compliance rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove compliance rule
router.delete('/compliance/rules/:ruleId', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;
    auditComplianceManager.removeComplianceRule(ruleId);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to remove compliance rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update audit settings
router.patch('/audit/settings', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { retentionPeriodDays, anomalyDetection } = req.body;

    if (retentionPeriodDays !== undefined) {
      auditComplianceManager.setRetentionPeriod(retentionPeriodDays);
    }

    if (anomalyDetection !== undefined) {
      auditComplianceManager.enableAnomalyDetection(anomalyDetection);
    }
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to update audit settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// Threat Detection and Analytics Routes
// ============================================================================

// Get active threats
router.get('/security/threats/active', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const filters = {
      userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
      severity: req.query.severity as any,
      type: req.query.type as any,
      status: req.query.status as string
    };

    const threats = threatDetectionEngine.getActiveThreats(filters);
    
    res.json({
      success: true,
      threats,
      count: threats.length
    });
  } catch (error: any) {
    logger.error('Failed to get active threats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user behavior analytics
router.get('/security/analytics/user/:userId', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Analyze recent user behavior
    const behavior = await threatDetectionEngine.analyzeUserBehavior(userId, {
      type: 'analysis',
      timestamp: new Date(),
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown'
    });
    
    // Get user risk score
    const riskScore = await threatDetectionEngine.calculateUserRiskScore(userId);
    
    // Get recent threats for this user
    const userThreats = threatDetectionEngine.getActiveThreats({ userId });
    
    res.json({
      success: true,
      analytics: {
        userId,
        behavior,
        riskScore,
        threats: userThreats,
        analysisTimestamp: new Date()
      }
    });
  } catch (error: any) {
    logger.error('Failed to get user analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Investigate a specific threat
router.post('/security/threats/investigate', requireAdminAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const investigateSchema = z.object({
      threatId: z.string(),
      action: z.enum(['investigate', 'mitigate', 'false_positive']),
      notes: z.string().optional()
    });

    const { threatId, action, notes } = investigateSchema.parse(req.body);
    const investigatorId = req.user?.id || 0;
    
    let result: any;
    
    switch (action) {
      case 'investigate':
        result = await threatDetectionEngine.investigateThreat(threatId, investigatorId);
        break;
      case 'mitigate':
        threatDetectionEngine.mitigateThreat(threatId, notes || 'Manual mitigation');
        result = { success: true, action: 'mitigated' };
        break;
      case 'false_positive':
        threatDetectionEngine.markThreatAsFalsePositive(threatId, notes || 'Marked as false positive');
        result = { success: true, action: 'false_positive_marked' };
        break;
    }
    
    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    logger.error('Failed to investigate threat:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get risk scores for all users
router.get('/security/risk-scores', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const filters = {
      minScore: req.query.minScore ? parseInt(req.query.minScore as string) : undefined,
      maxScore: req.query.maxScore ? parseInt(req.query.maxScore as string) : undefined,
      riskLevel: req.query.riskLevel as string
    };

    const riskScores = threatDetectionEngine.getRiskScores(filters);
    
    // Calculate statistics
    const stats = {
      total: riskScores.length,
      low: riskScores.filter(s => s.riskLevel === 'low').length,
      medium: riskScores.filter(s => s.riskLevel === 'medium').length,
      high: riskScores.filter(s => s.riskLevel === 'high').length,
      critical: riskScores.filter(s => s.riskLevel === 'critical').length,
      averageScore: riskScores.length > 0 
        ? riskScores.reduce((sum, s) => sum + s.totalScore, 0) / riskScores.length 
        : 0
    };
    
    res.json({
      success: true,
      riskScores,
      stats
    });
  } catch (error: any) {
    logger.error('Failed to get risk scores:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get security analytics dashboard data
router.get('/security/analytics/dashboard', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (req.query.days ? parseInt(req.query.days as string) : 7) * 24 * 60 * 60 * 1000);
    
    const analytics = await threatDetectionEngine.getSecurityAnalytics({
      start: startDate,
      end: endDate
    });
    
    res.json({
      success: true,
      analytics,
      period: { start: startDate, end: endDate }
    });
  } catch (error: any) {
    logger.error('Failed to get security analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manually trigger threat detection on input
router.post('/security/threats/detect', requireAdminAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const detectSchema = z.object({
      input: z.string(),
      type: z.enum(['sql', 'xss', 'all']).default('all')
    });

    const { input, type } = detectSchema.parse(req.body);
    const threats = [];
    
    if (type === 'sql' || type === 'all') {
      const sqlThreat = threatDetectionEngine.detectSQLInjection(input);
      if (sqlThreat) threats.push(sqlThreat);
    }
    
    if (type === 'xss' || type === 'all') {
      const xssThreat = threatDetectionEngine.detectXSSAttempt(input);
      if (xssThreat) threats.push(xssThreat);
    }
    
    res.json({
      success: true,
      threats,
      threatsDetected: threats.length > 0
    });
  } catch (error: any) {
    logger.error('Failed to detect threats:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// Role Template Management Routes
// ============================================================================

// Get all role templates
router.get('/access/templates', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const templates = category 
      ? roleTemplateManager.getTemplatesByCategory(category)
      : roleTemplateManager.getAllTemplates();
    
    res.json({
      success: true,
      templates,
      statistics: roleTemplateManager.getStatistics()
    });
  } catch (error: any) {
    logger.error('Failed to get templates:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific template
router.get('/access/templates/:templateId', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const template = roleTemplateManager.getTemplate(templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({
      success: true,
      template
    });
  } catch (error: any) {
    logger.error('Failed to get template:', error);
    res.status(500).json({ error: error.message });
  }
});

// Apply a template to create roles
router.post('/access/templates/apply', requireAdminAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const applySchema = z.object({
      templateId: z.string(),
      targetRoleId: z.string().optional(),
      modifications: z.object({
        addPermissions: z.array(z.any()).optional(),
        removePermissions: z.array(z.string()).optional(),
        priority: z.number().optional(),
        metadata: z.record(z.any()).optional()
      }).optional(),
      applyToUsers: z.array(z.number()).optional()
    });

    const application = applySchema.parse(req.body);
    const role = await roleTemplateManager.applyTemplate(application);
    
    // Create the role in the access control manager
    accessControlManager.createRole(role);
    
    // Assign to users if requested
    if (application.applyToUsers && application.applyToUsers.length > 0) {
      for (const userId of application.applyToUsers) {
        await identityManager.changeUserRole(userId, role.id, {
          userId: req.user?.id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || 'unknown'
        });
      }
    }
    
    res.json({
      success: true,
      role,
      usersAssigned: application.applyToUsers?.length || 0
    });
  } catch (error: any) {
    logger.error('Failed to apply template:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create custom template
router.post('/access/templates/custom', requireAdminAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const createTemplateSchema = z.object({
      name: z.string(),
      description: z.string(),
      category: z.enum(['system', 'security', 'business', 'development', 'compliance', 'custom']).default('custom'),
      permissions: z.array(z.object({
        id: z.string(),
        resource: z.string(),
        actions: z.array(z.string()),
        conditions: z.array(z.any()).optional(),
        description: z.string().optional()
      })),
      inherits: z.array(z.string()).optional(),
      priority: z.number().min(0).max(1000),
      isEditable: z.boolean().default(true),
      metadata: z.record(z.any()).optional()
    });

    const templateData = createTemplateSchema.parse(req.body);
    
    // Add author information
    if (!templateData.metadata) {
      templateData.metadata = {};
    }
    templateData.metadata.author = req.user?.username || 'System';
    
    const template = await roleTemplateManager.createCustomTemplate(templateData);
    
    res.status(201).json({
      success: true,
      template
    });
  } catch (error: any) {
    logger.error('Failed to create custom template:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clone an existing template
router.post('/access/templates/:templateId/clone', requireAdminAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { templateId } = req.params;
    const modifications = req.body;
    
    const cloned = await roleTemplateManager.cloneTemplate(templateId, modifications);
    
    res.json({
      success: true,
      template: cloned
    });
  } catch (error: any) {
    logger.error('Failed to clone template:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update custom template
router.patch('/access/templates/:templateId', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const updates = req.body;
    
    const updated = await roleTemplateManager.updateTemplate(templateId, updates);
    
    res.json({
      success: true,
      template: updated
    });
  } catch (error: any) {
    logger.error('Failed to update template:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete custom template
router.delete('/access/templates/:templateId', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    
    await roleTemplateManager.deleteTemplate(templateId);
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to delete template:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get permission preset groups
router.get('/access/presets', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const presets = category
      ? roleTemplateManager.getPresetsByCategory(category)
      : roleTemplateManager.getAllPresets();
    
    res.json({
      success: true,
      presets
    });
  } catch (error: any) {
    logger.error('Failed to get presets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Combine multiple presets
router.post('/access/presets/combine', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { presetIds } = req.body;
    
    if (!Array.isArray(presetIds) || presetIds.length === 0) {
      return res.status(400).json({ error: 'presetIds must be a non-empty array' });
    }
    
    const combined = roleTemplateManager.combinePresets(presetIds);
    
    res.json({
      success: true,
      permissions: combined
    });
  } catch (error: any) {
    logger.error('Failed to combine presets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Run quick setup wizard
router.post('/access/setup/wizard', requireAdminAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const wizardSchema = z.object({
      organizationType: z.enum(['startup', 'enterprise', 'government', 'nonprofit', 'educational']),
      departments: z.array(z.string()).optional(),
      projectId: z.string().optional(),
      userCount: z.number().optional(),
      complianceRequirements: z.array(z.string()).optional(),
      securityLevel: z.enum(['basic', 'standard', 'high', 'maximum'])
    });

    const config = wizardSchema.parse(req.body);
    const result = await roleTemplateManager.runSetupWizard(config);
    
    // Create the roles in the access control manager
    for (const role of result.roles) {
      accessControlManager.createRole(role);
    }
    
    // Log the wizard completion
    await auditComplianceManager.logEvent({
      userId: req.user?.id,
      action: 'setup_wizard_completed',
      resourceType: 'security',
      resourceId: 'wizard',
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      metadata: {
        config,
        rolesCreated: result.roles.length
      }
    });
    
    res.json({
      success: true,
      roles: result.roles,
      assignments: Array.from(result.assignments.entries()).map(([roleId, userIds]) => ({
        roleId,
        userIds
      }))
    });
  } catch (error: any) {
    logger.error('Failed to run setup wizard:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export templates
router.post('/access/templates/export', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const { templateIds } = req.body;
    
    const exportData = await roleTemplateManager.exportTemplates(templateIds);
    
    res.json({
      success: true,
      export: exportData
    });
  } catch (error: any) {
    logger.error('Failed to export templates:', error);
    res.status(500).json({ error: error.message });
  }
});

// Import templates
router.post('/access/templates/import', requireAdminAccess, async (req: Request & { user?: any }, res: Response) => {
  try {
    const importData = req.body;
    
    const result = await roleTemplateManager.importTemplates(importData);
    
    // Log the import
    await auditComplianceManager.logEvent({
      userId: req.user?.id,
      action: 'templates_imported',
      resourceType: 'templates',
      resourceId: 'import',
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      metadata: result
    });
    
    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    logger.error('Failed to import templates:', error);
    res.status(500).json({ error: error.message });
  }
});

// Validate a template
router.post('/access/templates/validate', requireAdminAccess, async (req: Request, res: Response) => {
  try {
    const template = req.body;
    
    const validation = roleTemplateManager.validateTemplate(template);
    
    res.json({
      success: validation.valid,
      errors: validation.errors
    });
  } catch (error: any) {
    logger.error('Failed to validate template:', error);
    res.status(500).json({ error: error.message });
  }
});

// Apply security middleware to all routes
router.use(securityPolicyEngine.middleware());

export default router;