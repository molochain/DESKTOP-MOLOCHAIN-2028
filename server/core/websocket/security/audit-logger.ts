import { logger } from '../../../utils/logger';
import { AuthenticatedUser } from './ws-auth';

export interface SecurityEvent {
  type: 'connection' | 'disconnection' | 'auth_attempt' | 'auth_success' | 'auth_failure' | 'rate_limit' | 'permission_denied' | 'suspicious_activity';
  userId?: string;
  sessionId: string;
  namespace: string;
  clientIP: string;
  userAgent?: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export interface AuditMetrics {
  totalConnections: number;
  activeConnections: number;
  authFailures: number;
  rateLimitHits: number;
  suspiciousActivities: number;
  lastSecurityIncident?: Date;
}

class WebSocketAuditLogger {
  private metrics: AuditMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    authFailures: 0,
    rateLimitHits: 0,
    suspiciousActivities: 0
  };

  private recentEvents: SecurityEvent[] = [];
  private maxRecentEvents = 1000;

  /**
   * Logs a security event
   */
  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    };

    // Add to recent events
    this.recentEvents.unshift(securityEvent);
    if (this.recentEvents.length > this.maxRecentEvents) {
      this.recentEvents.pop();
    }

    // Update metrics
    this.updateMetrics(securityEvent);

    // Log based on severity
    const logData = {
      event: event.type,
      namespace: event.namespace,
      user: event.userId || 'anonymous',
      ip: event.clientIP,
      details: event.details || {},
      sessionId: event.sessionId
    };

    switch (event.severity) {
      case 'critical':
        logger.error(`[SECURITY CRITICAL] WebSocket: ${event.type}`, logData);
        break;
      case 'high':
        logger.error(`[SECURITY HIGH] WebSocket: ${event.type}`, logData);
        break;
      case 'medium':
        logger.warn(`[SECURITY MEDIUM] WebSocket: ${event.type}`, logData);
        break;
      case 'low':
      default:
        logger.info(`[SECURITY] WebSocket: ${event.type}`, logData);
        break;
    }

    // Trigger alerts for high severity events
    if (event.severity === 'critical' || event.severity === 'high') {
      this.triggerSecurityAlert(securityEvent);
    }
  }

  /**
   * Logs successful WebSocket connection
   */
  logConnection(user: AuthenticatedUser | undefined, sessionId: string, namespace: string, clientIP: string, userAgent?: string): void {
    this.logSecurityEvent({
      type: 'connection',
      userId: user?.id,
      sessionId,
      namespace,
      clientIP,
      userAgent,
      details: {
        userRole: user?.role,
        authenticated: !!user
      },
      severity: 'low'
    });

    this.metrics.activeConnections++;
  }

  /**
   * Logs WebSocket disconnection
   */
  logDisconnection(userId: string | undefined, sessionId: string, namespace: string, clientIP: string): void {
    this.logSecurityEvent({
      type: 'disconnection',
      userId,
      sessionId,
      namespace,
      clientIP,
      severity: 'low'
    });

    this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);
  }

  /**
   * Logs authentication failure
   */
  logAuthFailure(sessionId: string, namespace: string, clientIP: string, reason: string, userAgent?: string): void {
    this.logSecurityEvent({
      type: 'auth_failure',
      sessionId,
      namespace,
      clientIP,
      userAgent,
      details: { reason },
      severity: 'medium'
    });
  }

  /**
   * Logs rate limiting event
   */
  logRateLimit(sessionId: string, namespace: string, clientIP: string, userAgent?: string): void {
    this.logSecurityEvent({
      type: 'rate_limit',
      sessionId,
      namespace,
      clientIP,
      userAgent,
      details: { action: 'connection_blocked' },
      severity: 'medium'
    });
  }

  /**
   * Logs permission denied
   */
  logPermissionDenied(userId: string, sessionId: string, namespace: string, clientIP: string, userAgent?: string): void {
    this.logSecurityEvent({
      type: 'permission_denied',
      userId,
      sessionId,
      namespace,
      clientIP,
      userAgent,
      details: { attempted_namespace: namespace },
      severity: 'high'
    });
  }

  /**
   * Logs suspicious activity
   */
  logSuspiciousActivity(sessionId: string, namespace: string, clientIP: string, activity: string, details?: Record<string, any>): void {
    this.logSecurityEvent({
      type: 'suspicious_activity',
      sessionId,
      namespace,
      clientIP,
      details: { activity, ...details },
      severity: 'high'
    });
  }

  /**
   * Updates internal metrics
   */
  private updateMetrics(event: SecurityEvent): void {
    switch (event.type) {
      case 'connection':
        this.metrics.totalConnections++;
        break;
      case 'auth_failure':
        this.metrics.authFailures++;
        break;
      case 'rate_limit':
        this.metrics.rateLimitHits++;
        break;
      case 'suspicious_activity':
        this.metrics.suspiciousActivities++;
        break;
    }

    if (event.severity === 'high' || event.severity === 'critical') {
      this.metrics.lastSecurityIncident = event.timestamp;
    }
  }

  /**
   * Triggers security alerts for critical events
   */
  private triggerSecurityAlert(event: SecurityEvent): void {
    // Here you could integrate with external alerting systems
    logger.error('🚨 SECURITY ALERT 🚨', {
      event: event.type,
      severity: event.severity,
      namespace: event.namespace,
      clientIP: event.clientIP,
      userId: event.userId || 'anonymous',
      details: event.details
    });

    // Check for patterns that might indicate attacks
    this.detectAttackPatterns(event);
  }

  /**
   * Detects potential attack patterns
   */
  private detectAttackPatterns(event: SecurityEvent): void {
    const recentEvents = this.recentEvents.slice(0, 100); // Last 100 events

    // Pattern 1: Multiple auth failures from same IP
    const authFailures = recentEvents.filter(e => 
      e.clientIP === event.clientIP && 
      e.type === 'auth_failure' && 
      (Date.now() - e.timestamp.getTime()) < 300000 // Last 5 minutes
    );

    if (authFailures.length >= 5) {
      logger.error('🚨 ATTACK PATTERN DETECTED: Brute force attempt', {
        clientIP: event.clientIP,
        failureCount: authFailures.length,
        timeWindow: '5 minutes'
      });
    }

    // Pattern 2: Rapid connection attempts
    const rapidConnections = recentEvents.filter(e => 
      e.clientIP === event.clientIP && 
      e.type === 'connection' && 
      (Date.now() - e.timestamp.getTime()) < 60000 // Last 1 minute
    );

    if (rapidConnections.length >= 10) {
      logger.error('🚨 ATTACK PATTERN DETECTED: Connection flooding', {
        clientIP: event.clientIP,
        connectionCount: rapidConnections.length,
        timeWindow: '1 minute'
      });
    }

    // Pattern 3: Permission denied attempts across multiple namespaces
    const permissionDenied = recentEvents.filter(e => 
      e.clientIP === event.clientIP && 
      e.type === 'permission_denied' && 
      (Date.now() - e.timestamp.getTime()) < 600000 // Last 10 minutes
    );

    if (permissionDenied.length >= 3) {
      const uniqueNamespaces = new Set(permissionDenied.map(e => e.namespace));
      if (uniqueNamespaces.size >= 2) {
        logger.error('🚨 ATTACK PATTERN DETECTED: Namespace reconnaissance', {
          clientIP: event.clientIP,
          attemptCount: permissionDenied.length,
          namespacesTargeted: Array.from(uniqueNamespaces)
        });
      }
    }
  }

  /**
   * Gets current security metrics
   */
  getMetrics(): AuditMetrics {
    return { ...this.metrics };
  }

  /**
   * Gets recent security events
   */
  getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.recentEvents.slice(0, limit);
  }

  /**
   * Gets events by type
   */
  getEventsByType(type: SecurityEvent['type'], limit: number = 50): SecurityEvent[] {
    return this.recentEvents
      .filter(event => event.type === type)
      .slice(0, limit);
  }

  /**
   * Gets security summary for admin dashboard
   */
  getSecuritySummary(): {
    metrics: AuditMetrics;
    recentHighSeverityEvents: SecurityEvent[];
    topThreats: Array<{ ip: string; eventCount: number; lastSeen: Date }>;
  } {
    const recentHighSeverity = this.recentEvents
      .filter(e => e.severity === 'high' || e.severity === 'critical')
      .slice(0, 10);

    // Aggregate threats by IP
    const threatMap = new Map<string, { count: number; lastSeen: Date }>();
    this.recentEvents
      .filter(e => e.severity === 'high' || e.severity === 'critical')
      .forEach(event => {
        const existing = threatMap.get(event.clientIP) || { count: 0, lastSeen: new Date(0) };
        threatMap.set(event.clientIP, {
          count: existing.count + 1,
          lastSeen: event.timestamp > existing.lastSeen ? event.timestamp : existing.lastSeen
        });
      });

    const topThreats = Array.from(threatMap.entries())
      .map(([ip, data]) => ({ ip, eventCount: data.count, lastSeen: data.lastSeen }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 5);

    return {
      metrics: this.getMetrics(),
      recentHighSeverityEvents: recentHighSeverity,
      topThreats
    };
  }
}

// Export singleton instance
export const wsAuditLogger = new WebSocketAuditLogger();