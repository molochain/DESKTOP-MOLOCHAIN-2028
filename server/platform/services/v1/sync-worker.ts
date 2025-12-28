import cron from 'node-cron';
import { serviceRepository } from './repository';
import { serviceCacheService } from './cache';
import { syncMonitor } from './sync-monitor';
import { logger } from '../../../utils/logger';

export interface ServicesSyncStatus {
  lastSync: Date | null;
  lastSyncDuration: number;
  lastSyncSuccess: boolean;
  lastSyncError?: string;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  isRunning: boolean;
  nextScheduledSync?: Date;
  syncStats: {
    created: number;
    updated: number;
    synced: number;
  } | null;
}

class ServicesSyncWorker {
  private static instance: ServicesSyncWorker;
  private syncJob: cron.ScheduledTask | null = null;
  private status: ServicesSyncStatus = {
    lastSync: null,
    lastSyncDuration: 0,
    lastSyncSuccess: false,
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    isRunning: false,
    syncStats: null,
  };

  static getInstance(): ServicesSyncWorker {
    if (!ServicesSyncWorker.instance) {
      ServicesSyncWorker.instance = new ServicesSyncWorker();
    }
    return ServicesSyncWorker.instance;
  }

  async initialize(cronExpression: string = '*/5 * * * *') {
    logger.info('[Services Platform] Initializing sync worker', { cronExpression });

    await this.performSync();

    this.syncJob = cron.schedule(cronExpression, async () => {
      await this.performSync();
    }, {
      scheduled: true,
      timezone: 'UTC',
    });

    this.updateNextScheduledSync();
    logger.info('[Services Platform] Sync worker initialized and scheduled');
  }

  private updateNextScheduledSync() {
    const now = new Date();
    const nextMinute = new Date(now);
    nextMinute.setMinutes(nextMinute.getMinutes() + 5 - (nextMinute.getMinutes() % 5));
    nextMinute.setSeconds(0);
    nextMinute.setMilliseconds(0);
    this.status.nextScheduledSync = nextMinute;
  }

  async performSync(invalidateCache: boolean = true): Promise<boolean> {
    if (this.status.isRunning) {
      logger.warn('[Services Platform] Sync already in progress, skipping');
      return false;
    }

    this.status.isRunning = true;
    this.status.totalSyncs++;
    const startTime = Date.now();

    logger.info('[Services Platform] Starting CMS-to-Registry sync...');

    try {
      const syncStats = await serviceRepository.syncFromCMS();
      
      const duration = Date.now() - startTime;
      
      this.status.lastSync = new Date();
      this.status.lastSyncDuration = duration;
      this.status.lastSyncSuccess = true;
      this.status.successfulSyncs++;
      this.status.syncStats = syncStats;
      this.status.lastSyncError = undefined;
      
      if (invalidateCache) {
        await serviceCacheService.invalidateAll();
        logger.info('[Services Platform] Cache invalidated after sync');
      }

      logger.info(`[Services Platform] Sync completed in ${duration}ms`, { 
        created: syncStats.created, 
        updated: syncStats.updated, 
        synced: syncStats.synced 
      });

      syncMonitor.recordSync({
        timestamp: new Date(),
        duration,
        success: true,
        servicesCount: syncStats.synced,
        stats: syncStats,
      });

      this.updateNextScheduledSync();
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.status.lastSync = new Date();
      this.status.lastSyncDuration = duration;
      this.status.lastSyncSuccess = false;
      this.status.failedSyncs++;
      this.status.lastSyncError = error instanceof Error ? error.message : 'Unknown error';

      logger.error('[Services Platform] Sync failed', { 
        error: this.status.lastSyncError, 
        duration 
      });

      syncMonitor.recordSync({
        timestamp: new Date(),
        duration,
        success: false,
        servicesCount: 0,
        error: this.status.lastSyncError,
      });

      return false;
    } finally {
      this.status.isRunning = false;
    }
  }

  async forceSync(): Promise<boolean> {
    logger.info('[Services Platform] Force sync requested');
    return this.performSync(true);
  }

  getStatus(): ServicesSyncStatus {
    return { ...this.status };
  }

  stop() {
    if (this.syncJob) {
      this.syncJob.stop();
      logger.info('[Services Platform] Sync worker stopped');
    }
  }
}

export const servicesSyncWorker = ServicesSyncWorker.getInstance();
