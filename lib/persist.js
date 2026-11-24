const { Client } = require("pg");

// Structured Postgres persistence.
// One table per entity collection, typed columns, array order preserved
// through the `position` column, and an `extra` jsonb overflow column so
// future entity fields are never dropped silently.
// The store keeps its in-memory document API; this module syncs it.

const TYPES = { text: "text", num: "numeric", int: "integer", bool: "boolean", ts: "timestamptz", json: "jsonb" };

// columns: entity field -> [column name, type]
const TABLES = [
  {
    key: "users", table: "users",
    columns: {
      id: ["id", "text"], name: ["name", "text"], email: ["email", "text"],
      passwordHash: ["password_hash", "text"], role: ["role", "text"],
      rating: ["rating", "num"], balance: ["balance", "num"],
      favorites: ["favorites", "json"], tokenVersion: ["token_version", "int"],
      banned: ["banned", "bool"], totpEnabled: ["totp_enabled", "bool"],
      totpSecret: ["totp_secret", "text"], totpPending: ["totp_pending", "text"],
      createdAt: ["created_at", "ts"]
    },
    indexes: ["create unique index if not exists users_email_key on users (email)"]
  },
  {
    key: "listings", table: "listings",
    columns: {
      id: ["id", "text"], game: ["game", "text"], title: ["title", "text"],
      price: ["price", "num"], sellerId: ["seller_id", "text"], sellerName: ["seller_name", "text"],
      rating: ["rating", "num"], delivery: ["delivery", "text"], featured: ["featured", "bool"],
      status: ["status", "text"], description: ["description", "text"], credentials: ["credentials", "text"],
      createdAt: ["created_at", "ts"], reviewedAt: ["reviewed_at", "ts"]
    },
    indexes: [
      "create index if not exists listings_status_idx on listings (status)",
      "create index if not exists listings_seller_idx on listings (seller_id)",
      "create index if not exists listings_game_idx on listings (game)"
    ]
  },
  {
    key: "orders", table: "orders",
    columns: {
      id: ["id", "text"], listingId: ["listing_id", "text"], title: ["title", "text"],
      price: ["price", "num"], game: ["game", "text"],
      buyerId: ["buyer_id", "text"], buyerName: ["buyer_name", "text"],
      sellerId: ["seller_id", "text"], sellerName: ["seller_name", "text"],
      delivery: ["delivery", "text"], status: ["status", "text"],
      credentials: ["credentials", "text"], createdAt: ["created_at", "ts"]
    },
    indexes: [
      "create index if not exists orders_buyer_idx on orders (buyer_id)",
      "create index if not exists orders_seller_idx on orders (seller_id)",
      "create index if not exists orders_status_idx on orders (status)"
    ]
  },
  {
    key: "disputes", table: "disputes",
    columns: {
      id: ["id", "text"], orderId: ["order_id", "text"], by: ["opened_by", "text"],
      note: ["note", "text"], at: ["created_at", "ts"]
    },
    indexes: ["create index if not exists disputes_order_idx on disputes (order_id)"]
  },
  {
    key: "messages", table: "messages",
    columns: {
      id: ["id", "text"], orderId: ["order_id", "text"], userId: ["user_id", "text"],
      name: ["name", "text"], text: ["text", "text"], at: ["created_at", "ts"]
    },
    indexes: ["create index if not exists messages_order_idx on messages (order_id)"]
  },
  {
    key: "reviews", table: "reviews",
    columns: {
      id: ["id", "text"], orderId: ["order_id", "text"], listingId: ["listing_id", "text"],
      sellerId: ["seller_id", "text"], buyerName: ["buyer_name", "text"],
      stars: ["stars", "int"], text: ["text", "text"], at: ["created_at", "ts"]
    },
    indexes: [
      "create unique index if not exists reviews_order_key on reviews (order_id)",
      "create index if not exists reviews_seller_idx on reviews (seller_id)"
    ]
  },
  {
    key: "offers", table: "offers",
    columns: {
      id: ["id", "text"], listingId: ["listing_id", "text"], title: ["title", "text"],
      amount: ["amount", "num"], price: ["price", "num"],
      buyerId: ["buyer_id", "text"], buyerName: ["buyer_name", "text"],
      sellerId: ["seller_id", "text"], sellerName: ["seller_name", "text"],
      status: ["status", "text"], createdAt: ["created_at", "ts"]
    },
    indexes: ["create index if not exists offers_listing_idx on offers (listing_id)"]
  },
  {
    key: "watches", table: "watches",
    columns: {
      id: ["id", "text"], userId: ["user_id", "text"], game: ["game", "text"],
      q: ["q", "text"], maxPrice: ["max_price", "num"], createdAt: ["created_at", "ts"]
    },
    indexes: ["create index if not exists watches_user_idx on watches (user_id)"]
  },
  {
    key: "notifications", table: "notifications",
    columns: {
      id: ["id", "text"], userId: ["user_id", "text"], text: ["text", "text"],
      read: ["read", "bool"], at: ["created_at", "ts"]
    },
    indexes: ["create index if not exists notifications_user_idx on notifications (user_id)"]
  },
  {
    key: "reports", table: "reports",
    columns: {
      id: ["id", "text"], listingId: ["listing_id", "text"], userId: ["user_id", "text"],
      reason: ["reason", "text"], status: ["status", "text"], createdAt: ["created_at", "ts"]
    }
  },
  {
    key: "tickets", table: "tickets",
    columns: {
      id: ["id", "text"], userId: ["user_id", "text"], userName: ["user_name", "text"],
      subject: ["subject", "text"], body: ["body", "text"], orderId: ["order_id", "text"],
      status: ["status", "text"], createdAt: ["created_at", "ts"], updatedAt: ["updated_at", "ts"]
    },
    indexes: ["create index if not exists tickets_user_idx on tickets (user_id)"]
  },
  {
    key: "verifications", table: "verifications",
    columns: {
      id: ["id", "text"], userId: ["user_id", "text"], note: ["note", "text"],
      status: ["status", "text"], at: ["created_at", "ts"]
    }
  },
  {
    key: "audit", table: "audit_log", noId: true,
    columns: {
      at: ["at", "ts"], action: ["action", "text"], userId: ["user_id", "text"],
      orderId: ["order_id", "text"], listingId: ["listing_id", "text"],
      offerId: ["offer_id", "text"], watchId: ["watch_id", "text"],
      ticketId: ["ticket_id", "text"], amount: ["amount", "num"]
    },
    indexes: ["create index if not exists audit_log_at_idx on audit_log (at)"]
  }
];

