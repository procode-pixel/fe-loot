const { load, save } = require("../../../../lib/store");
const { verifyPassword, sign, cookieHeader, ensureAdmin, rateLimit, ip, publicUser } = require("../../../../lib/auth");
const { open } = require("../../../../lib/box");
const { verifyTotp } = require("../../../../lib/totp");
const { clean } = require("../../../../lib/guard");

export async function POST(req) {
  ensureAdmin();
  const body = await req.json().catch(() => ({}));
  const email = clean(body.email, 120).toLowerCase();
  const password = String(body.password || "");
  if (!rateLimit("login:" + ip(req), 8) || !rateLimit("login-email:" + email, 6)) {
    return Response.json({ error: "\u062a\u0645 \u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0645\u0624\u0642\u062a\u0627\u064b." }, { status: 429 });
  }
  const db = load();
  const user = db.users.find((u) => u.email === email);
  const lockedUntil = user?.lockedUntil ? Date.parse(user.lockedUntil) : 0;
  if (lockedUntil > Date.now()) {
    return Response.json({ error: "\u0627\u0644\u062d\u0633\u0627\u0628 \u0645\u0642\u0641\u0648\u0644 \u0645\u0624\u0642\u062a\u0627\u064b \u0628\u0639\u062f \u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0641\u0627\u0634\u0644\u0629." }, { status: 423 });
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
    return Response.json({ error: "\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062f\u062e\u0648\u0644 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629." }, { status: 401 });
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
