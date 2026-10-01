const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const FILE = process.env.DATA_FILE || path.join(process.cwd(), "data", "store.json");

const GAMES = [
  { id: "pubg", name: "PUBG Mobile", emoji: "🎯" },
  { id: "freefire", name: "Free Fire", emoji: "🔥" },
  { id: "valorant", name: "Valorant", emoji: "⚔️" },
  { id: "fortnite", name: "Fortnite", emoji: "🏗️" },
  { id: "codm", name: "Call of Duty Mobile", emoji: "💥" },
  { id: "eafc", name: "EA FC Mobile", emoji: "⚽" }
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
        createdAt: now
      }
    ],
    listings: [
      { id: "l1", game: "pubg", title: "PUBG Level 70 • Conqueror • M416 Glacier", price: 3500, sellerId: "u_admin", sellerName: "ProGamerEG", rating: 4.9, delivery: "instant", featured: true, status: "active", description: "حساب كونكرر مع سكن M416 Glacier. التسليم بعد تأمين الإسكرو.", credentials: "user: demo-pubg / pass: change-me", createdAt: now },
      { id: "l2", game: "valorant", title: "Valorant Radiant • Full Collection • 42 Skins", price: 8200, sellerId: "u_admin", sellerName: "EliteSkins", rating: 5, delivery: "manual", featured: true, status: "active", description: "راديانت مع مجموعة سكنات كاملة. التسليم عبر شات محمي.", credentials: "riot: demo-val", createdAt: now },
      { id: "l3", game: "fortnite", title: "Fortnite • OG Skins • Battle Pass", price: 2600, sellerId: "u_admin", sellerName: "BuildPro", rating: 4.6, delivery: "instant", featured: true, status: "active", description: "سكنات OG وباتل باس.", credentials: "epic: demo-fn", createdAt: now },
      { id: "l4", game: "freefire", title: "Free Fire • Grandmaster • حساب نادر", price: 1800, sellerId: "u_admin", sellerName: "FireKing", rating: 4.8, delivery: "instant", featured: false, status: "active", description: "جراند ماستر نادر.", credentials: "ff: demo", createdAt: now },
      { id: "l5", game: "codm", title: "COD Mobile • Legendary • سكنات كاملة", price: 4200, sellerId: "u_admin", sellerName: "CodVault", rating: 4.7, delivery: "manual", featured: false, status: "active", description: "ليجندري مع سكنات.", credentials: "cod: demo", createdAt: now },
      { id: "l6", game: "eafc", title: "EA FC Mobile • فريق قوي • لاعبون 95+", price: 3100, sellerId: "u_admin", sellerName: "PitchKing", rating: 4.8, delivery: "manual", featured: false, status: "active", description: "فريق 95+.", credentials: "ea: demo", createdAt: now }
    ],
    orders: [],
    disputes: [],
    audit: []
  };
}

function load() {
  try {
    if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {}
  const data = seed();
  save(data);
  return data;
}

function save(data) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, FILE);
}

function id(prefix) {
  return prefix + "_" + crypto.randomBytes(6).toString("hex");
}

function publicListing(l) {
  const { credentials, ...rest } = l;
  return rest;
}

module.exports = { GAMES, load, save, id, publicListing, seed };
