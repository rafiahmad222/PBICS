FROM php:8.2-cli

# Install system dependencies
RUN apt-get update -y && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev

# Install PHP extensions required by Laravel
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy all project files
COPY . /app

# Install Laravel dependencies
RUN composer install --optimize-autoloader --no-dev --prefer-source

# Give full permission to storage and bootstrap/cache folders
RUN chmod -R 777 storage bootstrap/cache

# Start the Laravel built-in server (suitable for testing)
CMD php artisan serve --host=0.0.0.0 --port=$PORT
