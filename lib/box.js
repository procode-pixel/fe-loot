const crypto = require("crypto");

function key() {
  const raw = process.env.ENCRYPTION_KEY || process.env.AUTH_SECRET || "";
  if (raw.length < 16) return null;
  return crypto.createHash("sha256").update(raw).digest();
}

function seal(text) {
  const k = key();
  const value = String(text || "");
  if (!k || !value) return value;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", k, iv);
  const enc = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return "enc:v1:" + Buffer.concat([iv, tag, enc]).toString("base64url");
}

function open(stored) {
  const value = String(stored || "");
  if (!value.startsWith("enc:v1:")) return value;
  const k = key();
  if (!k) return "";
  try {
    const buf = Buffer.from(value.slice(7), "base64url");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", k, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}

module.exports = { seal, open, hasKey: () => Boolean(key()) };
