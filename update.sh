#!/bin/bash

# variables
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
BACKEND_DEST="/var/www/backend"
FRONTEND_DEST="/var/www/html/auburncs-dev"

update_backend_dev() {
    echo "backend deployment not implemented"
}

update_backend_prod() {
    echo "backend deployment not implemented"
}

update_frontend_dev() {
    cd $FRONTEND_DIR
    npm install
    rm -rf $FRONTEND_DEST/* # clears previous frontend files
    npm run build:dev
    mv build/ $FRONTEND_DEST
}

update_frontend_prod() {
    cd $FRONTEND_DIR
    npm install
    rm -rf $FRONTEND_DEST # clears previous frontend files
    npm run build:prod
    mv build/ $FRONTEND_DEST
}

start() {
    if [ "$1" = "prod" ]; then
        echo "Building for production..."
        update_frontend_prod
    elif [ "$1" = "dev" ]; then
        echo "Building for development..."
        update_frontend_dev
    else
        echo "Invalid argument. Please use 'prod' or 'dev'."
    fi
    echo "Build complete!"
}

start $1

