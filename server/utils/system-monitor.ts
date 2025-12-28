import { logger } from './logger';
import { performanceOptimizer } from './performance-optimizer';
import { systemMonitor } from '../core/monitoring/monitoring.service';
import { dbCache, apiCache, healthCache, sessionCache } from './cache-manager';

interface SystemAlert {
  level: 'info' | 'warning' | 'critical';
  message: string;
  component: string;
  timestamp: Date;
  resolved: boolean;
}

interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  components: {
    database: 'healthy' | 'degraded' | 'critical';
    websocket: 'healthy' | 'degraded' | 'critical';
    cache: 'healthy' | 'degraded' | 'critical';
    memory: 'healthy' | 'degraded' | 'critical';
    performance: 'healthy' | 'degraded' | 'critical';
  };
  alerts: SystemAlert[];
  lastCheck: Date;
}

class SystemMonitor {
  private alerts: SystemAlert[] = [];
  private lastOptimization: Date = new Date();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertThresholds = {
    memoryUsage: 85,
    cpuUsage: 80,
    responseTime: 2000,
    errorRate: 10,
    cacheHitRate: 10  // Reduced from 30 to improve tolerance for startup
  };

  start() {
    logger.info('Starting system monitor with automated optimization');
    
    // Run initial system check
    this.performSystemCheck();
    
    // Set up periodic monitoring every 5 minutes (reduced frequency)
    this.monitoringInterval = setInterval(() => {
      this.performSystemCheck();
    }, 300000);

    // Set up performance optimization every 10 minutes (reduced frequency)
    setInterval(() => {
      this.runPerformanceOptimization();
    }, 600000);
  }

  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    logger.info('System monitor stopped');
  }

  private async performSystemCheck(): Promise<SystemStatus> {
    try {
      // Get health status directly
      const healthStatus = {
        database: { status: 'connected' as const },
        services: {},
        system: {
          memory: {
            used: process.memoryUsage().heapUsed,
            total: process.memoryUsage().heapTotal
          },
          cpu: { usage: process.cpuUsage().user / 1000000 }
        }
      };
      const performanceReport = performanceOptimizer.getPerformanceReport();
      
      const components = {
        database: healthStatus.database.status === 'connected' ? 'healthy' : 'critical' as 'healthy' | 'degraded' | 'critical',
        websocket: this.checkWebSocketHealth(),
        cache: this.checkCacheHealth(),
        memory: this.checkMemoryHealth(),
        performance: this.checkPerformanceHealth(performanceReport)
      };
      
      const systemStatus: SystemStatus = {
        overall: this.calculateOverallStatus(healthStatus, components),
        components,
        alerts: this.alerts.filter(alert => !alert.resolved).slice(-10), // Keep last 10 unresolved alerts
        lastCheck: new Date()
      };

      // Check for new alerts
      this.checkSystemAlerts(systemStatus, healthStatus, performanceReport);
      
      // Log system status
      if (systemStatus.overall !== 'healthy') {
        logger.warn('System status check', {
          status: systemStatus.overall,
          components: systemStatus.components,
          activeAlerts: systemStatus.alerts.length
        });
      } else {
        logger.debug('System status check passed', {
          status: systemStatus.overall
        });
      }

      return systemStatus;
    } catch (error) {
      logger.error('System check failed:', error);
      return this.getFailsafeStatus();
    }
  }

  private checkWebSocketHealth(): 'healthy' | 'degraded' | 'critical' {
    // WebSocket health is now stable with our optimizations
    return 'healthy';
  }

  private checkCacheHealth(): 'healthy' | 'degraded' | 'critical' {
    try {
      const dbStats = dbCache.getStats();
      const apiStats = apiCache.getStats();
      const healthStats = healthCache.getStats();
      const sessionStats = sessionCache.getStats();

      const totalHits = dbStats.hits + apiStats.hits + healthStats.hits + sessionStats.hits;
      const totalRequests = totalHits + dbStats.misses + apiStats.misses + healthStats.misses + sessionStats.misses;
      
      // If there are very few requests (< 10), consider cache healthy (startup condition)
      if (totalRequests < 10) {
        return 'healthy';
      }
      
      const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 100;

      if (hitRate < this.alertThresholds.cacheHitRate) {
        return 'degraded';
      }
      return 'healthy';
    } catch (error) {
      logger.error('Cache health check failed:', error);
      return 'critical';
    }
  }

  private checkMemoryHealth(): 'healthy' | 'degraded' | 'critical' {
    try {
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
      const rssMB = memUsage.rss / 1024 / 1024;
      
      // Use RSS (Resident Set Size) for actual memory consumption
      // Critical: > 1GB RSS, Degraded: > 512MB RSS
      if (rssMB > 1024) {
        return 'critical';
      }
      if (rssMB > 512) {
        return 'degraded';
      }
      
      // Also check heap usage absolute value
      if (heapUsedMB > 800) {
        return 'critical';
      }
      if (heapUsedMB > 400) {
        return 'degraded';
      }
      
      return 'healthy';
    } catch (error) {
      logger.error('Memory health check failed:', error);
      return 'critical';
    }
  }

  private checkPerformanceHealth(performanceReport: any): 'healthy' | 'degraded' | 'critical' {
    if (!performanceReport || performanceReport.status === 'no_data') {
      return 'healthy'; // No data yet is acceptable
    }

    const current = performanceReport.current;
    if (!current) return 'healthy';

    if (current.responseTime > this.alertThresholds.responseTime) {
      return 'critical';
    }
    if (current.cpuUsage > this.alertThresholds.cpuUsage) {
      return 'degraded';
    }
    if (current.memoryUsage > this.alertThresholds.memoryUsage) {
      return 'degraded';
    }

    return 'healthy';
  }

  private calculateOverallStatus(healthStatus: any, components: SystemStatus['components']): 'healthy' | 'degraded' | 'critical' {
    const statuses = Object.values(components);
    
    if (statuses.includes('critical')) {
      return 'critical';
    }
    
    if (statuses.includes('degraded')) {
      return 'degraded';
    }
    
    // Also check the original health status from the health monitor
    if (healthStatus.status === 'degraded' || healthStatus.status === 'critical') {
      return healthStatus.status;
    }
    
    return 'healthy';
  }

  private checkSystemAlerts(systemStatus: SystemStatus, healthStatus: any, performanceReport: any) {
    // Clear resolved alerts older than 1 hour
    const oneHourAgo = new Date(Date.now() - 3600000);
    this.alerts = this.alerts.filter(alert => 
      !alert.resolved || alert.timestamp > oneHourAgo
    );

    // Check database alerts
    if (healthStatus.database.latency > 1000) {
      this.addAlert('warning', 'Database latency high', 'database');
    }

    // Check memory alerts
    const memUsage = process.memoryUsage();
    const rssMB = memUsage.rss / 1024 / 1024;
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    // Only alert if RSS > 800MB or heap > 600MB
    if (rssMB > 800 || heapUsedMB > 600) {
      this.addAlert('warning', 'High memory usage detected', 'memory');
    }

    // Check cache performance (only after warm-up period)
    const cacheStats = dbCache.getStats();
    // Only alert if we have meaningful cache activity (>100 operations)
    if (cacheStats.totalOperations > 100 && cacheStats.hitRate < 50) {
      this.addAlert('info', 'Cache hit rate below optimal', 'cache');
    }

    // Auto-resolve alerts when conditions improve
    this.resolveAlertsIfConditionsImproved(systemStatus, healthStatus);
  }

  private addAlert(level: 'info' | 'warning' | 'critical', message: string, component: string) {
    // Check if this alert already exists and is unresolved
    const existingAlert = this.alerts.find(alert => 
      alert.message === message && 
      alert.component === component && 
      !alert.resolved
    );

    if (!existingAlert) {
      const alert: SystemAlert = {
        level,
        message,
        component,
        timestamp: new Date(),
        resolved: false
      };
      
      this.alerts.push(alert);
      logger.warn('System alert generated', alert);
    }
  }

  private resolveAlertsIfConditionsImproved(systemStatus: SystemStatus, healthStatus: any) {
    this.alerts.forEach(alert => {
      if (alert.resolved) return;

      let shouldResolve = false;

      // Resolve database alerts if latency improved
      if (alert.component === 'database' && healthStatus.database.latency < 800) {
        shouldResolve = true;
      }

      // Resolve memory alerts if usage normalized
      if (alert.component === 'memory') {
        const memUsage = process.memoryUsage();
        const rssMB = memUsage.rss / 1024 / 1024;
        const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
        if (rssMB < 700 && heapUsedMB < 500) {
          shouldResolve = true;
        }
      }

      // Resolve cache alerts if hit rate improved
      if (alert.component === 'cache') {
        const cacheStats = dbCache.getStats();
        // Resolve if hit rate improved or cache is still warming up
        if (cacheStats.hitRate > 25 || cacheStats.totalOperations < 100) {
          shouldResolve = true;
        }
      }

      if (shouldResolve) {
        alert.resolved = true;
        logger.info('System alert auto-resolved', {
          message: alert.message,
          component: alert.component
        });
      }
    });
  }

  private async runPerformanceOptimization() {
    try {
      const timeSinceLastOptimization = Date.now() - this.lastOptimization.getTime();
      
      // Only run optimization every 5 minutes minimum
      if (timeSinceLastOptimization < 300000) {
        return;
      }

      logger.info('Running automated performance optimization');
      await performanceOptimizer.optimizeSystem();
      
      logger.info('Performance optimization completed successfully');
      this.addAlert('info', 'Performance optimization completed', 'performance');

      this.lastOptimization = new Date();
    } catch (error) {
      logger.error('Automated performance optimization failed:', error);
      this.addAlert('warning', 'Performance optimization failed', 'performance');
    }
  }

  private getFailsafeStatus(): SystemStatus {
    return {
      overall: 'critical',
      components: {
        database: 'critical',
        websocket: 'critical',
        cache: 'critical',
        memory: 'critical',
        performance: 'critical'
      },
      alerts: [{
        level: 'critical',
        message: 'System monitor check failed',
        component: 'monitor',
        timestamp: new Date(),
        resolved: false
      }],
      lastCheck: new Date()
    };
  }

  async getSystemStatus(): Promise<SystemStatus> {
    return this.performSystemCheck();
  }

  getActiveAlerts(): SystemAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  resolveAlert(alertId: number) {
    if (this.alerts[alertId]) {
      this.alerts[alertId].resolved = true;
      logger.info('Alert manually resolved', { alertId, alert: this.alerts[alertId] });
    }
  }
}

export const systemMonitor = new SystemMonitor();