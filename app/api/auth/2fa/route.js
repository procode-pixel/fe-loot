const { load, save } = require("../../../../../lib/store");
const { currentUser, verifyPassword, ensureAdmin } = require("../../../../../lib/auth");
const { seal, open } = require("../../../../../lib/box");
const { generateSecret, verifyTotp, otpauthUrl } = require("../../../../../lib/totp");

export async function POST(req) {
  ensureAdmin();
  const user = currentUser(req);
  if (!user) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const db = load();
  const row = db.users.find((u) => u.id === user.id);
  if (!row) return Response.json({ error: "غير موجود" }, { status: 404 });
  if (body.action === "start") {
    const secret = generateSecret();
    row.totpPending = seal(secret);
    await save(db);
    return Response.json({ ok: true, secret, url: otpauthUrl(row.email, secret) });
  }
  if (body.action === "confirm") {
    const secret = open(row.totpPending || "");
    if (!secret || !verifyTotp(secret, body.code)) return Response.json({ error: "الكود غير صحيح." }, { status: 400 });
    row.totpSecret = row.totpPending;
    row.totpPending = "";
    row.totpEnabled = true;
    row.tokenVersion = (row.tokenVersion || 1) + 1;
    db.audit.push({ at: new Date().toISOString(), action: "2fa.enable", userId: row.id });
    await save(db);
    return Response.json({ ok: true, enabled: true });
  }
  if (body.action === "disable") {
    if (!verifyPassword(String(body.password || ""), row.passwordHash)) return Response.json({ error: "كلمة المرور غير صحيحة." }, { status: 401 });
    const secret = open(row.totpSecret || "");
    if (row.totpEnabled && !verifyTotp(secret, body.code)) return Response.json({ error: "كود التحقق غير صحيح." }, { status: 400 });
    row.totpEnabled = false;
    row.totpSecret = "";
    row.totpPending = "";
    row.tokenVersion = (row.tokenVersion || 1) + 1;
    db.audit.push({ at: new Date().toISOString(), action: "2fa.disable", userId: row.id });
    await save(db);
    return Response.json({ ok: true, enabled: false });
  }
  return Response.json({ error: "إجراء غير معروف." }, { status: 400 });
}
