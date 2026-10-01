const { currentUser, ensureAdmin } = require("../../../../lib/auth");
export async function GET(req) {
  ensureAdmin();
  const user = currentUser(req);
  if (!user) return Response.json({ user: null });
  return Response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
