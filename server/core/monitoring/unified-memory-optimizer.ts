/**
 * Unified Memory Optimization System
 * Replaces all duplicate memory optimizers with a single, efficient solution
 */

import { logger } from '../../utils/logger';
import * as os from 'os';

interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  rss: number;
  percentage: number;
  external: number;
  arrayBuffers: number;
}

class UnifiedMemoryOptimizer {
  private readonly WARNING_THRESHOLD = 75;
  private readonly CRITICAL_THRESHOLD = 85;
  private readonly TARGET_THRESHOLD = 70;
  
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastOptimization = 0;
  private optimizationCooldown = 60000; // 1 minute between optimizations
  private isOptimizing = false;

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring(): void {
    // Reduced frequency monitoring - every 30 seconds instead of every 10
    this.monitoringInterval = setInterval(() => {
      this.checkMemory();
    }, 30000);
  }

  private getMemoryStats(): MemoryStats {
    const usage = process.memoryUsage();
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      rss: usage.rss,
      percentage: (used / total) * 100,
      external: usage.external || 0,
      arrayBuffers: usage.arrayBuffers || 0
    };
  }

  private checkMemory(): void {
    const stats = this.getMemoryStats();
    
    if (stats.percentage > this.CRITICAL_THRESHOLD && !this.isOptimizing) {
      const now = Date.now();
      if (now - this.lastOptimization > this.optimizationCooldown) {
        this.optimizeMemory();
      }
    }
  }

  private async optimizeMemory(): Promise<void> {
    if (this.isOptimizing) return;
    
    this.isOptimizing = true;
    this.lastOptimization = Date.now();
    
    try {
      const beforeStats = this.getMemoryStats();
      
      // Simple, effective garbage collection (ESM compatible)
      if (global.gc) {
        global.gc();
      }
      
      // Small delay to allow GC to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const afterStats = this.getMemoryStats();
      const improvement = beforeStats.percentage - afterStats.percentage;
      const heapReduction = (beforeStats.heapUsed - afterStats.heapUsed) / 1024 / 1024;
      
      logger.info('Memory optimization completed', {
        before: beforeStats.percentage.toFixed(2) + '%',
        after: afterStats.percentage.toFixed(2) + '%',
        improvement: improvement.toFixed(2) + '%',
        heapReduction: heapReduction.toFixed(2) + ' MB'
      });
      
    } catch (error) {
      logger.error('Memory optimization failed:', error);
    } finally {
      this.isOptimizing = false;
    }
  }

  public getStatus(): MemoryStats {
    return this.getMemoryStats();
  }

  public forceOptimization(): Promise<void> {
    this.lastOptimization = 0; // Reset cooldown
    return this.optimizeMemory();
  }

  public destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

// Single instance to prevent multiple optimizers
export const unifiedMemoryOptimizer = new UnifiedMemoryOptimizer();