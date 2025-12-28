import { db } from '../db';
import { sql } from 'drizzle-orm';
import { logger } from '../utils/logger';

async function createMissingTables() {
  try {
    logger.info('🔧 Creating missing database tables...');

    // Create Instagram posts table
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS instagram_posts (
        id SERIAL PRIMARY KEY,
        account_id TEXT,
        instagram_post_id TEXT,
        media_type TEXT,
        media_url TEXT,
        thumbnail_url TEXT,
        caption TEXT,
        hashtags TEXT,
        permalink TEXT,
        is_scheduled BOOLEAN DEFAULT false,
        scheduled_publish_time TIMESTAMP,
        published_at TIMESTAMP,
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        shares_count INTEGER DEFAULT 0,
        reach INTEGER,
        impressions INTEGER,
        engagement_rate REAL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `));

    logger.info('✅ Instagram posts table created');

    // Create indexes for better performance
    await db.execute(sql.raw(`
      CREATE INDEX IF NOT EXISTS idx_instagram_posts_scheduled 
      ON instagram_posts(scheduled_publish_time) 
      WHERE is_scheduled = true;
    `));

    await db.execute(sql.raw(`
      CREATE INDEX IF NOT EXISTS idx_instagram_posts_created 
      ON instagram_posts(created_at);
    `));

    logger.info('✅ Database indexes created');

    // Verify tables exist
    const result = await db.execute(sql.raw(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'instagram_posts';
    `));

    if (result.length > 0) {
      logger.info('✅ All missing tables have been created successfully');
    } else {
      logger.warn('⚠️  Some tables may not have been created properly');
    }

  } catch (error) {
    logger.error('❌ Error creating missing tables:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createMissingTables()
    .then(() => {
      logger.info('🎉 Database migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Database migration failed:', error);
      process.exit(1);
    });
}

export { createMissingTables };