const { load, save, notify } = require("../../../../lib/store");
const { currentUser, rateLimit, ip } = require("../../../../lib/auth");
const { clean } = require("../../../../lib/guard");

export async function POST(req) {
  if (!rateLimit("profile:" + ip(req), 10)) {
    return Response.json({ error: "محاولات كثيرة." }, { status: 429 });
  }
  const user = currentUser(req);
  if (!user) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = clean(body.name, 32);
  if (name.length < 2) return Response.json({ error: "الاسم قصير." }, { status: 400 });
  const db = load();
  const row = db.users.find((u) => u.id === user.id);
  if (!row || row.banned) return Response.json({ error: "الحساب غير متاح." }, { status: 403 });
  row.name = name;
  db.listings.forEach((l) => {
    if (l.sellerId === row.id) l.sellerName = name;
  });
  notify(db, row.id, "تم تحديث اسم العرض.");
  await save(db);
  return Response.json({ ok: true, name });
}
