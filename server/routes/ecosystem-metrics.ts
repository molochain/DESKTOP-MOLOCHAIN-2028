/**
 * Ecosystem Metrics Routes
 * Exposes Prometheus-compatible metrics and health worker management
 */

import { Router, Request, Response } from 'express';
import { ecosystemHealthWorker } from '../services/ecosystem-health-worker';
import { webhookDeliveryService } from '../services/webhook-delivery';
import { isAuthenticated, isAdmin } from '../core/auth/auth.service';
import { logger } from '../utils/logger';

const router = Router();

router.get('/prometheus', async (req: Request, res: Response) => {
  try {
    const metrics = ecosystemHealthWorker.getPrometheusMetrics();
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(metrics);
  } catch (error) {
    logger.error('Error getting Prometheus metrics:', error);
    res.status(500).send('# Error generating metrics\n');
  }
});

router.get('/json', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const metrics = ecosystemHealthWorker.getMetricsJson();
    const webhookStats = webhookDeliveryService.getStats();

    res.json({
      success: true,
      workerRunning: ecosystemHealthWorker.isWorkerRunning(),
      services: metrics,
      webhookDelivery: webhookStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting JSON metrics:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

router.get('/service/:slug', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const status = await ecosystemHealthWorker.getServiceStatus(slug);

    if (!status) {
      return res.status(404).json({ error: 'Service not found or not yet checked' });
    }

    res.json({
      success: true,
      service: status
    });
  } catch (error) {
    logger.error('Error getting service status:', error);
    res.status(500).json({ error: 'Failed to get service status' });
  }
});

router.post('/check', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    logger.info('[EcosystemMetrics] Manual health check triggered');
    const results = await ecosystemHealthWorker.performHealthChecks();

    res.json({
      success: true,
      message: 'Health checks completed',
      results: results.map(r => ({
        slug: r.slug,
        status: r.status,
        responseTime: r.responseTime,
        error: r.error
      }))
    });
  } catch (error) {
    logger.error('Error performing manual health check:', error);
    res.status(500).json({ error: 'Failed to perform health checks' });
  }
});

router.post('/worker/start', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { intervalMs } = req.body;
    await ecosystemHealthWorker.initialize(intervalMs);

    res.json({
      success: true,
      message: 'Health worker started',
      interval: intervalMs || 60000
    });
  } catch (error) {
    logger.error('Error starting health worker:', error);
    res.status(500).json({ error: 'Failed to start health worker' });
  }
});

router.post('/worker/stop', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    ecosystemHealthWorker.stop();

    res.json({
      success: true,
      message: 'Health worker stopped'
    });
  } catch (error) {
    logger.error('Error stopping health worker:', error);
    res.status(500).json({ error: 'Failed to stop health worker' });
  }
});

router.get('/worker/status', isAuthenticated, async (req: Request, res: Response) => {
  res.json({
    success: true,
    running: ecosystemHealthWorker.isWorkerRunning()
  });
});

router.post('/webhook/trigger', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { serviceSlug, event, data } = req.body;

    if (!serviceSlug || !event) {
      return res.status(400).json({ error: 'serviceSlug and event are required' });
    }

    const results = await webhookDeliveryService.triggerEvent(serviceSlug, event, data || {});

    res.json({
      success: true,
      message: `Triggered ${event} for ${serviceSlug}`,
      deliveryResults: results
    });
  } catch (error) {
    logger.error('Error triggering webhook:', error);
    res.status(500).json({ error: 'Failed to trigger webhook' });
  }
});

router.get('/webhook/stats', isAuthenticated, async (req: Request, res: Response) => {
  const stats = webhookDeliveryService.getStats();

  res.json({
    success: true,
    stats
  });
});

router.post('/webhook/stats/reset', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  webhookDeliveryService.resetStats();

  res.json({
    success: true,
    message: 'Webhook stats reset'
  });
});

export default router;
