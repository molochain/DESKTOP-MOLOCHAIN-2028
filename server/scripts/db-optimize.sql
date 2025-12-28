-- PostgreSQL Optimization Script for molochain-core
-- Run as superuser or database owner
-- psql -U molodb -d molochaindb -f db-optimize.sql

-- ============================================
-- CONNECTION POOLING SETTINGS
-- ============================================
-- These should be set in postgresql.conf or via ALTER SYSTEM

-- Max connections (adjust based on your PM2 cluster instances)
-- For 4 CPU cluster mode with pool size 20: 4 * 20 + 20 = 100
ALTER SYSTEM SET max_connections = 120;

-- Shared buffers (25% of RAM, max ~8GB)
-- For 7.5GB RAM server: ~1.8GB
ALTER SYSTEM SET shared_buffers = '1792MB';

-- Effective cache size (50-75% of RAM)
ALTER SYSTEM SET effective_cache_size = '5GB';

-- Work mem for complex queries
ALTER SYSTEM SET work_mem = '64MB';

-- Maintenance work mem for vacuum, index creation
ALTER SYSTEM SET maintenance_work_mem = '256MB';

-- WAL settings for better write performance
ALTER SYSTEM SET wal_buffers = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

-- Random page cost (lower for SSDs)
ALTER SYSTEM SET random_page_cost = 1.1;

-- ============================================
-- COMMON INDEXES FOR LOGISTICS/OTMS
-- ============================================
-- Run these after checking your actual table structure

-- Example indexes - adjust table/column names to match your schema
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shipments_status ON shipments(status);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shipments_created_at ON shipments(created_at DESC);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_id ON orders(user_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_date ON orders(status, created_at DESC);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracking_events_shipment ON tracking_events(shipment_id, event_time DESC);

-- Composite index example for common queries
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shipments_status_date 
--   ON shipments(status, created_at DESC) 
--   WHERE status IN ('pending', 'in_transit', 'delivered');

-- ============================================
-- VACUUM AND ANALYZE
-- ============================================
-- Run periodically or via pg_cron

-- Analyze all tables to update statistics
ANALYZE;

-- Vacuum full (requires downtime - run during maintenance window)
-- VACUUM FULL;

-- Regular vacuum (can run live)
VACUUM ANALYZE;

-- ============================================
-- MONITORING QUERIES
-- ============================================

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) as indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find missing indexes (slow queries)
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    CASE WHEN seq_scan > 0 THEN seq_tup_read / seq_scan ELSE 0 END as avg_rows_per_seq_scan
FROM pg_stat_user_tables
WHERE seq_scan > 100
ORDER BY seq_tup_read DESC;

-- Check connection usage
SELECT 
    count(*) as total_connections,
    count(*) FILTER (WHERE state = 'active') as active,
    count(*) FILTER (WHERE state = 'idle') as idle,
    count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
FROM pg_stat_activity
WHERE datname = current_database();

-- Long running queries
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
AND state != 'idle';

-- ============================================
-- RELOAD CONFIGURATION
-- ============================================
-- After ALTER SYSTEM commands, reload config:
-- SELECT pg_reload_conf();
-- Or restart PostgreSQL for some settings
