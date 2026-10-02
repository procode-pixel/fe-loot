const { load, save } = require("../../../../lib/store");
const { currentUser, sign, cookieHeader, rateLimit, ip } = require("../../../../lib/auth");

export async function POST(req) {
  if (!rateLimit("sess:" + ip(req), 8)) return Response.json({ error: "محاولات كثيرة." }, { status: 429 });
  const user = currentUser(req);
  if (!user) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const db = load();
  const fresh = db.users.find((u) => u.id === user.id);
  if (!fresh) return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
  fresh.tokenVersion = (fresh.tokenVersion || 1) + 1;
  db.audit = db.audit || [];
  db.audit.push({ at: new Date().toISOString(), action: "sessions.revoke", userId: user.id });
  await save(db);
  const token = sign({ uid: fresh.id, tv: fresh.tokenVersion, exp: Date.now() + 7 * 864e5 });
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json", "set-cookie": cookieHeader(token) }
  });
}
