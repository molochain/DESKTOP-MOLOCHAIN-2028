import { Router } from 'express';
import { eq, desc, count, and, gte } from 'drizzle-orm';
import { db } from '../../core/database/db.service';
import { users, auditLogs } from '@db/schema';
import { logger } from '../../utils/logger';
import { isAuthenticated, isAdmin } from '../../core/auth/auth.service';
import { requirePermission, PERMISSIONS } from '../../middleware/requirePermission';
import crypto from 'crypto';

const router = Router();

const defaultSecuritySettings = {
  sessionTimeout: 1440,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  requireTwoFactor: false,
  enforcePasswordComplexity: true,
  auditLogsEnabled: true,
  ipWhitelist: [],
  rateLimiting: {
    enabled: true,
    maxRequests: 100,
    windowMinutes: 15
  }
};

router.get('/settings', isAuthenticated, isAdmin, requirePermission(PERMISSIONS.SECURITY_VIEW), async (req, res) => {
  try {
    res.json(defaultSecuritySettings);
  } catch (error) {
    logger.error('Error fetching security settings:', error);
    res.status(500).json({ error: 'Failed to fetch security settings' });
  }
});

router.put('/settings', isAuthenticated, isAdmin, requirePermission(PERMISSIONS.SECURITY_MANAGE), async (req, res) => {
  try {
    const updates = req.body;
    
    if (updates.sessionTimeout && (updates.sessionTimeout < 5 || updates.sessionTimeout > 10080)) {
      return res.status(400).json({ error: 'Session timeout must be between 5 minutes and 1 week' });
    }
    
    if (updates.maxLoginAttempts && (updates.maxLoginAttempts < 3 || updates.maxLoginAttempts > 10)) {
      return res.status(400).json({ error: 'Max login attempts must be between 3 and 10' });
    }
    
    if (updates.passwordMinLength && (updates.passwordMinLength < 6 || updates.passwordMinLength > 128)) {
      return res.status(400).json({ error: 'Password minimum length must be between 6 and 128' });
    }

    await db.insert(auditLogs).values({
      userId: (req.user as any).id,
      action: 'update',
      resourceType: 'security_settings',
      resourceId: 'global',
      details: { 
        message: 'Updated security settings',
        changes: updates
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Admin ${(req.user as any).username} updated security settings`);

    res.json({
      message: 'Security settings updated successfully',
      settings: { ...defaultSecuritySettings, ...updates }
    });
  } catch (error) {
    logger.error('Error updating security settings:', error);
    res.status(500).json({ error: 'Failed to update security settings' });
  }
});

router.get('/stats', isAuthenticated, isAdmin, requirePermission(PERMISSIONS.SECURITY_VIEW), async (req, res) => {
  try {
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [activeUsers] = await db.select({ count: count() }).from(users).where(eq(users.isActive, true));
    const [twoFactorUsers] = await db.select({ count: count() }).from(users).where(
      and(eq(users.isActive, true), eq(users.twoFactorEnabled, true))
    );

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const [recentFailedLogins] = await db.select({ count: count() }).from(auditLogs).where(
      and(
        eq(auditLogs.action, 'login_failed'),
        gte(auditLogs.createdAt, twentyFourHoursAgo)
      )
    );

    let securityScore = 0;
    
    const twoFactorAdoption = totalUsers.count > 0 ? (twoFactorUsers.count / totalUsers.count) * 100 : 0;
    securityScore += Math.min(25, twoFactorAdoption * 0.25);
    
    const failureRate = totalUsers.count > 0 ? (recentFailedLogins.count / totalUsers.count) : 0;
    securityScore += Math.max(0, 20 - (failureRate * 10));
    
    const activeUserRatio = totalUsers.count > 0 ? (activeUsers.count / totalUsers.count) * 100 : 0;
    securityScore += Math.min(15, activeUserRatio * 0.15);
    
    const [defaultAdmin] = await db.select().from(users).where(
      and(eq(users.email, 'admin@molochain.com'), eq(users.username, 'admin'))
    ).limit(1);
    if (!defaultAdmin) securityScore += 20;
    
    securityScore += 20;

    res.json({
      totalUsers: totalUsers.count,
      activeUsers: activeUsers.count,
      twoFactorUsers: twoFactorUsers.count,
      recentFailedLogins: recentFailedLogins.count,
      securityScore: Math.round(securityScore),
      lastSecurityScan: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching security stats:', error);
    res.status(500).json({ error: 'Failed to fetch security statistics' });
  }
});

router.get('/audit-logs', isAuthenticated, isAdmin, requirePermission(PERMISSIONS.AUDIT_VIEW), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await db.select({
      id: auditLogs.id,
      userId: auditLogs.userId,
      action: auditLogs.action,
      resourceType: auditLogs.resourceType,
      resourceId: auditLogs.resourceId,
      details: auditLogs.details,
      ipAddress: auditLogs.ipAddress,
      timestamp: auditLogs.createdAt
    })
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

    const enrichedLogs = logs.map((log) => ({
      ...log,
      username: 'System'
    }));

    res.json(enrichedLogs);
  } catch (error) {
    logger.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

router.post('/scan', isAuthenticated, isAdmin, requirePermission(PERMISSIONS.SECURITY_MANAGE), async (req, res) => {
  try {
    const scanResults = [];

    const [usersWithWeakPasswords] = await db.select({ count: count() }).from(users).where(eq(users.isActive, true));
    if (usersWithWeakPasswords.count > 0) {
      scanResults.push({
        severity: 'medium',
        category: 'authentication',
        message: 'Some users may have weak passwords',
        recommendation: 'Enforce password complexity requirements'
      });
    }

    const defaultAdminQuery = await db.execute(`
      SELECT id FROM users 
      WHERE email = 'admin@molochain.com' AND username = 'admin' 
      LIMIT 1
    `);
    const defaultAdmin = (defaultAdminQuery.rowCount || 0) > 0;
    
    if (defaultAdmin) {
      scanResults.push({
        severity: 'high',
        category: 'authentication',
        message: 'Default admin account detected',
        recommendation: 'Change default admin credentials'
      });
    }

    const [inactiveAdmins] = await db.select({ count: count() }).from(users).where(
      and(eq(users.role, 'admin'), eq(users.isActive, false))
    );
    
    if (inactiveAdmins.count > 0) {
      scanResults.push({
        severity: 'low',
        category: 'access_control',
        message: `${inactiveAdmins.count} inactive admin accounts found`,
        recommendation: 'Review and remove unnecessary admin accounts'
      });
    }

    const [totalUsers] = await db.select({ count: count() }).from(users).where(eq(users.isActive, true));
    const [twoFactorUsers] = await db.select({ count: count() }).from(users).where(
      and(eq(users.isActive, true), eq(users.twoFactorEnabled, true))
    );
    
    const twoFactorAdoption = totalUsers.count > 0 ? (twoFactorUsers.count / totalUsers.count) * 100 : 0;
    
    if (twoFactorAdoption < 50) {
      scanResults.push({
        severity: 'medium',
        category: 'authentication',
        message: `Two-factor authentication adoption is ${Math.round(twoFactorAdoption)}%`,
        recommendation: 'Encourage or enforce two-factor authentication'
      });
    }

    await db.insert(auditLogs).values({
      userId: (req.user as any).id,
      action: 'security_scan',
      resourceType: 'system',
      resourceId: 'global',
      details: { 
        message: 'Performed security scan',
        results: scanResults,
        timestamp: new Date().toISOString()
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Admin ${(req.user as any).username} performed security scan`);

    res.json({
      message: 'Security scan completed',
      timestamp: new Date().toISOString(),
      results: scanResults,
      summary: {
        total: scanResults.length,
        high: scanResults.filter(r => r.severity === 'high').length,
        medium: scanResults.filter(r => r.severity === 'medium').length,
        low: scanResults.filter(r => r.severity === 'low').length
      }
    });
  } catch (error) {
    logger.error('Error running security scan:', error);
    res.status(500).json({ error: 'Failed to run security scan' });
  }
});

router.post('/validate-password', isAuthenticated, isAdmin, requirePermission(PERMISSIONS.SECURITY_VIEW), async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const strength = {
      score: 0,
      feedback: [] as string[],
      isValid: false
    };

    if (password.length >= 8) {
      strength.score += 20;
    } else {
      strength.feedback.push('Password must be at least 8 characters long');
    }

    if (/[A-Z]/.test(password)) {
      strength.score += 20;
    } else {
      strength.feedback.push('Password must contain at least one uppercase letter');
    }

    if (/[a-z]/.test(password)) {
      strength.score += 20;
    } else {
      strength.feedback.push('Password must contain at least one lowercase letter');
    }

    if (/\d/.test(password)) {
      strength.score += 20;
    } else {
      strength.feedback.push('Password must contain at least one number');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength.score += 20;
    } else {
      strength.feedback.push('Password must contain at least one special character');
    }

    strength.isValid = strength.score >= 80;

    res.json(strength);
  } catch (error) {
    logger.error('Error validating password:', error);
    res.status(500).json({ error: 'Failed to validate password' });
  }
});

export default router;
