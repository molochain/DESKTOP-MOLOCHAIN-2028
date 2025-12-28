import { Router } from 'express';
import { serviceController } from './controller';
import { cacheMiddleware } from '../../../middleware/cache';
import webhookRoutes from './webhook-handler';
import adminRoutes from './admin-override';
import {
  publicEndpointsLimiter,
  singleServiceLimiter,
  deltaSyncLimiter,
  adminEndpointsLimiter,
  availabilityLimiter,
  webhookLimiter,
} from './rate-limiter';

const router = Router();

const CACHE_TTL = {
  CATALOG: 5 * 60,
  SERVICE: 1 * 60,
  CATEGORIES: 5 * 60,
  SEARCH: 30,
  AVAILABILITY: 30,
};

router.get(
  '/catalog',
  publicEndpointsLimiter,
  cacheMiddleware({ type: 'service', ttl: CACHE_TTL.CATALOG }),
  (req, res) => serviceController.getCatalog(req, res)
);

router.get(
  '/catalog/:slug',
  singleServiceLimiter,
  cacheMiddleware({ type: 'service', keyParam: 'slug', ttl: CACHE_TTL.SERVICE }),
  (req, res) => serviceController.getService(req, res)
);

router.get(
  '/categories',
  publicEndpointsLimiter,
  cacheMiddleware({ type: 'service', ttl: CACHE_TTL.CATEGORIES }),
  (req, res) => serviceController.getCategories(req, res)
);

router.get(
  '/search',
  publicEndpointsLimiter,
  cacheMiddleware({ 
    type: 'service', 
    ttl: CACHE_TTL.SEARCH,
    keyFn: (req) => `search:${req.query.q || ''}:${req.query.category || ''}:${req.query.limit || 50}:${req.query.offset || 0}`
  }),
  (req, res) => serviceController.searchServices(req, res)
);

router.get(
  '/availability/:serviceId',
  availabilityLimiter,
  cacheMiddleware({ type: 'service', keyParam: 'serviceId', ttl: CACHE_TTL.AVAILABILITY }),
  (req, res) => serviceController.getAvailability(req, res)
);

router.get(
  '/sync/delta',
  deltaSyncLimiter,
  (req, res) => serviceController.getSyncDelta(req, res)
);

router.use('/webhooks', webhookLimiter, webhookRoutes);

router.use('/admin', adminEndpointsLimiter, adminRoutes);

export default router;
