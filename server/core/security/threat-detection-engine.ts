/**
 * Advanced Security Analytics and Threat Detection Engine
 * Provides behavioral analytics, threat detection, risk scoring, and automated responses
 */

import EventEmitter from 'events';
import { db } from '../database/db.service';
import { users, auditLogs } from '@db/schema';
import { eq, and, or, gte, lte, desc, count, sql, inArray } from 'drizzle-orm';
import { logger } from '../../utils/logger';
import crypto from 'crypto';

// ============================================================================
// Type Definitions
// ============================================================================

export interface UserBehaviorProfile {
  userId: number;
  username: string;
  normalLoginTimes: { hour: number; frequency: number }[];
  normalLocations: string[];
  normalDevices: string[];
  averageSessionDuration: number;
  resourceAccessPatterns: Map<string, AccessPattern>;
  lastUpdated: Date;
  baselineEstablished: boolean;
}

export interface AccessPattern {
  resource: string;
  dailyAccess: number[];
  weeklyAccess: number[];
  averageFrequency: number;
  lastAccessed: Date;
}

export interface ThreatIndicator {
  id: string;
  type: ThreatType;
  severity: ThreatSeverity;
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
  description: string;
  indicators: string[];
  detectedAt: Date;
  status: 'active' | 'investigating' | 'mitigated' | 'false_positive';
  riskScore: number;
  evidence: any[];
  responseActions: ResponseAction[];
}

export enum ThreatType {
  BRUTE_FORCE = 'brute_force',
  ACCOUNT_ENUMERATION = 'account_enumeration',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  SUSPICIOUS_API_USAGE = 'suspicious_api_usage',
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION = 'sql_injection',
  RATE_LIMIT_VIOLATION = 'rate_limit_violation',
  ANOMALOUS_BEHAVIOR = 'anomalous_behavior',
  IMPOSSIBLE_TRAVEL = 'impossible_travel',
  UNKNOWN_DEVICE = 'unknown_device',
  SESSION_HIJACKING = 'session_hijacking',
  DATA_EXFILTRATION = 'data_exfiltration'
}

export enum ThreatSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ResponseAction {
  type: 'lockout' | 'challenge' | 'terminate_session' | 'alert' | 'restrict_access' | 'monitor';
  target: string;
  duration?: number;
  parameters?: any;
  executedAt?: Date;
  executedBy?: string;
}

export interface RiskScore {
  userId: number;
  username: string;
  baseScore: number;
  behaviorScore: number;
  threatScore: number;
  reputationScore: number;
  deviceTrustScore: number;
  totalScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  calculatedAt: Date;
}

export interface RiskFactor {
  name: string;
  value: number;
  weight: number;
  contribution: number;
  description: string;
}

export interface SecurityAnalytics {
  timeRange: { start: Date; end: Date };
  totalThreatsDetected: number;
  threatsByType: Record<ThreatType, number>;
  threatsBySeverity: Record<ThreatSeverity, number>;
  topThreatenedUsers: Array<{ userId: number; username: string; threatCount: number }>;
  topThreatSources: Array<{ source: string; count: number }>;
  averageRiskScore: number;
  highRiskUsers: number;
  mitigatedThreats: number;
  falsePositives: number;
  responseTime: { average: number; min: number; max: number };
}

export interface MLFeatureVector {
  userId: number;
  timestamp: Date;
  features: {
    loginHour: number;
    loginDayOfWeek: number;
    sessionDuration: number;
    failedLoginCount: number;
    uniqueIPs: number;
    uniqueDevices: number;
    apiCallRate: number;
    dataAccessVolume: number;
    privilegedActions: number;
    timesSinceLastLogin: number;
    locationChangeRate: number;
    abnormalTimeLogin: boolean;
    newDevice: boolean;
    newLocation: boolean;
  };
  label?: 'normal' | 'suspicious' | 'malicious';
}

// ============================================================================
// Threat Detection Engine Implementation
// ============================================================================

class ThreatDetectionEngine extends EventEmitter {
  private static instance: ThreatDetectionEngine;
  private userProfiles: Map<number, UserBehaviorProfile> = new Map();
  private activeThreats: Map<string, ThreatIndicator> = new Map();
  private riskScores: Map<number, RiskScore> = new Map();
  private loginAttempts: Map<string, { count: number; timestamps: Date[] }> = new Map();
  private apiUsagePatterns: Map<string, { calls: number; lastReset: Date }> = new Map();
  private mlDataBuffer: MLFeatureVector[] = [];
  
