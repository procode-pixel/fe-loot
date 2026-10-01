const { clearCookie } = require("../../../../lib/auth");
const { ready } = require("../../../../lib/store");
export async function POST() {
  await ready();
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", "set-cookie": clearCookie() } });
}
