const { load } = require("../../../../lib/store");
const { currentUser, ensureAdmin } = require("../../../../lib/auth");

export async function GET(req) {
  ensureAdmin();
  const user = currentUser(req);
  if (!user || user.role !== "admin") return Response.json({ error: "ممنوع" }, { status: 403 });
  const db = load();
  return Response.json({
    users: db.users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, banned: !!u.banned })),
    orders: db.orders.map(({ credentials, ...rest }) => rest),
    disputes: db.disputes || [],
    pending: db.listings.filter((l) => l.status === "pending").map(({ credentials, ...rest }) => rest),
    audit: (db.audit || []).slice(-40).reverse()
  });
}