  // Configuration
  private readonly config = {
    bruteForce: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      lockoutDurationMs: 30 * 60 * 1000 // 30 minutes
    },
    anomaly: {
      baselineDataPoints: 30, // Number of data points needed to establish baseline
      deviationThreshold: 3, // Standard deviations from mean
      impossibleTravelSpeedKmh: 900 // Max travel speed in km/h
    },
    riskScoring: {
      weights: {
        behavior: 0.3,
        threats: 0.4,
        reputation: 0.2,
        deviceTrust: 0.1
      },
      thresholds: {
        low: 30,
        medium: 50,
        high: 70,
        critical: 85
      }
    },
    ml: {
      bufferSize: 10000,
      flushInterval: 60 * 60 * 1000 // 1 hour
    }
  };

  private constructor() {
    super();
    this.initializeEngine();
  }

  public static getInstance(): ThreatDetectionEngine {
    if (!ThreatDetectionEngine.instance) {
      ThreatDetectionEngine.instance = new ThreatDetectionEngine();
    }
    return ThreatDetectionEngine.instance;
  }

  private initializeEngine(): void {
    // Start periodic tasks
    this.startPeriodicTasks();
    
    // Load existing user profiles
    this.loadUserProfiles();
    
    logger.info('Threat Detection Engine initialized');
  }

  private startPeriodicTasks(): void {
    // Update behavior baselines every hour
    setInterval(() => {
      this.updateBehaviorBaselines();
    }, 60 * 60 * 1000);

    // Calculate risk scores every 5 minutes
    setInterval(() => {
      this.recalculateRiskScores();
    }, 5 * 60 * 1000);

    // Clean up old data every 30 minutes
    setInterval(() => {
      this.cleanupOldData();
    }, 30 * 60 * 1000);

    // Flush ML data buffer periodically
    setInterval(() => {
      this.flushMLDataBuffer();
    }, this.config.ml.flushInterval);

    // Check for impossible travel every minute
    setInterval(() => {
      this.detectImpossibleTravel();
    }, 60 * 1000);
  }

  // ============================================================================
  // Behavioral Analytics
  // ============================================================================

  public async analyzeUserBehavior(userId: number, activity: {
    type: string;
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    resource?: string;
    sessionDuration?: number;
  }): Promise<{ anomalies: string[]; score: number }> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = await this.createUserProfile(userId);
    }

    const anomalies: string[] = [];
    let anomalyScore = 0;

    // Check login time anomaly
    const hour = activity.timestamp.getHours();
    const normalHours = profile.normalLoginTimes.filter(t => t.frequency > 0.1);
    const isNormalTime = normalHours.some(t => Math.abs(t.hour - hour) <= 2);
    
    if (!isNormalTime && profile.baselineEstablished) {
      anomalies.push('unusual_login_time');
      anomalyScore += 15;
    }

    // Check device anomaly
    if (!profile.normalDevices.includes(activity.userAgent) && profile.baselineEstablished) {
      anomalies.push('unknown_device');
      anomalyScore += 20;
    }

    // Check location anomaly
    if (!profile.normalLocations.includes(activity.ipAddress) && profile.baselineEstablished) {
      anomalies.push('unknown_location');
      anomalyScore += 25;
    }

    // Check session duration anomaly
    if (activity.sessionDuration) {
      const avgDuration = profile.averageSessionDuration;
      const deviation = Math.abs(activity.sessionDuration - avgDuration) / avgDuration;
      
      if (deviation > 2 && profile.baselineEstablished) {
        anomalies.push('abnormal_session_duration');
        anomalyScore += 10;
      }
    }

    // Check resource access pattern
    if (activity.resource) {
      const pattern = profile.resourceAccessPatterns.get(activity.resource);
      
      if (pattern) {
        const dayOfWeek = activity.timestamp.getDay();
        const expectedFreq = pattern.weeklyAccess[dayOfWeek] || 0;
        
        if (expectedFreq === 0 && profile.baselineEstablished) {
          anomalies.push('unusual_resource_access');
          anomalyScore += 15;
        }
      } else if (profile.baselineEstablished) {
        anomalies.push('new_resource_access');
        anomalyScore += 10;
      }
    }

    // Update profile with new activity
    this.updateUserProfile(profile, activity);

    // Create ML feature vector for future training
    this.collectMLData(userId, activity, anomalies);

    return { anomalies, score: Math.min(anomalyScore, 100) };
  }

  private async createUserProfile(userId: number): Promise<UserBehaviorProfile> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    const profile: UserBehaviorProfile = {
      userId,
      username: user?.username || 'unknown',
      normalLoginTimes: Array(24).fill(0).map((_, hour) => ({ hour, frequency: 0 })),
      normalLocations: [],
      normalDevices: [],
      averageSessionDuration: 0,
      resourceAccessPatterns: new Map(),
      lastUpdated: new Date(),
      baselineEstablished: false
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  private updateUserProfile(profile: UserBehaviorProfile, activity: any): void {
    const hour = activity.timestamp.getHours();
    profile.normalLoginTimes[hour].frequency += 0.1;
    
    // Normalize frequencies
    const total = profile.normalLoginTimes.reduce((sum, t) => sum + t.frequency, 0);
    profile.normalLoginTimes.forEach(t => t.frequency /= total);

    // Update locations and devices
    if (!profile.normalLocations.includes(activity.ipAddress)) {
      profile.normalLocations.push(activity.ipAddress);
      if (profile.normalLocations.length > 10) {
        profile.normalLocations.shift(); // Keep only last 10
      }
    }

    if (!profile.normalDevices.includes(activity.userAgent)) {
      profile.normalDevices.push(activity.userAgent);
      if (profile.normalDevices.length > 5) {
        profile.normalDevices.shift(); // Keep only last 5
      }
    }

    // Update session duration average
    if (activity.sessionDuration) {
      profile.averageSessionDuration = 
        (profile.averageSessionDuration * 0.9) + (activity.sessionDuration * 0.1);
    }

    profile.lastUpdated = new Date();
    
    // Check if baseline can be established
    // (simplified - in production, would need more sophisticated logic)
    const dataPoints = profile.normalLocations.length + profile.normalDevices.length;
    if (dataPoints >= 10 && !profile.baselineEstablished) {
      profile.baselineEstablished = true;
      this.emit('baseline_established', { userId: profile.userId });
    }
  }

  // ============================================================================
  // Threat Detection Algorithms
  // ============================================================================

  public detectBruteForceAttack(identifier: string, success: boolean): ThreatIndicator | null {
    const key = `bruteforce_${identifier}`;
    let attempts = this.loginAttempts.get(key);
    
    if (!attempts) {
      attempts = { count: 0, timestamps: [] };
      this.loginAttempts.set(key, attempts);
    }

    const now = new Date();
    
    // Clean old timestamps
    attempts.timestamps = attempts.timestamps.filter(
      t => now.getTime() - t.getTime() < this.config.bruteForce.windowMs
    );

    if (!success) {
      attempts.count++;
      attempts.timestamps.push(now);
    } else {
      // Reset on successful login
      this.loginAttempts.delete(key);
      return null;
    }

    // Check if threshold exceeded
    if (attempts.count >= this.config.bruteForce.maxAttempts) {
      const threat: ThreatIndicator = {
        id: crypto.randomBytes(16).toString('hex'),
        type: ThreatType.BRUTE_FORCE,
        severity: ThreatSeverity.HIGH,
        description: `Brute force attack detected: ${attempts.count} failed attempts in ${this.config.bruteForce.windowMs / 1000}s`,
        indicators: [`Failed attempts: ${attempts.count}`, `Target: ${identifier}`],
        detectedAt: now,
        status: 'active',
        riskScore: 75,
        evidence: attempts.timestamps,
        responseActions: [
          {
            type: 'lockout',
            target: identifier,
            duration: this.config.bruteForce.lockoutDurationMs
          }
        ]
      };

      this.activeThreats.set(threat.id, threat);
      this.emit('threat_detected', threat);
      
      return threat;
    }

    return null;
  }

  public detectSQLInjection(input: string): ThreatIndicator | null {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
      /(\bAND\b\s*\d+\s*=\s*\d+)/gi,
      /(--|\#|\/\*|\*\/)/g,
      /(\bWAITFOR\s+DELAY\b)/gi,
      /(\bBENCHMARK\b)/gi
    ];

    const matches: string[] = [];
    
    for (const pattern of sqlPatterns) {
      const match = input.match(pattern);
      if (match) {
        matches.push(...match);
      }
    }

    if (matches.length > 0) {
      const threat: ThreatIndicator = {
        id: crypto.randomBytes(16).toString('hex'),
        type: ThreatType.SQL_INJECTION,
        severity: ThreatSeverity.CRITICAL,
        description: 'SQL injection attempt detected',
        indicators: matches,
        detectedAt: new Date(),
        status: 'active',
        riskScore: 90,
        evidence: [{ input, patterns: matches }],
        responseActions: [
          {
            type: 'terminate_session',
            target: 'current'
          },
          {
            type: 'alert',
            target: 'security_team'
          }
        ]
      };

      this.activeThreats.set(threat.id, threat);
      this.emit('threat_detected', threat);
      
      return threat;
    }

    return null;
  }

  public detectXSSAttempt(input: string): ThreatIndicator | null {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // Event handlers
      /<iframe[^>]*>/gi,
      /<embed[^>]*>/gi,
      /<object[^>]*>/gi,
      /document\.(cookie|write|location)/gi,
      /window\.(location|open)/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi
    ];

    const matches: string[] = [];
    
    for (const pattern of xssPatterns) {
      const match = input.match(pattern);
      if (match) {
        matches.push(...match);
      }
    }

    if (matches.length > 0) {
      const threat: ThreatIndicator = {
        id: crypto.randomBytes(16).toString('hex'),
        type: ThreatType.XSS_ATTEMPT,
        severity: ThreatSeverity.HIGH,
        description: 'Cross-site scripting attempt detected',
        indicators: matches,
        detectedAt: new Date(),
        status: 'active',
        riskScore: 80,
        evidence: [{ input, patterns: matches }],
        responseActions: [
          {
            type: 'terminate_session',
            target: 'current'
          },
          {
            type: 'alert',
            target: 'security_team'
          }
        ]
      };

      this.activeThreats.set(threat.id, threat);
      this.emit('threat_detected', threat);
      
      return threat;
    }

    return null;
  }

  public detectPrivilegeEscalation(userId: number, requestedPermission: string, currentRole: string): ThreatIndicator | null {
    const privilegedActions = ['admin', 'superadmin', 'delete_all', 'modify_system'];
    const userRoles = ['user', 'viewer', 'editor'];
    
    if (userRoles.includes(currentRole) && privilegedActions.includes(requestedPermission)) {
      const threat: ThreatIndicator = {
        id: crypto.randomBytes(16).toString('hex'),
        type: ThreatType.PRIVILEGE_ESCALATION,
        severity: ThreatSeverity.CRITICAL,
        userId,
        description: `Privilege escalation attempt: ${currentRole} -> ${requestedPermission}`,
        indicators: [`Current role: ${currentRole}`, `Requested: ${requestedPermission}`],
        detectedAt: new Date(),
        status: 'active',
        riskScore: 85,
        evidence: [{ userId, currentRole, requestedPermission }],
        responseActions: [
          {
            type: 'terminate_session',
            target: userId.toString()
          },
          {
            type: 'alert',
            target: 'security_team'
          },
          {
            type: 'lockout',
            target: userId.toString(),
            duration: 60 * 60 * 1000 // 1 hour
          }
        ]
      };

      this.activeThreats.set(threat.id, threat);
      this.emit('threat_detected', threat);
      
      return threat;
    }

    return null;
  }

  private async detectImpossibleTravel(): Promise<void> {
    // Implementation would check for users logging in from geographically
    // impossible locations within a short time frame
    // This is a placeholder for the actual implementation
  }

  // ============================================================================
  // Risk Scoring System
  // ============================================================================

  public async calculateUserRiskScore(userId: number): Promise<RiskScore> {
    const factors: RiskFactor[] = [];
    let totalScore = 0;

    // Behavior score
    const behaviorScore = await this.calculateBehaviorScore(userId);
    factors.push({
      name: 'behavior',
      value: behaviorScore,
      weight: this.config.riskScoring.weights.behavior,
      contribution: behaviorScore * this.config.riskScoring.weights.behavior,
      description: 'User behavior anomaly score'
    });

    // Threat score
    const threatScore = this.calculateThreatScore(userId);
    factors.push({
      name: 'threats',
      value: threatScore,
      weight: this.config.riskScoring.weights.threats,
      contribution: threatScore * this.config.riskScoring.weights.threats,
      description: 'Active threats associated with user'
    });

    // Reputation score
    const reputationScore = await this.calculateReputationScore(userId);
    factors.push({
      name: 'reputation',
      value: reputationScore,
      weight: this.config.riskScoring.weights.reputation,
      contribution: reputationScore * this.config.riskScoring.weights.reputation,
      description: 'User reputation based on history'
    });

    // Device trust score
    const deviceTrustScore = this.calculateDeviceTrustScore(userId);
    factors.push({
      name: 'deviceTrust',
      value: deviceTrustScore,
      weight: this.config.riskScoring.weights.deviceTrust,
      contribution: deviceTrustScore * this.config.riskScoring.weights.deviceTrust,
      description: 'Trust level of user devices'
    });

    // Calculate total score
    totalScore = factors.reduce((sum, factor) => sum + factor.contribution, 0);

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (totalScore < this.config.riskScoring.thresholds.low) {
      riskLevel = 'low';
    } else if (totalScore < this.config.riskScoring.thresholds.medium) {
      riskLevel = 'medium';
    } else if (totalScore < this.config.riskScoring.thresholds.high) {
      riskLevel = 'high';
    } else {
      riskLevel = 'critical';
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    const riskScore: RiskScore = {
      userId,
      username: user?.username || 'unknown',
      baseScore: 0,
      behaviorScore,
      threatScore,
      reputationScore,
      deviceTrustScore,
      totalScore,
      riskLevel,
      factors,
      calculatedAt: new Date()
    };

    this.riskScores.set(userId, riskScore);
    
    // Trigger actions based on risk level
    if (riskLevel === 'critical') {
      this.handleCriticalRisk(userId, riskScore);
    } else if (riskLevel === 'high') {
      this.handleHighRisk(userId, riskScore);
    }

    return riskScore;
  }

  private async calculateBehaviorScore(userId: number): Promise<number> {
    const profile = this.userProfiles.get(userId);
    if (!profile || !profile.baselineEstablished) {
      return 0; // No baseline, no risk
    }

    // Simplified calculation - in production would be more sophisticated
    let score = 0;
    
    // Check recent anomalies
    const recentAnomalies = await this.getRecentAnomalies(userId);
    score += recentAnomalies.length * 10;

    return Math.min(score, 100);
  }

  private calculateThreatScore(userId: number): number {
    let score = 0;
    
    for (const threat of this.activeThreats.values()) {
      if (threat.userId === userId && threat.status === 'active') {
        switch (threat.severity) {
          case ThreatSeverity.CRITICAL:
            score += 40;
            break;
          case ThreatSeverity.HIGH:
            score += 25;
            break;
          case ThreatSeverity.MEDIUM:
            score += 15;
            break;
          case ThreatSeverity.LOW:
            score += 5;
            break;
        }
      }
    }

    return Math.min(score, 100);
  }

  private async calculateReputationScore(userId: number): Promise<number> {
    // Check user history for security incidents
    const incidents = await db.select({ count: count() })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.userId, userId),
          or(
            eq(auditLogs.action, 'security_violation'),
            eq(auditLogs.action, 'threat_detected')
          ),
          gte(auditLogs.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
        )
      );

    const incidentCount = incidents[0]?.count || 0;
    
    // Higher incidents = higher risk score
    return Math.min(incidentCount * 5, 100);
  }

  private calculateDeviceTrustScore(userId: number): number {
    const profile = this.userProfiles.get(userId);
    if (!profile) return 50; // Default medium trust

    // More devices = potentially higher risk
    const deviceCount = profile.normalDevices.length;
    
    if (deviceCount <= 2) return 10; // Low risk
    if (deviceCount <= 4) return 30; // Medium risk
    return 50; // High risk for many devices
  }

  // ============================================================================
  // Automated Response Actions
  // ============================================================================

  public async executeResponseAction(action: ResponseAction): Promise<void> {
    action.executedAt = new Date();
    action.executedBy = 'threat_detection_engine';

    switch (action.type) {
      case 'lockout':
        await this.executeLockout(action);
        break;
      case 'challenge':
        await this.executeChallenge(action);
        break;
      case 'terminate_session':
        await this.executeSessionTermination(action);
        break;
      case 'alert':
        await this.executeAlert(action);
        break;
      case 'restrict_access':
        await this.executeAccessRestriction(action);
        break;
      case 'monitor':
        await this.executeMonitoring(action);
        break;
    }

    this.emit('response_action_executed', action);
  }

  private async executeLockout(action: ResponseAction): Promise<void> {
    logger.warn(`Executing lockout for target: ${action.target}`, action);
    // Implementation would integrate with identity manager to lock account
    this.emit('account_locked', { 
      target: action.target, 
      duration: action.duration,
      reason: 'threat_detection'
    });
  }

  private async executeChallenge(action: ResponseAction): Promise<void> {
    logger.info(`Executing authentication challenge for target: ${action.target}`, action);
    // Implementation would trigger additional authentication requirements
    this.emit('auth_challenge_required', {
      target: action.target,
      type: action.parameters?.type || 'mfa'
    });
  }

  private async executeSessionTermination(action: ResponseAction): Promise<void> {
    logger.warn(`Terminating session for target: ${action.target}`, action);
    // Implementation would terminate active sessions
    this.emit('session_terminated', {
      target: action.target,
      reason: 'threat_detection'
    });
  }

  private async executeAlert(action: ResponseAction): Promise<void> {
    logger.error(`Security alert for target: ${action.target}`, action);
    // Implementation would send alerts to security team
    this.emit('security_alert', {
      target: action.target,
      priority: action.parameters?.priority || 'high',
      message: action.parameters?.message
    });
  }

  private async executeAccessRestriction(action: ResponseAction): Promise<void> {
    logger.warn(`Restricting access for target: ${action.target}`, action);
    // Implementation would modify user permissions temporarily
    this.emit('access_restricted', {
      target: action.target,
      restrictions: action.parameters?.restrictions,
      duration: action.duration
    });
  }

  private async executeMonitoring(action: ResponseAction): Promise<void> {
    logger.info(`Enhanced monitoring activated for target: ${action.target}`, action);
    // Implementation would increase logging and monitoring for user
    this.emit('enhanced_monitoring', {
      target: action.target,
      level: action.parameters?.level || 'high'
    });
  }

  // ============================================================================
  // Machine Learning Integration
  // ============================================================================

  private collectMLData(userId: number, activity: any, anomalies: string[]): void {
    const feature: MLFeatureVector = {
      userId,
      timestamp: new Date(),
      features: {
        loginHour: activity.timestamp.getHours(),
        loginDayOfWeek: activity.timestamp.getDay(),
        sessionDuration: activity.sessionDuration || 0,
        failedLoginCount: this.getFailedLoginCount(userId),
        uniqueIPs: this.getUniqueIPCount(userId),
        uniqueDevices: this.getUniqueDeviceCount(userId),
        apiCallRate: this.getAPICallRate(userId),
        dataAccessVolume: 0, // Would be calculated from actual data access
        privilegedActions: 0, // Would be calculated from audit logs
        timesSinceLastLogin: 0, // Would be calculated from last login time
        locationChangeRate: 0, // Would be calculated from location history
        abnormalTimeLogin: anomalies.includes('unusual_login_time'),
        newDevice: anomalies.includes('unknown_device'),
        newLocation: anomalies.includes('unknown_location')
      },
      label: anomalies.length > 2 ? 'suspicious' : 'normal'
    };

    this.mlDataBuffer.push(feature);

    // Flush if buffer is full
    if (this.mlDataBuffer.length >= this.config.ml.bufferSize) {
      this.flushMLDataBuffer();
    }
  }

  private flushMLDataBuffer(): void {
    if (this.mlDataBuffer.length === 0) return;

    // In production, this would send data to ML training pipeline
    logger.info(`Flushing ${this.mlDataBuffer.length} ML feature vectors for training`);
    
    this.emit('ml_data_ready', {
      count: this.mlDataBuffer.length,
      data: this.mlDataBuffer
    });

    this.mlDataBuffer = [];
  }

  public async prepareTrainingData(startDate: Date, endDate: Date): Promise<MLFeatureVector[]> {
    // Implementation would extract historical data and prepare for ML training
    logger.info(`Preparing training data from ${startDate} to ${endDate}`);
    return [];
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private getFailedLoginCount(userId: number): number {
    let count = 0;
    for (const [key, attempts] of this.loginAttempts.entries()) {
      if (key.includes(userId.toString())) {
        count += attempts.count;
      }
    }
    return count;
  }

  private getUniqueIPCount(userId: number): number {
    const profile = this.userProfiles.get(userId);
    return profile?.normalLocations.length || 0;
  }

  private getUniqueDeviceCount(userId: number): number {
    const profile = this.userProfiles.get(userId);
    return profile?.normalDevices.length || 0;
  }

  private getAPICallRate(userId: number): number {
    const usage = this.apiUsagePatterns.get(`user_${userId}`);
    if (!usage) return 0;
    
    const elapsed = Date.now() - usage.lastReset.getTime();
    return (usage.calls / elapsed) * 1000 * 60; // Calls per minute
  }

  private async getRecentAnomalies(userId: number): Promise<string[]> {
    // Would query recent anomalies from database
    return [];
  }

  private handleCriticalRisk(userId: number, riskScore: RiskScore): void {
    logger.error(`Critical risk detected for user ${userId}`, riskScore);
    
    // Execute immediate response actions
    this.executeResponseAction({
      type: 'terminate_session',
      target: userId.toString()
    });
    
    this.executeResponseAction({
      type: 'lockout',
      target: userId.toString(),
      duration: 60 * 60 * 1000 // 1 hour
    });
    
    this.executeResponseAction({
      type: 'alert',
      target: 'security_team',
      parameters: {
        priority: 'critical',
        message: `Critical risk detected for user ${userId}: score ${riskScore.totalScore}`
      }
    });
  }

  private handleHighRisk(userId: number, riskScore: RiskScore): void {
    logger.warn(`High risk detected for user ${userId}`, riskScore);
    
    // Execute response actions
    this.executeResponseAction({
      type: 'challenge',
      target: userId.toString(),
      parameters: { type: 'mfa' }
    });
    
    this.executeResponseAction({
      type: 'monitor',
      target: userId.toString(),
      parameters: { level: 'high' }
    });
  }

  private async updateBehaviorBaselines(): Promise<void> {
    logger.info('Updating user behavior baselines');
    // Implementation would update baselines based on recent activity
  }

  private async recalculateRiskScores(): Promise<void> {
    for (const userId of this.userProfiles.keys()) {
      await this.calculateUserRiskScore(userId);
    }
  }

  private cleanupOldData(): void {
    const now = Date.now();
    
    // Clean old login attempts
    for (const [key, attempts] of this.loginAttempts.entries()) {
      const recent = attempts.timestamps.filter(
        t => now - t.getTime() < 24 * 60 * 60 * 1000 // Keep last 24 hours
      );
      
      if (recent.length === 0) {
        this.loginAttempts.delete(key);
      } else {
        attempts.timestamps = recent;
        attempts.count = recent.length;
      }
    }

    // Clean old threats
    for (const [id, threat] of this.activeThreats.entries()) {
      const age = now - threat.detectedAt.getTime();
      
      if (age > 7 * 24 * 60 * 60 * 1000 && threat.status !== 'active') {
        this.activeThreats.delete(id);
      }
    }
  }

  private async loadUserProfiles(): Promise<void> {
    // Load existing profiles from database
    // This is a placeholder - would load from persistent storage
    logger.info('Loading user behavior profiles');
  }

  // ============================================================================
  // Public API Methods
  // ============================================================================

  public getActiveThreats(filters?: {
    userId?: number;
    severity?: ThreatSeverity;
    type?: ThreatType;
    status?: string;
  }): ThreatIndicator[] {
    let threats = Array.from(this.activeThreats.values());
    
    if (filters) {
      if (filters.userId !== undefined) {
        threats = threats.filter(t => t.userId === filters.userId);
      }
      if (filters.severity) {
        threats = threats.filter(t => t.severity === filters.severity);
      }
      if (filters.type) {
        threats = threats.filter(t => t.type === filters.type);
      }
      if (filters.status) {
        threats = threats.filter(t => t.status === filters.status);
      }
    }

    return threats;
  }

  public async investigateThreat(threatId: string, investigatorId: number): Promise<{
    threat: ThreatIndicator;
    relatedThreats: ThreatIndicator[];
    userProfile?: UserBehaviorProfile;
    recommendations: string[];
  }> {
    const threat = this.activeThreats.get(threatId);
    
    if (!threat) {
      throw new Error('Threat not found');
    }

    threat.status = 'investigating';
    
    const relatedThreats = this.getActiveThreats({
      userId: threat.userId,
      type: threat.type
    }).filter(t => t.id !== threatId);

    const userProfile = threat.userId ? this.userProfiles.get(threat.userId) : undefined;

    const recommendations: string[] = [];
    
    switch (threat.severity) {
      case ThreatSeverity.CRITICAL:
        recommendations.push('Immediately lock the affected account');
        recommendations.push('Review all recent activity from this user');
        recommendations.push('Check for data exfiltration attempts');
        break;
      case ThreatSeverity.HIGH:
        recommendations.push('Enable enhanced monitoring for this user');
        recommendations.push('Require MFA for all future logins');
        recommendations.push('Review user permissions');
        break;
      case ThreatSeverity.MEDIUM:
        recommendations.push('Monitor user activity closely');
        recommendations.push('Consider requiring password reset');
        break;
      case ThreatSeverity.LOW:
        recommendations.push('Continue monitoring');
        recommendations.push('Update security awareness training');
        break;
    }

    logger.info(`Threat ${threatId} under investigation by user ${investigatorId}`);

    return {
      threat,
      relatedThreats,
      userProfile,
      recommendations
    };
  }

  public markThreatAsFalsePositive(threatId: string, reason: string): void {
    const threat = this.activeThreats.get(threatId);
    
    if (threat) {
      threat.status = 'false_positive';
      logger.info(`Threat ${threatId} marked as false positive: ${reason}`);
      this.emit('threat_false_positive', { threatId, reason });
    }
  }

  public mitigateThreat(threatId: string, mitigation: string): void {
    const threat = this.activeThreats.get(threatId);
    
    if (threat) {
      threat.status = 'mitigated';
      logger.info(`Threat ${threatId} mitigated: ${mitigation}`);
      this.emit('threat_mitigated', { threatId, mitigation });
    }
  }

  public getRiskScores(filters?: {
    minScore?: number;
    maxScore?: number;
    riskLevel?: string;
  }): RiskScore[] {
    let scores = Array.from(this.riskScores.values());
    
    if (filters) {
      if (filters.minScore !== undefined) {
        scores = scores.filter(s => s.totalScore >= filters.minScore);
      }
      if (filters.maxScore !== undefined) {
        scores = scores.filter(s => s.totalScore <= filters.maxScore);
      }
      if (filters.riskLevel) {
        scores = scores.filter(s => s.riskLevel === filters.riskLevel);
      }
    }

    return scores;
  }

  public async getSecurityAnalytics(timeRange: { start: Date; end: Date }): Promise<SecurityAnalytics> {
    const threats = Array.from(this.activeThreats.values()).filter(
      t => t.detectedAt >= timeRange.start && t.detectedAt <= timeRange.end
    );

    const threatsByType: Record<ThreatType, number> = {} as any;
    const threatsBySeverity: Record<ThreatSeverity, number> = {} as any;
    
    for (const type of Object.values(ThreatType)) {
      threatsByType[type] = threats.filter(t => t.type === type).length;
    }
    
    for (const severity of Object.values(ThreatSeverity)) {
      threatsBySeverity[severity] = threats.filter(t => t.severity === severity).length;
    }

    const userThreatCounts = new Map<number, { username: string; count: number }>();
    
    for (const threat of threats) {
      if (threat.userId) {
        const existing = userThreatCounts.get(threat.userId);
        if (existing) {
          existing.count++;
        } else {
          const [user] = await db.select().from(users).where(eq(users.id, threat.userId)).limit(1);
          userThreatCounts.set(threat.userId, {
            username: user?.username || 'unknown',
            count: 1
          });
        }
      }
    }

    const topThreatenedUsers = Array.from(userThreatCounts.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const ipCounts = new Map<string, number>();
    
    for (const threat of threats) {
      if (threat.ipAddress) {
        ipCounts.set(threat.ipAddress, (ipCounts.get(threat.ipAddress) || 0) + 1);
      }
    }

    const topThreatSources = Array.from(ipCounts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const riskScores = Array.from(this.riskScores.values());
    const averageRiskScore = riskScores.length > 0
      ? riskScores.reduce((sum, s) => sum + s.totalScore, 0) / riskScores.length
      : 0;

    const highRiskUsers = riskScores.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length;
    const mitigatedThreats = threats.filter(t => t.status === 'mitigated').length;
    const falsePositives = threats.filter(t => t.status === 'false_positive').length;

    return {
      timeRange,
      totalThreatsDetected: threats.length,
      threatsByType,
      threatsBySeverity,
      topThreatenedUsers,
      topThreatSources,
      averageRiskScore,
      highRiskUsers,
      mitigatedThreats,
      falsePositives,
      responseTime: {
        average: 0, // Would calculate from actual response times
        min: 0,
        max: 0
      }
    };
  }
}

// Export singleton instance
export const threatDetectionEngine = ThreatDetectionEngine.getInstance();