#!/usr/bin/env bash
set -euo pipefail

if [ ! -f "/app/.env" ]; then
  echo "Warning: /app/.env not found; scheduler jobs may fail due to missing env vars."
fi

if [ ! -f "/app/docker/scrappers.cron" ]; then
  echo "Error: /app/docker/scrappers.cron not found."
  exit 1
fi

chmod 0644 /app/docker/scrappers.cron
crontab /app/docker/scrappers.cron

echo "Installed scrappers cron schedule:"
crontab -l

echo "Starting cron in foreground..."
exec cron -f
