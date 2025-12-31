#!/bin/bash
set -e

echo "[Scheduler] Starting Laravel scheduler..."
echo "[Scheduler] Environment: ${APP_ENV:-production}"

cd /var/www/html

php artisan config:cache
php artisan route:cache

echo "[Scheduler] Running schedule:work (runs scheduler every minute)..."

exec php artisan schedule:work --verbose
