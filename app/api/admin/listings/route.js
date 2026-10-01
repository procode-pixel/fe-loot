const { load, save, publicListing } = require("../../../../lib/store");
const { currentUser, ensureAdmin, rateLimit, ip } = require("../../../../lib/auth");
const { clean } = require("../../../../lib/guard");

export async function POST(req) {
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
  db.audit.push({ at: listing.reviewedAt, action: "listing." + listing.status, userId: user.id, listingId: listing.id });
  save(db);
  return Response.json({ ok: true, listing: publicListing(listing) });
}
