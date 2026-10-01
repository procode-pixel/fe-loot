# FeLoot
Marketplace UI for gaming-account listings with escrow hold, dispute freeze, and admin review.

## Run
```
npm install
npm run dev
```
Set ADMIN_PASSWORD (10+ chars) and AUTH_SECRET (24+ chars) before production. Do not use a shared demo password.

## Production env
- AUTH_SECRET long random string. Production login refuses a missing secret.
- ENCRYPTION_KEY separate 32+ char secret for delivery credentials (AES-256-GCM).
- ADMIN_PASSWORD strong unique password.
- DATABASE_URL Postgres connection. Without it, storage is a local file or lambda memory and is not durable on Vercel.

## Security notes
- New listings stay pending until an admin approves them.
- Credentials are encrypted at rest and stripped from public listing responses.
- Login lockout, per-IP and per-email rate limits, origin check on mutating APIs.
- Password change bumps tokenVersion so old sessions stop working on next login token.
- Security headers: frame deny, nosniff, HSTS, CSP, referrer policy.
- This build does not move real funds.
- Favorites: POST /api/favorites. Reports: POST /api/reports.
