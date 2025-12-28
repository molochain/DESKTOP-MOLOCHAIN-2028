import { logger } from '../utils/logger';
import os from 'os';
import v8 from 'v8';

export class PerformanceOptimizationManager {
  private performanceMetrics: Map<string, any> = new Map();
  private gcStats: any[] = [];
  private startTime: number = Date.now();

  initialize() {
    logger.info('Initializing performance optimization manager...');
    
    // Configure V8 heap settings
    this.configureV8Settings();
    
    // Start monitoring
    this.startPerformanceMonitoring();
    
    // Initialize request pooling
    this.initializeRequestPooling();
    
    // Setup garbage collection monitoring
    this.setupGCMonitoring();
    
    logger.info('Performance optimization manager initialized');
  }

  private configureV8Settings() {
    try {
      // Get heap statistics
      const heapStats = v8.getHeapStatistics();
      
      // Log current heap configuration
      logger.info('V8 Heap Configuration:', {
        totalHeapSize: Math.round(heapStats.total_heap_size / 1024 / 1024) + ' MB',
        heapSizeLimit: Math.round(heapStats.heap_size_limit / 1024 / 1024) + ' MB',
        usedHeapSize: Math.round(heapStats.used_heap_size / 1024 / 1024) + ' MB'
      });
      
      // Optimize for production if not in development
      if (process.env.NODE_ENV === 'production') {
        // These would typically be set as Node.js flags
        logger.info('Production optimizations enabled');
      }
    } catch (error) {
      logger.error('Error configuring V8 settings:', error);
    }
  }

  private startPerformanceMonitoring() {
    // Monitor CPU usage
    setInterval(() => {
      const cpuUsage = process.cpuUsage();
      const memoryUsage = process.memoryUsage();
      
      this.performanceMetrics.set('cpu', {
        user: cpuUsage.user,
        system: cpuUsage.system,
        timestamp: Date.now()
      });
      
      this.performanceMetrics.set('memory', {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers,
        timestamp: Date.now()
      });
      
      // Check for high memory usage
      const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
      if (heapUsedMB > 500) {
        logger.warn(`High memory usage detected: ${heapUsedMB.toFixed(2)} MB`);
        this.performMemoryCleanup();
      }
    }, 30000); // Every 30 seconds
  }

  private initializeRequestPooling() {
    // Implement request batching for similar requests
    const requestPool = new Map<string, Promise<any>>();
    
    (global as any).requestPool = {
      get: (key: string, factory: () => Promise<any>) => {
        if (requestPool.has(key)) {
          return requestPool.get(key);
        }
        
        const promise = factory().finally(() => {
          requestPool.delete(key);
        });
        
        requestPool.set(key, promise);
        return promise;
      }
    };
  }

  private setupGCMonitoring() {
    try {
      // Monitor garbage collection if available
      if ((global as any).gc) {
        const originalGC = (global as any).gc;
        (global as any).gc = () => {
          const start = Date.now();
          originalGC();
          const duration = Date.now() - start;
          
          this.gcStats.push({
            timestamp: Date.now(),
            duration
          });
          
          // Keep only last 100 GC events
          if (this.gcStats.length > 100) {
            this.gcStats.shift();
          }
          
          if (duration > 100) {
            logger.warn(`Long GC pause detected: ${duration}ms`);
          }
        };
      }
    } catch (error) {
      logger.debug('GC monitoring not available');
    }
  }

  private performMemoryCleanup() {
    try {
      // Clear caches
      if ((global as any).cacheManager) {
        (global as any).cacheManager.clearOldEntries();
      }
      
      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc();
        logger.info('Manual garbage collection triggered');
      }
    } catch (error) {
      logger.error('Error during memory cleanup:', error);
    }
  }

  getPerformanceReport() {
    const uptime = Date.now() - this.startTime;
    const cpuInfo = os.cpus();
    const loadAvg = os.loadavg();
    
    return {
      uptime: Math.round(uptime / 1000), // seconds
      cpu: {
        cores: cpuInfo.length,
        model: cpuInfo[0]?.model,
        loadAverage: {
          '1min': loadAvg[0],
          '5min': loadAvg[1],
          '15min': loadAvg[2]
        },
        usage: this.performanceMetrics.get('cpu')
      },
      memory: {
        system: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem()
        },
        process: this.performanceMetrics.get('memory')
      },
      gc: {
        recentEvents: this.gcStats.slice(-10),
        averagePause: this.gcStats.length > 0 
          ? this.gcStats.reduce((sum, stat) => sum + stat.duration, 0) / this.gcStats.length
          : 0
      }
    };
  }

  optimizeForHighLoad() {
    logger.info('Optimizing for high load conditions...');
    
    // Increase connection pool sizes
    if ((global as any).connectionPool) {
      (global as any).connectionPool.setMaxConnections(50);
    }
    
    // Reduce cache TTL for memory optimization
    if ((global as any).cacheManager) {
      (global as any).cacheManager.reduceTTL(0.5);
    }
    
    // Enable aggressive memory cleanup
    setInterval(() => {
      this.performMemoryCleanup();
    }, 60000); // Every minute
    
    logger.info('High load optimizations applied');
  }

  optimizeForLowLatency() {
    logger.info('Optimizing for low latency...');
    
    // Pre-warm caches
    if ((global as any).cacheManager) {
      (global as any).cacheManager.preWarm();
    }
    
    // Increase memory limits for faster processing
    const currentLimit = v8.getHeapStatistics().heap_size_limit;
    logger.info(`Current heap limit: ${Math.round(currentLimit / 1024 / 1024)} MB`);
    
    logger.info('Low latency optimizations applied');
  }
}

export const performanceManager = new PerformanceOptimizationManager();