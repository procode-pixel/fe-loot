const { load, save } = require("../../../../lib/store");
const { currentUser, verifyPassword, clearCookie, rateLimit, ip } = require("../../../../lib/auth");

export async function POST(req) {
  if (!rateLimit("del:" + ip(req), 4)) return Response.json({ error: "محاولات كثيرة." }, { status: 429 });
  const user = currentUser(req);
  if (!user) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  if (user.role === "admin") return Response.json({ error: "حساب الإدارة لا يُحذف من هنا." }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  if (body.confirm !== "DELETE") return Response.json({ error: "اكتب DELETE للتأكيد." }, { status: 400 });
  if (!verifyPassword(String(body.password || ""), user.passwordHash)) {
    return Response.json({ error: "كلمة المرور غير صحيحة." }, { status: 401 });
  }
  const db = load();
  const fresh = db.users.find((u) => u.id === user.id);
  if (!fresh) return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
  const openOrder = (db.orders || []).some((o) => (o.buyerId === user.id || o.sellerId === user.id) && ["escrow_held", "disputed"].includes(o.status));
  if (openOrder) return Response.json({ error: "فيه صفقة مفتوحة. اقفلها قبل حذف الحساب." }, { status: 409 });
  fresh.banned = true;
  fresh.tokenVersion = (fresh.tokenVersion || 1) + 1;
  fresh.email = "deleted+" + fresh.id + "@feloot.invalid";
  fresh.name = "حساب محذوف";
  fresh.passwordHash = "";
  fresh.totpSecret = "";
  fresh.totpEnabled = false;
  fresh.balance = 0;
  for (const l of db.listings || []) {
    if (l.sellerId === user.id && l.status === "active") l.status = "removed";
  }
  db.audit = db.audit || [];
  db.audit.push({ at: new Date().toISOString(), action: "account.delete", userId: user.id });
  if (db.audit.length > 400) db.audit = db.audit.slice(-400);
  await save(db);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json", "set-cookie": clearCookie() }
  });
}
