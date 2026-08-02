#!/bin/sh
set -e

if [ -n "$RUN_MIGRATIONS" ] && [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Applying database migrations..."
  ./node_modules/prisma/build/index.js migrate deploy
fi

if [ -n "$SEED_ON_START" ] && [ "$SEED_ON_START" = "true" ]; then
  echo "Seeding database..."
  ./node_modules/prisma/build/index.js db seed
fi

exec node server.js