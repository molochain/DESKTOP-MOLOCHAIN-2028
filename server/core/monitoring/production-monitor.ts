/**
 * Production Monitoring System
 * Tracks critical metrics and triggers alerts
 */

import { logger } from '../../utils/logger';
import { db } from '../database/db.service';
import { healthMetrics } from '@db/schema';
import { desc } from 'drizzle-orm';

interface MonitoringThresholds {
  responseTime: number; // ms
  errorRate: number; // percentage
  memoryUsage: number; // percentage
  dbLatency: number; // ms
  cacheHitRate: number; // percentage
}

export class ProductionMonitor {
  private static instance: ProductionMonitor;
  private thresholds: MonitoringThresholds = {
    responseTime: 500,
    errorRate: 5,
    memoryUsage: 80,
    dbLatency: 100,
    cacheHitRate: 50
  };
  
  private metrics = {
    requests: 0,
    errors: 0,
    totalResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: Infinity
  };
  
  private constructor() {
    this.startMonitoring();
  }
  
  public static getInstance(): ProductionMonitor {
    if (!ProductionMonitor.instance) {
      ProductionMonitor.instance = new ProductionMonitor();
    }
    return ProductionMonitor.instance;
  }
  
  private startMonitoring() {
    // Monitor every 30 seconds
    setInterval(() => {
      this.checkSystemHealth();
    }, 30000);
    
    // Report metrics every 5 minutes
    setInterval(() => {
      this.reportMetrics();
    }, 300000);
  }
  
  public recordRequest(responseTime: number, success: boolean) {
    this.metrics.requests++;
    this.metrics.totalResponseTime += responseTime;
    
    if (!success) {
      this.metrics.errors++;
    }
    
    if (responseTime > this.metrics.maxResponseTime) {
      this.metrics.maxResponseTime = responseTime;
    }
    
    if (responseTime < this.metrics.minResponseTime) {
      this.metrics.minResponseTime = responseTime;
    }
    
    // Check for threshold violations
    if (responseTime > this.thresholds.responseTime) {
      logger.warn(`Slow response detected: ${responseTime}ms`);
    }
  }
  
  private async checkSystemHealth() {
    const memoryUsage = process.memoryUsage();
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    if (memoryPercent > this.thresholds.memoryUsage) {
      logger.error(`High memory usage: ${memoryPercent.toFixed(2)}%`);
      this.triggerAlert('memory', `Memory usage at ${memoryPercent.toFixed(2)}%`);
    }
    
    const errorRate = this.metrics.requests > 0 
      ? (this.metrics.errors / this.metrics.requests) * 100 
      : 0;
    
    if (errorRate > this.thresholds.errorRate) {
      logger.error(`High error rate: ${errorRate.toFixed(2)}%`);
      this.triggerAlert('errors', `Error rate at ${errorRate.toFixed(2)}%`);
    }
    
    // Check database latency
    const startTime = Date.now();
    try {
      await db.select().from(healthMetrics).orderBy(desc(healthMetrics.timestamp)).limit(1);
      const dbLatency = Date.now() - startTime;
      
      if (dbLatency > this.thresholds.dbLatency) {
        logger.warn(`High database latency: ${dbLatency}ms`);
        this.triggerAlert('database', `Database latency at ${dbLatency}ms`);
      }
    } catch (error) {
      logger.error('Database health check failed:', error);
      this.triggerAlert('database', 'Database connection failed');
    }
  }
  
  private reportMetrics() {
    const avgResponseTime = this.metrics.requests > 0 
      ? this.metrics.totalResponseTime / this.metrics.requests 
      : 0;
    
    const errorRate = this.metrics.requests > 0 
      ? (this.metrics.errors / this.metrics.requests) * 100 
      : 0;
    
    logger.info('Production Metrics Report', {
      totalRequests: this.metrics.requests,
      totalErrors: this.metrics.errors,
      errorRate: `${errorRate.toFixed(2)}%`,
      avgResponseTime: `${avgResponseTime.toFixed(2)}ms`,
      maxResponseTime: `${this.metrics.maxResponseTime}ms`,
      minResponseTime: this.metrics.minResponseTime === Infinity ? '0ms' : `${this.metrics.minResponseTime}ms`
    });
    
    // Reset metrics for next period
    this.metrics = {
      requests: 0,
      errors: 0,
      totalResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity
    };
  }
  
  private triggerAlert(type: string, message: string) {
    // In production, this would send to PagerDuty, Slack, etc.
    logger.error(`ALERT [${type}]: ${message}`);
    
    // Record alert in database
    this.recordAlert(type, message).catch(err => {
      logger.error('Failed to record alert:', err);
    });
  }
  
  private async recordAlert(type: string, message: string) {
    // Log alert for now - table schema mismatch in production
    logger.warn('Alert recorded', { type, message, timestamp: new Date() });
  }
  
  public getThresholds(): MonitoringThresholds {
    return { ...this.thresholds };
  }
  
  public updateThresholds(newThresholds: Partial<MonitoringThresholds>) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    logger.info('Monitoring thresholds updated:', this.thresholds);
  }
}

export const productionMonitor = ProductionMonitor.getInstance();