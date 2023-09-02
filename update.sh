#!/bin/bash

# variables
BACKEND_DIR="/home/ubuntu/auburncs/backend"
FRONTEND_DIR="/home/ubuntu/auburncs/frontend"
BACKEND_DEST="/var/www/backend"
FRONTEND_DEST="/var/www/html/auburncs-dev"

update_backend_dev() {
    cd $BACKEND_DIR
    npm install
    npm start 
}

update_backend_prod() {
    echo "backend prod deployment not implemented"
}

update_frontend_dev() {
    cd $FRONTEND_DIR
    npm install
    rm -rf $FRONTEND_DEST/* # clears previous frontend files
    npm run build:dev
    mv build/* $FRONTEND_DEST
}

update_frontend_prod() {
    cd $FRONTEND_DIR
    npm install
    rm -rf $FRONTEND_DEST # clears previous frontend files
    npm run build:prod
    mv build/* $FRONTEND_DEST
}

start() {
    if [ "$1" = "prod" ]; then
        echo "Building for production..."
        update_frontend_prod
        update_backend_prod
        echo "Build complete!"
    elif [ "$1" = "dev" ]; then
        echo "Building for development..."
        update_frontend_dev
        update_backend_dev
        echo "Build complete!"
    else
        echo "Invalid argument. Please use 'prod' or 'dev'."
    fi
}

start $1

