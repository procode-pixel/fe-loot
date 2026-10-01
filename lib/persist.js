const { Client } = require("pg");

function client() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return new Client({ connectionString: url, ssl: url.includes("localhost") ? false : { rejectUnauthorized: false } });
}

async function pullState() {
  const c = client();
  if (!c) return null;
  await c.connect();
  try {
    await c.query(`create table if not exists feloot_state (
      id text primary key,
      doc jsonb not null,
      updated_at timestamptz not null default now()
    )`);
    const res = await c.query("select doc from feloot_state where id = $1", ["main"]);
    return res.rows[0] ? res.rows[0].doc : null;
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
    await c.query(`create table if not exists feloot_state (
      id text primary key,
      doc jsonb not null,
      updated_at timestamptz not null default now()
    )`);
    await c.query(
      `insert into feloot_state (id, doc, updated_at) values ($1, $2::jsonb, now())
       on conflict (id) do update set doc = excluded.doc, updated_at = now()`,
      ["main", JSON.stringify(copy)]
    );
  } finally {
    await c.end();
  }
}

module.exports = { pullState, pushState };
