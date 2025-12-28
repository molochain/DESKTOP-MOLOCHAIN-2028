-- =============================================================================
-- Molochain Database Initialization Script
-- Runs on first PostgreSQL container startup
-- =============================================================================

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE molochain_production TO molochain;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Molochain database initialized successfully';
END $$;
