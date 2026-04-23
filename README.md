# Manpower Portal App

This is a runnable manpower web app prepared for `skill.quantproc.com`.

## Included

- `server.js`: lightweight Node server with OTP, sessions, worker registration, and location APIs
- `index.html`: mobile OTP login, role-based dashboard UI, and worker registration
- `styles.css`: responsive app styling
- `app.js`: frontend app logic
- `schema.sql`: production-style relational schema for a future database-backed version
- `data/store.json`: auto-generated local data store after first run

## Roles

- Admin
- Ambassador
- Client
- Worker

## Demo login

- Admin: `9000000001`
- Ambassador: `9000000002`
- Client: `9000000003`
- Worker: `9000000004`

## Seeded emails

- Admin: `admin@skill.quantproc.com`
- Ambassador: `ambassador@skill.quantproc.com`
- Client: `client@skill.quantproc.com`
- Worker: `worker@skill.quantproc.com`

## Run

Run:

```powershell
node server.js
```

Then open `http://localhost:3000`.

## Deployment

Deployment files for `skill.quantproc.com` are in [`deploy`](E:/Software/manpower-portal/deploy).

This setup is isolated from `app.quantproc.com` by using:

- separate directory
- separate process name
- separate port `3011`
- separate nginx site config

## Functional note

When a worker selects an industry category, the skill dropdown is automatically filtered from the category master.

OTP is demo-generated locally and shown on screen. In production, connect `/api/auth/request-otp` to an SMS gateway.

## MSG91 OTP

The app now supports MSG91-backed OTP sending when these environment variables are set:

- `OTP_PROVIDER=msg91`
- `MSG91_AUTH_KEY=...`
- `MSG91_TEMPLATE_ID=...`
- `MSG91_SENDER_ID=...`
- `MSG91_REAL_OTP=true`

Without those values, localhost can still use demo OTP for development.

The app includes mobile geolocation capture for both workers and clients. In production, the SQL schema supports proper tracking tables, assignments, and alerts.

## PWA

The app now includes:

- `manifest.webmanifest`
- `sw.js`
- installable app icons under `icons/`

Open the deployed site on mobile and use `Add to Home Screen` or `Install app`.
