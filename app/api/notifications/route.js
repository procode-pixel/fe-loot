const { currentUser } = require("../../../lib/auth");
const { load, save, ready } = require("../../../lib/store");

export async function GET(req) {
  await ready();
  const user = currentUser(req);
  if (!user) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const db = load();
  const items = (db.notifications || []).filter((n) => n.userId === user.id).slice(0, 40);
  return Response.json({ items, unread: items.filter((n) => !n.read).length });
}

export async function POST(req) {
  await ready();
  const user = currentUser(req);
  if (!user) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const db = load();
  db.notifications = (db.notifications || []).map((n) => n.userId === user.id ? { ...n, read: true } : n);
  await save(db);
  return Response.json({ ok: true });
}
