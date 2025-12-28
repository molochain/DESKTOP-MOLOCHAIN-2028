import { db } from '../db';
import { sql } from 'drizzle-orm';
import { logger } from './logger';
import os from 'os';

interface QueryPerformanceMetrics {
  query: string;
  executionTime: number;
  rowsAffected: number;
  timestamp: Date;
}

class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private queryMetrics: QueryPerformanceMetrics[] = [];
  private connectionPool = {
    active: 0,
    idle: 0,
    maxConnections: 20
  };

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  async optimizeQueries() {
    try {
      // Analyze slow queries and suggest optimizations
      const slowQueries = this.queryMetrics
        .filter(metric => metric.executionTime > 1000)
        .sort((a, b) => b.executionTime - a.executionTime);

      if (slowQueries.length > 0) {
        logger.warn(`Found ${slowQueries.length} slow queries`, {
          slowestQuery: slowQueries[0],
          averageTime: slowQueries.reduce((sum, q) => sum + q.executionTime, 0) / slowQueries.length
        });

        // Implement immediate optimizations for critical queries
        await this.implementCriticalOptimizations();
      }

      // Create indexes for frequently queried columns
      await this.ensureOptimalIndexes();
      
      // Optimize connection pool settings
      await this.optimizeConnectionPool();
      
      // Clean up old metrics
      this.queryMetrics = this.queryMetrics.slice(-1000);
      
    } catch (error) {
      logger.error('Database optimization failed:', error);
    }
  }

  private async implementCriticalOptimizations() {
    try {
      // Optimize database connection settings
      await db.execute(sql.raw(`SET work_mem = '256MB'`));
      await db.execute(sql.raw(`SET shared_buffers = '128MB'`));
      await db.execute(sql.raw(`SET effective_cache_size = '1GB'`));
      
      // Update query planner settings
      await db.execute(sql.raw(`SET random_page_cost = 1.1`));
      await db.execute(sql.raw(`SET seq_page_cost = 1.0`));
      
      logger.info('Critical database optimizations applied');
    } catch (error) {
      logger.error('Failed to apply critical optimizations:', error);
    }
  }

  private async optimizeConnectionPool() {
    try {
      // Optimize connection pool for better performance
      this.connectionPool.maxConnections = Math.min(20, Math.max(5, Math.floor(os.cpus().length * 2)));
      
      logger.info('Connection pool optimized', {
        maxConnections: this.connectionPool.maxConnections,
        cpuCores: os.cpus().length
      });
    } catch (error) {
      logger.error('Failed to optimize connection pool:', error);
    }
  }

  private async ensureOptimalIndexes() {
    const indexes = [
      // User table optimizations
      { table: 'users', column: 'email', unique: true },
      { table: 'users', column: 'created_at' },
      
      // Service availability optimizations
      { table: 'service_availability', column: 'service_id' },
      { table: 'service_availability', column: 'region_id' },
      
      // Health metrics optimizations
      { table: 'health_metrics', column: 'timestamp' },
      { table: 'health_metrics', column: 'status' },
      
      // Notification optimizations
      { table: 'notifications', column: 'user_id' },
      { table: 'notifications', column: 'read' },
      
      // Shipment tracking optimizations
      { table: 'shipments', column: 'customer_id' },
      { table: 'shipments', column: 'status' },
      { table: 'shipments', column: 'created_at' },
      
      // Audit log optimizations
      { table: 'audit_logs', column: 'user_id' },
      { table: 'audit_logs', column: 'created_at' }
    ];

    for (const index of indexes) {
      try {
        const indexName = `idx_${index.table}_${index.column}`;
        const uniqueClause = index.unique ? 'UNIQUE' : '';
        
        await db.execute(sql.raw(`
          CREATE INDEX IF NOT EXISTS ${indexName} 
          ON ${index.table} (${index.column})
        `));
        
        logger.debug(`Ensured index exists: ${indexName}`);
      } catch (error) {
        // Index might already exist, continue with others
        logger.debug(`Index creation skipped for ${index.table}.${index.column}:`, error);
      }
    }
  }

  async analyzeTableStats() {
    try {
      const tables = [
        'users', 'shipments', 'notifications', 'health_metrics',
        'audit_logs', 'service_availability', 'customers'
      ];

      const stats = await Promise.all(
        tables.map(async (table) => {
          try {
            const result = await db.execute(sql.raw(`
              SELECT 
                COUNT(*) as row_count,
                pg_size_pretty(pg_total_relation_size('${table}')) as size
              FROM ${table}
            `));
            
            return {
              table,
              rowCount: result.rows[0]?.row_count || 0,
              size: result.rows[0]?.size || '0 bytes'
            };
          } catch (error) {
            return { table, rowCount: 0, size: '0 bytes', error: error instanceof Error ? error.message : String(error) };
          }
        })
      );

      logger.info('Database table statistics:', stats);
      return stats;
    } catch (error) {
      logger.error('Failed to analyze table stats:', error);
      return [];
    }
  }

  trackQuery(query: string, executionTime: number, rowsAffected: number = 0) {
    this.queryMetrics.push({
      query: query.substring(0, 200), // Truncate long queries
      executionTime,
      rowsAffected,
      timestamp: new Date()
    });
  }

  getConnectionPoolStatus() {
    return { ...this.connectionPool };
  }

  async runMaintenance() {
    try {
      logger.info('Starting database maintenance...');
      
      // Update table statistics
      await db.execute(sql.raw(`ANALYZE`));
      
      // Vacuum old data if needed
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 90); // 90 days ago
      
      // Clean up old audit logs
      const deletedAuditLogs = await db.execute(sql.raw(`
        DELETE FROM audit_logs 
        WHERE created_at < '${oldDate.toISOString()}'
        AND action NOT IN ('SECURITY_EVENT', 'LOGIN_FAILURE')
      `));
      
      // Clean up old health metrics
      const deletedHealthMetrics = await db.execute(sql.raw(`
        DELETE FROM health_metrics 
        WHERE timestamp < '${oldDate.toISOString()}'
      `));
      
      logger.info('Database maintenance completed', {
        deletedAuditLogs: deletedAuditLogs.rowCount || 0,
        deletedHealthMetrics: deletedHealthMetrics.rowCount || 0
      });
      
    } catch (error) {
      logger.error('Database maintenance failed:', error);
    }
  }
}

export const dbOptimizer = DatabaseOptimizer.getInstance();
export default dbOptimizer;