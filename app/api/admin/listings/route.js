const { load, save, publicListing, ready, notify } = require("../../../../lib/store");
const { currentUser, ensureAdmin, rateLimit, ip } = require("../../../../lib/auth");
const { clean } = require("../../../../lib/guard");

function watchHit(listing, watch) {
  if (watch.game && watch.game !== listing.game) return false;
  if (watch.maxPrice && Number(listing.price) > Number(watch.maxPrice)) return false;
  if (watch.q && !String(listing.title || "").toLowerCase().includes(String(watch.q).toLowerCase())) return false;
  return true;
}

export async function POST(req) {
  await ready();
  ensureAdmin();
  if (!rateLimit("admin:" + ip(req), 30)) return Response.json({ error: "محاولات كثيرة." }, { status: 429 });
  const user = currentUser(req);
  if (!user || user.role !== "admin") return Response.json({ error: "ممنوع" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const listingId = clean(body.listingId, 40);
  const action = body.action === "reject" ? "reject" : body.action === "approve" ? "approve" : "";
  if (!action) return Response.json({ error: "إجراء غير معروف." }, { status: 400 });
  const db = load();
  const listing = db.listings.find((l) => l.id === listingId);
  if (!listing) return Response.json({ error: "العرض غير موجود." }, { status: 404 });
  listing.status = action === "approve" ? "active" : "rejected";
  listing.reviewedAt = new Date().toISOString();
  db.audit = db.audit || [];
  db.audit.push({ at: listing.reviewedAt, action: "listing." + listing.status, userId: user.id, listingId: listing.id });
  if (action === "approve") {
    notify(db, listing.sellerId, "تمت الموافقة على عرضك: " + String(listing.title).slice(0, 80));
    const seen = new Set();
    for (const watch of db.watches || []) {
      if (!watchHit(listing, watch) || seen.has(watch.userId) || watch.userId === listing.sellerId) continue;
      seen.add(watch.userId);
      notify(db, watch.userId, "تنبيه مطابق: " + String(listing.title).slice(0, 80));
    }
  } else {
    notify(db, listing.sellerId, "تم رفض العرض. عدّل البيانات وأعد الإرسال.");
  }
  await save(db);
  return Response.json({ ok: true, listing: publicListing(listing) });
}
