const { load, save, ready, id, notify, publicListing } = require("../../../lib/store");
const { currentUser, ensureAdmin, rateLimit, ip } = require("../../../lib/auth");

export async function GET(req) {
  await ready();
  ensureAdmin();
  const user = currentUser(req);
  if (!user) return Response.json({ error: "سجل الدخول." }, { status: 401 });
  const db = load();
  const rows = (db.offers || []).filter((o) => o.buyerId === user.id || o.sellerId === user.id || user.role === "admin");
  return Response.json({ offers: rows });
}

export async function POST(req) {
  await ready();
  ensureAdmin();
  if (!rateLimit("offer:" + ip(req), 12)) return Response.json({ error: "محاولات كثيرة." }, { status: 429 });
  const user = currentUser(req);
  if (!user || user.banned) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const db = load();
  db.offers = db.offers || [];
  if (body.action === "withdraw" || body.action === "reject" || body.action === "accept") {
    const offer = db.offers.find((o) => o.id === body.offerId);
    if (!offer || offer.status !== "open") return Response.json({ error: "العرض غير متاح." }, { status: 404 });
    if (body.action === "withdraw" && offer.buyerId !== user.id) return Response.json({ error: "ممنوع" }, { status: 403 });
    if ((body.action === "reject" || body.action === "accept") && offer.sellerId !== user.id && user.role !== "admin") {
      return Response.json({ error: "ممنوع" }, { status: 403 });
    }
    offer.status = body.action === "accept" ? "accepted" : body.action === "reject" ? "rejected" : "withdrawn";
    notify(db, offer.buyerId, "تحديث عرض السعر: " + offer.status);
    notify(db, offer.sellerId, "تحديث عرض السعر: " + offer.status);
    db.audit.push({ at: new Date().toISOString(), action: "offer." + body.action, userId: user.id, offerId: offer.id });
    await save(db);
    return Response.json({ ok: true, offer });
  }
  const listing = db.listings.find((l) => l.id === body.listingId && l.status === "active");
  if (!listing) return Response.json({ error: "العرض غير متاح." }, { status: 404 });
  if (listing.sellerId === user.id) return Response.json({ error: "لا يمكنك المزايدة على عرضك." }, { status: 400 });
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < 50 || amount >= Number(listing.price)) {
    return Response.json({ error: "المزايدة يجب أن تكون أقل من السعر وأكبر من 50." }, { status: 400 });
  }
  const open = db.offers.filter((o) => o.buyerId === user.id && o.listingId === listing.id && o.status === "open").length;
  if (open) return Response.json({ error: "عندك مزايدة مفتوحة على هذا العرض." }, { status: 409 });
  const offer = {
    id: id("of"), listingId: listing.id, title: listing.title, amount, price: listing.price,
    buyerId: user.id, buyerName: user.name, sellerId: listing.sellerId, sellerName: listing.sellerName,
    status: "open", createdAt: new Date().toISOString()
  };
  db.offers.unshift(offer);
  db.offers = db.offers.slice(0, 300);
  notify(db, listing.sellerId, "مزايدة جديدة على " + listing.title);
  db.audit.push({ at: offer.createdAt, action: "offer.create", userId: user.id, offerId: offer.id });
  await save(db);
  return Response.json({ ok: true, offer, listing: publicListing(listing) });
}
