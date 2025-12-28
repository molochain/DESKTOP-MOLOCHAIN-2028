#!/bin/sh
set -e

echo "==================================="
echo "  Molochain Admin Service"
echo "  Environment: ${NODE_ENV:-development}"
echo "  Port: ${PORT:-7000}"
echo "==================================="

# Install connect-redis if not present (workaround for Docker build caching)
if [ ! -d "/app/node_modules/connect-redis" ]; then
  echo "Installing connect-redis for Redis session store..."
  cd /app && npm install connect-redis@7.1.1 --production --no-save 2>/dev/null || echo "Warning: Could not install connect-redis, will use MemoryStore fallback"
fi

# Wait for dependencies
echo "Checking dependencies..."

# Wait for PostgreSQL (using host.docker.internal for production setup)
echo "Waiting for PostgreSQL..."
for i in 1 2 3 4 5 6 7 8 9 10; do
  if nc -z host.docker.internal 5432 2>/dev/null; then
    echo "PostgreSQL is ready"
    break
  fi
  if nc -z postgres 5432 2>/dev/null; then
    echo "PostgreSQL is ready (via postgres hostname)"
    break
  fi
  echo "PostgreSQL is unavailable - attempt $i/10"
  sleep 2
done

# Wait for Redis if REDIS_URL is configured
if [ -n "$REDIS_URL" ]; then
  echo "Waiting for Redis..."
  for i in 1 2 3 4 5; do
    if nc -z host.docker.internal 6379 2>/dev/null; then
      echo "Redis is ready"
      break
    fi
    if nc -z redis 6379 2>/dev/null; then
      echo "Redis is ready (via redis hostname)"
      break
    fi
    echo "Redis is unavailable - attempt $i/5"
    sleep 2
  done
fi

echo "All dependencies ready!"
echo "Starting Admin Service..."

cd /app
exec npx tsx server/index.ts
