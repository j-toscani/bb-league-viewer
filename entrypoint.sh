#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx payload migrate
echo "✅ Migrations complete"

echo "🚀 Starting server..."
exec node server.js
