const { load, save, ready, id, notify } = require("../../../lib/store");
const { currentUser, ensureAdmin, rateLimit, ip } = require("../../../lib/auth");
const { clean } = require("../../../lib/guard");

export async function GET(req) {
  await ready();
  ensureAdmin();
  const url = new URL(req.url);
  const sellerId = url.searchParams.get("sellerId");
  const db = load();
  let rows = db.reviews || [];
  if (sellerId) rows = rows.filter((r) => r.sellerId === sellerId);
  return Response.json({ reviews: rows.slice(0, 40) });
}

export async function POST(req) {
  await ready();
  ensureAdmin();
  if (!rateLimit("rev:" + ip(req), 8)) return Response.json({ error: "محاولات كثيرة." }, { status: 429 });
  const user = currentUser(req);
  if (!user) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const stars = Number(body.stars);
  const text = clean(body.text, 240);
  const db = load();
  const order = db.orders.find((o) => o.id === body.orderId && o.buyerId === user.id);
  if (!order) return Response.json({ error: "الطلب غير موجود." }, { status: 404 });
  if (!["released", "delivered"].includes(order.status)) return Response.json({ error: "التقييم بعد استلام الطلب فقط." }, { status: 400 });
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return Response.json({ error: "التقييم من 1 إلى 5." }, { status: 400 });
  db.reviews = db.reviews || [];
  if (db.reviews.some((r) => r.orderId === order.id)) return Response.json({ error: "تم التقييم مسبقاً." }, { status: 409 });
  const review = { id: id("r"), orderId: order.id, listingId: order.listingId, sellerId: order.sellerId, buyerName: user.name, stars, text, at: new Date().toISOString() };
  db.reviews.unshift(review);
  const seller = db.users.find((u) => u.id === order.sellerId);
  if (seller) {
    const mine = db.reviews.filter((r) => r.sellerId === seller.id);
    seller.rating = Math.round((mine.reduce((s, r) => s + r.stars, 0) / mine.length) * 10) / 10;
  }
  notify(db, order.sellerId, "تقييم جديد " + stars + "/5 على طلبك.");
  db.audit.push({ at: review.at, action: "review.create", orderId: order.id, userId: user.id });
  await save(db);
  return Response.json({ ok: true, review });
}
