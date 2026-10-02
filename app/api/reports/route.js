const { load, save, id } = require("../../../lib/store");
const { currentUser, rateLimit, ip } = require("../../../lib/auth");
const { clean } = require("../../../lib/guard");

export async function POST(req) {
  if (!rateLimit("report:" + ip(req), 6)) return Response.json({ error: "\u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0643\u062b\u064a\u0631\u0629." }, { status: 429 });
  const user = currentUser(req);
  if (!user) return Response.json({ error: "\u0633\u062c\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0623\u0648\u0644\u0627\u064b." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const listingId = clean(body.listingId, 40);
  const reason = clean(body.reason, 280);
  if (reason.length < 8) return Response.json({ error: "\u0627\u0643\u062a\u0628 \u0633\u0628\u0628 \u0627\u0644\u0628\u0644\u0627\u063a \u0628\u0648\u0636\u0648\u062d." }, { status: 400 });
  const db = load();
  const listing = db.listings.find((l) => l.id === listingId);
  if (!listing) return Response.json({ error: "\u0627\u0644\u0639\u0631\u0636 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f." }, { status: 404 });
  db.reports = db.reports || [];
  const recent = db.reports.filter((r) => r.userId === user.id && r.listingId === listingId).length;
  if (recent >= 2) return Response.json({ error: "\u062a\u0645 \u0627\u0633\u062a\u0644\u0627\u0645 \u0628\u0644\u0627\u063a \u0633\u0627\u0628\u0642." }, { status: 429 });
  db.reports.push({
    id: id("r"),
    listingId,
    userId: user.id,
    reason,
    status: "open",
    createdAt: new Date().toISOString()
  });
  db.audit.push({ at: new Date().toISOString(), action: "report", userId: user.id, listingId });
  await save(db);
  return Response.json({ ok: true, message: "\u0627\u0644\u0628\u0644\u0627\u063a \u0648\u0635\u0644 \u0644\u0644\u0625\u062f\u0627\u0631\u0629." });
}
