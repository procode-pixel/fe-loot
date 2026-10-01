const { load, save, id, publicListing, GAMES } = require("../../../lib/store");
const { currentUser, ensureAdmin, rateLimit, ip } = require("../../../lib/auth");
const { clean } = require("../../../lib/guard");

export async function GET(req) {
  ensureAdmin();
  const db = load();
  const url = new URL(req.url);
  const game = url.searchParams.get("game");
  const q = (url.searchParams.get("q") || "").toLowerCase();
  let rows = db.listings.filter((l) => l.status === "active");
  if (game) rows = rows.filter((l) => l.game === game);
  if (q) rows = rows.filter((l) => l.title.toLowerCase().includes(q));
  return Response.json({ games: GAMES, listings: rows.map(publicListing) });
}

export async function POST(req) {
  ensureAdmin();
  if (!rateLimit("sell:" + ip(req), 12)) return Response.json({ error: "بطء شوية، محاولات كثيرة." }, { status: 429 });
  const user = currentUser(req);
  if (!user) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const title = clean(body.title, 80);
  const game = clean(body.game, 20);
  const delivery = body.delivery === "manual" ? "manual" : "instant";
  const price = Number(body.price);
  const description = clean(body.description, 400);
  const credentials = clean(body.credentials, 300);
  if (title.length < 4 || !["pubg","freefire","valorant","fortnite","codm","eafc"].includes(game) || !Number.isFinite(price) || price < 50 || price > 500000 || credentials.length < 4) {
    return Response.json({ error: "راجع بيانات العرض: العنوان، اللعبة، السعر، وبيانات التسليم." }, { status: 400 });
  }
  const db = load();
  const listing = { id: id("l"), game, title, price, sellerId: user.id, sellerName: user.name, rating: user.rating || 5, delivery, featured: false, status: "active", description, credentials, createdAt: new Date().toISOString() };
  db.listings.unshift(listing);
  db.audit.push({ at: listing.createdAt, action: "listing.create", userId: user.id, listingId: listing.id });
  save(db);
  return Response.json({ ok: true, listing: publicListing(listing) });
}
