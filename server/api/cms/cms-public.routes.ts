import { Router, Request, Response } from 'express';
import { laravelCMS } from '../../services/laravel-cms-client';
import { logger } from '../../utils/logger';
import { cmsMonitor } from '../../utils/cms-monitor';
import { cmsCache } from '../../utils/cms-cache';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  try {
    const isHealthy = await laravelCMS.healthCheck();
    res.json({
      status: isHealthy ? 'connected' : 'disconnected',
      service: 'laravel-cms',
      baseUrl: process.env.LARAVEL_CMS_URL || 'https://cms.molochain.com/api'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: (error as Error).message });
  }
});

router.get('/pages', async (_req: Request, res: Response) => {
  try {
    const pages = await laravelCMS.getPages();
    res.json({ data: pages, count: pages.length });
  } catch (error) {
    logger.error('Failed to fetch CMS pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages from CMS' });
  }
});

router.get('/pages/:slug', async (req: Request, res: Response) => {
  try {
    const page = await laravelCMS.getPage(req.params.slug);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json({ data: page });
  } catch (error) {
    logger.error('Failed to fetch CMS page:', error);
    res.status(500).json({ error: 'Failed to fetch page from CMS' });
  }
});

router.get('/services', async (_req: Request, res: Response) => {
  try {
    const services = await laravelCMS.getServices();
    res.json({ data: services, count: services.length });
  } catch (error) {
    logger.error('Failed to fetch CMS services:', error);
    res.status(500).json({ error: 'Failed to fetch services from CMS' });
  }
});

router.get('/services/:slug', async (req: Request, res: Response) => {
  try {
    const service = await laravelCMS.getService(req.params.slug);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ data: service });
  } catch (error) {
    logger.error('Failed to fetch CMS service:', error);
    res.status(500).json({ error: 'Failed to fetch service from CMS' });
  }
});

router.get('/menu', async (_req: Request, res: Response) => {
  try {
    const menu = await laravelCMS.getMenu();
    res.json({ data: menu });
  } catch (error) {
    logger.error('Failed to fetch CMS menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu from CMS' });
  }
});

router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await laravelCMS.getSettings();
    res.json({ data: settings });
  } catch (error) {
    logger.error('Failed to fetch CMS settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings from CMS' });
  }
});

router.get('/home-sections', async (_req: Request, res: Response) => {
  try {
    const sections = await laravelCMS.getHomeSections();
    res.json({ data: sections, count: sections.length });
  } catch (error) {
    logger.error('Failed to fetch CMS home sections:', error);
    res.status(500).json({ error: 'Failed to fetch home sections from CMS' });
  }
});

// Blog Posts
router.get('/blog/posts', async (_req: Request, res: Response) => {
  try {
    const posts = await laravelCMS.getBlogPosts();
    res.json({ success: true, data: posts, count: posts.length });
  } catch (error) {
    logger.error('Failed to fetch blog posts from CMS:', error);
    res.json({ success: true, data: [], count: 0 });
  }
});

router.get('/blog/posts/:slug', async (req: Request, res: Response) => {
  try {
    const post = await laravelCMS.getBlogPost(req.params.slug);
    if (!post) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: post });
  } catch (error) {
    logger.error('Failed to fetch blog post from CMS:', error);
    res.json({ success: true, data: null });
  }
});

router.get('/blog/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await laravelCMS.getBlogCategories();
    res.json({ success: true, data: categories, count: categories.length });
  } catch (error) {
    logger.error('Failed to fetch blog categories from CMS:', error);
    res.json({ success: true, data: [], count: 0 });
  }
});

// Testimonials
router.get('/testimonials', async (_req: Request, res: Response) => {
  try {
    const testimonials = await laravelCMS.getTestimonials();
    res.json({ success: true, data: testimonials, count: testimonials.length });
  } catch (error) {
    logger.error('Failed to fetch testimonials from CMS:', error);
    res.json({ success: true, data: [], count: 0 });
  }
});

// FAQs
router.get('/faqs', async (_req: Request, res: Response) => {
  try {
    const faqs = await laravelCMS.getFAQs();
    res.json({ success: true, data: faqs, count: faqs.length });
  } catch (error) {
    logger.error('Failed to fetch FAQs from CMS:', error);
    res.json({ success: true, data: [], count: 0 });
  }
});

