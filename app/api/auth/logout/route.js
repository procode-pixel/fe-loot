const { clearCookie } = require("../../../../lib/auth");
export async function POST() {
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", "set-cookie": clearCookie() } });
}
