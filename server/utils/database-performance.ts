/**
 * Database Performance Optimization and Monitoring
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { logger } from './logger';

interface QueryPerformanceMetrics {
  queryName: string;
  executionTime: number;
  rowsAffected: number;
  timestamp: Date;
}

interface DatabaseIndexSuggestion {
  table: string;
  columns: string[];
  reason: string;
  estimatedImprovement: string;
}

class DatabasePerformanceOptimizer {
  private queryMetrics: QueryPerformanceMetrics[] = [];
  private readonly SLOW_QUERY_THRESHOLD = 100; // milliseconds

  /**
   * Create essential indexes for performance optimization
   */
  async createPerformanceIndexes(): Promise<void> {
    const indexes = [
      // Shipments table indexes
      {
        name: "idx_shipments_status_created",
        query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shipments_status_created ON shipments (status, created_at DESC);`
      },
      {
        name: "idx_shipments_customer_status",
        query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shipments_customer_status ON shipments (customer_id, status);`
      },
      {
        name: "idx_shipments_tracking_number",
        query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shipments_tracking_number ON shipments (tracking_number) WHERE tracking_number IS NOT NULL;`
      },

      // Users table indexes
      {
        name: "idx_users_email_unique",
        query: `CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_unique ON users (email);`
      },
      {
        name: "idx_users_active_created",
        query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_created ON users (active, created_at DESC);`
      },

      // Analytics performance indexes
      {
        name: "idx_audit_logs_timestamp",
        query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC);`
      },
      {
        name: "idx_audit_logs_user_action",
        query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_action ON audit_logs (user_id, action, timestamp DESC);`
      },

      // Route optimization indexes
      {
        name: "idx_route_optimizations_shipment",
        query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_route_optimizations_shipment ON route_optimizations (shipment_id, created_at DESC);`
      },
      {
        name: "idx_route_history_points_optimization",
        query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_route_history_points_optimization ON route_history_points (route_optimization_id, sequence_order);`
      },

      // Collaboration and project indexes
      {
        name: "idx_collaboration_sessions_active",
        query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collaboration_sessions_active ON collaboration_sessions (status, created_at DESC) WHERE status = 'active';`
      },
      {
        name: "idx_collaboration_messages_session_time",
        query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collaboration_messages_session_time ON collaboration_messages (session_id, created_at DESC);`
      },

      // Service and booking indexes
      {
        name: "idx_service_bookings_user_status",
        query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_bookings_user_status ON service_bookings (user_id, status, booking_date DESC);`
      },
      {
        name: "idx_service_availability_region_date",
        query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_availability_region_date ON service_availability (region_id, available_date);`
      }
    ];

    for (const index of indexes) {
      try {
        await db.execute(sql.raw(index.query));
        logger.info(`Created index: ${index.name}`);
      } catch (error: any) {
        // Index might already exist, log but continue
        if (!error.message?.includes('already exists')) {
          logger.warn(`Failed to create index ${index.name}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Monitor query performance and identify slow queries
   */
  async monitorQueryPerformance<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const executionTime = Date.now() - startTime;
      
      // Log slow queries
      if (executionTime > this.SLOW_QUERY_THRESHOLD) {
        logger.warn(`Slow query detected: ${queryName} took ${executionTime}ms`);
      }

      // Store metrics
      this.queryMetrics.push({
        queryName,
        executionTime,
        rowsAffected: Array.isArray(result) ? result.length : 1,
        timestamp: new Date()
      });

      // Keep only last 1000 metrics
      if (this.queryMetrics.length > 1000) {
        this.queryMetrics = this.queryMetrics.slice(-1000);
      }

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(`Query failed: ${queryName} after ${executionTime}ms`, error);
      throw error;
    }
  }

  /**
   * Analyze database statistics and provide optimization suggestions
   */
  async analyzePerformance(): Promise<{
    slowQueries: QueryPerformanceMetrics[];
    indexSuggestions: DatabaseIndexSuggestion[];
    tableStats: any[];
  }> {
    // Get slow queries from metrics
    const slowQueries = this.queryMetrics
      .filter(metric => metric.executionTime > this.SLOW_QUERY_THRESHOLD)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    // Get table statistics
    const tableStatsQuery = `
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        seq_scan as sequential_scans,
        seq_tup_read as sequential_reads,
        idx_scan as index_scans,
        idx_tup_fetch as index_reads
      FROM pg_stat_user_tables 
      ORDER BY seq_scan DESC, seq_tup_read DESC
      LIMIT 20;
    `;

    let tableStats: any[] = [];
    try {
      const result = await db.execute(sql.raw(tableStatsQuery));
      tableStats = result.rows || [];
    } catch (error) {
      logger.warn('Could not fetch table statistics:', error);
    }

    // Generate index suggestions based on table stats
    const indexSuggestions: DatabaseIndexSuggestion[] = [];
    
    for (const stat of tableStats) {
      if (stat.sequential_scans > 100 && stat.index_scans < stat.sequential_scans) {
        indexSuggestions.push({
          table: stat.tablename,
          columns: ['id', 'created_at'],
          reason: `High sequential scan ratio (${stat.sequential_scans} seq vs ${stat.index_scans || 0} idx)`,
          estimatedImprovement: 'Potential 50-80% query speed improvement'
        });
      }
    }

    return {
      slowQueries,
      indexSuggestions,
      tableStats
    };
  }

  /**
   * Get current query performance metrics
   */
  getMetrics(): {
    totalQueries: number;
    averageExecutionTime: number;
    slowQueriesCount: number;
    recentMetrics: QueryPerformanceMetrics[];
  } {
    const recent = this.queryMetrics.slice(-50);
    const averageTime = recent.length > 0 
      ? recent.reduce((sum, metric) => sum + metric.executionTime, 0) / recent.length 
      : 0;
    
    return {
      totalQueries: this.queryMetrics.length,
      averageExecutionTime: Math.round(averageTime * 100) / 100,
      slowQueriesCount: this.queryMetrics.filter(m => m.executionTime > this.SLOW_QUERY_THRESHOLD).length,
      recentMetrics: recent
    };
  }

  /**
   * Clear old metrics to prevent memory issues
   */
  clearOldMetrics(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.queryMetrics = this.queryMetrics.filter(metric => metric.timestamp > oneHourAgo);
  }
}

export const dbPerformanceOptimizer = new DatabasePerformanceOptimizer();

/**
 * Wrapper function for monitoring query performance
 */
export function monitorQuery<T>(queryName: string, queryFn: () => Promise<T>): Promise<T> {
  return dbPerformanceOptimizer.monitorQueryPerformance(queryName, queryFn);
}

/**
 * Initialize database performance optimizations
 */
export async function initializeDatabaseOptimizations(): Promise<void> {
  try {
    await dbPerformanceOptimizer.createPerformanceIndexes();
    logger.info('Database performance optimizations initialized');
    
    // Set up periodic cleanup
    setInterval(() => {
      dbPerformanceOptimizer.clearOldMetrics();
    }, 30 * 60 * 1000); // Every 30 minutes
    
  } catch (error) {
    logger.error('Failed to initialize database optimizations:', error);
  }
}