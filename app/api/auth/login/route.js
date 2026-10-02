const { load, save, ready } = require("../../../../lib/store");
const { verifyPassword, sign, cookieHeader, ensureAdmin, rateLimit, ip, publicUser } = require("../../../../lib/auth");
const { open } = require("../../../../lib/box");
const { verifyTotp } = require("../../../../lib/totp");
const { clean } = require("../../../../lib/guard");

export async function POST(req) {
  await ready();
  ensureAdmin();
  const body = await req.json().catch(() => ({}));
  if (body.website) return Response.json({ error: "طلب مرفوض." }, { status: 400 });
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
      await save(db);
    }
    return Response.json({ error: "بيانات الدخول غير صحيحة." }, { status: 401 });
  }
  if (user.totpEnabled) {
    const secret = open(user.totpSecret || "");
    if (!verifyTotp(secret, body.code)) {
      return Response.json({ error: "كود التحقق الثنائي مطلوب أو غير صحيح.", need2fa: true }, { status: 401 });
    }
  }
  user.failedLogins = 0;
  user.lockedUntil = null;
  user.tokenVersion = user.tokenVersion || 1;
  db.audit.push({ at: new Date().toISOString(), action: "login", userId: user.id });
  await save(db);
  const token = sign({ uid: user.id, tv: user.tokenVersion, exp: Date.now() + 7 * 864e5 });
  return new Response(JSON.stringify({ ok: true, user: publicUser(user) }), {
    headers: { "content-type": "application/json", "set-cookie": cookieHeader(token) }
  });
}
