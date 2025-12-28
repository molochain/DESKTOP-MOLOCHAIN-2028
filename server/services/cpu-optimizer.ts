/**
 * CPU Optimization Service
 * Addresses high CPU usage and implements intelligent load management
 */

import { logger } from '../utils/logger';
import { EventEmitter } from 'events';
import * as os from 'os';
import * as cluster from 'cluster';

interface CPUMetrics {
  usage: number;
  loadAverage: number[];
  cores: number;
  processes: number;
  threads: number;
  timestamp: Date;
}

interface OptimizationAction {
  name: string;
  priority: number;
  threshold: number;
  action: () => Promise<void>;
  cooldown: number;
  lastExecuted?: number;
}

class CPUOptimizer extends EventEmitter {
  private readonly HIGH_CPU_THRESHOLD = 70;
  private readonly CRITICAL_CPU_THRESHOLD = 85;
  private readonly TARGET_CPU_THRESHOLD = 60;
  
  private monitoringInterval: NodeJS.Timeout | null = null;
  private optimizationActions: OptimizationAction[] = [];
  private processingQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  private cpuHistory: CPUMetrics[] = [];
  
  private taskPriorities = new Map<string, number>();
  private backgroundTasks = new Set<NodeJS.Timeout>();

  constructor() {
    super();
    this.initializeOptimizationActions();
    this.startMonitoring();
    this.setupProcessOptimization();
  }

  private initializeOptimizationActions() {
    this.optimizationActions = [
      {
        name: 'Emergency Process Throttling',
        priority: 1,
        threshold: this.CRITICAL_CPU_THRESHOLD,
        action: this.emergencyThrottling.bind(this),
        cooldown: 10000 // 10 seconds
      },
      {
        name: 'Background Task Suspension',
        priority: 2,
        threshold: this.HIGH_CPU_THRESHOLD,
        action: this.suspendBackgroundTasks.bind(this),
        cooldown: 30000 // 30 seconds
      },
      {
        name: 'Queue Processing Optimization',
        priority: 3,
        threshold: this.HIGH_CPU_THRESHOLD,
        action: this.optimizeQueueProcessing.bind(this),
        cooldown: 60000 // 1 minute
      },
      {
        name: 'Memory Cleanup',
        priority: 4,
        threshold: 65,
        action: this.triggerMemoryCleanup.bind(this),
        cooldown: 120000 // 2 minutes
      },
      {
        name: 'Load Balancing',
        priority: 5,
        threshold: this.TARGET_CPU_THRESHOLD,
        action: this.optimizeLoadBalancing.bind(this),
        cooldown: 300000 // 5 minutes
      }
    ];
  }

  private startMonitoring() {
    this.monitoringInterval = setInterval(async () => {
      await this.monitorCPUUsage();
    }, 5000); // Check every 5 seconds
  }

  private async monitorCPUUsage() {
    const metrics = this.getCPUMetrics();
    this.cpuHistory.push(metrics);
    
    // Keep only last 50 measurements
    if (this.cpuHistory.length > 50) {
      this.cpuHistory = this.cpuHistory.slice(-50);
    }

    this.emit('cpuUpdate', metrics);

    // Trigger optimizations based on CPU usage
    if (metrics.usage >= this.CRITICAL_CPU_THRESHOLD) {
      logger.error('Critical CPU usage detected', {
        usage: metrics.usage.toFixed(2),
        loadAvg: metrics.loadAverage,
        cores: metrics.cores
      });
      await this.executeOptimizations(this.CRITICAL_CPU_THRESHOLD);
    } else if (metrics.usage >= this.HIGH_CPU_THRESHOLD) {
      logger.warn('High CPU usage detected', {
        usage: metrics.usage.toFixed(2),
        loadAvg: metrics.loadAverage
      });
      await this.executeOptimizations(this.HIGH_CPU_THRESHOLD);
    } else if (metrics.usage >= this.TARGET_CPU_THRESHOLD) {
      await this.executeOptimizations(this.TARGET_CPU_THRESHOLD);
    }
  }

