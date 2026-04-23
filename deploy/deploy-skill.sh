#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/var/www/skill.quantproc.com"
APP_DIR="$APP_ROOT/app"
SERVICE_NAME="skill-quantproc-manpower"
NGINX_AVAILABLE="/etc/nginx/sites-available/skill.quantproc.com"
NGINX_ENABLED="/etc/nginx/sites-enabled/skill.quantproc.com"

mkdir -p "$APP_DIR"

rsync -av --delete \
  --exclude "data/store.json" \
  ./ "$APP_DIR"/

cd "$APP_DIR"

mkdir -p data

if command -v pm2 >/dev/null 2>&1; then
  pm2 startOrReload deploy/ecosystem.skill.config.cjs --update-env
  pm2 save
else
  echo "pm2 is not installed. Install pm2 before running this script."
  exit 1
fi

cp deploy/skill.quantproc.com.nginx.conf "$NGINX_AVAILABLE"
ln -sfn "$NGINX_AVAILABLE" "$NGINX_ENABLED"

nginx -t
systemctl reload nginx

echo "Deployment finished for skill.quantproc.com on port 3011"
