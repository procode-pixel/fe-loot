const { load, save, ready, id } = require("../../../lib/store");
const { open } = require("../../../lib/box");
const { currentUser, ensureAdmin, rateLimit, ip } = require("../../../lib/auth");

export async function GET(req) {
  await ready();
  ensureAdmin();
  const user = currentUser(req);
  if (!user) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const db = load();
  const orders = db.orders.filter((o) => o.buyerId === user.id || o.sellerId === user.id || user.role === "admin");
  return Response.json({ orders: orders.map((o) => sanitize(o, user)) });
}

export async function POST(req) {
  await ready();
  ensureAdmin();
  if (!rateLimit("buy:" + ip(req), 15)) return Response.json({ error: "محاولات كثيرة." }, { status: 429 });
  const user = currentUser(req);
  if (!user) return Response.json({ error: "سجل الدخول للشراء." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const db = load();
  const listing = db.listings.find((l) => l.id === body.listingId && l.status === "active");
  if (!listing) return Response.json({ error: "العرض غير متاح." }, { status: 404 });
  if (listing.sellerId === user.id) return Response.json({ error: "لا يمكنك شراء عرضك." }, { status: 400 });
  const buyer = db.users.find((u) => u.id === user.id);
  const price = Number(listing.price);
  if (!buyer || Number(buyer.balance || 0) < price) {
    return Response.json({ error: "رصيد المحفظة غير كافٍ. اشحن محفظة التجربة من صفحة المحفظة.", needWallet: true, balance: Number(buyer?.balance || 0), price }, { status: 402 });
  }
  buyer.balance = Number(buyer.balance) - price;
  const order = {
    id: id("o"), listingId: listing.id, title: listing.title, price: listing.price, game: listing.game,
    buyerId: user.id, buyerName: user.name, sellerId: listing.sellerId, sellerName: listing.sellerName,
    delivery: listing.delivery, status: "escrow_held", credentials: listing.credentials,
    createdAt: new Date().toISOString()
  };
  listing.status = "reserved";
  db.orders.unshift(order);
  db.audit.push({ at: order.createdAt, action: "escrow.hold", orderId: order.id, userId: user.id, amount: price });
  await save(db);
  return Response.json({ ok: true, order: sanitize(order, user) });
}

function sanitize(order, user) {
  const copy = { ...order };
  const canSee = order.status === "released" || order.status === "delivered" || user.role === "admin" || (order.delivery === "instant" && order.status === "escrow_held" && user.id === order.buyerId);
  const allowed = canSee && (user.id === order.buyerId || user.role === "admin");
  copy.credentials = allowed ? open(order.credentials) : null;
  return copy;
}
module.exports = { sanitize };
