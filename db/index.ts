import { drizzle } from "drizzle-orm/neon-serverless";
import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import * as schema from "@db/schema";
import { logger } from "../server/utils/logger";
import { DB_CONFIG } from "../config";

if (!DB_CONFIG.url) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Determine if we're in production
const isProd = process.env.NODE_ENV === 'production';

// Configure neon for optimal performance
neonConfig.fetchConnectionCache = true;
neonConfig.useSecureWebSocket = isProd;
neonConfig.pipelineConnect = false; // Disable for better reliability
neonConfig.pipelineTLS = false; // Disable for better reliability

// Performance tracking
let queryCount = 0;
let totalQueryTime = 0;

// Create enhanced logger for drizzle queries
const dbLogger = {
  logQuery: (query: string, params: unknown[]) => {
    const startTime = Date.now();
    queryCount++;
    
    if (DB_CONFIG.logging) {
      logger.debug('DB Query:', { query, params, queryId: queryCount });
    } else if (isProd && query.length > 500) {
      logger.debug(`Long DB query (${query.length} chars)`, { 
        queryStart: query.substring(0, 100) + '...',
        queryId: queryCount
      });
    }
    
    // Track query performance
    const duration = Date.now() - startTime;
    totalQueryTime += duration;
    
    if (duration > DB_CONFIG.queryTimeout / 2) {
      logger.warn('Slow query detected:', {
        duration,
        queryLength: query.length,
        queryId: queryCount
      });
    }
  }
};

// Create SQL query builder with neon and enhanced configuration
export const sql = neon(DB_CONFIG.url, {
  arrayMode: false,
  fullResults: false,
  fetchOptions: {
    cache: 'no-store', // Prevent caching for real-time data
  }
});

// Configure drizzle with the neon query builder
export const db = drizzle(sql, {
  schema,
  logger: dbLogger
});

// Enhanced health check function with performance metrics
export async function checkDatabaseConnection() {
  const startTime = Date.now();
  try {
    // Simple query to verify connection is working
    const result = await sql`SELECT 1 as health_check, NOW() as timestamp`;
    const latency = Date.now() - startTime;
    
    return { 
      status: 'connected', 
      message: 'Database connection successful',
      latency,
      timestamp: new Date().toISOString(),
      performance: getPerformanceStats()
    }

    // Add global database error handler
    process.on('unhandledRejection', (reason, promise) => {
      if (reason && reason.toString().includes('database')) {
        console.warn('Database promise rejection:', reason);
      }
    });
  } catch (error: unknown) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Database connection check failed', { error: errorMessage, latency });
    return { 
      status: 'disconnected', 
      message: 'Database connection failed', 
      error: errorMessage,
      latency,
      timestamp: new Date().toISOString()
    };
  }
}

// Get database performance statistics
export function getPerformanceStats() {
  return {
    totalQueries: queryCount,
    totalQueryTime,
    averageQueryTime: queryCount > 0 ? totalQueryTime / queryCount : 0,
    lastReset: new Date().toISOString()
  };
}

// Reset performance counters
export function resetPerformanceStats() {
  queryCount = 0;
  totalQueryTime = 0;
  logger.info('Database performance stats reset');
}

// Connection pool monitoring
export async function getConnectionPoolStats() {
  try {
    // Query to check current connections
    const result = await sql`
      SELECT 
        count(*) as active_connections,
        max(query_start) as last_activity
      FROM pg_stat_activity 
      WHERE state = 'active'
    `;
    
    return {
      activeConnections: result[0]?.active_connections || 0,
      lastActivity: result[0]?.last_activity || null,
      poolSize: DB_CONFIG.poolSize,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Failed to get connection pool stats', { error });
    return {
      activeConnections: 'unknown',
      lastActivity: null,
      poolSize: DB_CONFIG.poolSize,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}