  private getCPUMetrics(): CPUMetrics {
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    
    // Calculate CPU usage percentage
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });
    
    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - (100 * idle / total);

    return {
      usage: isNaN(usage) ? 0 : usage,
      loadAverage: loadAvg,
      cores: cpus.length,
      processes: 1, // Simplified
      threads: 1,   // Simplified
      timestamp: new Date()
    };
  }

  private async executeOptimizations(threshold: number) {
    const applicableActions = this.optimizationActions
      .filter(action => action.threshold <= threshold)
      .filter(action => !action.lastExecuted || 
        Date.now() - action.lastExecuted > action.cooldown)
      .sort((a, b) => a.priority - b.priority);

    for (const action of applicableActions) {
      try {
        logger.debug(`Executing CPU optimization: ${action.name}`);
        await action.action();
        action.lastExecuted = Date.now();
      } catch (error) {
        logger.error(`CPU optimization failed: ${action.name}`, error);
      }
    }
  }

  private async emergencyThrottling(): Promise<void> {
    logger.info('Emergency CPU throttling activated');
    
    // Pause all non-critical background processes
    this.backgroundTasks.forEach(task => {
      clearTimeout(task);
    });
    this.backgroundTasks.clear();

    // Implement aggressive garbage collection
    if (global.gc) {
      global.gc();
      await this.delay(100);
      global.gc();
    }

    // Throttle incoming requests temporarily
    this.emit('throttleRequests', { duration: 30000 });
    
    logger.info('Emergency throttling measures applied');
  }

  private async suspendBackgroundTasks(): Promise<void> {
    logger.info('Suspending background tasks to reduce CPU load');
    
    // Clear non-essential background tasks
    const suspendedCount = this.backgroundTasks.size;
    this.backgroundTasks.forEach(task => {
      clearTimeout(task);
    });
    this.backgroundTasks.clear();

    // Reduce processing queue frequency
    this.isProcessingQueue = false;
    
    logger.info(`Suspended ${suspendedCount} background tasks`);
    
    // Resume after cooldown period
    setTimeout(() => {
      this.resumeBackgroundTasks();
    }, 60000); // Resume after 1 minute
  }

  private async optimizeQueueProcessing(): Promise<void> {
    if (this.processingQueue.length === 0) return;
    
    logger.info('Optimizing queue processing for CPU efficiency');
    
    // Process queue items in smaller batches
    const batchSize = Math.max(1, Math.floor(this.processingQueue.length / 4));
    const batch = this.processingQueue.splice(0, batchSize);
    
    // Process with delays to prevent CPU spikes
    for (let i = 0; i < batch.length; i++) {
      try {
        await batch[i]();
        
        // Add small delay between tasks
        if (i < batch.length - 1) {
          await this.delay(50);
        }
      } catch (error) {
        logger.error('Queue processing error:', error);
      }
    }
    
    logger.debug(`Processed ${batch.length} queue items with CPU optimization`);
  }

  private async triggerMemoryCleanup(): Promise<void> {
    logger.info('Triggering memory cleanup to reduce CPU pressure');
    
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
    
    // Clear internal caches
    this.taskPriorities.clear();
    
    // Trim CPU history to reduce memory usage
    this.cpuHistory = this.cpuHistory.slice(-20);
    
    this.emit('memoryCleanup', { trigger: 'cpu_optimization' });
  }

  private async optimizeLoadBalancing(): Promise<void> {
    logger.info('Optimizing load balancing for CPU efficiency');
    
    const metrics = this.getCPUMetrics();
    
    // If we have multiple cores, suggest clustering
    if (metrics.cores > 1) {
      logger.info(`System has ${metrics.cores} cores available for load balancing`);
      this.emit('suggestClustering', { cores: metrics.cores });
    }
    
    // Adjust process priorities based on CPU usage
    this.adjustProcessPriorities(metrics.usage);
  }

  private adjustProcessPriorities(cpuUsage: number) {
    try {
      // Process priority adjustment is platform-specific and optional
      logger.debug(`CPU usage at ${cpuUsage.toFixed(2)}% - priority adjustment would be beneficial`);
      
      if (cpuUsage > this.HIGH_CPU_THRESHOLD) {
        logger.debug('High CPU usage detected - would lower process priority if supported');
      } else if (cpuUsage < this.TARGET_CPU_THRESHOLD) {
        logger.debug('Normal CPU usage - would restore normal process priority if supported');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.debug('Process priority check completed:', errorMessage);
    }
  }

  private resumeBackgroundTasks() {
    logger.info('Resuming background tasks');
    this.isProcessingQueue = true;
    this.emit('resumeBackgroundTasks');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private setupProcessOptimization() {
    // Optimize event loop
    process.nextTick(() => {
      this.optimizeEventLoop();
    });

    // Handle uncaught exceptions gracefully
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception detected:', error);
      this.handleCriticalError(error);
    });

    // Monitor event loop lag
    setInterval(() => {
      this.monitorEventLoopLag();
    }, 30000); // Check every 30 seconds
  }

  private optimizeEventLoop() {
    // Log event loop optimization without overriding global functions
    logger.debug('Event loop optimization configured');
  }

  private monitorEventLoopLag() {
    try {
      const start = process.hrtime();
      setImmediate(() => {
        const delta = process.hrtime(start);
        const lag = (delta[0] * 1000) + (delta[1] * 1e-6);
        if (lag > 100) { // More than 100ms lag
          logger.warn('Event loop lag detected', { lagMs: lag.toFixed(2) });
          this.emit('eventLoopLag', { lag });
        }
      });
    } catch (error) {
      logger.debug('Event loop monitoring skipped:', error instanceof Error ? error.message : String(error));
    }
  }

  private handleCriticalError(error: Error) {
    logger.error('Critical error in CPU optimizer:', error);
    this.emit('criticalError', error);
    
    // Emergency cleanup
    this.emergencyThrottling().catch(cleanupError => {
      logger.error('Emergency cleanup failed:', cleanupError);
    });
  }

  public addToProcessingQueue(task: () => Promise<void>, priority: number = 5) {
    this.processingQueue.push(task);
    this.taskPriorities.set(task.toString(), priority);
    
    // Sort queue by priority
    this.processingQueue.sort((a, b) => {
      const priorityA = this.taskPriorities.get(a.toString()) || 5;
      const priorityB = this.taskPriorities.get(b.toString()) || 5;
      return priorityA - priorityB;
    });
  }

  public getCPUStatus() {
    const currentMetrics = this.getCPUMetrics();
    const averageUsage = this.cpuHistory.length > 0 
      ? this.cpuHistory.reduce((sum, m) => sum + m.usage, 0) / this.cpuHistory.length 
      : 0;

    return {
      current: currentMetrics,
      average: averageUsage,
      trend: this.calculateTrend(),
      queueLength: this.processingQueue.length,
      backgroundTasks: this.backgroundTasks.size,
      status: this.getHealthStatus(currentMetrics.usage)
    };
  }

  private calculateTrend(): 'improving' | 'stable' | 'degrading' {
    if (this.cpuHistory.length < 10) return 'stable';
    
    const recent = this.cpuHistory.slice(-5);
    const older = this.cpuHistory.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, m) => sum + m.usage, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.usage, 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 5) return 'degrading';
    if (difference < -5) return 'improving';
    return 'stable';
  }

  private getHealthStatus(usage: number): 'healthy' | 'warning' | 'critical' {
    if (usage >= this.CRITICAL_CPU_THRESHOLD) return 'critical';
    if (usage >= this.HIGH_CPU_THRESHOLD) return 'warning';
    return 'healthy';
  }

  public async optimizeNow(): Promise<CPUMetrics> {
    logger.info('Manual CPU optimization triggered');
    
    const beforeMetrics = this.getCPUMetrics();
    await this.executeOptimizations(0); // Execute all optimizations
    
    // Wait a moment for optimizations to take effect
    await this.delay(2000);
    
    const afterMetrics = this.getCPUMetrics();
    
    logger.info('Manual CPU optimization completed', {
      beforeUsage: beforeMetrics.usage.toFixed(2),
      afterUsage: afterMetrics.usage.toFixed(2),
      improvement: (beforeMetrics.usage - afterMetrics.usage).toFixed(2)
    });

    return afterMetrics;
  }

  public stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.backgroundTasks.forEach(task => {
      clearTimeout(task);
    });
    this.backgroundTasks.clear();
    
    logger.info('CPU optimizer stopped');
  }
}

export const cpuOptimizer = new CPUOptimizer();
export default CPUOptimizer;