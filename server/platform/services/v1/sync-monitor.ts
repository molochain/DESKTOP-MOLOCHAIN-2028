import { createLoggerWithContext } from '../../../utils/logger';

const syncLogger = createLoggerWithContext('services-v1-sync');

export interface SyncRecord {
  id: string;
  timestamp: Date;
  duration: number;
  success: boolean;
  servicesCount: number;
  error?: string;
  stats?: {
    created: number;
    updated: number;
    synced: number;
  };
}

export interface SyncHealthMetrics {
  healthScore: number;
  avgDuration: number;
  successRate: number;
  lastFailure: Date | null;
  uptimePercentage: number;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  windowStart: Date;
  windowEnd: Date;
}

class SyncMonitor {
  private static instance: SyncMonitor;
  private syncHistory: SyncRecord[] = [];
  private readonly maxHistorySize = 500;
  private readonly windowHours = 24;

  static getInstance(): SyncMonitor {
    if (!SyncMonitor.instance) {
      SyncMonitor.instance = new SyncMonitor();
    }
    return SyncMonitor.instance;
  }

  recordSync(record: Omit<SyncRecord, 'id'>): void {
    const syncRecord: SyncRecord = {
      ...record,
      id: crypto.randomUUID(),
    };

    this.syncHistory.unshift(syncRecord);

    if (this.syncHistory.length > this.maxHistorySize) {
      this.syncHistory = this.syncHistory.slice(0, this.maxHistorySize);
    }

    syncLogger.info('Sync recorded', {
      success: record.success,
      duration: record.duration,
      servicesCount: record.servicesCount,
      stats: record.stats,
    });

    if (!record.success) {
      syncLogger.error('Sync failed', record.error, {
        duration: record.duration,
      });
    }
  }

  private getRecordsInWindow(): SyncRecord[] {
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - this.windowHours);
    
    return this.syncHistory.filter(record => 
      new Date(record.timestamp) >= windowStart
    );
  }

  getHealthMetrics(): SyncHealthMetrics {
    const windowEnd = new Date();
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - this.windowHours);

    const recordsInWindow = this.getRecordsInWindow();
    const totalSyncs = recordsInWindow.length;
    const successfulSyncs = recordsInWindow.filter(r => r.success).length;
    const failedSyncs = totalSyncs - successfulSyncs;

    const successRate = totalSyncs > 0 ? (successfulSyncs / totalSyncs) * 100 : 100;

    const avgDuration = totalSyncs > 0
      ? recordsInWindow.reduce((sum, r) => sum + r.duration, 0) / totalSyncs
      : 0;

    const failedRecords = recordsInWindow.filter(r => !r.success);
    const lastFailure = failedRecords.length > 0 
      ? new Date(failedRecords[0].timestamp)
      : null;

    const uptimePercentage = this.calculateUptimePercentage(recordsInWindow);

    const healthScore = this.calculateHealthScore(successRate, avgDuration, uptimePercentage);

    return {
      healthScore,
      avgDuration: Math.round(avgDuration),
      successRate: Math.round(successRate * 100) / 100,
      lastFailure,
      uptimePercentage: Math.round(uptimePercentage * 100) / 100,
      totalSyncs,
      successfulSyncs,
      failedSyncs,
      windowStart,
      windowEnd,
    };
  }

  private calculateUptimePercentage(records: SyncRecord[]): number {
    if (records.length === 0) return 100;

    let uptimeMinutes = 0;
    const totalMinutes = this.windowHours * 60;

    const sortedRecords = [...records].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let lastSuccessTime = new Date();
    lastSuccessTime.setHours(lastSuccessTime.getHours() - this.windowHours);

    for (const record of sortedRecords) {
      if (record.success) {
        const recordTime = new Date(record.timestamp);
        const intervalMinutes = (recordTime.getTime() - lastSuccessTime.getTime()) / (1000 * 60);
        uptimeMinutes += Math.min(intervalMinutes, 10);
        lastSuccessTime = recordTime;
      }
    }

    const lastRecord = sortedRecords[sortedRecords.length - 1];
    if (lastRecord && lastRecord.success) {
      const now = new Date();
      const minutesSinceLast = (now.getTime() - new Date(lastRecord.timestamp).getTime()) / (1000 * 60);
      uptimeMinutes += Math.min(minutesSinceLast, 10);
    }

    return Math.min((uptimeMinutes / totalMinutes) * 100, 100);
  }

  private calculateHealthScore(
    successRate: number,
    avgDuration: number,
    uptimePercentage: number
  ): number {
    const successWeight = 0.5;
    const durationWeight = 0.2;
    const uptimeWeight = 0.3;

    const successScore = successRate;

    const maxAcceptableDuration = 30000;
    const durationScore = avgDuration <= maxAcceptableDuration
      ? 100
      : Math.max(0, 100 - ((avgDuration - maxAcceptableDuration) / 1000));

    const uptimeScore = uptimePercentage;

    const healthScore = 
      (successScore * successWeight) +
      (durationScore * durationWeight) +
      (uptimeScore * uptimeWeight);

    return Math.round(Math.min(100, Math.max(0, healthScore)) * 100) / 100;
  }

  getHistory(limit: number = 50): SyncRecord[] {
    return this.syncHistory.slice(0, limit);
  }

  clearHistory(): void {
    this.syncHistory = [];
    syncLogger.info('Sync history cleared');
  }
}

export const syncMonitor = SyncMonitor.getInstance();
