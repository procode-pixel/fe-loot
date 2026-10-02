const { load, save, id, notify } = require("../../../lib/store");
const { currentUser, ensureAdmin, rateLimit, ip } = require("../../../lib/auth");
const { clean } = require("../../../lib/guard");

function party(order, user) {
  return user && (user.role === "admin" || user.id === order.buyerId || user.id === order.sellerId);
}

export async function GET(req) {
  ensureAdmin();
  const user = currentUser(req);
  if (!user) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const db = load();
  const orderId = new URL(req.url).searchParams.get("orderId");
  const order = db.orders.find((o) => o.id === orderId);
  if (!order || !party(order, user)) return Response.json({ error: "الطلب غير متاح." }, { status: 404 });
  const messages = (db.messages || []).filter((m) => m.orderId === orderId);
  return Response.json({ messages });
}

export async function POST(req) {
  ensureAdmin();
  if (!rateLimit("msg:" + ip(req), 20)) return Response.json({ error: "محاولات كثيرة." }, { status: 429 });
  const user = currentUser(req);
  if (!user || user.banned) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const text = clean(body.text, 400);
  const db = load();
  const order = db.orders.find((o) => o.id === body.orderId);
  if (!order || !party(order, user)) return Response.json({ error: "الطلب غير متاح." }, { status: 404 });
  if (text.length < 1) return Response.json({ error: "اكتب رسالة." }, { status: 400 });
  const message = { id: id("m"), orderId: order.id, userId: user.id, name: user.name, text, at: new Date().toISOString() };
  db.messages = db.messages || [];
  db.messages.push(message);
  db.messages = db.messages.slice(-800);
  const other = user.id === order.buyerId ? order.sellerId : order.buyerId;
  notify(db, other, "رسالة جديدة على الطلب " + order.id);
  db.audit.push({ at: message.at, action: "order.message", orderId: order.id, userId: user.id });
  if (db.audit.length > 400) db.audit = db.audit.slice(-400);
  await save(db);
  return Response.json({ ok: true, message });
}
