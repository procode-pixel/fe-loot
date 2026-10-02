const { load, ready } = require("../../../../lib/store");
const { currentUser, ensureAdmin, rateLimit, ip } = require("../../../../lib/auth");

export async function GET(req) {
  await ready();
  ensureAdmin();
  if (!rateLimit("export:" + ip(req), 6, 60_000)) {
    return Response.json({ error: "بطّئ شوية." }, { status: 429 });
  }
  const user = currentUser(req);
  if (!user) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const db = load();
  const mineOrders = (db.orders || []).filter((o) => o.buyerId === user.id || o.sellerId === user.id).map((o) => {
    const { credentials, ...rest } = o;
    return rest;
  });
  const mineListings = (db.listings || []).filter((l) => l.sellerId === user.id).map((l) => {
    const { credentials, ...rest } = l;
    return rest;
  });
  return Response.json({
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      rating: user.rating || 5,
      balance: Number(user.balance || 0),
      totpEnabled: !!user.totpEnabled,
      createdAt: user.createdAt || null
    },
    listings: mineListings,
    orders: mineOrders,
    offers: (db.offers || []).filter((o) => o.buyerId === user.id || o.sellerId === user.id),
    reviews: (db.reviews || []).filter((r) => r.userId === user.id || r.sellerId === user.id),
    notifications: (db.notifications || []).filter((n) => n.userId === user.id),
    tickets: (db.tickets || []).filter((t) => t.userId === user.id).map((t) => ({ id: t.id, subject: t.subject, status: t.status, createdAt: t.createdAt }))
  });
}
