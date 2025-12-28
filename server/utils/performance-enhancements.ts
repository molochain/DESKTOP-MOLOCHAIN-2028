/**
 * Performance Enhancement Utilities
 * Optimizes slow API endpoints and database queries
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { apiCache, dbCache } from './cache-manager';

// Default pagination settings
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Pagination helper - extracts and validates pagination params
 */
export function getPaginationParams(req: Request) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE)
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Fast endpoint wrapper - adds caching, pagination, and error handling
 */
export function fastEndpoint(
  handler: (req: Request, res: Response) => Promise<any>,
  options: {
    cache?: boolean;
    cacheTTL?: number;
    paginate?: boolean;
  } = {}
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    try {
      // Generate cache key if caching is enabled
      if (options.cache) {
        const cacheKey = `${req.method}:${req.originalUrl}`;
        const cached = apiCache.get(cacheKey);
        
        if (cached) {
          res.setHeader('X-Cache', 'HIT');
          res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
          return res.json(cached);
        }
      }

      // Add pagination to request if enabled
      if (options.paginate) {
        (req as any).pagination = getPaginationParams(req);
      }

      // Execute handler
      const result = await handler(req, res);

      // Cache the result if caching is enabled
      if (options.cache && result) {
        const cacheKey = `${req.method}:${req.originalUrl}`;
        const ttl = options.cacheTTL || 60;
        apiCache.set(cacheKey, result, ttl);
        res.setHeader('X-Cache', 'MISS');
      }

      // Set response time header
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);

      // Log slow endpoints
      const duration = Date.now() - startTime;
      if (duration > 500) {
        logger.warn(`Slow endpoint: ${req.method} ${req.path}`, {
          duration,
          query: req.query,
          body: req.body
        });
      }

      res.json(result);
    } catch (error) {
      logger.error(`Endpoint error: ${req.method} ${req.path}`, error);
      next(error);
    }
  };
}

/**
 * Optimized database query executor with automatic caching
 */
export async function executeOptimizedQuery<T>(
  queryBuilder: any,
  cacheKey: string,
  options: {
    ttl?: number;
    limit?: number;
    offset?: number;
  } = {}
): Promise<T> {
  const ttl = options.ttl || 60;
  
  // Check cache first
  const cached = dbCache.get(cacheKey);
  if (cached) {
    logger.debug(`Database cache HIT: ${cacheKey}`);
    return cached as T;
  }

  const startTime = Date.now();
  
  try {
    // Apply limit and offset if provided
    if (options.limit) {
      queryBuilder = queryBuilder.limit(options.limit);
    }
    if (options.offset) {
      queryBuilder = queryBuilder.offset(options.offset);
    }

    // Execute query
    const result = await queryBuilder;
    
    // Log slow queries
    const duration = Date.now() - startTime;
    if (duration > 500) {
      logger.warn(`Slow database query detected`, {
        cacheKey,
        duration,
        limit: options.limit,
        offset: options.offset
      });
    }

    // Cache the result
    dbCache.set(cacheKey, result, ttl);
    logger.debug(`Database cache MISS: ${cacheKey} (cached for ${ttl}s)`);

    return result;
  } catch (error) {
    logger.error(`Database query error: ${cacheKey}`, error);
    throw error;
  }
}

/**
 * Batch query executor - runs multiple queries in parallel
 */
export async function executeBatchQueries<T extends Record<string, any>>(
  queries: Record<string, () => Promise<any>>
): Promise<T> {
  const startTime = Date.now();
  const results: any = {};
  
  try {
    // Execute all queries in parallel
    const promises = Object.entries(queries).map(async ([key, queryFn]) => {
      results[key] = await queryFn();
    });

    await Promise.all(promises);

    const duration = Date.now() - startTime;
    logger.debug(`Batch queries executed in ${duration}ms`, {
      queryCount: Object.keys(queries).length
    });

    return results as T;
  } catch (error) {
    logger.error('Batch query execution failed', error);
    throw error;
  }
}

/**
 * Stream large dataset responses
 */
export function streamResponse(
  res: Response,
  dataSource: AsyncIterable<any> | Array<any>,
  options: {
    transform?: (item: any) => any;
    batchSize?: number;
  } = {}
) {
  const batchSize = options.batchSize || 100;
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.write('[');

  let first = true;
  let count = 0;
  let batch: any[] = [];

  const writeBatch = () => {
    if (batch.length === 0) return;
    
    const items = batch.map(item => {
      const transformed = options.transform ? options.transform(item) : item;
      return JSON.stringify(transformed);
    });

    const prefix = first ? '' : ',';
    res.write(prefix + items.join(','));
    first = false;
    batch = [];
  };

  // Handle arrays
  if (Array.isArray(dataSource)) {
    for (const item of dataSource) {
      batch.push(item);
      count++;
      
      if (batch.length >= batchSize) {
        writeBatch();
      }
    }
    writeBatch();
    res.end(']');
  } else {
    // Handle async iterables
    (async () => {
      try {
        for await (const item of dataSource) {
          batch.push(item);
          count++;
          
          if (batch.length >= batchSize) {
            writeBatch();
          }
        }
        writeBatch();
        res.end(']');
        
        logger.debug(`Streamed ${count} items`);
      } catch (error) {
        logger.error('Stream response error', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream failed' });
        }
      }
    })();
  }
}

/**
 * Create database indexes for commonly queried fields
 */
export async function createPerformanceIndexes() {
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active)',
    'CREATE INDEX IF NOT EXISTS idx_services_category ON services(category)',
    'CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status)',
    'CREATE INDEX IF NOT EXISTS idx_shipments_created ON shipments(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_bookings_customer ON service_bookings(customer_id)',
    'CREATE INDEX IF NOT EXISTS idx_bookings_service ON service_bookings(service_id)',
    'CREATE INDEX IF NOT EXISTS idx_bookings_status ON service_bookings(status)',
  ];

  for (const indexQuery of indexes) {
    try {
      await db.execute(sql.raw(indexQuery));
      logger.info(`Index created: ${indexQuery.match(/idx_\w+/)?.[0]}`);
    } catch (error: any) {
      // Only suppress "already exists" errors - log all others for visibility
      if (!error.message?.includes('already exists')) {
        logger.error(`Failed to create index: ${indexQuery}`, error);
      }
    }
  }
}

/**
 * Initialize performance enhancements
 */
export async function initializePerformanceEnhancements() {
  logger.info('Initializing performance enhancements...');
  
  // Create database indexes
  await createPerformanceIndexes();
  
  // Warm up caches with frequently accessed data
  warmupCaches();
  
  logger.info('Performance enhancements initialized');
}

/**
 * Warm up caches with frequently accessed data
 */
async function warmupCaches() {
  try {
    // Pre-cache commonly accessed endpoints
    const commonQueries = [
      { key: 'services:active', query: async () => await db.execute(sql.raw('SELECT * FROM services WHERE is_active = true LIMIT 100')) },
      { key: 'api:status', data: { status: 'operational', timestamp: Date.now() } },
    ];

    for (const item of commonQueries) {
      if (item.query) {
        const result = await item.query();
        dbCache.set(item.key, result, 300);
      } else if (item.data) {
        apiCache.set(item.key, item.data, 300);
      }
    }

    logger.info('Cache warmup completed');
  } catch (error) {
    logger.error('Cache warmup failed', error);
  }
}