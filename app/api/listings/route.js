const { load, save, id, publicListing, GAMES } = require("../../../lib/store");
const { currentUser, ensureAdmin, rateLimit, ip } = require("../../../lib/auth");
const { clean } = require("../../../lib/guard");
const { seal } = require("../../../lib/box");

const GAMES_IDS = GAMES.map((g) => g.id);

export async function GET(req) {
  ensureAdmin();
  const db = load();
  const url = new URL(req.url);
  const game = url.searchParams.get("game");
  const q = (url.searchParams.get("q") || "").toLowerCase().slice(0, 80);
  const sort = url.searchParams.get("sort") || "featured";
  const min = Number(url.searchParams.get("min") || 0);
  const max = Number(url.searchParams.get("max") || 0);
  const mine = url.searchParams.get("mine") === "1";
  const user = currentUser(req);
  let rows = db.listings.filter((l) => l.status === "active");
  if (mine && user) rows = db.listings.filter((l) => l.sellerId === user.id);
  if (game && GAMES_IDS.includes(game)) rows = rows.filter((l) => l.game === game);
  if (q) rows = rows.filter((l) => (l.title + " " + (l.description || "")).toLowerCase().includes(q));
  if (Number.isFinite(min) && min > 0) rows = rows.filter((l) => l.price >= min);
  if (Number.isFinite(max) && max > 0) rows = rows.filter((l) => l.price <= max);
  if (sort === "price_asc") rows.sort((a, b) => a.price - b.price);
  else if (sort === "price_desc") rows.sort((a, b) => b.price - a.price);
  else if (sort === "rating") rows.sort((a, b) => Number(b.rating) - Number(a.rating));
  else rows.sort((a, b) => Number(b.featured) - Number(a.featured) || String(b.createdAt).localeCompare(String(a.createdAt)));
  return Response.json({
    games: GAMES.map((g) => ({ ...g, count: db.listings.filter((l) => l.game === g.id && l.status === "active").length })),
    listings: rows.map(publicListing),
    preview: !process.env.DATABASE_URL
  });
}

export async function POST(req) {
  ensureAdmin();
  if (!rateLimit("sell:" + ip(req), 8)) return Response.json({ error: "بطّئ شوية، محاولات كثيرة." }, { status: 429 });
  const user = currentUser(req);
  if (!user || user.banned) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const title = clean(body.title, 80);
  const game = clean(body.game, 20);
  const delivery = body.delivery === "manual" ? "manual" : "instant";
  const price = Number(body.price);
  const description = clean(body.description, 400);
  const credentials = clean(body.credentials, 300);
  if (title.length < 4 || !GAMES_IDS.includes(game) || !Number.isFinite(price) || price < 50 || price > 500000 || credentials.length < 4) {
    return Response.json({ error: "راجع بيانات العرض: العنوان، اللعبة، السعر، وبيانات التسليم." }, { status: 400 });
  }
  const db = load();
  const open = db.listings.filter((l) => l.sellerId === user.id && l.status === "pending").length;
  if (open >= 5 && user.role !== "admin") return Response.json({ error: "عندك 5 عروض بانتظار المراجعة." }, { status: 429 });
  const listing = {
    id: id("l"), game, title, price, sellerId: user.id, sellerName: user.name, rating: user.rating || 5,
    delivery, featured: false, status: "pending", description, credentials: seal(credentials), createdAt: new Date().toISOString()
  };
  db.listings.unshift(listing);
  db.audit.push({ at: listing.createdAt, action: "listing.pending", userId: user.id, listingId: listing.id });
  if (db.audit.length > 400) db.audit = db.audit.slice(-400);
  save(db);
  return Response.json({ ok: true, listing: publicListing(listing), message: "العرض اتبعت للمراجعة ومش هيظهر قبل موافقة الإدارة." });
}
