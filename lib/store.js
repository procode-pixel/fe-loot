const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { seal } = require("./box");

const FILE = process.env.DATA_FILE || (process.env.VERCEL
  ? path.join("/tmp", "feloot-store.json")
  : path.join(process.cwd(), "data", "store.json"));

const GAMES = [
  { id: "pubg", name: "PUBG Mobile", emoji: "\ud83c\udfaf" },
  { id: "freefire", name: "Free Fire", emoji: "\ud83d\udd25" },
  { id: "valorant", name: "Valorant", emoji: "\u2694\ufe0f" },
  { id: "fortnite", name: "Fortnite", emoji: "\ud83c\udfd7\ufe0f" },
  { id: "codm", name: "Call of Duty Mobile", emoji: "\ud83d\udca5" },
  { id: "eafc", name: "EA FC Mobile", emoji: "\u26bd" }
];

function seed() {
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: "u_admin",
        name: "FeLoot Admin",
        email: "admin@feloot.app",
        passwordHash: "",
        role: "admin",
        rating: 5,
        favorites: [],
        tokenVersion: 1,
        createdAt: now
      }
    ],
    listings: [
      { id: "l1", game: "pubg", title: "PUBG Level 70 \u2022 Conqueror \u2022 M416 Glacier", price: 3500, sellerId: "u_admin", sellerName: "ProGamerEG", rating: 4.9, delivery: "instant", featured: true, status: "active", description: "\u0639\u0631\u0636 \u0645\u0639\u0627\u064a\u0646\u0629. \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062f\u062e\u0648\u0644 \u0645\u0634 \u0645\u062a\u0627\u062d\u0629 \u0641\u064a \u0627\u0644\u0648\u0627\u062c\u0647\u0629.", credentials: seal("demo-only"), createdAt: now },
      { id: "l2", game: "valorant", title: "Valorant Radiant \u2022 Full Collection \u2022 42 Skins", price: 8200, sellerId: "u_admin", sellerName: "EliteSkins", rating: 5, delivery: "manual", featured: true, status: "active", description: "\u0639\u0631\u0636 \u0645\u0639\u0627\u064a\u0646\u0629 \u0644\u0644\u062a\u0633\u0644\u064a\u0645 \u0627\u0644\u064a\u062f\u0648\u064a.", credentials: seal("demo-only"), createdAt: now },
      { id: "l3", game: "fortnite", title: "Fortnite \u2022 OG Skins \u2022 Battle Pass", price: 2600, sellerId: "u_admin", sellerName: "BuildPro", rating: 4.6, delivery: "instant", featured: true, status: "active", description: "\u0639\u0631\u0636 \u0645\u0639\u0627\u064a\u0646\u0629.", credentials: seal("demo-only"), createdAt: now },
      { id: "l4", game: "freefire", title: "Free Fire \u2022 Grandmaster \u2022 \u062d\u0633\u0627\u0628 \u0646\u0627\u062f\u0631", price: 1800, sellerId: "u_admin", sellerName: "FireKing", rating: 4.8, delivery: "instant", featured: false, status: "active", description: "\u0639\u0631\u0636 \u0645\u0639\u0627\u064a\u0646\u0629.", credentials: seal("demo-only"), createdAt: now },
      { id: "l5", game: "codm", title: "COD Mobile \u2022 Legendary \u2022 \u0633\u0643\u0646\u0627\u062a \u0643\u0627\u0645\u0644\u0629", price: 4200, sellerId: "u_admin", sellerName: "CodVault", rating: 4.7, delivery: "manual", featured: false, status: "active", description: "\u0639\u0631\u0636 \u0645\u0639\u0627\u064a\u0646\u0629.", credentials: seal("demo-only"), createdAt: now },
      { id: "l6", game: "eafc", title: "EA FC Mobile \u2022 \u0641\u0631\u064a\u0642 \u0642\u0648\u064a \u2022 \u0644\u0627\u0639\u0628\u0648\u0646 95+", price: 3100, sellerId: "u_admin", sellerName: "PitchKing", rating: 4.8, delivery: "manual", featured: false, status: "active", description: "\u0639\u0631\u0636 \u0645\u0639\u0627\u064a\u0646\u0629.", credentials: seal("demo-only"), createdAt: now }
    ],
    orders: [],
    disputes: [],
    reports: [],
    notifications: [],
    messages: [],
    reviews: [],
    audit: []
  };
}

function load() {
  if (globalThis.__feloot && globalThis.__feloot.users) return globalThis.__feloot;
  try {
    if (fs.existsSync(FILE)) {
      const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
      data.reports = data.reports || [];
      data.notifications = data.notifications || [];
      data.messages = data.messages || [];
      data.reviews = data.reviews || [];
      data.audit = data.audit || [];
      globalThis.__feloot = data;
      return data;
    }
  } catch {}
  const data = seed();
  save(data);
  return data;
}

function save(data) {
  globalThis.__feloot = data;
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    const tmp = FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(data));
    fs.renameSync(tmp, FILE);
  } catch {
    data.storageWarning = "file-store-unavailable";
  }
}

function id(prefix) {
  return prefix + "_" + crypto.randomBytes(6).toString("hex");
}

function publicListing(l) {
  if (!l) return null;
  const { credentials, ...rest } = l;
  return rest;
}

function storageMode() {
  if (process.env.DATABASE_URL) return "postgres-url-present-json-store";
  if (process.env.VERCEL) return "ephemeral-tmp";
  return "local-file";
}

function notify(db, userId, text) {
  db.notifications = db.notifications || [];
  db.notifications.unshift({ id: id("n"), userId, text: String(text).slice(0, 180), at: new Date().toISOString(), read: false });
  db.notifications = db.notifications.slice(0, 200);
}

module.exports = { notify, GAMES, load, save, id, publicListing, seed, storageMode };
