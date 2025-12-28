import { logger } from './logger';
import dbOptimizer from './database-optimizer';

interface SystemMetrics {
  memory: NodeJS.MemoryUsage;
  cpu: NodeJS.CpuUsage;
  uptime: number;
  timestamp: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: SystemMetrics[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private lastCpuUsage = process.cpuUsage();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring(intervalMs: number = 60000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);

    logger.info('Performance monitoring started', { intervalMs });
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      logger.info('Performance monitoring stopped');
    }
  }

  private collectMetrics(): void {
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage(this.lastCpuUsage);
    this.lastCpuUsage = process.cpuUsage();

    const metrics: SystemMetrics = {
      memory,
      cpu,
      uptime: process.uptime(),
      timestamp: Date.now()
    };

    this.metrics.push(metrics);
    this.checkThresholds(metrics);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Run database optimization periodically
    if (this.metrics.length % 10 === 0) {
      dbOptimizer.optimizeQueries().catch(err => {
        logger.debug('Database optimization failed:', err);
      });
    }
  }

  private checkThresholds(metrics: SystemMetrics): void {
    const heapUsedMB = metrics.memory.heapUsed / 1024 / 1024;
    const heapTotalMB = metrics.memory.heapTotal / 1024 / 1024;

    // Memory warnings
    if (heapUsedMB > 400) {
      logger.warn('High memory usage detected', {
        heapUsed: `${heapUsedMB.toFixed(2)}MB`,
        heapTotal: `${heapTotalMB.toFixed(2)}MB`,
        usage: `${((heapUsedMB / heapTotalMB) * 100).toFixed(1)}%`
      });

      // Force garbage collection if available and memory is very high
      if (heapUsedMB > 600 && global.gc) {
        global.gc();
        logger.info('Forced garbage collection due to high memory usage');
      }
    }

    // CPU warnings - disable individual monitoring as it's handled by main health check
    // The previous calculation was incorrect and causing false alerts
    if (false) { // Temporarily disabled
      logger.warn('High CPU usage detected', {
        user: metrics.cpu.user,
        system: metrics.cpu.system
      });
    }
  }

  getMetrics(): SystemMetrics[] {
    return [...this.metrics];
  }

  getCurrentMetrics(): SystemMetrics {
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage();
    
    return {
      memory,
      cpu,
      uptime: process.uptime(),
      timestamp: Date.now()
    };
  }

  getAverageMetrics(minutes: number = 5): Partial<SystemMetrics> {
    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoffTime);

    if (recentMetrics.length === 0) {
      return {};
    }

    const avg = recentMetrics.reduce((acc, metric) => {
      acc.heapUsed += metric.memory.heapUsed;
      acc.heapTotal += metric.memory.heapTotal;
      acc.cpuUser += metric.cpu.user;
      acc.cpuSystem += metric.cpu.system;
      return acc;
    }, { heapUsed: 0, heapTotal: 0, cpuUser: 0, cpuSystem: 0 });

    const count = recentMetrics.length;
    return {
      memory: {
        heapUsed: avg.heapUsed / count,
        heapTotal: avg.heapTotal / count,
        external: 0,
        arrayBuffers: 0,
        rss: 0
      },
      cpu: {
        user: avg.cpuUser / count,
        system: avg.cpuSystem / count
      }
    };
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
export default performanceMonitor;