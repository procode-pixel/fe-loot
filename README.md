# FeLoot
Marketplace UI for gaming-account listings with escrow hold, dispute freeze, and admin review.

## Run
```
npm install
npm run dev
```
Set ADMIN_PASSWORD before first boot. Do not use a shared demo password in production.

## Production env
- AUTH_SECRET long random string
- ADMIN_PASSWORD strong unique password
- DATA_FILE optional path. On Vercel serverless, file storage is ephemeral. Connect Postgres before real payments.

## Security notes
- New listings stay pending until an admin approves them.
- Credentials are stripped from public listing responses.
- Login lockout, per-IP and per-email rate limits, origin check on mutating APIs.
- Security headers: frame deny, nosniff, HSTS, CSP, referrer policy.
- This build does not move real funds.
