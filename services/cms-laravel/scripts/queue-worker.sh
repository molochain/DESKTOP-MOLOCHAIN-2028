#!/bin/bash
set -e

echo "[Queue Worker] Starting Laravel queue worker..."
echo "[Queue Worker] Environment: ${APP_ENV:-production}"

cd /var/www/html

php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "[Queue Worker] Caches warmed. Starting queue:work..."

exec php artisan queue:work redis \
    --sleep=3 \
    --tries=3 \
    --max-time=3600 \
    --max-jobs=1000 \
    --memory=128 \
    --queue=high,default,low \
    --verbose
