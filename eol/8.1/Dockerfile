FROM php:8.1.34-alpine

# Add docker-php-extension-installer script
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

# Install dependencies
RUN apk add --no-cache \
    bash \
    curl \
    freetype-dev \
    g++ \
    gcc \
    gcompat \
    git \
    icu-dev \
    icu-libs \
    libc-dev \
    libzip-dev \
    make \
    mysql-client \
    nodejs \
    npm \
    oniguruma-dev \
    yarn \
    openssh-client \
    postgresql-libs \
    rsync \
    zlib-dev

# 基础镜像自带的 PEAR (1.10.16) 太旧：pecl.php.net 现在只提供 REST1.0/1.1 的
# channel.xml，旧客户端解析失败，`pecl channel-update` 报
# "XML Error: 'Not well-formed (invalid token)'"，接着装 imagick/xdebug 会报
# "No releases available"。升级到 1.10.18（8.2+ 官方镜像自带该版本）后恢复。
RUN curl -fsSL https://pear.php.net/go-pear.phar -o /tmp/go-pear.phar \
    && php /tmp/go-pear.phar -y > /dev/null \
    && rm -f /tmp/go-pear.phar

# Install php extensions
RUN chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions \
    @composer \
    redis-stable \
    imagick \
    xdebug \
    bcmath \
    calendar \
    exif \
    gd \
    intl \
    pdo_mysql \
    pdo_pgsql \
    pcntl \
    soap \
    zip

# Add local and global vendor bin to PATH.
ENV PATH ./vendor/bin:/composer/vendor/bin:/root/.composer/vendor/bin:/usr/local/bin:$PATH

# Install code style tools (phpcs and pint)
RUN composer global require "squizlabs/php_codesniffer=*" "laravel/pint=*"

# Setup working directory
WORKDIR /var/www
