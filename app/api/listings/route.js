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
  const mine = url.searchParams.get("mine") === "1";
  const user = currentUser(req);
  let rows = db.listings.filter((l) => l.status === "active");
  if (mine && user) rows = db.listings.filter((l) => l.sellerId === user.id);
  if (game && GAMES_IDS.includes(game)) rows = rows.filter((l) => l.game === game);
  if (q) rows = rows.filter((l) => (l.title + " " + (l.description || "")).toLowerCase().includes(q));
  rows.sort((a, b) => Number(b.featured) - Number(a.featured) || String(b.createdAt).localeCompare(String(a.createdAt)));
  return Response.json({
    games: GAMES.map((g) => ({ ...g, count: db.listings.filter((l) => l.game === g.id && l.status === "active").length })),
    listings: rows.map(publicListing),
    preview: !process.env.DATABASE_URL
  });
}

export async function POST(req) {
  ensureAdmin();
  if (!rateLimit("sell:" + ip(req), 8)) return Response.json({ error: "\u0628\u0637\u0621 \u0634\u0648\u064a\u0629\u060c \u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0643\u062b\u064a\u0631\u0629." }, { status: 429 });
  const user = currentUser(req);
  if (!user || user.banned) return Response.json({ error: "\u0633\u062c\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0623\u0648\u0644\u0627\u064b." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const title = clean(body.title, 80);
  const game = clean(body.game, 20);
  const delivery = body.delivery === "manual" ? "manual" : "instant";
  const price = Number(body.price);
  const description = clean(body.description, 400);
  const credentials = clean(body.credentials, 300);
  if (title.length < 4 || !GAMES_IDS.includes(game) || !Number.isFinite(price) || price < 50 || price > 500000 || credentials.length < 4) {
    return Response.json({ error: "\u0631\u0627\u062c\u0639 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0639\u0631\u0636: \u0627\u0644\u0639\u0646\u0648\u0627\u0646\u060c \u0627\u0644\u0644\u0639\u0628\u0629\u060c \u0627\u0644\u0633\u0639\u0631\u060c \u0648\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u0633\u0644\u064a\u0645." }, { status: 400 });
  }
  const db = load();
  const open = db.listings.filter((l) => l.sellerId === user.id && l.status === "pending").length;
  if (open >= 5 && user.role !== "admin") return Response.json({ error: "\u0639\u0646\u062f\u0643 5 \u0639\u0631\u0648\u0636 \u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629." }, { status: 429 });
  const listing = {
    id: id("l"), game, title, price, sellerId: user.id, sellerName: user.name, rating: user.rating || 5,
    delivery, featured: false, status: "pending", description, credentials: seal(credentials), createdAt: new Date().toISOString()
  };
  db.listings.unshift(listing);
  db.audit.push({ at: listing.createdAt, action: "listing.pending", userId: user.id, listingId: listing.id });
  if (db.audit.length > 400) db.audit = db.audit.slice(-400);
  save(db);
  return Response.json({ ok: true, listing: publicListing(listing), message: "\u0627\u0644\u0639\u0631\u0636 \u0627\u062a\u0628\u0639\u062a \u0644\u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u0648\u0645\u0634 \u0647\u064a\u0638\u0647\u0631 \u0642\u0628\u0644 \u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629." });
}
