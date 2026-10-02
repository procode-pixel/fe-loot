const { ready, mutate, notify } = require("../../../../lib/store");
const { currentUser, ensureAdmin, rateLimit, ip } = require("../../../../lib/auth");
const { clean } = require("../../../../lib/guard");

export async function POST(req, { params }) {
  await ready();
  ensureAdmin();
  if (!rateLimit("order-act:" + ip(req), 30)) return Response.json({ error: "محاولات كثيرة." }, { status: 429 });
  const user = currentUser(req);
  if (!user) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const action = body.action;
  const result = await mutate(async (db) => {
    const order = db.orders.find((o) => o.id === params.id);
    if (!order) return { save: false, status: 404, body: { error: "الطلب غير موجود" } };
    const isParty = user.id === order.buyerId || user.id === order.sellerId || user.role === "admin";
    if (!isParty) return { save: false, status: 403, body: { error: "ممنوع" } };
    const buyer = db.users.find((u) => u.id === order.buyerId);
    const seller = db.users.find((u) => u.id === order.sellerId);
    const price = Number(order.price || 0);
    if (action === "confirm" && user.id === order.buyerId && order.status === "escrow_held") {
      order.status = "released";
      const listing = db.listings.find((l) => l.id === order.listingId);
      if (listing) listing.status = "sold";
      if (seller) seller.balance = Number(seller.balance || 0) + price;
      notify(db, order.sellerId, "تم تحرير إسكرو الصفقة " + order.id);
    } else if (action === "dispute" && order.status === "escrow_held" && (user.id === order.buyerId || user.id === order.sellerId)) {
      order.status = "disputed";
      db.disputes = db.disputes || [];
      db.disputes.push({ id: "d_" + order.id, orderId: order.id, by: user.id, note: clean(body.note, 300), at: new Date().toISOString() });
      notify(db, order.buyerId, "تم تجميد الصفقة بسبب شكوى.");
      notify(db, order.sellerId, "تم تجميد الصفقة بسبب شكوى.");
    } else if (action === "resolve_buyer" && user.role === "admin" && order.status === "disputed") {
      order.status = "refunded";
      const listing = db.listings.find((l) => l.id === order.listingId);
      if (listing && listing.status === "reserved") listing.status = "active";
      if (buyer) buyer.balance = Number(buyer.balance || 0) + price;
      notify(db, order.buyerId, "تم رد مبلغ الصفقة إلى محفظتك.");
    } else if (action === "resolve_seller" && user.role === "admin" && order.status === "disputed") {
      order.status = "released";
      const listing = db.listings.find((l) => l.id === order.listingId);
      if (listing) listing.status = "sold";
      if (seller) seller.balance = Number(seller.balance || 0) + price;
      notify(db, order.sellerId, "تم تحرير الإسكرو لصالحك.");
    } else {
      return { save: false, status: 400, body: { error: "الإجراء غير مسموح في هذه الحالة." } };
    }
    db.audit.push({ at: new Date().toISOString(), action, orderId: order.id, userId: user.id, amount: price });
    if (db.audit.length > 400) db.audit = db.audit.slice(-400);
    return { save: true, status: 200, body: { ok: true, status: order.status } };
  });
  return Response.json(result.body, { status: result.status });
}
