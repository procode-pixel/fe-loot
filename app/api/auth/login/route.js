const { load, save } = require("../../../../lib/store");
const { verifyPassword, sign, cookieHeader, ensureAdmin, rateLimit, ip, publicUser } = require("../../../../lib/auth");
const { clean } = require("../../../../lib/guard");

export async function POST(req) {
  ensureAdmin();
  const body = await req.json().catch(() => ({}));
  const email = clean(body.email, 120).toLowerCase();
  const password = String(body.password || "");
  if (!rateLimit("login:" + ip(req), 8) || !rateLimit("login-email:" + email, 6)) {
    return Response.json({ error: "تم إيقاف المحاولات مؤقتاً." }, { status: 429 });
  }
  const db = load();
  const user = db.users.find((u) => u.email === email);
  const lockedUntil = user?.lockedUntil ? Date.parse(user.lockedUntil) : 0;
  if (lockedUntil > Date.now()) {
    return Response.json({ error: "الحساب مقفول مؤقتاً بعد محاولات فاشلة." }, { status: 423 });
  }
  if (!user || user.banned || !verifyPassword(password, user.passwordHash)) {
    if (user) {
      user.failedLogins = (user.failedLogins || 0) + 1;
      if (user.failedLogins >= 8) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        user.failedLogins = 0;
      }
      save(db);
    }
    return Response.json({ error: "بيانات الدخول غير صحيحة." }, { status: 401 });
  }
  user.failedLogins = 0;
  user.lockedUntil = null;
  db.audit.push({ at: new Date().toISOString(), action: "login", userId: user.id });
  save(db);
  const token = sign({ uid: user.id, exp: Date.now() + 7 * 864e5 });
  return new Response(JSON.stringify({ ok: true, user: publicUser(user) }), {
    headers: { "content-type": "application/json", "set-cookie": cookieHeader(token) }
  });
}
