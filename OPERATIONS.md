# Operations Guide

This guide covers the day-to-day operating model for the `SKILL` platform.

## Core services

- Web app: `https://skill.quantproc.com`
- Node app process: `skill-quantproc-manpower`
- Database: `skill_quantproc`
- SMS provider: MSG91

## Important runtime concepts

- OTP login is mobile-first
- workers and clients share real-time location data
- project location can be separate from device location
- professional candidates can be pre-screened
- resume access is protected through backend routes

## Useful PM2 commands

```bash
pm2 status
pm2 logs skill-quantproc-manpower
pm2 restart skill-quantproc-manpower
pm2 save
```

## Useful Nginx commands

```bash
nginx -t
systemctl reload nginx
tail -f /var/log/nginx/skill.quantproc.access.log
tail -f /var/log/nginx/skill.quantproc.error.log
```

## Useful PostgreSQL checks

```bash
sudo -u postgres psql
\l
\c skill_quantproc
\dt
```

## Environment checklist

Keep these values available only on the server:

- `APP_SECRET`
- `DATABASE_URL`
- `MSG91_AUTH_KEY`
- `MSG91_TEMPLATE_ID`
- `MSG91_SENDER_ID`

Never commit live secrets into Git.

## Operational tests after each deployment

- open the home page
- request OTP for a test mobile number
- complete login for at least one role
- verify registry pages open
- verify map loads
- verify nearby matches still calculate
- verify resume view/download still works

## Safe release practice

Before deployment:

- commit local changes
- push to GitHub
- review changed files
- confirm `.env` is not being overwritten
- confirm the deployment stays isolated from `app.quantproc.com`

After deployment:

- reload PM2
- check server logs
- test OTP delivery
- test one worker and one client flow

## Sensitive files excluded from Git

- `.env`
- generated stores and logs
- private passwords and notes

## Recovery notes

If a release breaks:

- inspect `pm2 logs skill-quantproc-manpower`
- inspect nginx logs
- confirm database connection
- confirm MSG91 configuration
- roll back to the previous Git commit and redeploy the app directory
