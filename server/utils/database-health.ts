/**
 * Enhanced database health monitoring and optimization
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { logger } from './logger';

export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'critical';
  metrics: {
    connectionCount: number;
    activeQueries: number;
    averageQueryTime: number;
    slowQueries: number;
    cacheHitRatio: number;
  };
  issues: string[];
  recommendations: string[];
}

export interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

class DatabaseHealthMonitor {
  private queryMetrics: QueryMetrics[] = [];
  private readonly maxMetricsHistory = 1000;
  private readonly slowQueryThreshold = 1000; // 1 second

  /**
   * Check overall database health
   */
  async checkHealth(): Promise<DatabaseHealth> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Test basic connectivity
      const startTime = Date.now();
      await db.execute(sql.raw(`SELECT 1 as health_check`));
      const queryTime = Date.now() - startTime;

      // Get connection statistics
      const connectionStats = await this.getConnectionStats();
      const queryStats = this.getQueryStats();

      // Analyze health metrics
      let status: 'healthy' | 'degraded' | 'critical' = 'healthy';

      if (queryTime > 500) {
        status = 'degraded';
        issues.push('Database response time is elevated');
        recommendations.push('Check database server performance and network connectivity');
      }

      if (connectionStats.activeConnections > 80) {
        status = 'degraded';
        issues.push('High number of active connections');
        recommendations.push('Consider implementing connection pooling or increasing pool size');
      }

      if (queryStats.slowQueries > 10) {
        status = 'degraded';
        issues.push('Multiple slow queries detected');
        recommendations.push('Analyze and optimize slow queries, consider adding indexes');
      }

      if (queryStats.errorRate > 5) {
        status = 'critical';
        issues.push('High database error rate');
        recommendations.push('Investigate database errors and fix failing queries');
      }

      return {
        status,
        metrics: {
          connectionCount: connectionStats.totalConnections,
          activeQueries: connectionStats.activeConnections,
          averageQueryTime: queryStats.averageTime,
          slowQueries: queryStats.slowQueries,
          cacheHitRatio: await this.getCacheHitRatio()
        },
        issues,
        recommendations
      };

    } catch (error) {
      logger.error('Database health check failed', { error });
      return {
        status: 'critical',
        metrics: {
          connectionCount: 0,
          activeQueries: 0,
          averageQueryTime: 0,
          slowQueries: 0,
          cacheHitRatio: 0
        },
        issues: ['Database connection failed'],
        recommendations: ['Check database server status and connectivity']
      };
    }
  }

  /**
   * Record query metrics for monitoring
   */
  recordQuery(query: string, duration: number, success: boolean, error?: string) {
    const metric: QueryMetrics = {
      query,
      duration,
      timestamp: new Date(),
      success,
      error
    };

    this.queryMetrics.push(metric);

    // Keep only recent metrics
    if (this.queryMetrics.length > this.maxMetricsHistory) {
      this.queryMetrics.splice(0, this.queryMetrics.length - this.maxMetricsHistory);
    }

    // Log slow queries
    if (duration > this.slowQueryThreshold) {
      logger.warn('Slow query detected', {
        query: query.substring(0, 200),
        duration,
        success
      });
    }
  }

  /**
   * Get connection statistics from database
   */
  private async getConnectionStats() {
    try {
      const result = await db.execute(sql.raw(`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `));

      const row = result?.[0] as any;
      return {
        totalConnections: Number(row?.total_connections || 0),
        activeConnections: Number(row?.active_connections || 0),
        idleConnections: Number(row?.idle_connections || 0)
      };
    } catch (error) {
      logger.error('Failed to get connection stats', { error });
      return { totalConnections: 0, activeConnections: 0, idleConnections: 0 };
    }
  }

  /**
   * Analyze query performance metrics
   */
  private getQueryStats() {
    const recentMetrics = this.queryMetrics.filter(
      m => m.timestamp.getTime() > Date.now() - 60000 // Last minute
    );

    if (recentMetrics.length === 0) {
      return {
        totalQueries: 0,
        averageTime: 0,
        slowQueries: 0,
        errorRate: 0
      };
    }

    const totalTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
    const slowQueries = recentMetrics.filter(m => m.duration > this.slowQueryThreshold).length;
    const errorCount = recentMetrics.filter(m => !m.success).length;

    return {
      totalQueries: recentMetrics.length,
      averageTime: totalTime / recentMetrics.length,
      slowQueries,
      errorRate: (errorCount / recentMetrics.length) * 100
    };
  }

  /**
   * Get cache hit ratio from database
   */
  private async getCacheHitRatio(): Promise<number> {
    try {
      const result = await db.execute(sql.raw(`
        SELECT 
          round(
            (sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))) * 100, 
            2
          ) as cache_hit_ratio
        FROM pg_statio_user_tables
      `));

      const row = result?.[0] as any;
      return Number(row?.cache_hit_ratio || 0);
    } catch (error) {
      logger.error('Failed to get cache hit ratio', { error });
      return 0;
    }
  }

  /**
   * Get slow queries analysis
   */
  async getSlowQueries(limit: number = 10) {
    try {
      const result = await db.execute(sql.raw(`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows
        FROM pg_stat_statements 
        WHERE calls > 10
        ORDER BY mean_time DESC 
        LIMIT ${limit}
      `));

      return result.map(row => ({
        query: String(row.query),
        calls: Number(row.calls),
        totalTime: Number(row.total_time),
        meanTime: Number(row.mean_time),
        rows: Number(row.rows)
      }));
    } catch (error) {
      logger.error('Failed to get slow queries', { error });
      return [];
    }
  }

  /**
   * Get table size information
   */
  async getTableSizes() {
    try {
      const result = await db.execute(sql.raw(`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 20
      `));

      return (result as any[]).map((row: any) => ({
        schema: String(row.schemaname),
        table: String(row.tablename),
        size: String(row.size),
        sizeBytes: Number(row.size_bytes)
      }));
    } catch (error) {
      logger.error('Failed to get table sizes', { error });
      return [];
    }
  }
}

export const dbHealthMonitor = new DatabaseHealthMonitor();

/**
 * Middleware to monitor database query performance
 */
export function createQueryMonitoringMiddleware() {
  return (req: any, res: any, next: any) => {
    const originalExecute = db.execute;
    
    db.execute = async function(query: any) {
      const startTime = Date.now();
      let success = true;
      let error: string | undefined;

      try {
        const result = await originalExecute.call(this, query);
        return result;
      } catch (err) {
        success = false;
        error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        const duration = Date.now() - startTime;
        dbHealthMonitor.recordQuery(
          String(query).substring(0, 500),
          duration,
          success,
          error
        );
      }
    };

    next();
  };
}