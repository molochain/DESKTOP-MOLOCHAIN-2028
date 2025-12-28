/**
 * Centralized Identity Management Service
 * Orchestrates all authentication, user, and security operations
 */

import { Request, Response } from 'express';
import { db } from '../database/db.service';
import { users, auditLogs } from '@db/schema';
import { eq, and, or, gte, lte, desc, count, sql } from 'drizzle-orm';
import { logger } from '../../utils/logger';
import { hashPassword, verifyPassword, getUserById, getUserByEmail } from '../auth/auth.service';
import { generateTOTPSecret, enableTwoFactorAuth, disableTwoFactorAuth, verifyTOTP } from '../auth/two-factor.service';
import { securityMonitor } from '../../middleware/advanced-security';
import { threatDetectionEngine } from '../security/threat-detection-engine';
import EventEmitter from 'events';
import crypto from 'crypto';

export interface IdentityContext {
  userId: number;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  twoFactorEnabled: boolean;
}

export interface IdentityPolicy {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays?: number;
    preventReuse?: number;
  };
  sessionPolicy: {
    maxDuration: number;
    idleTimeout: number;
    maxConcurrentSessions?: number;
    requireMFA?: boolean;
  };
  accessPolicy: {
    ipWhitelist?: string[];
    ipBlacklist?: string[];
    allowedCountries?: string[];
    blockedCountries?: string[];
    workingHours?: { start: string; end: string; timezone: string };
  };
  securityPolicy: {
    enforceRateLimit: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number;
    requireEmailVerification: boolean;
    auditAllActions: boolean;
  };
}

export interface IdentityEvent {
  type: 'login' | 'logout' | 'register' | 'password_change' | 'role_change' | 'permission_change' | 'lockout' | 'unlock' | '2fa_enable' | '2fa_disable';
  userId?: number;
  details: any;
  timestamp: Date;
  context?: Partial<IdentityContext>;
}

class IdentityManagerService extends EventEmitter {
  private static instance: IdentityManagerService;
  private policies: Map<string, IdentityPolicy> = new Map();
  private activeSessions: Map<string, IdentityContext> = new Map();
  private loginAttempts: Map<string, number> = new Map();
  private lockedAccounts: Map<number, Date> = new Map();

  private constructor() {
    super();
    this.initializeDefaultPolicies();
    this.startCleanupTasks();
  }

  public static getInstance(): IdentityManagerService {
    if (!IdentityManagerService.instance) {
      IdentityManagerService.instance = new IdentityManagerService();
    }
    return IdentityManagerService.instance;
  }

  private initializeDefaultPolicies() {
    this.policies.set('default', {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expirationDays: 90
      },
      sessionPolicy: {
        maxDuration: 24 * 60 * 60 * 1000, // 24 hours
        idleTimeout: 30 * 60 * 1000, // 30 minutes
        maxConcurrentSessions: 3
      },
      accessPolicy: {
        ipWhitelist: [],
        ipBlacklist: []
      },
      securityPolicy: {
        enforceRateLimit: true,
        maxLoginAttempts: 5,
        lockoutDuration: 30 * 60 * 1000, // 30 minutes
        requireEmailVerification: false,
        auditAllActions: true
      }
    });

