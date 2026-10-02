const { load, save, ready } = require("../../../lib/store");
const { currentUser, ensureAdmin, rateLimit, ip } = require("../../../lib/auth");

export async function GET(req) {
  await ready();
  ensureAdmin();
  const user = currentUser(req);
  if (!user) return Response.json({ error: "سجل الدخول لعرض المحفظة." }, { status: 401 });
  const db = load();
  const fresh = db.users.find((u) => u.id === user.id);
  const orders = db.orders.filter((o) => o.buyerId === user.id || o.sellerId === user.id);
  const held = orders.filter((o) => o.buyerId === user.id && (o.status === "escrow_held" || o.status === "disputed")).reduce((s, o) => s + Number(o.price || 0), 0);
  return Response.json({
    balance: Number(fresh?.balance || 0),
    held,
    demo: true,
    note: "رصيد تجريبي داخل الموقع. ليس تحويلاً بنكياً."
  });
}

export async function POST(req) {
  await ready();
  ensureAdmin();
  if (!rateLimit("wallet:" + ip(req), 6)) return Response.json({ error: "محاولات كثيرة." }, { status: 429 });
  const user = currentUser(req);
  if (!user || user.banned) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < 50 || amount > 20000) {
    return Response.json({ error: "الشحن التجريبي بين 50 و 20000 جنيه." }, { status: 400 });
  }
  const db = load();
  const fresh = db.users.find((u) => u.id === user.id);
  if (!fresh) return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
  const day = new Date().toISOString().slice(0, 10);
  const topped = (db.audit || []).filter((a) => a.action === "wallet.topup" && a.userId === user.id && String(a.at).startsWith(day)).reduce((s, a) => s + Number(a.amount || 0), 0);
  if (topped + amount > 50000 && user.role !== "admin") {
    return Response.json({ error: "وصلت حد الشحن التجريبي اليومي." }, { status: 429 });
  }
  fresh.balance = Number(fresh.balance || 0) + amount;
  db.audit.push({ at: new Date().toISOString(), action: "wallet.topup", userId: user.id, amount });
  if (db.audit.length > 400) db.audit = db.audit.slice(-400);
  await save(db);
  return Response.json({ ok: true, balance: fresh.balance, demo: true });
}
