# FeLoot
Marketplace for gaming accounts with escrow hold, dispute freeze, and admin resolution.

## Run
```
npm install
npm run dev
```
Admin demo: admin@feloot.app / Admin#FeLoot2026

## Production env
- AUTH_SECRET long random string
- ADMIN_PASSWORD replace the demo password
- DATA_FILE optional path. On Vercel serverless, file storage is ephemeral. Connect Postgres before real payments.

## Security
HttpOnly signed cookies, scrypt passwords, rate limits, security headers, credentials hidden until escrow, role checks, audit log.
