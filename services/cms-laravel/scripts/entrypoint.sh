#!/bin/bash
set -e

echo "[Entrypoint] Starting CMS Laravel application..."
echo "[Entrypoint] Environment: ${APP_ENV:-production}"

cd /var/www/html

if [ ! -f ".env" ]; then
    echo "[Entrypoint] No .env file found, copying from .env.example..."
    cp .env.example .env
fi

if [ -z "$APP_KEY" ] && ! grep -q "^APP_KEY=base64:" .env; then
    echo "[Entrypoint] Generating application key..."
    php artisan key:generate --force
fi

echo "[Entrypoint] Running database migrations..."
php artisan migrate --force

if [ "${APP_ENV}" = "production" ]; then
    echo "[Entrypoint] Caching configuration for production..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan event:cache
fi

echo "[Entrypoint] Creating storage symlink..."
php artisan storage:link --force 2>/dev/null || true

echo "[Entrypoint] Setting permissions..."
chmod -R 775 storage bootstrap/cache

echo "[Entrypoint] Application ready. Starting PHP-FPM..."
exec php-fpm
