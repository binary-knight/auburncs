#!/bin/bash

if [ "$1" = "prod" ]; then
    echo "Building for production..."
    rm -rf /var/www/html/auburncs-dev
    npm run build:prod
    mv build/ /var/www/html/auburncs-dev
elif [ "$1" = "dev" ]; then
    echo "Building for development..."
    rm -rf /var/www/html/auburncs-dev
    npm run build:dev
    mv build/ /var/www/html/auburncs-dev
else
    echo "Invalid argument. Please use 'prod' or 'dev'."
fi

