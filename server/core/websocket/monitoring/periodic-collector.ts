import { logger } from '../../../utils/logger';
import { getWebSocketManager } from '../unified-setup';
import { wsAuditLogger } from '../security/audit-logger';
import { wsHealthMonitor } from '../../../utils/websocket-health';

export interface PeriodicMetrics {
  timestamp: Date;
  websockets: {
    totalConnections: number;
    totalMessages: number;
    totalErrors: number;
    namespaceMetrics: Record<string, {
      name: string;
      connections: number;
      messagesReceived: number;
      messagesSent: number;
      errors: number;
    }>;
  };
  security: {
    authFailures: number;
    rateLimitHits: number;
    suspiciousActivities: number;
    activeConnections: number;
  };
  system: {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    cpuUsage?: NodeJS.CpuUsage;
  };
  healthScore: number;
}

class PeriodicMetricsCollector {
  private metricsHistory: PeriodicMetrics[] = [];
  private maxHistorySize = 288; // 24 hours at 5-minute intervals
  private collectionInterval?: NodeJS.Timeout;
  private lastCpuUsage?: NodeJS.CpuUsage;

  /**
   * Start periodic metrics collection
   */
  start(intervalMs: number = 300000) { // Default 5 minutes
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
    }

    logger.info(`Starting periodic WebSocket metrics collection (interval: ${intervalMs}ms)`);

    // Collect initial baseline
    this.collectMetrics();