router.get('/faqs/grouped', async (_req: Request, res: Response) => {
  try {
    const grouped = await laravelCMS.getFAQsGrouped();
    res.json({ success: true, data: grouped, count: grouped.length });
  } catch (error) {
    logger.error('Failed to fetch grouped FAQs from CMS:', error);
    res.json({ success: true, data: [], count: 0 });
  }
});

// Team Members
router.get('/team', async (_req: Request, res: Response) => {
  try {
    const team = await laravelCMS.getTeamMembers();
    res.json({ success: true, data: team, count: team.length });
  } catch (error) {
    logger.error('Failed to fetch team members from CMS:', error);
    res.json({ success: true, data: [], count: 0 });
  }
});

router.get('/diagnostics', async (_req: Request, res: Response) => {
  try {
    const summary = await laravelCMS.getDiagnosticSummary();
    res.json(summary);
  } catch (error) {
    logger.error('Failed to get CMS diagnostics:', error);
    res.status(500).json({ error: 'Failed to get diagnostics' });
  }
});

router.get('/status', async (_req: Request, res: Response) => {
  try {
    const stats = cmsMonitor.getStats();
    const isHealthy = await laravelCMS.healthCheck();
    
    res.json({
      status: isHealthy ? 'healthy' : 'degraded',
      alerting: cmsMonitor.shouldAlert(),
      metrics: {
        uptime: stats.uptime,
        uptimeFormatted: formatUptime(stats.uptime),
        startTime: stats.startTime.toISOString(),
        totalRequests: stats.totalRequests,
        successfulRequests: stats.successfulRequests,
        failedRequests: stats.failedRequests,
        successRate: stats.successRate,
        consecutiveFailures: stats.consecutiveFailures,
        responseTime: {
          avg: stats.responseTimeAvg,
          min: stats.responseTimeMin,
          max: stats.responseTimeMax,
        },
      },
      lastError: stats.lastErrorMessage ? {
        message: stats.lastErrorMessage,
        time: stats.lastErrorTime?.toISOString(),
      } : null,
    });
  } catch (error) {
    logger.error('Failed to get CMS status:', error);
    res.status(500).json({ error: 'Failed to get CMS status' });
  }
});

router.get('/cache', async (_req: Request, res: Response) => {
  try {
    const stats = cmsCache.getStats();
    const keys = cmsCache.getKeys();
    const ttlConfig = cmsCache.getTTLConfig();
    
    res.json({
      stats: {
        keys: stats.keys,
        hits: stats.hits,
        misses: stats.misses,
        hitRate: `${stats.hitRate}%`,
        memoryUsage: {
          keySize: stats.ksize,
          valueSize: stats.vsize,
          totalBytes: stats.ksize + stats.vsize,
        },
      },
      cachedKeys: keys,
      ttlConfig,
    });
  } catch (error) {
    logger.error('Failed to get CMS cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache statistics' });
  }
});

router.delete('/cache', async (req: Request, res: Response) => {
  try {
    const pattern = req.query.pattern as string | undefined;
    
    if (pattern) {
      const deleted = cmsCache.delPattern(pattern);
      logger.info(`CMS cache pattern flush: ${pattern} (${deleted} keys)`);
      res.json({ 
        success: true, 
        message: `Deleted ${deleted} cache keys matching pattern: ${pattern}`,
        deletedCount: deleted,
      });
    } else {
      cmsCache.flush();
      logger.info('CMS cache fully flushed');
      res.json({ 
        success: true, 
        message: 'Cache flushed successfully',
      });
    }
  } catch (error) {
    logger.error('Failed to flush CMS cache:', error);
    res.status(500).json({ error: 'Failed to flush cache' });
  }
});

router.get('/sync/status', async (_req: Request, res: Response) => {
  try {
    const { cmsSyncService } = await import('../../services/cms-sync.service');
    const status = cmsSyncService.getStatus();
    res.json({
      success: true,
      data: {
        ...status,
        healthy: cmsSyncService.isHealthy(),
      },
    });
  } catch (error) {
    logger.error('Failed to get CMS sync status:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

router.post('/sync/trigger', async (_req: Request, res: Response) => {
  try {
    const { cmsSyncService } = await import('../../services/cms-sync.service');
    const success = await cmsSyncService.forceSync();
    const status = cmsSyncService.getStatus();
    res.json({
      success,
      message: success ? 'CMS sync completed successfully' : 'CMS sync completed with some failures',
      data: status,
    });
  } catch (error) {
    logger.error('Failed to trigger CMS sync:', error);
    res.status(500).json({ error: 'Failed to trigger sync' });
  }
});

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export default router;