function columnDefs(t) {
  const defs = [];
  if (t.noId) defs.push("id bigint generated always as identity primary key");
  for (const [jsKey, [col, type]] of Object.entries(t.columns)) {
    if (jsKey === "id" && !t.noId) defs.push("id text primary key");
    else defs.push(`${col} ${TYPES[type]}`);
  }
  defs.push("extra jsonb");
  defs.push("position integer not null default 0");
  return defs.join(", ");
}

async function ensureSchema(c) {
  for (const t of TABLES) {
    await c.query(`create table if not exists ${t.table} (${columnDefs(t)})`);
    for (const idx of t.indexes || []) await c.query(idx);
  }
}

function toValues(t, entity, position) {
  const vals = [position];
  const extra = {};
  const known = new Set(Object.keys(t.columns));
  for (const [k, v] of Object.entries(entity)) {
    if (!known.has(k) && v !== undefined) extra[k] = v;
  }
  vals.push(Object.keys(extra).length ? JSON.stringify(extra) : null);
  for (const [jsKey, [, type]] of Object.entries(t.columns)) {
    let v = entity[jsKey];
    if (v === undefined || v === null) { vals.push(null); continue; }
    if (type === "num" || type === "int") v = Number(v);
    else if (type === "bool") v = Boolean(v);
    else if (type === "json") v = JSON.stringify(v);
    else v = String(v);
    vals.push(v);
  }
  return vals;
}

function toEntity(t, row) {
  const out = {};
  if (row.extra && typeof row.extra === "object") Object.assign(out, row.extra);
  for (const [jsKey, [col, type]] of Object.entries(t.columns)) {
    let v = row[col];
    if (v === null || v === undefined) continue;
    if (type === "num" || type === "int") v = Number(v);
    else if (type === "bool") v = Boolean(v);
    else if (type === "ts") v = v instanceof Date ? v.toISOString() : String(v);
    out[jsKey] = v;
  }
  return out;
}

function columnNames(t) {
  return ["position", "extra", ...Object.values(t.columns).map(([col]) => col)];
}

function client() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return new Client({ connectionString: url, ssl: url.includes("localhost") ? false : { rejectUnauthorized: false } });
}

// One-time import path from the retired single-row feloot_state document.
async function pullLegacy(c) {
  try {
    const res = await c.query("select doc from feloot_state where id = $1", ["main"]);
    return res.rows[0] ? res.rows[0].doc : null;
  } catch {
    return null; // table never existed
  }
}

async function pullState() {
  const c = client();
  if (!c) return null;
  await c.connect();
  try {
    await ensureSchema(c);
    const doc = {};
    for (const t of TABLES) {
      const res = await c.query(`select * from ${t.table} order by position asc`);
      doc[t.key] = res.rows.map((r) => toEntity(t, r));
    }
    if (!doc.users.length) {
      const legacy = await pullLegacy(c);
      if (legacy && Array.isArray(legacy.users) && legacy.users.length) return legacy;
      return null; // empty database: let the store seed and push
    }
    return doc;
  } finally {
    await c.end();
  }
}

async function pushState(data) {
  const c = client();
  if (!c) return;
  const copy = { ...data };
  delete copy.storageWarning;
  await c.connect();
  try {
    await ensureSchema(c);
    await c.query("begin");
    for (const t of TABLES) {
      const entities = (copy[t.key] || []).filter((e) => e && (t.noId || e.id));
      if (!entities.length) {
        await c.query(`delete from ${t.table}`);
        continue;
      }
      const cols = columnNames(t);
      const tuples = [];
      const params = [];
      entities.forEach((e, i) => {
        const vals = toValues(t, e, i);
        tuples.push("(" + vals.map((_, j) => "$" + (params.length + j + 1)).join(",") + ")");
        params.push(...vals);
      });
      if (t.noId) {
        await c.query(`delete from ${t.table}`);
        await c.query(`insert into ${t.table} (${cols.join(",")}) values ${tuples.join(",")}`, params);
      } else {
        const updates = cols.filter((col) => col !== "id").map((col) => `${col} = excluded.${col}`);
        await c.query(
          `insert into ${t.table} (${cols.join(",")}) values ${tuples.join(",")}
           on conflict (id) do update set ${updates.join(",")}`,
          params
        );
        await c.query(`delete from ${t.table} where not (id = any($1::text[]))`, [entities.map((e) => String(e.id))]);
      }
    }
    await c.query("commit");
  } catch (err) {
    await c.query("rollback").catch(() => {});
    throw err;
  } finally {
    await c.end();
  }
}

module.exports = { pullState, pushState, ensureSchema, TABLES };
