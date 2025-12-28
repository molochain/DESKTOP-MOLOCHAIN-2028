import { logger } from './logger';

interface CMSStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  consecutiveFailures: number;
  lastErrorTime: Date | null;
  lastErrorMessage: string | null;
  responseTimeAvg: number;
  responseTimeMin: number;
  responseTimeMax: number;
  successRate: number;
  uptime: number;
  startTime: Date;
}

interface RequestRecord {
  success: boolean;
  timestamp: Date;
  responseTime?: number;
}

class CMSMonitor {
  private totalRequests: number = 0;
  private successfulRequests: number = 0;
  private failedRequests: number = 0;
  private consecutiveFailures: number = 0;
  private lastErrorTime: Date | null = null;
  private lastErrorMessage: string | null = null;
  private responseTimes: number[] = [];
  private recentRequests: RequestRecord[] = [];
  private startTime: Date = new Date();
  private readonly maxRecentRequests: number = 10;
  private readonly alertThresholdConsecutive: number = 3;
  private readonly alertThresholdFailureRate: number = 0.5;

  recordSuccess(responseTime: number): void {
    this.totalRequests++;
    this.successfulRequests++;
    this.consecutiveFailures = 0;
    this.responseTimes.push(responseTime);

    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }

    this.recentRequests.push({
      success: true,
      timestamp: new Date(),
      responseTime,
    });

    if (this.recentRequests.length > this.maxRecentRequests) {
      this.recentRequests.shift();
    }

    logger.debug('CMS request successful', {
      context: 'cms-monitor',
      responseTime,
      totalRequests: this.totalRequests,
    });
  }

  recordFailure(error: Error | string): void {
    this.totalRequests++;
    this.failedRequests++;
    this.consecutiveFailures++;
    this.lastErrorTime = new Date();
    this.lastErrorMessage = error instanceof Error ? error.message : error;

    this.recentRequests.push({
      success: false,
      timestamp: new Date(),
    });

    if (this.recentRequests.length > this.maxRecentRequests) {
      this.recentRequests.shift();
    }

    logger.error('CMS request failed', {
      context: 'cms-monitor',
      error: this.lastErrorMessage,
      consecutiveFailures: this.consecutiveFailures,
      totalRequests: this.totalRequests,
    });

    if (this.shouldAlert()) {
      this.emitAlert();
    }
  }

  shouldAlert(): boolean {
    if (this.consecutiveFailures >= this.alertThresholdConsecutive) {
      return true;
    }

    if (this.recentRequests.length >= this.maxRecentRequests) {
      const recentFailures = this.recentRequests.filter(r => !r.success).length;
      const failureRate = recentFailures / this.recentRequests.length;
      if (failureRate > this.alertThresholdFailureRate) {
        return true;
      }
    }

    return false;
  }

  private emitAlert(): void {
    const stats = this.getStats();
    logger.warn('CMS ALERT: High failure rate detected', {
      context: 'cms-monitor',
      level: 'alert',
      consecutiveFailures: this.consecutiveFailures,
      successRate: stats.successRate,
      lastError: this.lastErrorMessage,
      lastErrorTime: this.lastErrorTime?.toISOString(),
      recentFailures: this.recentRequests.filter(r => !r.success).length,
      recentTotal: this.recentRequests.length,
    });
  }

  getStats(): CMSStats {
    const avgResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
      : 0;

    const minResponseTime = this.responseTimes.length > 0
      ? Math.min(...this.responseTimes)
      : 0;

    const maxResponseTime = this.responseTimes.length > 0
      ? Math.max(...this.responseTimes)
      : 0;

    const successRate = this.totalRequests > 0
      ? (this.successfulRequests / this.totalRequests) * 100
      : 100;

    const uptime = Date.now() - this.startTime.getTime();

    return {
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      consecutiveFailures: this.consecutiveFailures,
      lastErrorTime: this.lastErrorTime,
      lastErrorMessage: this.lastErrorMessage,
      responseTimeAvg: Math.round(avgResponseTime),
      responseTimeMin: minResponseTime,
      responseTimeMax: maxResponseTime,
      successRate: Math.round(successRate * 100) / 100,
      uptime,
      startTime: this.startTime,
    };
  }

  reset(): void {
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.consecutiveFailures = 0;
    this.lastErrorTime = null;
    this.lastErrorMessage = null;
    this.responseTimes = [];
    this.recentRequests = [];
    this.startTime = new Date();
  }
}

export const cmsMonitor = new CMSMonitor();
export default cmsMonitor;
