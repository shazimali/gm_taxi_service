#!/bin/sh
set -e

# This project has no prisma/migrations history — schema is kept in sync via
# `prisma db push`. Running it here (instead of as a separate manual step)
# means every deploy automatically applies additive schema changes before the
# server starts. Non-additive changes (e.g. a dropped/renamed column) will
# make this fail loudly rather than silently accept data loss — that's
# intentional; resolve those manually against the production DB first.
echo "[entrypoint] Syncing database schema (prisma db push)..."
npx prisma db push --skip-generate

echo "[entrypoint] Starting server..."
exec node server.js
