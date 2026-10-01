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

## Security notes (2026-10-01)
- Session verify no longer throws on malformed tokens or password hashes.
- Login lockout after repeated failures, plus per-email rate limit.
- Origin check on mutating API calls.
- Password change at /account. New passwords need 10+ chars with a letter and a digit.
- Admin hash is created only when ADMIN_PASSWORD is set. Do not ship the demo password.
- File store is still ephemeral on Vercel. Real money needs Postgres and a payment provider; this build does not move real funds.
