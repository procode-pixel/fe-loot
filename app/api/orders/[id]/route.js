const { load, save } = require("../../../../lib/store");
const { currentUser, ensureAdmin } = require("../../../../lib/auth");

export async function POST(req, { params }) {
  ensureAdmin();
  const user = currentUser(req);
  if (!user) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const action = body.action;
  const db = load();
  const order = db.orders.find((o) => o.id === params.id);
  if (!order) return Response.json({ error: "الطلب غير موجود" }, { status: 404 });
  const isParty = user.id === order.buyerId || user.id === order.sellerId || user.role === "admin";
  if (!isParty) return Response.json({ error: "ممنوع" }, { status: 403 });
  if (action === "confirm" && user.id === order.buyerId && order.status === "escrow_held") {
    order.status = "released";
    const listing = db.listings.find((l) => l.id === order.listingId);
    if (listing) listing.status = "sold";
  } else if (action === "dispute" && ["escrow_held", "released"].includes(order.status)) {
    order.status = "disputed";
    db.disputes.push({ id: "d_" + order.id, orderId: order.id, by: user.id, note: String(body.note || "").slice(0, 300), at: new Date().toISOString() });
  } else if (action === "resolve_buyer" && user.role === "admin" && order.status === "disputed") {
    order.status = "refunded";
    const listing = db.listings.find((l) => l.id === order.listingId);
    if (listing) listing.status = "active";
  } else if (action === "resolve_seller" && user.role === "admin" && order.status === "disputed") {
    order.status = "released";
    const listing = db.listings.find((l) => l.id === order.listingId);
    if (listing) listing.status = "sold";
  } else {
    return Response.json({ error: "الإجراء غير مسموح في هذه الحالة." }, { status: 400 });
  }
  db.audit.push({ at: new Date().toISOString(), action, orderId: order.id, userId: user.id });
  save(db);
  return Response.json({ ok: true, status: order.status });
}
