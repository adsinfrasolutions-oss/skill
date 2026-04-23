# SKILL

SKILL is a role-based manpower and professional hiring platform built for `skill.quantproc.com`. It supports mobile OTP login, worker and professional registration, live location sharing, nearby matching, expert pre-screening, and mobile-friendly PWA installation.

## Core capabilities

- Role-based access for `Admin`, `Ambassador`, `Client`, and `Worker`
- Mobile OTP login with MSG91 support
- Separate worker and professional registration journeys
- Dynamic professional form logic by education, stream, role, and specialization
- Resume upload and protected resume access
- Worker availability, wages, radius, and visibility controls
- Client project-location capture with separate mobile and project coordinates
- Live map with worker, client, and project markers
- Nearby matching and in-app notifications
- Professional pre-screening tag and expert comments
- PWA support for install on Android and iPhone home screens
- Android and iOS wrapper projects for future store publishing

## Project structure

- `server.js`: Node server, OTP flow, session handling, registry APIs, file handling, and DB-backed state
- `app.js`: frontend application logic and dynamic dashboard behavior
- `index.html`: mobile-first app shell and dashboard layout
- `styles.css`: responsive UI styling
- `schema.sql`: relational schema reference
- `manifest.webmanifest`: PWA manifest
- `sw.js`: service worker
- `icons/`: installable app icons
- `android/`: Android wrapper project
- `ios/`: iOS wrapper project
- `deploy/`: nginx, PM2, DB, and deployment helper files

## Roles

- `Admin`: approvals, platform oversight, expert pre-screening, registry access
- `Ambassador`: worker sourcing, support, and tracking
- `Client`: manpower demand, project location, nearby worker discovery
- `Worker`: profile, wages, visibility, radius, location, and duty preferences

## Live environment

- Domain: `https://skill.quantproc.com`
- Deployment isolation: separate from `app.quantproc.com`
- App process: dedicated PM2 process
- Database: separate PostgreSQL database for SKILL

## Local run

Install dependencies and start the app:

```powershell
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

## Environment

Create an `.env` file for production-style configuration. Supported OTP configuration includes:

```text
OTP_PROVIDER=msg91
MSG91_AUTH_KEY=...
MSG91_TEMPLATE_ID=...
MSG91_SENDER_ID=...
MSG91_REAL_OTP=true
DATABASE_URL=postgres://...
```

Without MSG91 values, local development can still use demo OTP behavior.

## Mobile app use

The fastest way to test on mobile is the PWA:

- Android: open the site in Chrome and use `Install app` or `Add to Home screen`
- iPhone: open the site in Safari and use `Add to Home Screen`

## Deployment

Deployment assets for `skill.quantproc.com` are available under `deploy/`, including:

- nginx config
- PM2 ecosystem config
- deployment helper script
- PostgreSQL setup and reseed SQL

## Repository notes

- Sensitive runtime files such as `.env`, generated data stores, and logs are ignored
- `password.docx` is intentionally excluded from version control
- This repository currently tracks the application source and deployment assets only

## License

This repository is distributed under the proprietary license in [LICENSE](LICENSE).
