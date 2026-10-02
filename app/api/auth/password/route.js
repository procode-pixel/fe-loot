const { currentUser, verifyPassword, scryptHash, rateLimit, ip, publicUser, clearCookie } = require("../../../../lib/auth");
const { load, save } = require("../../../../lib/store");
const { strongPassword } = require("../../../../lib/guard");

export async function POST(req) {
  if (!rateLimit("pw:" + ip(req), 5)) return Response.json({ error: "\u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0643\u062b\u064a\u0631\u0629." }, { status: 429 });
  const user = currentUser(req);
  if (!user) return Response.json({ error: "\u063a\u064a\u0631 \u0645\u0635\u0631\u062d" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const current = String(body.current || "");
  const next = String(body.next || "");
  if (!verifyPassword(current, user.passwordHash) || !strongPassword(next) || current === next) {
    return Response.json({ error: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062d\u0627\u0644\u064a\u0629 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629 \u0623\u0648 \u0627\u0644\u062c\u062f\u064a\u062f\u0629 \u0623\u0636\u0639\u0641 \u0645\u0646 10 \u0623\u062d\u0631\u0641 \u0648\u0641\u064a\u0647\u0627 \u062d\u0631\u0641 \u0648\u0631\u0642\u0645." }, { status: 400 });
  }
  const db = load();
  const row = db.users.find((u) => u.id === user.id);
  row.passwordHash = scryptHash(next);
  row.tokenVersion = (row.tokenVersion || 1) + 1;
  db.audit.push({ at: new Date().toISOString(), action: "password.change", userId: user.id });
  await save(db);
  return new Response(JSON.stringify({ ok: true, user: publicUser(row) }), {
    headers: { "content-type": "application/json", "set-cookie": clearCookie() }
  });
}
