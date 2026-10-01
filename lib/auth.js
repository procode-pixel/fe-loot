const crypto = require("crypto");
const { load, save } = require("./store");

function secret() {
  return process.env.AUTH_SECRET || "";
}

function scryptHash(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  try {
    if (!stored || !password) return false;
    const [salt, hash] = String(stored).split(":");
    if (!salt || !hash || hash.length !== 64) return false;
    const next = crypto.scryptSync(password, salt, 32).toString("hex");
    const a = Buffer.from(hash, "hex");
    const b = Buffer.from(next, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function sign(payload) {
  const key = secret();
  if (process.env.NODE_ENV === "production" && key.length < 24) {
    throw new Error("AUTH_SECRET missing");
  }
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", key || "dev-only-change-me-feloot-secret").update(body).digest("base64url");
  return `${body}.${sig}`;
}

function readSession(token) {
  try {
    if (!token || !token.includes(".")) return null;
    const key = secret();
    if (process.env.NODE_ENV === "production" && key.length < 24) return null;
    const [body, sig] = token.split(".");
    const expected = crypto.createHmac("sha256", key || "dev-only-change-me-feloot-secret").update(body).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

function cookieHeader(token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `feloot_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800${secure}`;
}

function clearCookie() {
  return "feloot_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0";
}

function parseCookie(req) {
  const raw = req.headers.get?.("cookie") || req.headers.cookie || "";
  const hit = raw.split(";").map((p) => p.trim()).find((p) => p.startsWith("feloot_session="));
  return hit ? hit.slice("feloot_session=".length) : "";
}

function currentUser(req) {
  const session = readSession(parseCookie(req));
  if (!session) return null;
  const db = load();
  const user = db.users.find((u) => u.id === session.uid) || null;
  if (!user || user.banned) return null;
  if ((user.tokenVersion || 1) !== (session.tv || 1)) return null;
  return user;
}

function ensureAdmin() {
  const db = load();
  const admin = db.users.find((u) => u.email === "admin@feloot.app");
  if (admin && !admin.passwordHash && process.env.ADMIN_PASSWORD && String(process.env.ADMIN_PASSWORD).length >= 10) {
    admin.passwordHash = scryptHash(process.env.ADMIN_PASSWORD);
    admin.tokenVersion = admin.tokenVersion || 1;
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
  if (hits.size > 5000) hits.clear();
  return true;
}

function ip(req) {
  const headers = req.headers;
  const raw = headers.get?.("x-forwarded-for") || headers["x-forwarded-for"] || "local";
  return String(raw).split(",")[0].trim().slice(0, 64);
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    rating: user.rating || 5,
    favorites: user.favorites || []
  };
}

module.exports = {
  scryptHash,
  verifyPassword,
  sign,
  readSession,
  cookieHeader,
  clearCookie,
  currentUser,
  ensureAdmin,
  rateLimit,
  ip,
  publicUser
};
