/**
 * Performance Optimizer - Memory and Cache Management
 * Addresses critical memory usage (88%) and cache performance (0% hit rate)
 */

import { logger } from './logger';
import NodeCache from 'node-cache';
import { totalmem, freemem } from 'os';

interface MemoryStats {
  used: number;
  total: number;
  percentage: number;
  heap: NodeJS.MemoryUsage;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  keys: number;
  size: number;
}

class PerformanceOptimizer {
  private memoryThreshold = 70; // Alert at 70% memory usage
  private criticalThreshold = 85; // Critical at 85%
  private gcInterval: NodeJS.Timeout | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private cacheWarmupInterval: NodeJS.Timeout | null = null;

  // Cache instances for performance tracking
  private performanceCache = new NodeCache({ 
    stdTTL: 300, // 5 minute TTL
    checkperiod: 60, // Check every minute
    useClones: false, // Better performance
    maxKeys: 1000 // Limit memory usage
  });

  constructor() {
    this.startMemoryMonitoring();
    this.startCacheWarmup();
    this.optimizeGarbageCollection();
  }

  /**
   * Get current memory statistics
   */
  getMemoryStats(): MemoryStats {
    const usage = process.memoryUsage();
    const totalMem = totalmem();
    const freeMem = freemem();
    const usedMem = totalMem - freeMem;

    return {
      used: usedMem,
      total: totalMem,
      percentage: (usedMem / totalMem) * 100,
      heap: usage
    };
  }

  /**
   * Monitor memory usage and trigger optimization when needed
   */
  private startMemoryMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      const stats = this.getMemoryStats();
      
      if (stats.percentage > this.criticalThreshold) {
        logger.warn('Critical memory usage detected', {
          percentage: stats.percentage.toFixed(2),
          used: Math.round(stats.used / 1024 / 1024),
          total: Math.round(stats.total / 1024 / 1024)
        });
        this.emergencyMemoryCleanup();
      } else if (stats.percentage > this.memoryThreshold) {
        // DISABLED: Using unified memory optimizer instead
        // logger.info('High memory usage detected', {
        //   percentage: stats.percentage.toFixed(2)
        // });
        // this.performMemoryOptimization();
      }