    // Start periodic collection
    this.collectionInterval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);

    // Also collect metrics every minute for real-time monitoring
    setInterval(() => {
      this.collectRealTimeMetrics();
    }, 60000); // 1 minute
  }

  /**
   * Stop periodic metrics collection
   */
  stop() {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = undefined;
      logger.info('Stopped periodic WebSocket metrics collection');
    }
  }

  /**
   * Collect comprehensive metrics snapshot
   */
  private collectMetrics() {
    try {
      const manager = getWebSocketManager();
      if (!manager) {
        logger.warn('WebSocket manager not available for metrics collection');
        return;
      }

      const wsMetrics = manager.getEnhancedMetrics();
      const securityMetrics = wsAuditLogger.getMetrics();
      const healthStatus = wsHealthMonitor.getHealthStatus();

      // Calculate CPU usage
      const currentCpuUsage = process.cpuUsage(this.lastCpuUsage);
      this.lastCpuUsage = process.cpuUsage();

      // Calculate health score based on multiple factors
      const healthScore = this.calculateHealthScore(wsMetrics, securityMetrics);

      const metrics: PeriodicMetrics = {
        timestamp: new Date(),
        websockets: {
          totalConnections: wsMetrics.overall.totalConnections,
          totalMessages: wsMetrics.overall.totalMessages,
          totalErrors: wsMetrics.overall.totalErrors,
          namespaceMetrics: Object.keys(wsMetrics.namespaces).reduce((acc: any, path) => {
            const ns = wsMetrics.namespaces[path];
            acc[path] = {
              name: ns.name,
              connections: ns.connections,
              messagesReceived: ns.messagesReceived,
              messagesSent: ns.messagesSent,
              errors: ns.errors
            };
            return acc;
          }, {})
        },
        security: {
          authFailures: securityMetrics.authFailures,
          rateLimitHits: securityMetrics.rateLimitHits,
          suspiciousActivities: securityMetrics.suspiciousActivities,
          activeConnections: securityMetrics.activeConnections
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpuUsage: currentCpuUsage
        },
        healthScore
      };

      // Add to history
      this.metricsHistory.unshift(metrics);
      
      // Trim history to max size
      if (this.metricsHistory.length > this.maxHistorySize) {
        this.metricsHistory = this.metricsHistory.slice(0, this.maxHistorySize);
      }

      // Log key metrics
      logger.info('Periodic WebSocket metrics collected', {
        connections: metrics.websockets.totalConnections,
        messages: metrics.websockets.totalMessages,
        errors: metrics.websockets.totalErrors,
        healthScore: metrics.healthScore,
        memoryUsage: `${Math.round(metrics.system.memory.heapUsed / 1024 / 1024)}MB`
      });

      // Check for alerts
      this.checkAlerts(metrics);

    } catch (error) {
      logger.error('Error collecting periodic metrics:', error);
    }
  }

  /**
   * Collect real-time metrics for immediate monitoring
   */
  private collectRealTimeMetrics() {
    try {
      const manager = getWebSocketManager();
      if (!manager) return;

      const metrics = manager.getEnhancedMetrics();
      const healthScore = this.calculateHealthScore(metrics, wsAuditLogger.getMetrics());

      // Log real-time status if significant changes
      if (this.shouldLogRealTimeUpdate(metrics, healthScore)) {
        logger.info('Real-time WebSocket status', {
          connections: metrics.overall.totalConnections,
          healthScore: healthScore.toFixed(1),
          errors: metrics.overall.totalErrors,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      logger.debug('Error in real-time metrics collection:', error);
    }
  }

  /**
   * Calculate overall health score (0-100)
   */
  private calculateHealthScore(wsMetrics: any, securityMetrics: any): number {
    let score = 100;

    // Deduct for errors (max -30 points)
    const errorRate = wsMetrics.overall.totalMessages > 0 
      ? (wsMetrics.overall.totalErrors / wsMetrics.overall.totalMessages) 
      : 0;
    score -= Math.min(30, errorRate * 100 * 3);

    // Deduct for security issues (max -25 points)
    const authFailureRate = wsMetrics.overall.totalConnections > 0
      ? (securityMetrics.authFailures / Math.max(wsMetrics.overall.totalConnections, 1))
      : 0;
    score -= Math.min(25, authFailureRate * 100 * 2.5);

    // Deduct for rate limiting (max -15 points)
    const rateLimitRate = wsMetrics.overall.totalConnections > 0
      ? (securityMetrics.rateLimitHits / Math.max(wsMetrics.overall.totalConnections, 1))
      : 0;
    score -= Math.min(15, rateLimitRate * 100 * 1.5);

    // Deduct for suspicious activities (max -20 points)
    score -= Math.min(20, securityMetrics.suspiciousActivities * 2);

    // Add points for active connections (max +10 points)
    const connectionBonus = Math.min(10, wsMetrics.overall.totalConnections / 10);
    score += connectionBonus;

    // Memory usage penalty (max -10 points)
    const memUsage = process.memoryUsage();
    const memUsagePercent = memUsage.heapUsed / memUsage.heapTotal;
    if (memUsagePercent > 0.8) {
      score -= (memUsagePercent - 0.8) * 50; // Penalty for high memory usage
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Check for alert conditions
   */
  private checkAlerts(metrics: PeriodicMetrics) {
    const alerts: string[] = [];

    // Health score alerts
    if (metrics.healthScore < 95) {
      if (metrics.healthScore < 80) {
        alerts.push(`🚨 LOW HEALTH SCORE: ${metrics.healthScore.toFixed(1)}/100`);
      } else {
        alerts.push(`⚠️ Health score below optimal: ${metrics.healthScore.toFixed(1)}/100`);
      }
    }

    // Error rate alerts
    const errorRate = metrics.websockets.totalMessages > 0 
      ? (metrics.websockets.totalErrors / metrics.websockets.totalMessages * 100)
      : 0;
    if (errorRate > 5) {
      alerts.push(`🚨 HIGH ERROR RATE: ${errorRate.toFixed(2)}%`);
    }

    // Security alerts
    if (metrics.security.authFailures > 10) {
      alerts.push(`🔒 HIGH AUTH FAILURES: ${metrics.security.authFailures}`);
    }
    if (metrics.security.suspiciousActivities > 5) {
      alerts.push(`👥 SUSPICIOUS ACTIVITIES: ${metrics.security.suspiciousActivities}`);
    }

    // Memory alerts
    const memUsagePercent = (metrics.system.memory.heapUsed / metrics.system.memory.heapTotal) * 100;
    if (memUsagePercent > 85) {
      alerts.push(`💾 HIGH MEMORY USAGE: ${memUsagePercent.toFixed(1)}%`);
    }

    // Log alerts
    if (alerts.length > 0) {
      logger.error('WebSocket System Alerts', {
        alerts,
        timestamp: metrics.timestamp.toISOString(),
        healthScore: metrics.healthScore
      });
    }
  }

  /**
   * Determine if real-time update should be logged
   */
  private shouldLogRealTimeUpdate(metrics: any, healthScore: number): boolean {
    if (this.metricsHistory.length === 0) return true;

    const lastMetrics = this.metricsHistory[0];
    
    // Log if significant change in connections (>20%)
    const connectionChange = Math.abs(metrics.overall.totalConnections - lastMetrics.websockets.totalConnections);
    if (connectionChange > Math.max(5, lastMetrics.websockets.totalConnections * 0.2)) {
      return true;
    }

    // Log if health score dropped significantly
    if (healthScore < lastMetrics.healthScore - 5) {
      return true;
    }

    // Log if new errors
    if (metrics.overall.totalErrors > lastMetrics.websockets.totalErrors) {
      return true;
    }

    return false;
  }

  /**
   * Get metrics history
   */
  getHistory(limit?: number): PeriodicMetrics[] {
    return limit ? this.metricsHistory.slice(0, limit) : [...this.metricsHistory];
  }

  /**
   * Get latest metrics
   */
  getLatestMetrics(): PeriodicMetrics | null {
    return this.metricsHistory.length > 0 ? this.metricsHistory[0] : null;
  }

  /**
   * Get metrics summary for time period
   */
  getMetricsSummary(hoursBack: number = 24): {
    avgHealthScore: number;
    totalConnections: number;
    totalMessages: number;
    totalErrors: number;
    peakConnections: number;
    errorRate: number;
    uptimeHours: number;
  } {
    const cutoffTime = new Date(Date.now() - (hoursBack * 60 * 60 * 1000));
    const relevantMetrics = this.metricsHistory.filter(m => m.timestamp >= cutoffTime);

    if (relevantMetrics.length === 0) {
      return {
        avgHealthScore: 0,
        totalConnections: 0,
        totalMessages: 0,
        totalErrors: 0,
        peakConnections: 0,
        errorRate: 0,
        uptimeHours: 0
      };
    }

    const latest = relevantMetrics[0];
    const oldest = relevantMetrics[relevantMetrics.length - 1];

    return {
      avgHealthScore: relevantMetrics.reduce((sum, m) => sum + m.healthScore, 0) / relevantMetrics.length,
      totalConnections: latest.websockets.totalConnections,
      totalMessages: latest.websockets.totalMessages - oldest.websockets.totalMessages,
      totalErrors: latest.websockets.totalErrors - oldest.websockets.totalErrors,
      peakConnections: Math.max(...relevantMetrics.map(m => m.websockets.totalConnections)),
      errorRate: latest.websockets.totalMessages > oldest.websockets.totalMessages
        ? ((latest.websockets.totalErrors - oldest.websockets.totalErrors) / 
           (latest.websockets.totalMessages - oldest.websockets.totalMessages)) * 100
        : 0,
      uptimeHours: latest.system.uptime / 3600
    };
  }

  /**
   * Export metrics for external monitoring
   */
  exportMetrics(): {
    current: PeriodicMetrics | null;
    summary24h: ReturnType<typeof this.getMetricsSummary>;
    recentHistory: PeriodicMetrics[];
  } {
    return {
      current: this.getLatestMetrics(),
      summary24h: this.getMetricsSummary(24),
      recentHistory: this.getHistory(12) // Last hour at 5-minute intervals
    };
  }
}

// Export singleton instance
export const periodicMetricsCollector = new PeriodicMetricsCollector();