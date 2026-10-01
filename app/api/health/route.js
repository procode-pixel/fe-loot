const { load, storageMode } = require("../../../lib/store");
const { hasKey } = require("../../../lib/box");

export async function GET() {
  const db = load();
  const authOk = String(process.env.AUTH_SECRET || "").length >= 24;
  const durable = Boolean(process.env.DATABASE_URL);
  return Response.json({
    ok: true,
    service: "feloot",
    previewMode: !durable,
    marketplaceReady: authOk,
    checks: {
      frontend: true,
      durableDatabase: durable,
      storage: storageMode(),
      authSecret: authOk,
      encryption: hasKey()
    },
    counts: {
      users: db.users.length,
      listings: db.listings.length,
      orders: db.orders.length,
      reports: (db.reports || []).length
    },
    time: new Date().toISOString()
  });
}
