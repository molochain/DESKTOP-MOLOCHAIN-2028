import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('database');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool error:', err);
});

pool.on('connect', () => {
  logger.debug('New database connection established');
});

export const db = drizzle(pool);

export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
  logger.info('Database pool closed');
}
