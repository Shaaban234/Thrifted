-- Thrifted database schema (Neon Postgres). Run via `npm run db:setup`.
-- Prices and amounts are stored in PKR as integers.

create extension if not exists pgcrypto;

create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  username      text unique not null,
  avatar_url    text,
  bio           text,
  location      text,
  rating_avg    numeric(2,1) default 0,
  review_count  int default 0,
  followers     int default 0,
  following     int default 0,
  is_admin      boolean default false,
  -- personal details & shipping address (private; only returned to the user themselves)
  full_name     text,
  phone         text,
  address_line1 text,
  address_line2 text,
  city          text,
  postal_code   text,
  country       text,
  joined_at     timestamptz default now()
);

-- Backfill the profile/address columns on databases created before they existed.
alter table users add column if not exists full_name     text;
alter table users add column if not exists phone         text;
alter table users add column if not exists address_line1 text;
alter table users add column if not exists address_line2 text;
alter table users add column if not exists city          text;
alter table users add column if not exists postal_code   text;
alter table users add column if not exists country        text;

create table if not exists items (
  id           uuid primary key default gen_random_uuid(),
  seller_id    uuid not null references users(id) on delete cascade,
  title        text not null,
  description  text default '',
  brand        text not null,
  category     text not null,
  subcategory  text,
  size         text not null,
  condition    text not null,
  color        text default 'Multi',
  price        int not null,
  photos       text[] not null default '{}',
  status       text not null default 'active',
  views        int default 0,
  likes        int default 0,
  created_at   timestamptz default now()
);
create index if not exists items_seller_idx on items(seller_id);
create index if not exists items_category_idx on items(category);

create table if not exists favorites (
  user_id    uuid not null references users(id) on delete cascade,
  item_id    uuid not null references items(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, item_id)
);

create table if not exists follows (
  follower_id uuid not null references users(id) on delete cascade,
  followed_id uuid not null references users(id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (follower_id, followed_id)
);

create table if not exists conversations (
  id         uuid primary key default gen_random_uuid(),
  item_id    uuid references items(id) on delete set null,
  buyer_id   uuid not null references users(id) on delete cascade,
  seller_id  uuid not null references users(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references users(id) on delete cascade,
  body            text not null,
  type            text not null default 'text',
  offer_amount    int,
  offer_status    text,
  created_at      timestamptz default now()
);
create index if not exists messages_convo_idx on messages(conversation_id);

create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  item_id        uuid not null references items(id) on delete cascade,
  buyer_id       uuid not null references users(id) on delete cascade,
  seller_id      uuid not null references users(id) on delete cascade,
  amount         int not null,
  protection_fee int not null,
  shipping_fee   int not null,
  total          int not null,
  status         text not null default 'paid',
  payment_method text not null default 'card', -- 'card' | 'cod'
  created_at     timestamptz default now()
);
alter table orders add column if not exists payment_method text not null default 'card';

create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid references orders(id) on delete set null,
  reviewer_id uuid not null references users(id) on delete cascade,
  reviewee_id uuid not null references users(id) on delete cascade,
  rating      int not null,
  comment     text default '',
  created_at  timestamptz default now()
);

create table if not exists notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  type            text not null,
  actor_id        uuid references users(id) on delete set null,
  item_id         uuid references items(id) on delete set null,
  conversation_id uuid references conversations(id) on delete set null,
  body            text not null,
  read            boolean default false,
  created_at      timestamptz default now()
);
create index if not exists notifications_user_idx on notifications(user_id);

create table if not exists wallet_transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  amount     int not null,
  type       text not null,
  label      text not null,
  order_id   uuid references orders(id) on delete set null,
  created_at timestamptz default now()
);
