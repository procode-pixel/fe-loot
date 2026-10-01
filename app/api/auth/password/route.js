const { currentUser, verifyPassword, scryptHash, rateLimit, ip, publicUser } = require("../../../../lib/auth");
const { load, save } = require("../../../../lib/store");
const { strongPassword } = require("../../../../lib/guard");

export async function POST(req) {
  if (!rateLimit("pw:" + ip(req), 5)) return Response.json({ error: "محاولات كثيرة." }, { status: 429 });
  const user = currentUser(req);
  if (!user) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const current = String(body.current || "");
  const next = String(body.next || "");
  if (!verifyPassword(current, user.passwordHash) || !strongPassword(next) || current === next) {
    return Response.json({ error: "كلمة المرور الحالية غير صحيحة أو الجديدة أضعف من 10 أحرف وفيها حرف ورقم." }, { status: 400 });
  }
  const db = load();
  const row = db.users.find((u) => u.id === user.id);
  row.passwordHash = scryptHash(next);
  db.audit.push({ at: new Date().toISOString(), action: "password.change", userId: user.id });
  save(db);
  return Response.json({ ok: true, user: publicUser(row) });
}