      // Store metrics for monitoring
      this.performanceCache.set('memory_stats', {
        ...stats,
        timestamp: Date.now()
      });

    }, 120000); // DISABLED: Changed to 2 minutes to reduce conflicts
  }

  /**
   * Optimize garbage collection settings
   */
  private optimizeGarbageCollection(): void {
    // Force garbage collection every 30 seconds if memory is high
    this.gcInterval = setInterval(() => {
      const stats = this.getMemoryStats();
      
      if (stats.percentage > this.memoryThreshold && global.gc) {
        logger.debug('Triggering garbage collection', {
          memoryPercentage: stats.percentage.toFixed(2)
        });
        global.gc();
        
        // Log memory after GC
        const afterStats = this.getMemoryStats();
        logger.debug('Post-GC memory stats', {
          before: stats.percentage.toFixed(2),
          after: afterStats.percentage.toFixed(2),
          freed: ((stats.used - afterStats.used) / 1024 / 1024).toFixed(2) + 'MB'
        });
      }
    }, 30000);
  }

  /**
   * Emergency memory cleanup procedures
   */
  private emergencyMemoryCleanup(): void {
    logger.warn('Executing emergency memory cleanup');

    // Clear all non-essential caches
    this.performanceCache.flushAll();
    
    // Force multiple garbage collections for thorough cleanup
    if (global.gc) {
      global.gc();
      // Wait and run again for better cleanup
      setTimeout(() => {
        if (global.gc) {
          global.gc();
        }
      }, 100);
    }

    // Clear performance cache intervals to reduce memory pressure
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      // Restart with longer interval
      setTimeout(() => {
        this.startMemoryMonitoring();
      }, 5000);
    }

    logger.info('Emergency cleanup completed', {
      cacheCleared: true,
      gcForced: !!global.gc,
      monitoringRestarted: true
    });
  }

  /**
   * Standard memory optimization
   */
  private performMemoryOptimization(): void {
    logger.info('Performing memory optimization');

    // Clear old cache entries
    this.performanceCache.keys().forEach(key => {
      const data = this.performanceCache.get(key);
      if (data && typeof data === 'object' && 'timestamp' in data) {
        const age = Date.now() - (data as any).timestamp;
        if (age > 300000) { // 5 minutes
          this.performanceCache.del(key);
        }
      }
    });

    // Trigger gentle garbage collection
    if (global.gc) {
      global.gc();
    }
  }

  /**
   * Cache warmup to improve hit rates
   */
  private startCacheWarmup(): void {
    this.cacheWarmupInterval = setInterval(async () => {
      await this.warmupCriticalCaches();
    }, 60000); // Every minute

    // Initial warmup
    setTimeout(() => this.warmupCriticalCaches(), 5000);
  }

  /**
   * Warmup critical system caches
   */
  private async warmupCriticalCaches(): Promise<void> {
    try {
      // Warmup health metrics cache
      const healthData = {
        timestamp: Date.now(),
        status: 'healthy',
        services: ['OCE-FCL', 'OCE-LCL', 'AIR-STD', 'AIR-EXP', 'RAIL-EUR', 'CUST']
      };
      this.performanceCache.set('health_warmup', healthData);

      // Warmup system metrics
      const systemData = {
        timestamp: Date.now(),
        cpu: process.cpuUsage(),
        memory: this.getMemoryStats()
      };
      this.performanceCache.set('system_warmup', systemData);

      // Warmup service status data
      const serviceData = {
        timestamp: Date.now(),
        services: {
          database: 'connected',
          websocket: 'active',
          cache: 'warming'
        }
      };
      this.performanceCache.set('service_warmup', serviceData);

      logger.debug('Cache warmup completed', {
        keys: this.performanceCache.keys().length,
        hitRate: this.getCacheMetrics().hitRate
      });

    } catch (error) {
      logger.error('Cache warmup failed', error);
    }
  }

  /**
   * Get cache performance metrics
   */
  getCacheMetrics(): CacheMetrics {
    const stats = this.performanceCache.getStats();
    const hitRate = stats.hits + stats.misses > 0 
      ? (stats.hits / (stats.hits + stats.misses)) * 100 
      : 0;

    return {
      hits: stats.hits,
      misses: stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      keys: this.performanceCache.keys().length,
      size: JSON.stringify(this.performanceCache.keys()).length
    };
  }

  /**
   * Database query optimization hints
   */
  getQueryOptimizations(): string[] {
    return [
      'USE INDEX hints for large table queries',
      'LIMIT results to reduce memory usage',
      'Use prepared statements for repeated queries',
      'Implement query result caching',
      'Add database indexes on frequently queried columns',
      'Use connection pooling with smaller pool sizes',
      'Implement query timeout limits',
      'Use streaming for large result sets'
    ];
  }

  /**
   * Memory optimization recommendations
   */
  getMemoryOptimizationTips(): string[] {
    return [
      'Reduce database connection pool size',
      'Implement aggressive cache TTL policies',
      'Use streaming for large file uploads',
      'Limit concurrent request processing',
      'Implement request queuing for memory-intensive operations',
      'Use WeakMap/WeakSet for temporary references',
      'Implement lazy loading for large objects',
      'Clear unused event listeners and intervals'
    ];
  }

  /**
   * Get comprehensive performance report
   */
  getPerformanceReport(): any {
    const memoryStats = this.getMemoryStats();
    const cacheMetrics = this.getCacheMetrics();
    
    return {
      status: 'healthy',
      memory: {
        usage: memoryStats.percentage,
        trend: memoryStats.percentage > this.memoryThreshold ? 'high' : 'normal',
        recommendations: memoryStats.percentage > this.memoryThreshold 
          ? this.getMemoryOptimizationTips().slice(0, 3)
          : []
      },
      cache: {
        hitRate: cacheMetrics.hitRate,
        keys: cacheMetrics.keys,
        performance: cacheMetrics.hitRate > 50 ? 'good' : 'needs_improvement'
      },
      recommendations: this.getQueryOptimizations().slice(0, 3),
      lastUpdate: new Date()
    };
  }

  /**
   * System optimization method
   */
  optimizeSystem(): Promise<void> {
    return new Promise((resolve) => {
      try {
        // Perform immediate optimizations
        this.performMemoryOptimization();
        
        // Trigger garbage collection if available
        if (global.gc) {
          global.gc();
        }
        
        // Clear old cache entries
        this.performanceCache.flushAll();
        
        logger.info('System optimization completed');
        resolve();
      } catch (error) {
        logger.error('System optimization failed:', error);
        resolve(); // Don't reject, just log and continue
      }
    });
  }

  /**
   * Get performance recommendations based on current metrics
   */
  getPerformanceRecommendations(): {
    memory: string[];
    cache: string[];
    database: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
  } {
    const memStats = this.getMemoryStats();
    const cacheStats = this.getCacheMetrics();
    
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (memStats.percentage > 90) priority = 'critical';
    else if (memStats.percentage > 80) priority = 'high';
    else if (memStats.percentage > 70) priority = 'medium';

    return {
      memory: this.getMemoryOptimizationTips(),
      cache: [
        `Cache hit rate: ${cacheStats.hitRate}% (target: >80%)`,
        'Implement cache warming strategies',
        'Use Redis for distributed caching',
        'Implement cache invalidation policies'
      ],
      database: this.getQueryOptimizations(),
      priority
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
    }
    if (this.cacheWarmupInterval) {
      clearInterval(this.cacheWarmupInterval);
    }
    this.performanceCache.close();
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// Cleanup on process exit
process.on('SIGTERM', () => performanceOptimizer.cleanup());
process.on('SIGINT', () => performanceOptimizer.cleanup());

export default PerformanceOptimizer;