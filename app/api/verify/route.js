const { load, ready, mutate, id, notify } = require("../../../lib/store");
const { currentUser, ensureAdmin, rateLimit, ip } = require("../../../lib/auth");
const { clean } = require("../../../lib/guard");

export async function GET(req) {
  await ready();
  ensureAdmin();
  const user = currentUser(req);
  if (!user) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const db = load();
  const mine = (db.verifications || []).filter((v) => v.userId === user.id || user.role === "admin");
  return Response.json({
    requests: mine.map((v) => ({ id: v.id, userId: v.userId, status: v.status, note: v.note, at: v.at }))
  });
}

export async function POST(req) {
  await ready();
  ensureAdmin();
  if (!rateLimit("verify:" + ip(req), 5)) return Response.json({ error: "محاولات كثيرة." }, { status: 429 });
  const user = currentUser(req);
  if (!user || user.banned) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (body.website) return Response.json({ error: "طلب مرفوض." }, { status: 400 });
  const note = clean(body.note, 240);
  if (note.length < 8) return Response.json({ error: "اكتب سبب التوثيق باختصار." }, { status: 400 });
  const result = await mutate(async (db) => {
    db.verifications = db.verifications || [];
    const open = db.verifications.find((v) => v.userId === user.id && v.status === "pending");
    if (open) return { save: false, status: 409, body: { error: "عندك طلب توثيق قيد المراجعة." } };
    const item = { id: id("v"), userId: user.id, note, status: "pending", at: new Date().toISOString() };
    db.verifications.unshift(item);
    db.verifications = db.verifications.slice(0, 200);
    notify(db, user.id, "طلب التوثيق اتبعت للمراجعة.");
    db.audit.push({ at: item.at, action: "verify.request", userId: user.id });
    return { save: true, status: 200, body: { ok: true, request: { id: item.id, status: item.status } } };
  });
  return Response.json(result.body, { status: result.status });
}
