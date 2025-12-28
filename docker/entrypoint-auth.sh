#!/bin/sh
set -e

echo "==================================="
echo "  Molochain Auth Service"
echo "  Environment: ${NODE_ENV:-development}"
echo "  Port: ${PORT:-7010}"
echo "==================================="

# Wait for dependencies
echo "Checking dependencies..."

# Wait for PostgreSQL
if [ -n "$DATABASE_URL" ]; then
  echo "Waiting for PostgreSQL..."
  until nc -z postgres 5432 2>/dev/null || timeout 30 sh -c 'echo > /dev/tcp/postgres/5432' 2>/dev/null; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 2
  done
  echo "PostgreSQL is up"
fi

# Wait for Redis
if [ -n "$REDIS_URL" ]; then
  echo "Waiting for Redis..."
  until nc -z redis 6379 2>/dev/null || timeout 30 sh -c 'echo > /dev/tcp/redis/6379' 2>/dev/null; do
    echo "Redis is unavailable - sleeping"
    sleep 2
  done
  echo "Redis is up"
fi

echo "All dependencies ready!"
echo "Starting Auth Service..."

# Run database migrations if needed
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  npm run db:push 2>/dev/null || echo "Migration skipped or failed"
fi

# Start the application
exec npx tsx server/index.ts
