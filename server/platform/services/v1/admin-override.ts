import { Router, Request, Response } from 'express';
import { serviceCacheService } from './cache';
import { servicesSyncWorker } from './sync-worker';
import { syncMonitor } from './sync-monitor';
import { logger } from '../../../utils/logger';
import type { ServicePlatform } from './types';

interface AdminOverrideLog {
  id: string;
  action: string;
  serviceSlug?: string;
  adminId?: string;
  timestamp: Date;
  changes?: Record<string, unknown>;
}

class AdminOverrideService {
  private static instance: AdminOverrideService;
  private overrideLogs: AdminOverrideLog[] = [];
  private maxLogs = 50;

  static getInstance(): AdminOverrideService {
    if (!AdminOverrideService.instance) {
      AdminOverrideService.instance = new AdminOverrideService();
    }
    return AdminOverrideService.instance;
  }

  private logOverride(log: AdminOverrideLog) {
    this.overrideLogs.unshift(log);
    if (this.overrideLogs.length > this.maxLogs) {
      this.overrideLogs = this.overrideLogs.slice(0, this.maxLogs);
    }
  }

  async updateService(
    slug: string, 
    updates: Partial<ServicePlatform>, 
    adminId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await serviceCacheService.invalidateService(slug);
      await serviceCacheService.invalidateCatalog();

      const now = new Date();
      this.logOverride({
        id: crypto.randomUUID(),
        action: 'update_service',
        serviceSlug: slug,
        adminId,
        timestamp: now,
        changes: updates,
      });

      logger.info('[Admin Override] Service cache invalidated (CMS is canonical source)', { slug, adminId });
      return { 
        success: true, 
        message: `Service ${slug} cache invalidated. Update the service in CMS to persist changes.` 
      };
    } catch (error) {
      logger.error('[Admin Override] Update failed', { slug, error });
      throw error;
    }
  }

  async toggleServiceStatus(
    slug: string, 
    isActive: boolean, 
    adminId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await serviceCacheService.invalidateService(slug);
      await serviceCacheService.invalidateCatalog();

      const now = new Date();
      this.logOverride({
        id: crypto.randomUUID(),
        action: isActive ? 'activate_service' : 'deactivate_service',
        serviceSlug: slug,
        adminId,
        timestamp: now,
      });

      logger.info('[Admin Override] Service cache invalidated (update status in CMS)', { slug, isActive, adminId });
      return { 
        success: true, 
        message: `Service ${slug} cache invalidated. Update status in CMS to persist the ${isActive ? 'activation' : 'deactivation'}.` 
      };
    } catch (error) {
      logger.error('[Admin Override] Toggle status failed', { slug, error });
      throw error;
    }
  }

  async forceSync(adminId?: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await servicesSyncWorker.forceSync();
      
      this.logOverride({
        id: crypto.randomUUID(),
        action: 'force_sync',
        adminId,
        timestamp: new Date(),
      });

      logger.info('[Admin Override] Force sync triggered', { adminId, result });
      return { 
        success: result, 
        message: result ? 'Sync completed successfully' : 'Sync failed' 
      };
    } catch (error) {
      logger.error('[Admin Override] Force sync failed', { error });
      throw error;
    }
  }

  async invalidateAllCaches(adminId?: string): Promise<{ success: boolean; message: string }> {
    try {
      await serviceCacheService.invalidateAll();
      
      this.logOverride({
        id: crypto.randomUUID(),
        action: 'invalidate_cache',
        adminId,
        timestamp: new Date(),
      });

      logger.info('[Admin Override] All caches invalidated', { adminId });
      return { success: true, message: 'All caches invalidated' };
    } catch (error) {
      logger.error('[Admin Override] Cache invalidation failed', { error });
      throw error;
    }
  }

  getOverrideLogs(): AdminOverrideLog[] {
    return [...this.overrideLogs];
  }

  getSyncStatus() {
    return servicesSyncWorker.getStatus();
  }
}

export const adminOverrideService = AdminOverrideService.getInstance();

const adminRouter = Router();

adminRouter.post('/sync', async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id;
    const result = await adminOverrideService.forceSync(adminId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Sync failed' 
    });
  }
});

adminRouter.post('/cache/invalidate', async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id;
    const result = await adminOverrideService.invalidateAllCaches(adminId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Cache invalidation failed' 
    });
  }
});

adminRouter.patch('/service/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const updates = req.body;
    const adminId = (req as any).user?.id;
    
    const result = await adminOverrideService.updateService(slug, updates, adminId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Update failed' 
    });
  }
});

adminRouter.post('/service/:slug/toggle', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { isActive } = req.body;
    const adminId = (req as any).user?.id;
    
    const result = await adminOverrideService.toggleServiceStatus(slug, isActive, adminId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Toggle failed' 
    });
  }
});

adminRouter.get('/sync/status', (_req: Request, res: Response) => {
  const status = adminOverrideService.getSyncStatus();
  res.json(status);
});

adminRouter.get('/logs', (_req: Request, res: Response) => {
  const logs = adminOverrideService.getOverrideLogs();
  res.json({ logs });
});

adminRouter.get('/sync/health', (_req: Request, res: Response) => {
  const health = syncMonitor.getHealthMetrics();
  res.json(health);
});

adminRouter.get('/sync/history', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const history = syncMonitor.getHistory(limit);
  res.json({ history, count: history.length });
});

export default adminRouter;
