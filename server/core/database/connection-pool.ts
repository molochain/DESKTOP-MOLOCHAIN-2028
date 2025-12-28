import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { logger } from '../../utils/logger';

class ConnectionPoolManager {
  private pool: Pool | null = null;
  private connectionCount = 0;
  private maxConnections = 50; // Increased from 20 for better concurrency
  private idleTimeout = 30000; // Increased from 10s to 30s to keep connections warm
  private connectionTimeout = 5000; // Increased from 3s to 5s for reliability

  async initialize() {
    if (this.pool) {
      logger.warn('Connection pool already initialized');
      return this.pool;
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable not set');
    }

    try {
      this.pool = new Pool({
        connectionString: databaseUrl,
        max: this.maxConnections,
        idleTimeoutMillis: this.idleTimeout,
        connectionTimeoutMillis: this.connectionTimeout,
        // Enable statement timeout to prevent long-running queries
        statement_timeout: 30000,
        // Enable query timeout
        query_timeout: 30000,
        // Application name for monitoring
        application_name: 'molochain-platform',
        // Keep alive
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000
      });

      // Handle pool errors
      this.pool.on('error', (err, client) => {
        logger.error('Unexpected error on idle database client', err);
      });

      // Track connection events
      this.pool.on('connect', (client) => {
        this.connectionCount++;
        logger.debug(`Database connection established. Total connections: ${this.connectionCount}`);
      });

      this.pool.on('remove', (client) => {
        this.connectionCount--;
        logger.debug(`Database connection removed. Total connections: ${this.connectionCount}`);
      });

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();

      logger.info('Database connection pool initialized successfully', {
        maxConnections: this.maxConnections,
        idleTimeout: this.idleTimeout,
        connectionTimeout: this.connectionTimeout
      });

      return this.pool;
    } catch (error) {
      logger.error('Failed to initialize database connection pool:', error);
      throw error;
    }
  }

  getPool(): Pool {
    if (!this.pool) {
      throw new Error('Connection pool not initialized');
    }
    return this.pool;
  }

  async getConnectionStats() {
    if (!this.pool) {
      return null;
    }

    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
      max: this.maxConnections,
      active: this.pool.totalCount - this.pool.idleCount
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.pool) {
        return false;
      }

      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();

      return result.rows.length > 0;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  async executeQuery<T>(query: string, params?: any[]): Promise<T[]> {
    const client = await this.pool!.connect();
    
    try {
      const start = Date.now();
      const result = await client.query(query, params);
      const duration = Date.now() - start;

      // Log slow queries
      if (duration > 1000) {
        logger.warn(`Slow query detected (${duration}ms):`, {
          query: query.substring(0, 100),
          duration
        });
      }

      return result.rows;
    } catch (error) {
      logger.error('Query execution failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool!.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async shutdown() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.connectionCount = 0;
      logger.info('Database connection pool shut down');
    }
  }

  // Monitor connection pool health
  startHealthMonitoring() {
    setInterval(async () => {
      const stats = await this.getConnectionStats();
      
      if (stats) {
        // Log warning if connection pool is nearly exhausted
        if (stats.active > stats.max * 0.8) {
          logger.warn('Database connection pool usage high:', stats);
        }
        
        // Log metrics periodically
        logger.debug('Database connection pool stats:', stats);
      }
    }, 30000); // Every 30 seconds
  }
}

export const connectionPool = new ConnectionPoolManager();