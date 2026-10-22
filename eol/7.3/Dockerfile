FROM php:7.3.33-alpine

# Add docker-php-extension-installer script
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

# Install dependencies
RUN apk add --no-cache \
    bash \
    curl \
    freetype-dev \
    g++ \
    gcc \
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

# 基础镜像自带的 PEAR (1.10.13) 太旧：pecl.php.net 现在只提供 REST1.0/1.1 的
# channel.xml，旧客户端解析失败，`pecl channel-update` 报 XML Error，接着装
# imagick 会报 "does not have REST xml available"。
# 升级到 1.10.18（8.2+ 官方镜像自带该版本）后恢复。
RUN curl -fsSL https://pear.php.net/go-pear.phar -o /tmp/go-pear.phar \
    && php /tmp/go-pear.phar -y > /dev/null \
    && rm -f /tmp/go-pear.phar

# Install php extensions
RUN chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions \
    @composer \
    redis-^6.0 \
    imagick-stable \
    xdebug-^3.1 \
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

# Install code style tool (phpcs)
RUN composer global require "squizlabs/php_codesniffer=*"

# Setup working directory
WORKDIR /var/www
