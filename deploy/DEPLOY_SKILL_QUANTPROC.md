# skill.quantproc.com Deployment

This deployment is intentionally isolated from `app.quantproc.com`.

## Isolation model

- Separate app root: `/var/www/skill.quantproc.com/app`
- Separate Node port: `3011`
- Separate PM2 process: `skill-quantproc-manpower`
- Separate nginx site file: `/etc/nginx/sites-available/skill.quantproc.com`
- Separate nginx access/error logs

## DNS

Point:

- `skill.quantproc.com` -> `167.71.199.128`

Use an `A` record with TTL `300`.

## Server steps

1. Copy the app to `/var/www/skill.quantproc.com/app`
2. Start the app with PM2 using `deploy/ecosystem.skill.config.cjs`
3. Install the nginx config from `deploy/skill.quantproc.com.nginx.conf`
4. Reload nginx
5. Add SSL with certbot for `skill.quantproc.com`

## Run commands

```bash
mkdir -p /var/www/skill.quantproc.com/app
cd /var/www/skill.quantproc.com/app
pm2 startOrReload deploy/ecosystem.skill.config.cjs --update-env
pm2 save
cp deploy/skill.quantproc.com.nginx.conf /etc/nginx/sites-available/skill.quantproc.com
ln -sfn /etc/nginx/sites-available/skill.quantproc.com /etc/nginx/sites-enabled/skill.quantproc.com
nginx -t
systemctl reload nginx
certbot --nginx -d skill.quantproc.com
```

## Separation guarantee

Do not reuse:

- the same nginx server block as `app.quantproc.com`
- the same PM2 app name
- the same Node port
- the same deployment directory

This prevents accidental overrides of the existing production app.
