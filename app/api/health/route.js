const { load, storageMode, ready } = require("../../../lib/store");
const { hasKey } = require("../../../lib/box");

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  await ready();
  const db = load();
  const authOk = String(process.env.AUTH_SECRET || "").length >= 24;
  const durable = Boolean(process.env.DATABASE_URL);
  const encryption = hasKey();
  const marketplaceReady = authOk && durable && encryption;
  return Response.json({
    ok: true,
    service: "feloot",
    status: marketplaceReady ? "ready" : "degraded",
    previewMode: !marketplaceReady,
    marketplaceReady,
    checks: {
      frontend: true,
      database: durable,
      durableDatabase: durable,
      storage: storageMode(),
      authSecret: authOk,
      encryption,
      cronSecret: String(process.env.CRON_SECRET || "").length >= 16
    },
    userFlows: {
      browse: true,
      register: marketplaceReady,
      sell: marketplaceReady,
      checkout: false,
      admin: authOk
    },
    counts: {
      listings: (db.listings || []).filter((l) => l.status === "active").length,
      orders: (db.orders || []).length
    },
    time: new Date().toISOString()
  }, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
