#!/bin/sh
set -e

# Schema changes are applied via versioned migrations (prisma/migrations),
# generated locally with `prisma migrate dev` and committed to git. Running
# `migrate deploy` here applies any pending migrations before the server
# starts. Unlike `db push`, this never guesses or warns about data loss —
# the SQL was already reviewed and committed, so there's nothing to confirm
# at deploy time.
echo "[entrypoint] Applying database migrations (prisma migrate deploy)..."
npx prisma migrate deploy

echo "[entrypoint] Starting server..."
exec node server.js
