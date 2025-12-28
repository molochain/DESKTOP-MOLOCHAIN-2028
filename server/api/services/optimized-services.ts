/**
 * Optimized Services API Routes
 * High-performance endpoints with caching, pagination, and streaming
 */

import { Router } from 'express';
import { 
  fastEndpoint, 
  getPaginationParams,
  executeOptimizedQuery,
  streamResponse
} from '../../utils/performance-enhancements';
import { logger } from '../../utils/logger';
import { db } from '../../db';
import { services, serviceBookings } from '@db/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { cacheResponse } from '../../core/cache/cache.service';

const router = Router();

/**
 * GET /api/services/fast
 * Optimized endpoint for fetching active services with pagination
 */
router.get('/services/fast', fastEndpoint(
  async (req) => {
    const { limit, offset } = (req as any).pagination;
    
    // Use optimized query with caching
    const result = await executeOptimizedQuery(
      db.select({
        id: services.id,
        title: services.title,
        description: services.description,
        category: services.category,
        price: services.price,
        isActive: services.isActive,
        imageUrl: services.imageUrl
      })
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(services.title),
      `services:active:${limit}:${offset}`,
      {
        ttl: 300, // Cache for 5 minutes
        limit,
        offset
      }
    );

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(services)
      .where(eq(services.isActive, true));

    return {
      data: result,
      pagination: {
        total: countResult.count,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        totalPages: Math.ceil(countResult.count / limit)
      }
    };
  },
  { cache: true, cacheTTL: 300, paginate: true }
));

/**
 * GET /api/services/categories
 * Get unique service categories with counts
 */
router.get('/services/categories', cacheResponse('api', undefined, 600), async (req, res) => {
  try {
    const categories = await db
      .select({
        category: services.category,
        count: sql<number>`count(*)::int`
      })
      .from(services)
      .where(eq(services.isActive, true))
      .groupBy(services.category)
      .orderBy(services.category);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Error fetching service categories:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch categories' 
    });
  }
});

/**
 * GET /api/services/:id/bookings
 * Get bookings for a specific service with pagination
 */
router.get('/services/:id/bookings', fastEndpoint(
  async (req) => {
    const serviceId = req.params.id;
    const { limit, offset } = (req as any).pagination;
    
    const bookings = await executeOptimizedQuery(
      db.select({
        id: serviceBookings.id,
        userId: serviceBookings.userId,
        serviceId: serviceBookings.serviceId,
        status: serviceBookings.status,
        scheduledDate: serviceBookings.scheduledDate,
        createdAt: serviceBookings.createdAt
      })
      .from(serviceBookings)
      .where(eq(serviceBookings.serviceId, serviceId))
      .orderBy(desc(serviceBookings.createdAt)),
      `bookings:service:${serviceId}:${limit}:${offset}`,
      {
        ttl: 60,
        limit,
        offset
      }
    );

    return {
      success: true,
      data: bookings
    };
  },
  { cache: true, cacheTTL: 60, paginate: true }
));

/**
 * GET /api/services/popular
 * Get most popular services based on booking count
 */
router.get('/services/popular', cacheResponse('api', undefined, 300), async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    
    const popularServices = await db
      .select({
        service: services,
        bookingCount: sql<number>`count(${serviceBookings.id})::int`
      })
      .from(services)
      .leftJoin(serviceBookings, eq(services.id, serviceBookings.serviceId))
      .where(eq(services.isActive, true))
      .groupBy(services.id)
      .orderBy(desc(sql`count(${serviceBookings.id})`))
      .limit(limit);

    res.json({
      success: true,
      data: popularServices
    });
  } catch (error) {
    logger.error('Error fetching popular services:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch popular services' 
    });
  }
});

/**
 * GET /api/services/stream
 * Stream all services for large datasets
 */
router.get('/services/stream', async (req, res) => {
  try {
    const query = db
      .select()
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(services.title);

    // Execute query and get cursor
    const result = await query;
    
    // Stream the response
    streamResponse(res, result, {
      transform: (service) => ({
        id: service.id,
        title: service.title,
        category: service.category,
        price: service.price
      }),
      batchSize: 50
    });
  } catch (error) {
    logger.error('Error streaming services:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to stream services' 
    });
  }
});

/**
 * GET /api/services/search
 * Search services with optimized full-text search
 */
router.get('/services/search', fastEndpoint(
  async (req) => {
    const { q, category } = req.query;
    const { limit, offset } = (req as any).pagination;
    
    if (!q || typeof q !== 'string') {
      return { success: false, error: 'Search query required' };
    }

    // Build search conditions
    const conditions = [
      eq(services.isActive, true),
      sql`(${services.title} ILIKE ${'%' + q + '%'} OR ${services.description} ILIKE ${'%' + q + '%'})`
    ];

    if (category) {
      conditions.push(eq(services.category, category as string));
    }

    const results = await executeOptimizedQuery(
      db.select()
        .from(services)
        .where(and(...conditions))
        .orderBy(services.title),
      `search:${q}:${category}:${limit}:${offset}`,
      {
        ttl: 120,
        limit,
        offset
      }
    );

    return {
      success: true,
      data: results,
      query: q,
      category
    };
  },
  { cache: true, cacheTTL: 120, paginate: true }
));

/**
 * GET /api/services/stats
 * Get service statistics with caching
 */
router.get('/services/stats', cacheResponse('api', undefined, 600), async (req, res) => {
  try {
    const stats = await db.transaction(async (tx) => {
      const [totalServices] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(services);
      
      const [activeServices] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(services)
        .where(eq(services.isActive, true));
      
      const [totalBookings] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(serviceBookings);
      
      const [recentBookings] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(serviceBookings)
        .where(gte(serviceBookings.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));

      return {
        totalServices: totalServices.count,
        activeServices: activeServices.count,
        totalBookings: totalBookings.count,
        recentBookings: recentBookings.count,
        timestamp: new Date().toISOString()
      };
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching service stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics' 
    });
  }
});

export default router;