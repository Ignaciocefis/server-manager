#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until nc -z db 5432; do
  sleep 1
done

echo "PostgreSQL is ready"

echo "Creating database..."
pnpm reset-db

echo "Starting Next.js..."
exec pnpm dev
