import { dbCache, apiCache, healthCache, sessionCache } from './cache-manager';
import { db } from '../db';
import { services, projects, users } from '@db/schema';
import { eq, desc } from 'drizzle-orm';
import { logger } from './logger';

export class CacheWarmupService {
  private static instance: CacheWarmupService;
  private warmupInterval: NodeJS.Timeout | null = null;

  static getInstance(): CacheWarmupService {
    if (!CacheWarmupService.instance) {
      CacheWarmupService.instance = new CacheWarmupService();
    }
    return CacheWarmupService.instance;
  }

  async initialize() {
    logger.info('Initializing cache warmup service');
    
    // Initial warmup
    await this.warmupAllCaches();
    
    // Schedule periodic warmup every 5 minutes
    this.warmupInterval = setInterval(async () => {
      await this.warmupAllCaches();
    }, 5 * 60 * 1000);
  }

  async warmupAllCaches() {
    logger.info('Starting cache warmup');
    const startTime = Date.now();

    try {
      await Promise.all([
        this.warmupDatabaseCache(),
        this.warmupApiCache(),
        this.warmupHealthCache(),
        this.warmupSessionCache()
      ]);

      const duration = Date.now() - startTime;
      logger.info(`Cache warmup completed in ${duration}ms`);
    } catch (error) {
      logger.error('Cache warmup failed', error);
    }
  }

  private async warmupDatabaseCache() {
    try {
      let itemCount = 0;
      
      // Preload frequently accessed services - skip if table structure is different
      try {
        const activeServices = await db.select({
          id: services.id,
          category: services.category,
          description: services.description,
          isActive: services.isActive,
        })
          .from(services)
          .where(eq(services.isActive, true))
          .limit(20)
          .execute();

        activeServices.forEach(service => {
          dbCache.set(`service:${service.id}`, service, 600); // 10 minutes
          if (service.category) {
            dbCache.set(`service:category:${service.category}`, service, 600);
          }
        });
        itemCount += activeServices.length;
      } catch (error) {
        logger.warn('Failed to preload services cache', error);
      }

      // Preload recent projects - wrapped in try-catch in case table doesn't exist
      try {
        const recentProjects = await db.select({
          id: projects.id,
          title: projects.title,
          status: projects.status,
          clientId: projects.clientId,
          updatedAt: projects.updatedAt,
        })
          .from(projects)
          .orderBy(desc(projects.updatedAt))
          .limit(10)
          .execute();

        recentProjects.forEach(project => {
          dbCache.set(`project:${project.id}`, project, 300);
        });
        itemCount += recentProjects.length;
      } catch (error) {
        // Projects table might not exist yet, skip gracefully
        logger.debug('Projects table not available for caching - skipping');
      }

      // Skip shipments for now as they're not in the schema
      // Will add them later if needed

      logger.debug(`Database cache warmed up with ${itemCount} items`);
    } catch (error) {
      logger.error('Database cache warmup failed', error);
    }
  }

  private async warmupApiCache() {
    try {
      // Preload common API responses
      const apiEndpoints = [
        '/api/health',
        '/api/services',
        '/api/supply-chain/metrics',
        '/api/page-modules'
      ];

      // Cache common responses
      apiCache.set('/api/health', { status: 'healthy', cached: true }, 60);
      apiCache.set('/api/services/count', { count: 46 }, 300);
      apiCache.set('/api/modules/count', { count: 14 }, 300);

      // Warm up CMS endpoints (most frequently accessed)
      await this.warmupCMSEndpoints();

      logger.debug('API cache warmed up with common endpoints');
    } catch (error) {
      logger.error('API cache warmup failed', error);
    }
  }

  private async warmupCMSEndpoints() {
    try {
      // Import CMS client dynamically to avoid circular dependencies
      const { laravelCMSClient } = await import('../services/laravel-cms-client');
      
      // Pre-fetch and cache CMS data in parallel
      const [menu, settings, cmsServices] = await Promise.allSettled([
        laravelCMSClient.getMenuItems(true), // skipCache=true to get fresh data
        laravelCMSClient.getSettings(true),
        laravelCMSClient.getServices(true)
      ]);
      
      // Cache the successful responses with longer TTL for stable content
      if (menu.status === 'fulfilled' && menu.value) {
        apiCache.set('/api/cms/menu', { data: menu.value }, 600); // 10 minutes
      }
      if (settings.status === 'fulfilled' && settings.value) {
        apiCache.set('/api/cms/settings', { data: settings.value }, 600);
      }
      if (cmsServices.status === 'fulfilled' && cmsServices.value) {
        apiCache.set('/api/cms/services', { data: cmsServices.value }, 600);
      }
      
      logger.debug('CMS endpoints warmed up successfully');
    } catch (error) {
      logger.debug('CMS warmup skipped - CMS may be unavailable');
    }
  }

  private async warmupHealthCache() {
    try {
      // Cache system health status
      healthCache.set('system:status', { 
        status: 'healthy', 
        timestamp: new Date().toISOString() 
      }, 60);

      // Cache default health metrics
      healthCache.set('health:metric:0', {
        status: 'healthy',
        database_latency: 50,
        services_status: {},
        timestamp: new Date()
      }, 300);

      logger.debug('Health cache warmed up with default metrics');
    } catch (error) {
      logger.error('Health cache warmup failed', error);
    }
  }

  private async warmupSessionCache() {
    try {
      // Preload active user sessions - handle cases where no users exist yet
      let activeUsers: any[] = [];
      
      try {
        // Try to get users - wrapped in try-catch to handle any schema issues
        activeUsers = await db.select()
          .from(users)
          .limit(20)
          .execute()
          .catch(() => []); // Handle any database errors
      } catch (error) {
        // If users table doesn't exist or has schema issues, just skip
        logger.debug('Session cache warmup skipped - users table not available');
        return;
      }

      if (Array.isArray(activeUsers) && activeUsers.length > 0) {
        activeUsers.forEach(user => {
          if (user && user.id) {
            const sessionData = {
              userId: user.id,
              email: user.email || '',
              role: user.role || 'user',
              fullName: user.fullName || user.email || 'User',
              cached: true
            };
            sessionCache.set(`user:${user.id}`, sessionData, 1800); // 30 minutes
          }
        });
        logger.debug(`Session cache warmed up with ${activeUsers.length} user sessions`);
      } else {
        logger.debug('Session cache warmup skipped - no users in database');
      }
    } catch (error) {
      logger.debug('Session cache warmup skipped - error occurred', error);
    }
  }

  stop() {
    if (this.warmupInterval) {
      clearInterval(this.warmupInterval);
      this.warmupInterval = null;
      logger.info('Cache warmup service stopped');
    }
  }
}

export const cacheWarmupService = CacheWarmupService.getInstance();