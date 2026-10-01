const { load, save } = require("../../../../lib/store");
const { verifyPassword, sign, cookieHeader, ensureAdmin, rateLimit, ip } = require("../../../../lib/auth");
const { clean } = require("../../../../lib/guard");

export async function POST(req) {
  ensureAdmin();
  if (!rateLimit("login:" + ip(req), 10)) return Response.json({ error: "تم إيقاف المحاولات مؤقتاً." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const email = clean(body.email, 120).toLowerCase();
  const password = String(body.password || "");
  const db = load();
  const user = db.users.find((u) => u.email === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return Response.json({ error: "بيانات الدخول غير صحيحة." }, { status: 401 });
  }
  db.audit.push({ at: new Date().toISOString(), action: "login", userId: user.id });
  save(db);
  const token = sign({ uid: user.id, exp: Date.now() + 7 * 864e5 });
  return new Response(JSON.stringify({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }), {
    headers: { "content-type": "application/json", "set-cookie": cookieHeader(token) }
  });
}
