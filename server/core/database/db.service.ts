import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@db/schema';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Determine SSL config from DATABASE_URL and environment
// If sslmode=disable is in the URL, don't add SSL config
const dbUrl = process.env.DATABASE_URL || '';
const sslDisabled = dbUrl.includes('sslmode=disable');
const getSslConfig = () => {
  if (sslDisabled) return undefined; // Respect explicit sslmode=disable
  if (process.env.NODE_ENV === 'production') {
    // For production with external DB (Neon, etc), verify SSL properly
    return { rejectUnauthorized: true };
  }
  return undefined; // Development - no SSL needed
};

// Use standard pg driver for better stability with optimized pool settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000, // 5 second timeout
  idleTimeoutMillis: 30000, // 30 second idle timeout (increased for connection reuse)
  max: 30, // Maximum number of connections (increased from 10 for better concurrency)
  min: 5, // Minimum number of connections to maintain
  ssl: getSslConfig(),
  statement_timeout: 10000, // 10 second statement timeout to prevent slow queries
  query_timeout: 10000, // 10 second query timeout
  application_name: 'molochain-platform'
});

export const db = drizzle({ client: pool, schema });
