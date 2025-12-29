import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('database');

const isDbOptional = process.env.DB_OPTIONAL === 'true';
const hasDbUrl = !!process.env.DATABASE_URL && 
  process.env.DATABASE_URL.trim() !== '' &&
  !process.env.DATABASE_URL.includes('user:password@localhost');

let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;
let connectionStatus: 'connected' | 'disconnected' | 'optional' = 'disconnected';

if (hasDbUrl) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => {
    logger.error('Unexpected database pool error:', err);
    connectionStatus = 'disconnected';
  });

  pool.on('connect', () => {
    logger.debug('New database connection established');
    connectionStatus = 'connected';
  });

  dbInstance = drizzle(pool);
} else if (isDbOptional) {
  logger.info('Database is optional and not configured - running without database persistence');
  connectionStatus = 'optional';
} else {
  logger.warn('DATABASE_URL not configured - database features will be unavailable');
}

export const db = dbInstance;

export function getConnectionStatus(): 'connected' | 'disconnected' | 'optional' {
  return connectionStatus;
}

export async function testConnection(): Promise<boolean> {
  if (!pool) {
    if (isDbOptional) {
      logger.info('Database is optional - skipping connection test');
      return true;
    }
    logger.warn('No database pool available');
    return false;
  }
  
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    logger.info('Database connection successful');
    connectionStatus = 'connected';
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    connectionStatus = 'disconnected';
    return false;
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    logger.info('Database pool closed');
  }
}
