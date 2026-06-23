FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock* ./
RUN composer install --no-interaction --prefer-dist --no-dev --optimize-autoloader

FROM php:8.3-cli

WORKDIR /app

COPY --from=vendor /app/vendor ./vendor
COPY . .

EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080", "-t", "public"]
