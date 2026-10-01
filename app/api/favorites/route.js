const { load, save, publicListing } = require("../../../lib/store");
const { currentUser, rateLimit, ip } = require("../../../lib/auth");
const { clean } = require("../../../lib/guard");

export async function GET(req) {
  const user = currentUser(req);
  if (!user) return Response.json({ error: "\u0633\u062c\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0623\u0648\u0644\u0627\u064b." }, { status: 401 });
  const db = load();
  const ids = user.favorites || [];
  const listings = db.listings.filter((l) => ids.includes(l.id) && l.status === "active").map(publicListing);
  return Response.json({ favorites: listings });
}

export async function POST(req) {
  if (!rateLimit("fav:" + ip(req), 30)) return Response.json({ error: "\u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0643\u062b\u064a\u0631\u0629." }, { status: 429 });
  const user = currentUser(req);
  if (!user) return Response.json({ error: "\u0633\u062c\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0623\u0648\u0644\u0627\u064b." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const listingId = clean(body.listingId, 40);
  const db = load();
  const row = db.users.find((u) => u.id === user.id);
  const listing = db.listings.find((l) => l.id === listingId && l.status === "active");
  if (!row || !listing) return Response.json({ error: "\u0627\u0644\u0639\u0631\u0636 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f." }, { status: 404 });
  row.favorites = row.favorites || [];
  if (row.favorites.includes(listingId)) row.favorites = row.favorites.filter((id) => id !== listingId);
  else {
    if (row.favorites.length >= 40) return Response.json({ error: "\u0648\u0635\u0644\u062a \u0644\u0644\u062d\u062f \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u0644\u0645\u0641\u0636\u0644\u0629." }, { status: 429 });
    row.favorites.push(listingId);
  }
  save(db);
  return Response.json({ ok: true, favorites: row.favorites });
}
