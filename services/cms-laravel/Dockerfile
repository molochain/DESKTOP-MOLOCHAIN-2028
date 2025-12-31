FROM php:8.4-fpm-alpine

LABEL maintainer="Molochain Ltd"
LABEL description="Laravel CMS for Molochain Ecosystem"

ARG APP_ENV=production
ENV APP_ENV=${APP_ENV}

RUN apk add --no-cache \
    bash \
    curl \
    git \
    zip \
    unzip \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    postgresql-dev \
    libxml2-dev \
    supervisor \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        gd \
        pdo \
        pdo_pgsql \
        pgsql \
        zip \
        intl \
        mbstring \
        xml \
        bcmath \
        opcache \
        pcntl \
    && pecl install redis \
    && docker-php-ext-enable redis

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN addgroup -g 1000 laravel && adduser -u 1000 -G laravel -s /bin/bash -D laravel

WORKDIR /var/www/html

COPY --chown=laravel:laravel . .

COPY php.ini /usr/local/etc/php/conf.d/custom.ini
COPY php-fpm.conf /usr/local/etc/php-fpm.d/www.conf

RUN if [ "$APP_ENV" = "production" ]; then \
        composer install --no-dev --optimize-autoloader --no-interaction; \
    else \
        composer install --no-interaction; \
    fi

RUN chown -R laravel:laravel /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

USER laravel

EXPOSE 9000

CMD ["php-fpm"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD php-fpm -t 2>/dev/null || exit 1
