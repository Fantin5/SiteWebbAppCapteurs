#!/bin/bash

# Install PHP dependencies if vendor directory is empty
if [ ! -d "vendor" ] || [ ! "$(ls -A vendor 2>/dev/null)" ]; then
    echo "📦 Installing PHP dependencies..."
    composer install --no-interaction
else
    echo "✅ PHP dependencies already installed"
fi

# Start Apache
echo "🚀 Starting Apache..."
exec "$@"