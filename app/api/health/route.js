const { load } = require("../../../lib/store");
const { ensureAdmin } = require("../../../lib/auth");

export async function GET() {
  ensureAdmin();
  const db = load();
  return Response.json({
    ok: true,
    ready: true,
    marketplaceReady: true,
    previewMode: false,
    service: "feloot",
    status: "ok",
    checks: { frontend: true, database: true, authSecret: Boolean(process.env.AUTH_SECRET), encryption: Boolean(process.env.AUTH_SECRET) },
    counts: { users: db.users.length, listings: db.listings.length, orders: db.orders.length },
    time: new Date().toISOString()
  });
}
