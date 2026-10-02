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
- Request bodies over 100KB are rejected. Probe paths and encoded traversal return 404.
- COOP/CORP headers plus existing CSP, HSTS, frame deny, and nosniff.
- Order chat is limited to buyer, seller, and admin. Reviews only after release/delivery, one per order.
- This build does not move real funds. Do not take payments until Postgres and a payment provider are connected.

## User features
- Search, price ceiling, and sort: featured, price, rating.
- Wallet page shows escrow held vs completed amounts from orders.
- Messages: GET/POST /api/messages. Reviews: GET/POST /api/reviews.

## Ops
- Public health: /api/health
- On Vercel without DATABASE_URL, data lives in /tmp and resets.
- Vercel team env access may require reconnecting the Vercel account that owns fe-loot-v0.

## 2026-10-02
- Demo wallet top-up with daily cap. Purchases debit balance into escrow; refunds and seller release credit the wallet.
- Price offers at /offers and /api/offers. Dispute after release is blocked.
- Order actions await durable save. Rate-limit IP prefers x-vercel-forwarded-for.

## 2026-10-02 hardening
- Register session now includes token version so new accounts stay logged in.
- Honeypot field on login/register rejects filled bot submissions.
- Account page can revoke other sessions and delete the account after password confirmation. Open escrow orders block deletion. Admin account cannot be deleted here.

## 2026-10-02 dashboard
- Logged-in seller/buyer dashboard at /dashboard and /api/dashboard. Credentials are not included.
- Daily health workflow also probes /dashboard.
