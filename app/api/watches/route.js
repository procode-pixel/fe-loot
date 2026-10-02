const { load, save, id, GAMES, publicListing } = require("../../../lib/store");
const { currentUser, rateLimit, ip } = require("../../../lib/auth");
const { clean } = require("../../../lib/guard");

function mine(db, user) {
  return (db.watches || []).filter((w) => w.userId === user.id);
}

function matches(listing, watch) {
  if (listing.status !== "active") return false;
  if (watch.game && listing.game !== watch.game) return false;
  if (watch.maxPrice && Number(listing.price) > Number(watch.maxPrice)) return false;
  if (watch.q && !String(listing.title || "").toLowerCase().includes(watch.q.toLowerCase())) return false;
  return true;
}

export async function GET(req) {
  const user = currentUser(req);
  if (!user) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const db = load();
  const watches = mine(db, user).map((w) => ({
    ...w,
    hits: (db.listings || []).filter((l) => matches(l, w)).slice(0, 8).map(publicListing)
  }));
  return Response.json({ watches, games: GAMES });
}

export async function POST(req) {
  const user = currentUser(req);
  if (!user) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  if (!rateLimit("watch:" + ip(req), 20)) return Response.json({ error: "محاولات كثيرة." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const game = clean(body.game, 20);
  const q = clean(body.q, 60);
  const maxPrice = Math.round(Number(body.maxPrice) || 0);
  if (game && !GAMES.some((g) => g.id === game)) return Response.json({ error: "اللعبة غير معروفة." }, { status: 400 });
  if (!game && !q && !maxPrice) return Response.json({ error: "حدد لعبة أو كلمة أو سقف سعر." }, { status: 400 });
  if (maxPrice < 0 || maxPrice > 1_000_000) return Response.json({ error: "السعر غير صالح." }, { status: 400 });
  const db = load();
  db.watches = db.watches || [];
  const own = mine(db, user);
  if (own.length >= 12 && user.role !== "admin") return Response.json({ error: "الحد 12 تنبيه." }, { status: 429 });
  const watch = { id: id("w"), userId: user.id, game, q, maxPrice, createdAt: new Date().toISOString() };
  db.watches.unshift(watch);
  db.audit = db.audit || [];
  db.audit.push({ at: watch.createdAt, action: "watch.create", userId: user.id, watchId: watch.id });
  await save(db);
  return Response.json({ ok: true, watch });
}

export async function DELETE(req) {
  const user = currentUser(req);
  if (!user) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const watchId = clean(body.id, 40);
  const db = load();
  const before = (db.watches || []).length;
  db.watches = (db.watches || []).filter((w) => !(w.id === watchId && (w.userId === user.id || user.role === "admin")));
  if (db.watches.length === before) return Response.json({ error: "التنبيه غير موجود." }, { status: 404 });
  await save(db);
  return Response.json({ ok: true });
}
