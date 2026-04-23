# Contributing

Thanks for contributing to `SKILL`.

## Working model

This project powers the live system at `skill.quantproc.com`, so changes should be made carefully and with production impact in mind.

## Ground rules

- keep `skill.quantproc.com` isolated from `app.quantproc.com`
- do not commit secrets, passwords, or live environment files
- keep database and deployment changes explicit
- test OTP, login, and dashboard basics after meaningful changes
- document operational changes in the repository when needed

## Typical contribution flow

1. Pull the latest `main`
2. Create a working branch
3. Make focused changes
4. Test locally where possible
5. Update docs if deployment, env, or operations changed
6. Open a pull request with validation notes

## Minimum validation

Before opening a PR, verify as applicable:

- app loads without console-breaking errors
- OTP flow still works in the intended environment
- role-based login still works
- affected dashboards still render
- any registry change still saves and loads correctly
- map-related changes do not break mobile usage

## Deployment-sensitive areas

Be extra careful when editing:

- `server.js`
- `app.js`
- `deploy/`
- OTP logic
- database connection handling
- resume access routes
- location and matching logic

## Production notes

- deployment model: see [DEPLOYMENT.md](DEPLOYMENT.md)
- operations guide: see [OPERATIONS.md](OPERATIONS.md)
- project overview: see [README.md](README.md)
