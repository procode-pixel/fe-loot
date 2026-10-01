const { NextResponse } = require("next/server");
const { currentUser } = require("../../../lib/auth");
const { load, save } = require("../../../lib/store");

function GET(req) {
  const user = currentUser(req);
  if (!user) return NextResponse.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const db = load();
  const items = (db.notifications || []).filter((n) => n.userId === user.id).slice(0, 40);
  return NextResponse.json({ items, unread: items.filter((n) => !n.read).length });
}

function POST(req) {
  const user = currentUser(req);
  if (!user) return NextResponse.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const db = load();
  db.notifications = (db.notifications || []).map((n) => n.userId === user.id ? { ...n, read: true } : n);
  save(db);
  return NextResponse.json({ ok: true });
}

module.exports = { GET, POST };
