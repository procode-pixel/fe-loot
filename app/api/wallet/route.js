const { ready, mutate } = require("../../../lib/store");
const { currentUser, ensureAdmin, rateLimit, ip } = require("../../../lib/auth");

export async function GET(req) {
  await ready();
  ensureAdmin();
  const user = currentUser(req);
  if (!user) return Response.json({ error: "سجل الدخول لعرض المحفظة." }, { status: 401 });
  const result = await mutate(async (db) => {
    const fresh = db.users.find((u) => u.id === user.id);
    const orders = db.orders.filter((o) => o.buyerId === user.id || o.sellerId === user.id);
    const held = orders.filter((o) => o.buyerId === user.id && (o.status === "escrow_held" || o.status === "disputed")).reduce((s, o) => s + Number(o.price || 0), 0);
    return { save: false, body: { balance: Number(fresh?.balance || 0), held, demo: true, note: "رصيد تجريبي داخل الموقع. ليس تحويلاً بنكياً." } };
  });
  return Response.json(result.body);
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
  const result = await mutate(async (db) => {
    const fresh = db.users.find((u) => u.id === user.id);
    if (!fresh || fresh.banned) return { save: false, status: 401, body: { error: "غير مصرح" } };
    const day = new Date().toISOString().slice(0, 10);
    const topped = (db.audit || []).filter((a) => a.action === "wallet.topup" && a.userId === user.id && String(a.at).startsWith(day)).reduce((s, a) => s + Number(a.amount || 0), 0);
    if (topped + amount > 50000 && fresh.role !== "admin") {
      return { save: false, status: 429, body: { error: "وصلت حد الشحن التجريبي اليومي." } };
    }
    fresh.balance = Number(fresh.balance || 0) + amount;
    db.audit.push({ at: new Date().toISOString(), action: "wallet.topup", userId: user.id, amount });
    if (db.audit.length > 400) db.audit = db.audit.slice(-400);
    return { save: true, status: 200, body: { ok: true, balance: fresh.balance, demo: true } };
  });
  return Response.json(result.body, { status: result.status || 200 });
}
