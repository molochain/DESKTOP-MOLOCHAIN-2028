#!/bin/bash
set -e

echo "======================================"
echo "  DATABASE MIGRATION - PRODUCTION"
echo "======================================"

PROJECT_DIR="/var/www/vhosts/molochain.com/molochain-core"
cd "$PROJECT_DIR"

if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Create .env from .env.production.example first"
    exit 1
fi

source .env 2>/dev/null || export $(grep -v '^#' .env | xargs)

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not set in .env"
    exit 1
fi

echo ""
echo "[1/3] Checking database connection..."
psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1 && echo "  ✓ Database connected" || {
    echo "  ✗ Cannot connect to database"
    exit 1
}

echo ""
echo "[2/3] Running Drizzle migrations..."
npx drizzle-kit push
echo "  ✓ Migrations applied"

echo ""
echo "[3/3] Running database optimizations..."
read -p "Run PostgreSQL optimizations? (requires superuser) [y/N]: " confirm
if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    psql "$DATABASE_URL" -f scripts/db-optimize.sql
    echo "  ✓ Optimizations applied"
else
    echo "  - Skipped optimizations"
fi

echo ""
echo "======================================"
echo "  MIGRATION COMPLETE!"
echo "======================================"
