# Deployment Guide

This guide describes the production deployment model for `SKILL` at `skill.quantproc.com`.

## Production topology

- Domain: `skill.quantproc.com`
- Server IP: `167.71.199.128`
- App root: `/var/www/skill.quantproc.com/app`
- Node port: `3011`
- PM2 process: `skill-quantproc-manpower`
- Nginx site file: `/etc/nginx/sites-available/skill.quantproc.com`
- PostgreSQL database: `skill_quantproc`
- PostgreSQL user: `skill_quantproc`

This deployment must remain isolated from `app.quantproc.com`.

## Isolation rules

Do not reuse any of the following from `app.quantproc.com`:

- nginx server block
- PM2 process name
- deployment directory
- Node port
- database
- database user
- environment file

## DNS

Create this DNS record:

- Type: `A`
- Host: `skill`
- Value: `167.71.199.128`
- TTL: `300`

## Server prerequisites

- Ubuntu server with Node.js installed
- Nginx installed
- PM2 installed globally
- PostgreSQL installed
- Certbot installed for SSL

## Environment variables

Create a production `.env` file in the app root with values such as:

```text
PORT=3011
APP_HOST=skill.quantproc.com
APP_SECRET=use-a-long-random-secret
DATABASE_URL=postgres://skill_quantproc:YOUR_DB_PASSWORD@127.0.0.1:5432/skill_quantproc
OTP_PROVIDER=msg91
MSG91_AUTH_KEY=YOUR_MSG91_AUTH_KEY
MSG91_TEMPLATE_ID=YOUR_MSG91_TEMPLATE_ID
MSG91_SENDER_ID=ADS91
MSG91_REAL_OTP=true
```

## Database setup

Use the helper SQL files in [`deploy`](E:/Software/manpower-portal/deploy):

- [create_skill_quantproc_role.sql](E:/Software/manpower-portal/deploy/create_skill_quantproc_role.sql)
- [create_skill_quantproc_db.sql](E:/Software/manpower-portal/deploy/create_skill_quantproc_db.sql)
- [reseed_skill_app_state.sql](E:/Software/manpower-portal/deploy/reseed_skill_app_state.sql)

Typical sequence:

```bash
sudo -u postgres psql -f create_skill_quantproc_role.sql
sudo -u postgres psql -f create_skill_quantproc_db.sql
sudo -u postgres psql -d skill_quantproc -f reseed_skill_app_state.sql
```

## Application deployment

Upload the project into:

```text
/var/www/skill.quantproc.com/app
```

Then install dependencies and start or reload the PM2 process:

```bash
cd /var/www/skill.quantproc.com/app
npm install --production
pm2 startOrReload deploy/ecosystem.skill.config.cjs --update-env
pm2 save
```

## Nginx setup

Copy the prepared config:

```bash
cp deploy/skill.quantproc.com.nginx.conf /etc/nginx/sites-available/skill.quantproc.com
ln -sfn /etc/nginx/sites-available/skill.quantproc.com /etc/nginx/sites-enabled/skill.quantproc.com
nginx -t
systemctl reload nginx
```

## SSL

After DNS resolves correctly:

```bash
certbot --nginx -d skill.quantproc.com
```

## Validation checklist

- `curl http://127.0.0.1:3011/api/bootstrap`
- `pm2 status`
- `nginx -t`
- `https://skill.quantproc.com` loads
- OTP SMS arrives through MSG91
- worker/client login succeeds
- map and location updates load

## Rollout checklist

- production `.env` present
- database reachable
- PM2 process online
- nginx proxy active
- SSL certificate issued
- DNS correct
- separate logs confirmed
- `app.quantproc.com` remains untouched
