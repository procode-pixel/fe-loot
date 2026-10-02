const { load, ready } = require("../../../lib/store");
const { currentUser, ensureAdmin } = require("../../../lib/auth");

export async function GET(req) {
  await ready();
  ensureAdmin();
  const user = currentUser(req);
  if (!user || user.banned) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const db = load();
  const listings = (db.listings || [])
    .filter((l) => l.sellerId === user.id)
    .map((l) => ({ id: l.id, title: l.title, price: l.price, status: l.status, game: l.game, delivery: l.delivery, createdAt: l.createdAt }));
  const orders = (db.orders || []).filter((o) => o.buyerId === user.id || o.sellerId === user.id || user.role === "admin");
  const openOrders = orders.filter((o) => ["escrow_held", "delivered", "disputed"].includes(o.status)).length;
  const tickets = (db.tickets || []).filter((t) => (user.role === "admin" || t.userId === user.id) && t.status !== "closed").length;
  const unread = (db.notifications || []).filter((n) => n.userId === user.id && !n.read).length;
  return Response.json({
    balance: Number(user.balance || 0),
    listings,
    openOrders,
    tickets,
    unread,
    sold: orders.filter((o) => o.sellerId === user.id && ["released", "delivered"].includes(o.status)).length
  });
}
