-- Molochain PostgreSQL Initialization Script
-- Creates all required databases and users for the Molochain ecosystem

-- Create users
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'molodb') THEN
        CREATE USER molodb WITH ENCRYPTED PASSWORD 'changeme_molodb';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mololink') THEN
        CREATE USER mololink WITH ENCRYPTED PASSWORD 'changeme_mololink';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'cmsuser') THEN
        CREATE USER cmsuser WITH ENCRYPTED PASSWORD 'changeme_cms';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'replicator') THEN
        CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'changeme_replicator';
    END IF;
END
$$;

-- Create databases
SELECT 'CREATE DATABASE molochaindb OWNER molodb' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'molochaindb')\gexec

SELECT 'CREATE DATABASE mololinkdb OWNER mololink' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mololinkdb')\gexec

SELECT 'CREATE DATABASE cmsdb OWNER cmsuser' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'cmsdb')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE molochaindb TO molodb;
GRANT ALL PRIVILEGES ON DATABASE mololinkdb TO mololink;
GRANT ALL PRIVILEGES ON DATABASE cmsdb TO cmsuser;

-- Create required extensions
\c molochaindb
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

\c mololinkdb
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c cmsdb
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Log completion
\echo 'Database initialization completed successfully'
