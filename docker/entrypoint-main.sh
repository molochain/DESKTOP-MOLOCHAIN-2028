#!/bin/sh
set -e

echo "==================================="
echo "  Molochain Main Platform"
echo "  Environment: ${NODE_ENV:-development}"
echo "  Port: ${PORT:-5000}"
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

# Wait for Auth Service
if [ -n "$AUTH_SERVICE_URL" ]; then
  echo "Waiting for Auth Service..."
  AUTH_HOST=$(echo $AUTH_SERVICE_URL | sed -e 's|http://||' -e 's|:.*||')
  AUTH_PORT=$(echo $AUTH_SERVICE_URL | sed -e 's|.*:||')
  until nc -z $AUTH_HOST $AUTH_PORT 2>/dev/null; do
    echo "Auth Service is unavailable - sleeping"
    sleep 2
  done
  echo "Auth Service is up"
fi

# Wait for Admin Service
if [ -n "$ADMIN_SERVICE_URL" ]; then
  echo "Waiting for Admin Service..."
  ADMIN_HOST=$(echo $ADMIN_SERVICE_URL | sed -e 's|http://||' -e 's|:.*||')
  ADMIN_PORT=$(echo $ADMIN_SERVICE_URL | sed -e 's|.*:||')
  until nc -z $ADMIN_HOST $ADMIN_PORT 2>/dev/null; do
    echo "Admin Service is unavailable - sleeping"
    sleep 2
  done
  echo "Admin Service is up"
fi

echo "All dependencies ready!"
echo "Starting Main Platform..."

# Run database migrations if needed
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  npm run db:push 2>/dev/null || echo "Migration skipped or failed"
fi

# Start the application
exec npx tsx server/index.ts