    // Admin policy with stricter requirements
    this.policies.set('admin', {
      ...this.policies.get('default')!,
      sessionPolicy: {
        maxDuration: 8 * 60 * 60 * 1000, // 8 hours
        idleTimeout: 15 * 60 * 1000, // 15 minutes
        maxConcurrentSessions: 1,
        requireMFA: true
      },
      securityPolicy: {
        ...this.policies.get('default')!.securityPolicy,
        maxLoginAttempts: 3,
        lockoutDuration: 60 * 60 * 1000, // 1 hour
        requireEmailVerification: true
      }
    });
  }

  private startCleanupTasks() {
    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);

    // Clear old login attempts every hour
    setInterval(() => {
      this.loginAttempts.clear();
    }, 60 * 60 * 1000);

    // Check and unlock accounts every minute
    setInterval(() => {
      this.checkLockedAccounts();
    }, 60 * 1000);
  }

  private cleanupExpiredSessions() {
    const now = Date.now();
    for (const [sessionId, context] of this.activeSessions.entries()) {
      const policy = this.getApplicablePolicy(context.role);
      const sessionAge = now - new Date(sessionId.split('-')[1] || '0').getTime();
      
      if (sessionAge > policy.sessionPolicy.maxDuration) {
        this.activeSessions.delete(sessionId);
        this.emit('session_expired', { sessionId, userId: context.userId });
      }
    }
  }

  private checkLockedAccounts() {
    const now = new Date();
    for (const [userId, lockTime] of this.lockedAccounts.entries()) {
      const policy = this.policies.get('default')!;
      const lockDuration = now.getTime() - lockTime.getTime();
      
      if (lockDuration > policy.securityPolicy.lockoutDuration) {
        this.lockedAccounts.delete(userId);
        this.emit('account_unlocked', { userId, unlockTime: now });
      }
    }
  }

  private getApplicablePolicy(role: string): IdentityPolicy {
    return this.policies.get(role) || this.policies.get('default')!;
  }

  // User lifecycle management
  public async createUser(userData: {
    username: string;
    email: string;
    password: string;
    role?: string;
    permissions?: string[];
  }, context?: Partial<IdentityContext>) {
    try {
      const policy = this.getApplicablePolicy(userData.role || 'user');
      
      // Validate password against policy
      const passwordValidation = this.validatePasswordPolicy(userData.password, policy.passwordPolicy);
      if (!passwordValidation.valid) {
        throw new Error(`Password policy violation: ${passwordValidation.errors.join(', ')}`);
      }

      // Check for existing user
      const existingUser = await getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(userData.password);
      const [newUser] = await db.insert(users).values({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'user',
        permissions: userData.permissions || ['read'],
        isActive: !policy.securityPolicy.requireEmailVerification
      }).returning();

      // Audit log
      if (policy.securityPolicy.auditAllActions) {
        await this.auditAction('create_user', newUser.id, {
          createdBy: context?.userId,
          username: userData.username,
          role: userData.role
        }, context);
      }

      this.emit('user_created', { 
        userId: newUser.id, 
        username: newUser.username,
        role: newUser.role,
        context 
      });

      return newUser;
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw error;
    }
  }

  public async authenticateUser(credentials: {
    email: string;
    password: string;
    totpToken?: string;
  }, context: Partial<IdentityContext>) {
    try {
      const ipKey = `${credentials.email}-${context.ipAddress}`;
      const attempts = this.loginAttempts.get(ipKey) || 0;
      const policy = this.policies.get('default')!;

      // Check if account is locked
      const user = await getUserByEmail(credentials.email);
      if (!user) {
        this.loginAttempts.set(ipKey, attempts + 1);
        throw new Error('Invalid credentials');
      }

      if (this.lockedAccounts.has(user.id)) {
        throw new Error('Account is locked. Please try again later.');
      }

      // Check login attempts
      if (attempts >= policy.securityPolicy.maxLoginAttempts) {
        this.lockedAccounts.set(user.id, new Date());
        this.emit('account_locked', { userId: user.id, reason: 'max_attempts' });
        
        // Report to threat detection engine
        threatDetectionEngine.detectBruteForceAttack(
          `${credentials.email}-${context.ipAddress}`,
          false
        );
        
        throw new Error('Account locked due to too many failed attempts');
      }

      // Verify password
      const [dbUser] = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1);
      const isValidPassword = await verifyPassword(credentials.password, dbUser.password);
      
      if (!isValidPassword) {
        this.loginAttempts.set(ipKey, attempts + 1);
        
        // Report failed login to threat detection
        threatDetectionEngine.detectBruteForceAttack(
          `${credentials.email}-${context.ipAddress}`,
          false
        );
        
        await this.auditAction('login_failed', user.id, { reason: 'invalid_password' }, context);
        throw new Error('Invalid credentials');
      }

      // Check 2FA if enabled
      const rolePolicy = this.getApplicablePolicy(user.role);
      if (user.twoFactorEnabled || rolePolicy.sessionPolicy.requireMFA) {
        if (!credentials.totpToken) {
          return { requiresTwoFactor: true, userId: user.id };
        }
        
        if (!verifyTOTP(credentials.totpToken, user.twoFactorSecret!)) {
          this.loginAttempts.set(ipKey, attempts + 1);
          await this.auditAction('login_failed', user.id, { reason: '2fa_failed' }, context);
          throw new Error('Invalid 2FA token');
        }
      }

      // Check access policy
      if (!this.checkAccessPolicy(user.role, context)) {
        await this.auditAction('login_denied', user.id, { reason: 'access_policy' }, context);
        throw new Error('Access denied by security policy');
      }
      
      // Report successful login to threat detection (clears failed attempts)
      threatDetectionEngine.detectBruteForceAttack(
        `${credentials.email}-${context.ipAddress}`,
        true
      );
      
      // Analyze user behavior
      await threatDetectionEngine.analyzeUserBehavior(user.id, {
        type: 'login',
        timestamp: new Date(),
        ipAddress: context.ipAddress || 'unknown',
        userAgent: context.userAgent || 'unknown'
      });
      
      // Calculate risk score
      const riskScore = await threatDetectionEngine.calculateUserRiskScore(user.id);
      
      // Check if additional authentication is needed based on risk
      if (riskScore.riskLevel === 'high' || riskScore.riskLevel === 'critical') {
        if (!credentials.totpToken && user.twoFactorEnabled) {
          logger.warn(`High risk detected for user ${user.id}. Risk level: ${riskScore.riskLevel}`);
          return { requiresTwoFactor: true, userId: user.id, riskLevel: riskScore.riskLevel };
        }
      }

      // Create session
      const sessionId = this.createSession({
        ...context,
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        twoFactorEnabled: user.twoFactorEnabled
      } as IdentityContext);

      // Clear login attempts
      this.loginAttempts.delete(ipKey);

      // Update last login
      await db.update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      // Audit successful login
      await this.auditAction('login', user.id, { sessionId }, context);

      this.emit('user_authenticated', { 
        userId: user.id, 
        sessionId,
        context 
      });

      return {
        success: true,
        user,
        sessionId
      };
    } catch (error) {
      logger.error('Authentication failed:', error);
      throw error;
    }
  }

  public async revokeUserAccess(userId: number, reason: string, context?: Partial<IdentityContext>) {
    try {
      // Deactivate user
      await db.update(users)
        .set({ isActive: false })
        .where(eq(users.id, userId));

      // Revoke all sessions
      for (const [sessionId, sessionContext] of this.activeSessions.entries()) {
        if (sessionContext.userId === userId) {
          this.activeSessions.delete(sessionId);
        }
      }

      // Audit action
      await this.auditAction('access_revoked', userId, { reason }, context);

      this.emit('access_revoked', { userId, reason, context });
    } catch (error) {
      logger.error('Failed to revoke access:', error);
      throw error;
    }
  }

  public async reactivateUser(userId: number, reason: string = 'Admin action', context?: Partial<IdentityContext>) {
    try {
      // Check if user exists
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user is already active
      if (user.isActive) {
        logger.info(`User ${userId} is already active`);
        return { success: true, alreadyActive: true };
      }

      // Apply policy checks for reactivation
      const policy = this.getApplicablePolicy(user.role);
      
      // Check if the requesting user has permission to reactivate
      if (context?.userId) {
        const [requestingUser] = await db.select().from(users).where(eq(users.id, context.userId)).limit(1);
        if (requestingUser && !['admin', 'superadmin'].includes(requestingUser.role)) {
          throw new Error('Insufficient permissions to reactivate user');
        }
      }

      // Reactivate user
      await db.update(users)
        .set({ 
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Clear any lockouts
      this.lockedAccounts.delete(userId);
      
      // Clear login attempts for this user
      for (const [key, _] of this.loginAttempts.entries()) {
        if (key.includes(user.email)) {
          this.loginAttempts.delete(key);
        }
      }

      // Audit action
      await this.auditAction('access_reactivated', userId, { 
        reason,
        reactivatedBy: context?.userId 
      }, context);

      this.emit('access_reactivated', { userId, reason, context });

      return { success: true, alreadyActive: false };
    } catch (error) {
      logger.error('Failed to reactivate user:', error);
      throw error;
    }
  }

  // Session management
  private createSession(context: IdentityContext): string {
    const sessionId = `${context.userId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const policy = this.getApplicablePolicy(context.role);

    // Check concurrent sessions
    const userSessions = Array.from(this.activeSessions.values())
      .filter(s => s.userId === context.userId);
    
    if (policy.sessionPolicy.maxConcurrentSessions && 
        userSessions.length >= policy.sessionPolicy.maxConcurrentSessions) {
      // Remove oldest session
      const oldestSession = userSessions.sort((a, b) => 
        a.sessionId.localeCompare(b.sessionId))[0];
      this.activeSessions.delete(oldestSession.sessionId);
    }

    this.activeSessions.set(sessionId, context);
    return sessionId;
  }

  public validateSession(sessionId: string): IdentityContext | null {
    const context = this.activeSessions.get(sessionId);
    if (!context) return null;

    const policy = this.getApplicablePolicy(context.role);
    const sessionAge = Date.now() - new Date(sessionId.split('-')[1] || '0').getTime();

    if (sessionAge > policy.sessionPolicy.maxDuration) {
      this.activeSessions.delete(sessionId);
      return null;
    }

    return context;
  }

  public endSession(sessionId: string, context?: Partial<IdentityContext>) {
    const sessionContext = this.activeSessions.get(sessionId);
    if (sessionContext) {
      this.activeSessions.delete(sessionId);
      this.auditAction('logout', sessionContext.userId, { sessionId }, context);
      this.emit('session_ended', { sessionId, userId: sessionContext.userId });
    }
  }

  // Policy management
  public updatePolicy(policyName: string, policy: Partial<IdentityPolicy>) {
    const existing = this.policies.get(policyName) || this.policies.get('default')!;
    this.policies.set(policyName, { ...existing, ...policy });
    this.emit('policy_updated', { policyName, policy });
  }

  public getPolicy(policyName: string): IdentityPolicy | undefined {
    return this.policies.get(policyName);
  }

  // Access control
  private checkAccessPolicy(role: string, context: Partial<IdentityContext>): boolean {
    const policy = this.getApplicablePolicy(role);
    
    // Check IP whitelist/blacklist
    if (context.ipAddress) {
      if (policy.accessPolicy.ipBlacklist?.includes(context.ipAddress)) {
        return false;
      }
      if (policy.accessPolicy.ipWhitelist?.length && 
          !policy.accessPolicy.ipWhitelist.includes(context.ipAddress)) {
        return false;
      }
    }

    // Check working hours
    if (policy.accessPolicy.workingHours) {
      const now = new Date();
      const { start, end } = policy.accessPolicy.workingHours;
      const currentHour = now.getHours();
      const startHour = parseInt(start.split(':')[0]);
      const endHour = parseInt(end.split(':')[0]);
      
      if (currentHour < startHour || currentHour > endHour) {
        return false;
      }
    }

    return true;
  }

  public async changeUserRole(userId: number, newRole: string, context?: Partial<IdentityContext>) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) throw new Error('User not found');

      const oldRole = user.role;
      
      // Check for privilege escalation attempts
      if (context?.userId && context.userId !== userId) {
        const threat = threatDetectionEngine.detectPrivilegeEscalation(
          context.userId,
          newRole,
          context.role || 'user'
        );
        
        if (threat) {
          logger.error(`Privilege escalation attempt detected from user ${context.userId}`);
          throw new Error('Privilege escalation attempt detected. Action blocked.');
        }
      }
      
      await db.update(users)
        .set({ role: newRole, updatedAt: new Date() })
        .where(eq(users.id, userId));

      await this.auditAction('role_change', userId, { 
        oldRole, 
        newRole,
        changedBy: context?.userId 
      }, context);

      this.emit('role_changed', { userId, oldRole, newRole, context });

      return { success: true };
    } catch (error) {
      logger.error('Failed to change role:', error);
      throw error;
    }
  }

  public async updatePermissions(userId: number, permissions: string[], context?: Partial<IdentityContext>) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) throw new Error('User not found');

      const oldPermissions = user.permissions;
      
      await db.update(users)
        .set({ permissions, updatedAt: new Date() })
        .where(eq(users.id, userId));

      await this.auditAction('permission_change', userId, { 
        oldPermissions, 
        newPermissions: permissions,
        changedBy: context?.userId 
      }, context);

      this.emit('permissions_changed', { userId, oldPermissions, newPermissions: permissions, context });

      return { success: true };
    } catch (error) {
      logger.error('Failed to update permissions:', error);
      throw error;
    }
  }

  // Password management
  private validatePasswordPolicy(password: string, policy: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters`);
    }
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain uppercase letters');
    }
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain lowercase letters');
    }
    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain numbers');
    }
    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain special characters');
    }

    return { valid: errors.length === 0, errors };
  }

  public async changePassword(userId: number, oldPassword: string, newPassword: string, context?: Partial<IdentityContext>) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) throw new Error('User not found');

      // Verify old password
      const isValid = await verifyPassword(oldPassword, user.password);
      if (!isValid) throw new Error('Invalid current password');

      // Validate new password
      const policy = this.getApplicablePolicy(user.role);
      const validation = this.validatePasswordPolicy(newPassword, policy.passwordPolicy);
      if (!validation.valid) {
        throw new Error(`Password policy violation: ${validation.errors.join(', ')}`);
      }

      // Update password
      const hashedPassword = await hashPassword(newPassword);
      await db.update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, userId));

      await this.auditAction('password_change', userId, {}, context);
      this.emit('password_changed', { userId, context });

      return { success: true };
    } catch (error) {
      logger.error('Failed to change password:', error);
      throw error;
    }
  }

  // Audit and monitoring
  private async auditAction(action: string, userId: number | null, details: any, context?: Partial<IdentityContext>) {
    try {
      await db.insert(auditLogs).values({
        userId: userId || context?.userId || 0,
        action,
        resourceType: 'identity',
        resourceId: userId?.toString() || 'system',
        details,
        ipAddress: context?.ipAddress || 'unknown',
        userAgent: context?.userAgent || 'unknown'
      });
    } catch (error) {
      logger.error('Failed to audit action:', error);
    }
  }

  // Statistics and reporting
  public async getIdentityStatistics() {
    try {
      const [totalUsers] = await db.select({ count: count() }).from(users);
      const [activeUsers] = await db.select({ count: count() }).from(users).where(eq(users.isActive, true));
      const [adminUsers] = await db.select({ count: count() }).from(users).where(eq(users.role, 'admin'));
      const [twoFactorUsers] = await db.select({ count: count() }).from(users).where(eq(users.twoFactorEnabled, true));

      const activeSessions = this.activeSessions.size;
      const lockedAccounts = this.lockedAccounts.size;
      const securityStats = securityMonitor.getSecurityStats();

      return {
        users: {
          total: totalUsers.count,
          active: activeUsers.count,
          admins: adminUsers.count,
          twoFactorEnabled: twoFactorUsers.count
        },
        sessions: {
          active: activeSessions,
          byRole: this.getSessionsByRole()
        },
        security: {
          lockedAccounts,
          recentFailedLogins: Array.from(this.loginAttempts.values()).reduce((a, b) => a + b, 0),
          ...securityStats
        },
        policies: {
          configured: this.policies.size,
          names: Array.from(this.policies.keys())
        }
      };
    } catch (error) {
      logger.error('Failed to get statistics:', error);
      throw error;
    }
  }

  private getSessionsByRole(): Record<string, number> {
    const byRole: Record<string, number> = {};
    for (const context of this.activeSessions.values()) {
      byRole[context.role] = (byRole[context.role] || 0) + 1;
    }
    return byRole;
  }

  // Two-factor authentication management
  public async enableTwoFactor(userId: number, context?: Partial<IdentityContext>) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) throw new Error('User not found');

      const { secret, qrCode, recoveryCodes } = await generateTOTPSecret(user.username, user.email!);
      
      await this.auditAction('2fa_enable', userId, {}, context);
      this.emit('2fa_enabled', { userId, context });

      return { secret, qrCode, recoveryCodes };
    } catch (error) {
      logger.error('Failed to enable 2FA:', error);
      throw error;
    }
  }

  public async disableTwoFactor(userId: number, context?: Partial<IdentityContext>) {
    try {
      await disableTwoFactorAuth(userId);
      
      await this.auditAction('2fa_disable', userId, {}, context);
      this.emit('2fa_disabled', { userId, context });

      return { success: true };
    } catch (error) {
      logger.error('Failed to disable 2FA:', error);
      throw error;
    }
  }

  // Compliance and reporting
  public async generateComplianceReport(startDate: Date, endDate: Date) {
    try {
      const auditData = await db.select()
        .from(auditLogs)
        .where(and(
          gte(auditLogs.createdAt, startDate),
          lte(auditLogs.createdAt, endDate)
        ))
        .orderBy(desc(auditLogs.createdAt));

      const report = {
        period: { start: startDate, end: endDate },
        summary: {
          totalEvents: auditData.length,
          uniqueUsers: new Set(auditData.map(log => log.userId)).size,
          eventTypes: this.categorizeEvents(auditData)
        },
        securityEvents: auditData.filter(log => 
          ['login_failed', 'access_revoked', 'account_locked'].includes(log.action)
        ),
        administrativeActions: auditData.filter(log => 
          ['role_change', 'permission_change', 'create_user'].includes(log.action)
        ),
        statistics: await this.getIdentityStatistics()
      };

      return report;
    } catch (error) {
      logger.error('Failed to generate compliance report:', error);
      throw error;
    }
  }

  private categorizeEvents(events: any[]): Record<string, number> {
    const categories: Record<string, number> = {};
    for (const event of events) {
      categories[event.action] = (categories[event.action] || 0) + 1;
    }
    return categories;
  }
}

export const identityManager = IdentityManagerService.getInstance();