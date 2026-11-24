-- FeLoot structured schema (Supabase / Postgres)
-- This file documents what lib/persist.js creates automatically on first run.
-- You can also run it manually in the Supabase SQL editor; it is idempotent.

create table if not exists users (
  id text primary key,
  name text,
  email text,
  password_hash text,
  role text,
  rating numeric,
  balance numeric,
  favorites jsonb,
  token_version integer,
  banned boolean,
  totp_enabled boolean,
  totp_secret text,
  totp_pending text,
  created_at timestamptz,
  extra jsonb,
  position integer not null default 0
);
create unique index if not exists users_email_key on users (email);

create table if not exists listings (
  id text primary key,
  game text,
  title text,
  price numeric,
  seller_id text,
  seller_name text,
  rating numeric,
  delivery text,
  featured boolean,
  status text,
  description text,
  credentials text, -- AES-256-GCM sealed, never shipped to public responses
  created_at timestamptz,
  reviewed_at timestamptz,
  extra jsonb,
  position integer not null default 0
);
create index if not exists listings_status_idx on listings (status);
create index if not exists listings_seller_idx on listings (seller_id);
create index if not exists listings_game_idx on listings (game);

create table if not exists orders (
  id text primary key,
  listing_id text,
  title text,
  price numeric,
  game text,
  buyer_id text,
  buyer_name text,
  seller_id text,
  seller_name text,
  delivery text,
  status text, -- escrow_held | disputed | released | refunded | delivered
  credentials text, -- sealed delivery credentials for the buyer
  created_at timestamptz,
  extra jsonb,
  position integer not null default 0
);
create index if not exists orders_buyer_idx on orders (buyer_id);
create index if not exists orders_seller_idx on orders (seller_id);
create index if not exists orders_status_idx on orders (status);

create table if not exists disputes (
  id text primary key,
  order_id text,
  opened_by text,
  note text,
  created_at timestamptz,
  extra jsonb,
  position integer not null default 0
);
create index if not exists disputes_order_idx on disputes (order_id);

create table if not exists messages (
  id text primary key,
  order_id text,
  user_id text,
  name text,
  text text,
  created_at timestamptz,
  extra jsonb,
  position integer not null default 0
);
create index if not exists messages_order_idx on messages (order_id);

create table if not exists reviews (
  id text primary key,
  order_id text,
  listing_id text,
  seller_id text,
  buyer_name text,
  stars integer,
  text text,
  created_at timestamptz,
  extra jsonb,
  position integer not null default 0
);
create unique index if not exists reviews_order_key on reviews (order_id);
create index if not exists reviews_seller_idx on reviews (seller_id);

create table if not exists offers (
  id text primary key,
  listing_id text,
  title text,
  amount numeric,
  price numeric,
  buyer_id text,
  buyer_name text,
  seller_id text,
  seller_name text,
  status text,
  created_at timestamptz,
  extra jsonb,
  position integer not null default 0
);
create index if not exists offers_listing_idx on offers (listing_id);

create table if not exists watches (
  id text primary key,
  user_id text,
  game text,
  q text,
  max_price numeric,
  created_at timestamptz,
  extra jsonb,
  position integer not null default 0
);
create index if not exists watches_user_idx on watches (user_id);

create table if not exists notifications (
  id text primary key,
  user_id text,
  text text,
  read boolean,
  created_at timestamptz,
  extra jsonb,
  position integer not null default 0
);
create index if not exists notifications_user_idx on notifications (user_id);

create table if not exists reports (
  id text primary key,
  listing_id text,
  user_id text,
  reason text,
  status text,
  created_at timestamptz,
  extra jsonb,
  position integer not null default 0
);

create table if not exists tickets (
  id text primary key,
  user_id text,
  user_name text,
  subject text,
  body text,
  order_id text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  extra jsonb,
  position integer not null default 0
);
create index if not exists tickets_user_idx on tickets (user_id);

create table if not exists verifications (
  id text primary key,
  user_id text,
  note text,
  status text,
  created_at timestamptz,
  extra jsonb,
  position integer not null default 0
);

create table if not exists audit_log (
  id bigint generated always as identity primary key,
  at timestamptz,
  action text,
  user_id text,
  order_id text,
  listing_id text,
  offer_id text,
  watch_id text,
  ticket_id text,
  amount numeric,
  extra jsonb,
  position integer not null default 0
);
create index if not exists audit_log_at_idx on audit_log (at);
