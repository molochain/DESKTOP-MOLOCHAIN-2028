import { Pool } from 'pg';

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('⚠️ DATABASE_URL not set, skipping database setup');
    return;
  }

  // Use standard pg pool - the DATABASE_URL should include sslmode parameter if needed
  const dbUrl = process.env.DATABASE_URL;
  const sslDisabled = dbUrl.includes('sslmode=disable');
  
  const pool = new Pool({ 
    connectionString: dbUrl,
    ssl: sslDisabled ? undefined : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined)
  });

  try {
    console.log('🔧 Verifying database schema...');
    
    const tables = [
      `CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY,
        "replit_id" varchar(255) UNIQUE,
        "username" varchar(100) NOT NULL,
        "email" varchar(255) UNIQUE,
        "display_name" varchar(255),
        "avatar_url" text,
        "bio" text,
        "role" varchar(50) DEFAULT 'user',
        "preferences" jsonb DEFAULT '{}',
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "services" (
        "id" serial PRIMARY KEY,
        "code" varchar(50) UNIQUE NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text,
        "category" varchar(100),
        "type" varchar(50),
        "status" varchar(50) DEFAULT 'active',
        "version" varchar(20) DEFAULT '1.0.0',
        "tags" text[],
        "business_types" text[],
        "cargo_types" text[],
        "capabilities" jsonb DEFAULT '{}',
        "pricing" jsonb DEFAULT '{}',
        "availability" jsonb DEFAULT '{}',
        "requirements" text[],
        "features" text[],
        "metadata" jsonb DEFAULT '{}',
        "config" jsonb DEFAULT '{}',
        "health_status" varchar(20) DEFAULT 'healthy',
        "last_health_check" timestamp DEFAULT CURRENT_TIMESTAMP,
        "metrics" jsonb DEFAULT '{}',
        "dependencies" text[],
        "endpoints" jsonb DEFAULT '{}',
        "documentation" text,
        "icon" varchar(255),
        "sort_order" integer DEFAULT 0,
        "is_active" boolean DEFAULT true,
        "created_by" integer,
        "updated_by" integer,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "projects" (
        "id" serial PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "description" text,
        "client_name" varchar(255),
        "status" varchar(50) DEFAULT 'active',
        "priority" varchar(20) DEFAULT 'medium',
        "start_date" timestamp,
        "end_date" timestamp,
        "budget" decimal(15,2),
        "progress" integer DEFAULT 0,
        "team_size" integer DEFAULT 1,
        "location" varchar(255),
        "services" text[],
        "tags" text[],
        "metadata" jsonb DEFAULT '{}',
        "created_by" integer,
        "updated_by" integer,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "page_modules" (
        "id" serial PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "component" varchar(255) NOT NULL,
        "route" varchar(255) NOT NULL,
        "category" varchar(100),
        "description" text,
        "is_active" boolean DEFAULT true,
        "sort_order" integer DEFAULT 0,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "health_metrics" (
        "id" serial PRIMARY KEY,
        "status" varchar(20) DEFAULT 'healthy',
        "database_latency" integer,
        "services_status" jsonb DEFAULT '{}',
        "system_metrics" jsonb DEFAULT '{}',
        "timestamp" timestamp DEFAULT CURRENT_TIMESTAMP,
        "alerts_enabled" boolean DEFAULT true,
        "alert_configurations" jsonb DEFAULT '{}',
        "last_alert_sent" timestamp,
        "response_time_thresholds" jsonb DEFAULT '{}'
      )`
    ];

    for (const tableQuery of tables) {
      try {
        await pool.query(tableQuery);
      } catch (tableError: any) {
        if (!tableError.message?.includes('already exists')) {
          console.warn(`Table creation warning: ${tableError.message}`);
        }
      }
    }

    console.log('✅ Database schema verified');

    const servicesSeed = [
      { code: 'AIR001', name: 'Air Freight Services', description: 'Fast and reliable air cargo transportation', category: 'transport', type: 'air' },
      { code: 'SEA001', name: 'Container Shipping', description: 'Cost-effective ocean freight solutions', category: 'transport', type: 'sea' },
      { code: 'WRH001', name: 'Warehousing & Storage', description: 'Secure storage and distribution services', category: 'storage', type: 'warehouse' }
    ];

    for (const service of servicesSeed) {
      try {
        await pool.query(`
          INSERT INTO services (code, name, description, category, type)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (code) DO NOTHING
        `, [service.code, service.name, service.description, service.category, service.type]);
      } catch (seedError: any) {
        if (!seedError.message?.includes('duplicate') && !seedError.message?.includes('already exists')) {
          console.warn(`Service seed warning: ${seedError.message}`);
        }
      }
    }

    console.log('✅ Database setup complete');

  } catch (error: any) {
    console.error('❌ Database setup failed:', error.message || error);
  } finally {
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase().catch(console.error);
}

export { setupDatabase };
