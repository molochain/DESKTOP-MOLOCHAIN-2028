import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const databaseUrl = process.env.DATABASE_URL;
const isLocalPostgres = databaseUrl.includes('localhost') || 
                        databaseUrl.includes('127.0.0.1') || 
                        databaseUrl.includes('sslmode=disable');

let pool: any;
let db: any;

if (isLocalPostgres) {
  const { Pool } = await import('pg');
  const { drizzle } = await import('drizzle-orm/node-postgres');
  
  pool = new Pool({ 
    connectionString: databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  
  db = drizzle(pool, { schema });
} else {
  const { Pool: NeonPool, neonConfig } = await import('@neondatabase/serverless');
  const { drizzle: neonDrizzle } = await import('drizzle-orm/neon-serverless');
  const ws = await import('ws');
  
  neonConfig.webSocketConstructor = ws.default;
  
  pool = new NeonPool({ connectionString: databaseUrl });
  db = neonDrizzle({ client: pool, schema });
}

export { pool, db };
