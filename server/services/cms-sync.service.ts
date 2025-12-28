import cron from 'node-cron';
import { laravelCMS } from './laravel-cms-client';
import { cmsCache } from '../utils/cms-cache';
import { logger } from '../utils/logger';

export interface CMSSyncStatus {
  lastSync: Date | null;
  lastSyncDuration: number;
  lastSyncSuccess: boolean;
  lastSyncError?: string;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  isRunning: boolean;
  nextScheduledSync?: Date;
  endpoints: {
    name: string;
    lastSync: Date | null;
    success: boolean;
    itemCount: number;
  }[];
}

class CMSSyncService {
  private static instance: CMSSyncService;
  private syncJob: cron.ScheduledTask | null = null;
  private status: CMSSyncStatus = {
    lastSync: null,
    lastSyncDuration: 0,
    lastSyncSuccess: false,
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    isRunning: false,
    endpoints: [],
  };

  static getInstance(): CMSSyncService {
    if (!CMSSyncService.instance) {
      CMSSyncService.instance = new CMSSyncService();
    }
    return CMSSyncService.instance;
  }

  async initialize(cronExpression: string = '*/5 * * * *') {
    logger.info('Initializing CMS Sync Service', { cronExpression });

    await this.performSync();

    this.syncJob = cron.schedule(cronExpression, async () => {
      await this.performSync();
    }, {
      scheduled: true,
      timezone: 'UTC',
    });

    this.updateNextScheduledSync();
    logger.info('CMS Sync Service initialized and scheduled');
  }

  private updateNextScheduledSync() {
    const now = new Date();
    const nextMinute = new Date(now);
    nextMinute.setMinutes(nextMinute.getMinutes() + 5 - (nextMinute.getMinutes() % 5));
    nextMinute.setSeconds(0);
    nextMinute.setMilliseconds(0);
    this.status.nextScheduledSync = nextMinute;
  }

  async performSync(skipCache: boolean = true): Promise<boolean> {
    if (this.status.isRunning) {
      logger.warn('CMS sync already in progress, skipping');
      return false;
    }

    this.status.isRunning = true;
    this.status.totalSyncs++;
    const startTime = Date.now();
    const endpointResults: CMSSyncStatus['endpoints'] = [];

    logger.info('Starting CMS sync...');

    try {
      const syncTasks = [
        { name: 'settings', fn: () => laravelCMS.getSettings(skipCache) },
        { name: 'menu', fn: () => laravelCMS.getMenu(skipCache) },
        { name: 'home-sections', fn: () => laravelCMS.getHomeSections(skipCache) },
        { name: 'services', fn: () => laravelCMS.getServices(skipCache) },
        { name: 'pages', fn: () => laravelCMS.getPages(skipCache) },
        { name: 'blog-posts', fn: () => laravelCMS.getBlogPosts(skipCache) },
        { name: 'testimonials', fn: () => laravelCMS.getTestimonials(skipCache) },
        { name: 'faqs', fn: () => laravelCMS.getFAQs(skipCache) },
        { name: 'team', fn: () => laravelCMS.getTeamMembers(skipCache) },
      ];

      const results = await Promise.allSettled(
        syncTasks.map(async (task) => {
          const result = await task.fn();
          const itemCount = Array.isArray(result) ? result.length : (result ? 1 : 0);
          return { name: task.name, itemCount };
        })
      );

      results.forEach((result, index) => {
        const taskName = syncTasks[index].name;
        if (result.status === 'fulfilled') {
          endpointResults.push({
            name: taskName,
            lastSync: new Date(),
            success: true,
            itemCount: result.value.itemCount,
          });
        } else {
          endpointResults.push({
            name: taskName,
            lastSync: new Date(),
            success: false,
            itemCount: 0,
          });
          logger.error(`CMS sync failed for ${taskName}:`, result.reason);
        }
      });

      const allSuccess = endpointResults.every(e => e.success);
      const duration = Date.now() - startTime;

      this.status = {
        ...this.status,
        lastSync: new Date(),
        lastSyncDuration: duration,
        lastSyncSuccess: allSuccess,
        successfulSyncs: this.status.successfulSyncs + (allSuccess ? 1 : 0),
        failedSyncs: this.status.failedSyncs + (allSuccess ? 0 : 1),
        isRunning: false,
        endpoints: endpointResults,
        lastSyncError: allSuccess ? undefined : 'Some endpoints failed',
      };

      this.updateNextScheduledSync();

      logger.info(`CMS sync completed in ${duration}ms`, {
        success: allSuccess,
        endpoints: endpointResults.length,
        successCount: endpointResults.filter(e => e.success).length,
      });

      return allSuccess;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.status = {
        ...this.status,
        lastSync: new Date(),
        lastSyncDuration: duration,
        lastSyncSuccess: false,
        failedSyncs: this.status.failedSyncs + 1,
        isRunning: false,
        lastSyncError: error instanceof Error ? error.message : 'Unknown error',
        endpoints: endpointResults,
      };

      this.updateNextScheduledSync();
      logger.error('CMS sync failed:', error);
      return false;
    }
  }

  async forceSync(): Promise<boolean> {
    logger.info('Force sync triggered');
    cmsCache.flush();
    return this.performSync(true);
  }

  getStatus(): CMSSyncStatus {
    return { ...this.status };
  }

  stop() {
    if (this.syncJob) {
      this.syncJob.stop();
      this.syncJob = null;
      logger.info('CMS Sync Service stopped');
    }
  }

  isHealthy(): boolean {
    if (!this.status.lastSync) return false;
    
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentSync = this.status.lastSync > fiveMinutesAgo;
    const hasSuccessfulEndpoints = this.status.endpoints.some(e => e.success);
    
    return recentSync && hasSuccessfulEndpoints;
  }
}

export const cmsSyncService = CMSSyncService.getInstance();
export default cmsSyncService;
