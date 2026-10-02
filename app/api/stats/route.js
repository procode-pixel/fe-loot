const { load, ready, GAMES } = require("../../../../lib/store");

export async function GET() {
  await ready();
  const db = load();
  const active = db.listings.filter((l) => l.status === "active");
  return Response.json({
    ok: true,
    preview: !process.env.DATABASE_URL,
    games: GAMES.length,
    activeListings: active.length,
    sellers: new Set(active.map((l) => l.sellerId)).size,
    openReports: (db.reports || []).filter((r) => r.status !== "closed").length,
    time: new Date().toISOString()
  });
}
