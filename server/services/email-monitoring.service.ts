import { createLoggerWithContext } from '../utils/logger';

const log = createLoggerWithContext('EmailMonitoring');

interface EmailFailureRecord {
  timestamp: Date;
  template: string | null;
  recipient: string;
  errorMessage: string;
}

interface EmailStats {
  totalSent: number;
  totalFailed: number;
  failureRate: number;
  lastSuccessTime: Date | null;
  lastFailureTime: Date | null;
  recentFailures: EmailFailureRecord[];
  uptimeSeconds: number;
  alertThresholdExceeded: boolean;
}

class EmailMonitoringService {
  private totalSent: number = 0;
  private totalFailed: number = 0;
  private lastSuccessTime: Date | null = null;
  private lastFailureTime: Date | null = null;
  private recentFailures: EmailFailureRecord[] = [];
  private startTime: Date = new Date();
  
  private readonly MAX_RECENT_FAILURES = 50;
  private readonly FAILURE_RATE_THRESHOLD = 0.20;

  recordSuccess(recipient: string, template?: string): void {
    this.totalSent++;
    this.lastSuccessTime = new Date();
    
    log.info('Email sent successfully', {
      recipient: this.maskEmail(recipient),
      template: template || 'direct',
      totalSent: this.totalSent,
      totalFailed: this.totalFailed,
    });

    this.checkFailureRate();
  }

  recordFailure(
    recipient: string,
    errorMessage: string,
    template?: string
  ): void {
    this.totalFailed++;
    this.lastFailureTime = new Date();

    const failureRecord: EmailFailureRecord = {
      timestamp: new Date(),
      template: template || null,
      recipient: this.maskEmail(recipient),
      errorMessage: this.sanitizeError(errorMessage),
    };

    this.recentFailures.unshift(failureRecord);
    if (this.recentFailures.length > this.MAX_RECENT_FAILURES) {
      this.recentFailures = this.recentFailures.slice(0, this.MAX_RECENT_FAILURES);
    }

    log.error('Email delivery failed', undefined, {
      recipient: this.maskEmail(recipient),
      template: template || 'direct',
      error: this.sanitizeError(errorMessage),
      totalSent: this.totalSent,
      totalFailed: this.totalFailed,
    });

    this.checkFailureRate();
  }

  getStats(): EmailStats {
    const total = this.totalSent + this.totalFailed;
    const failureRate = total > 0 ? this.totalFailed / total : 0;
    const uptimeSeconds = Math.floor((Date.now() - this.startTime.getTime()) / 1000);

    return {
      totalSent: this.totalSent,
      totalFailed: this.totalFailed,
      failureRate: Math.round(failureRate * 10000) / 100,
      lastSuccessTime: this.lastSuccessTime,
      lastFailureTime: this.lastFailureTime,
      recentFailures: this.recentFailures.slice(0, 10),
      uptimeSeconds,
      alertThresholdExceeded: failureRate > this.FAILURE_RATE_THRESHOLD,
    };
  }

  getDetailedStats(): EmailStats & { allRecentFailures: EmailFailureRecord[] } {
    return {
      ...this.getStats(),
      allRecentFailures: this.recentFailures,
    };
  }

  resetStats(): void {
    this.totalSent = 0;
    this.totalFailed = 0;
    this.lastSuccessTime = null;
    this.lastFailureTime = null;
    this.recentFailures = [];
    this.startTime = new Date();
    
    log.info('Email monitoring stats reset');
  }

  private checkFailureRate(): void {
    const total = this.totalSent + this.totalFailed;
    if (total < 5) return;

    const failureRate = this.totalFailed / total;
    
    if (failureRate > this.FAILURE_RATE_THRESHOLD) {
      log.warn('Email failure rate exceeds threshold', {
        failureRate: `${(failureRate * 100).toFixed(2)}%`,
        threshold: `${(this.FAILURE_RATE_THRESHOLD * 100).toFixed(0)}%`,
        totalSent: this.totalSent,
        totalFailed: this.totalFailed,
      });
    }
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***@***';
    
    const maskedLocal = local.length > 2 
      ? `${local[0]}***${local[local.length - 1]}`
      : '***';
    
    return `${maskedLocal}@${domain}`;
  }

  private sanitizeError(error: string): string {
    return error
      .replace(/password[=:]\s*\S+/gi, 'password=***')
      .replace(/auth[=:]\s*\S+/gi, 'auth=***')
      .replace(/key[=:]\s*\S+/gi, 'key=***')
      .substring(0, 500);
  }
}

export const emailMonitoringService = new EmailMonitoringService();
