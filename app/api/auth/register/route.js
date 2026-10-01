const { load, save, id } = require("../../../../lib/store");
const { scryptHash, sign, cookieHeader, ensureAdmin, rateLimit, ip } = require("../../../../lib/auth");
const { clean, isEmail } = require("../../../../lib/guard");

export async function POST(req) {
  ensureAdmin();
  if (!rateLimit("reg:" + ip(req), 8)) return Response.json({ error: "محاولات كثيرة. حاول بعد دقيقة." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const name = clean(body.name, 40);
  const email = clean(body.email, 120).toLowerCase();
  const password = String(body.password || "");
  if (name.length < 2 || !isEmail(email) || password.length < 8) {
    return Response.json({ error: "الاسم والإيميل وكلمة مرور 8 أحرف على الأقل مطلوبة." }, { status: 400 });
  }
  const db = load();
  if (db.users.some((u) => u.email === email)) return Response.json({ error: "الإيميل مسجل بالفعل." }, { status: 409 });
  const user = { id: id("u"), name, email, passwordHash: scryptHash(password), role: "user", rating: 5, createdAt: new Date().toISOString() };
  db.users.push(user);
  db.audit.push({ at: user.createdAt, action: "register", userId: user.id });
  save(db);
  const token = sign({ uid: user.id, exp: Date.now() + 7 * 864e5 });
  return new Response(JSON.stringify({ ok: true, user: { id: user.id, name, email, role: user.role } }), {
    headers: { "content-type": "application/json", "set-cookie": cookieHeader(token) }
  });
}
