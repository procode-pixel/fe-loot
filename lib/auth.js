const crypto = require("crypto");
const { load, save } = require("./store");

const SECRET = process.env.AUTH_SECRET || "dev-only-change-me-feloot-secret";

function scryptHash(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  const next = crypto.scryptSync(password, salt, 32).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(next, "hex"));
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function readSession(token) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const data = JSON.parse(Buffer.from(body, "base64url").toString());
  if (data.exp < Date.now()) return null;
  return data;
}

function cookieHeader(token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `feloot_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800${secure}`;
}

function clearCookie() {
  return "feloot_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0";
}

function parseCookie(req) {
  const raw = req.headers.cookie || "";
  const hit = raw.split(";").map((p) => p.trim()).find((p) => p.startsWith("feloot_session="));
  return hit ? hit.slice("feloot_session=".length) : "";
}

function currentUser(req) {
  const session = readSession(parseCookie(req));
  if (!session) return null;
  const db = load();
  return db.users.find((u) => u.id === session.uid) || null;
}

function ensureAdmin() {
  const db = load();
  const admin = db.users.find((u) => u.email === "admin@feloot.app");
  if (admin && !admin.passwordHash) {
    admin.passwordHash = scryptHash(process.env.ADMIN_PASSWORD || "Admin#FeLoot2026");
    save(db);
  }
  return db;
}

const hits = new Map();
function rateLimit(key, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const row = hits.get(key) || [];
  const fresh = row.filter((t) => now - t < windowMs);
  if (fresh.length >= limit) return false;
  fresh.push(now);
  hits.set(key, fresh);
  return true;
}

function ip(req) {
  return (req.headers["x-forwarded-for"] || "local").toString().split(",")[0].trim();
}

module.exports = { scryptHash, verifyPassword, sign, readSession, cookieHeader, clearCookie, currentUser, ensureAdmin, rateLimit, ip };
