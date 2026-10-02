const { load, save, ready, id, notify } = require("../../../lib/store");
const { currentUser, ensureAdmin, rateLimit, ip } = require("../../../lib/auth");
const { clean } = require("../../../lib/guard");

function publicTicket(t) {
  if (!t) return null;
  return {
    id: t.id,
    userId: t.userId,
    userName: t.userName,
    subject: t.subject,
    body: t.body,
    status: t.status,
    orderId: t.orderId || "",
    createdAt: t.createdAt,
    updatedAt: t.updatedAt
  };
}

export async function GET(req) {
  await ready();
  ensureAdmin();
  const user = currentUser(req);
  if (!user || user.banned) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const db = load();
  const rows = (db.tickets || []).filter((t) => user.role === "admin" || t.userId === user.id);
  return Response.json({ tickets: rows.map(publicTicket) });
}

export async function POST(req) {
  await ready();
  ensureAdmin();
  if (!rateLimit("support:" + ip(req), 8)) return Response.json({ error: "محاولات كثيرة. جرّب بعد شوية." }, { status: 429 });
  const user = currentUser(req);
  if (!user || user.banned) return Response.json({ error: "سجل الدخول أولاً." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const action = clean(body.action, 20);
  const db = load();
  db.tickets = db.tickets || [];

  if (action === "close") {
    const ticketId = clean(body.ticketId, 40);
    const ticket = db.tickets.find((t) => t.id === ticketId);
    if (!ticket) return Response.json({ error: "التذكرة غير موجودة." }, { status: 404 });
    if (user.role !== "admin" && ticket.userId !== user.id) return Response.json({ error: "ممنوع." }, { status: 403 });
    ticket.status = "closed";
    ticket.updatedAt = new Date().toISOString();
    db.audit = db.audit || [];
    db.audit.push({ at: ticket.updatedAt, action: "ticket.closed", userId: user.id, ticketId: ticket.id });
    await save(db);
    return Response.json({ ok: true, ticket: publicTicket(ticket) });
  }

  const subject = clean(body.subject, 80);
  const text = clean(body.body, 500);
  const orderId = clean(body.orderId, 40);
  if (subject.length < 4 || text.length < 8) {
    return Response.json({ error: "اكتب عنوان واضح ووصف المشكلة (8 حروف على الأقل)." }, { status: 400 });
  }
  const open = db.tickets.filter((t) => t.userId === user.id && t.status === "open").length;
  if (open >= 5 && user.role !== "admin") return Response.json({ error: "عندك 5 تذاكر مفتوحة. اقفل واحدة الأول." }, { status: 429 });
  const now = new Date().toISOString();
  const ticket = {
    id: id("t"),
    userId: user.id,
    userName: user.name,
    subject,
    body: text,
    orderId,
    status: "open",
    createdAt: now,
    updatedAt: now
  };
  db.tickets.unshift(ticket);
  db.tickets = db.tickets.slice(0, 300);
  db.audit = db.audit || [];
  db.audit.push({ at: now, action: "ticket.open", userId: user.id, ticketId: ticket.id });
  notify(db, "u_admin", "تذكرة دعم جديدة: " + subject);
  await save(db);
  return Response.json({ ok: true, ticket: publicTicket(ticket) });
}
