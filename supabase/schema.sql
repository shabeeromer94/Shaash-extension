-- =====================================================================
-- SHAASH Beauty Store — Database Schema
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New
-- query), then run seed.sql to load the starter catalog.
--
-- Design notes:
--   * Availability status (in stock / low stock / out of stock / hidden)
--     is derived in application code from stock_quantity / low_stock_threshold
--     / is_hidden — it is NOT stored as its own column, so it can never
--     drift out of sync with the real stock count.
--   * There is no separate "inventory" table: each product is a single
--     SKU (no size/colour variants), so stock lives directly on `products`.
--   * order_items and the order's shipping fields are snapshots taken at
--     checkout time, so historical orders stay accurate even if a product's
--     price/name changes (or the product is removed) later.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- categories — lets products be grouped beyond "hair extensions" later
-- (e.g. Accessories) without restructuring anything.
-- ---------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- hairstyles — the taxonomy used by the Hairstyle Finder
-- (soft curls, bridal, ponytail, waterfall braid, ...).
-- ---------------------------------------------------------------------
create table if not exists hairstyles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                 -- e.g. "201" — used in /products/[code]
  name text not null,
  description text,
  price_inr numeric(10, 2) not null check (price_inr >= 0),
  length_label text,                          -- e.g. "18 inch" (free text, for display)
  length_inches numeric(5, 2),                -- numeric, for filtering/sorting
  texture text,                                -- e.g. "Wavy", "Curly"
  colour text,                                 -- e.g. "Natural Black", "Highlights"
  category_id uuid references categories (id) on delete set null,
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  low_stock_threshold int not null default 5 check (low_stock_threshold >= 0),
  is_hidden boolean not null default false,   -- manual override to hide regardless of stock
  featured boolean not null default false,
  tags text[] not null default '{}',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on products (category_id);
create index if not exists products_texture_idx on products (texture);
create index if not exists products_featured_idx on products (featured);

-- ---------------------------------------------------------------------
-- product_images — supports any number of images per product (0..N).
-- ---------------------------------------------------------------------
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  image_url text not null,                    -- e.g. "/images/products/201/img-1.jpg"
  alt_text text,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on product_images (product_id);

-- ---------------------------------------------------------------------
-- product_hairstyles — many-to-many join powering the Finder's tag matching.
-- ---------------------------------------------------------------------
create table if not exists product_hairstyles (
  product_id uuid not null references products (id) on delete cascade,
  hairstyle_id uuid not null references hairstyles (id) on delete cascade,
  primary key (product_id, hairstyle_id)
);

create index if not exists product_hairstyles_hairstyle_id_idx on product_hairstyles (hairstyle_id);

-- ---------------------------------------------------------------------
-- hairstyle_inspiration — editorial content for /inspiration
-- (image, name, short description, recommended product(s), CTA).
-- ---------------------------------------------------------------------
create table if not exists hairstyle_inspiration (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  short_description text,
  body text,
  image_url text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists hairstyle_inspiration_products (
  inspiration_id uuid not null references hairstyle_inspiration (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  sort_order int not null default 0,
  primary key (inspiration_id, product_id)
);

-- ---------------------------------------------------------------------
-- customers — populated (find-or-create) at checkout time. No login/auth.
-- ---------------------------------------------------------------------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

create index if not exists customers_email_idx on customers (email);

-- ---------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------
create sequence if not exists order_number_seq start 1;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default ('SHA-' || lpad(nextval('order_number_seq')::text, 6, '0')),
  customer_id uuid references customers (id) on delete set null,

  -- "local" = self-pickup within Chennai (free, via the customer's own
  -- Rapido/Porter), "courier" = shipped, with shipping_fee computed from
  -- state + quantity. See lib/utils/shipping.ts for the fee formula.
  delivery_method text not null default 'courier'
    constraint orders_delivery_method_check check (delivery_method in ('local', 'courier')),

  -- Shipping snapshot, captured at checkout time. For delivery_method =
  -- 'local' these are filled with the pickup address (PICKUP_ADDRESS in
  -- lib/utils/shipping.ts), not the customer's — there's nothing else to put
  -- here since the columns are not null and no customer address is collected.
  shipping_name text not null,
  shipping_phone text not null,
  shipping_email text not null,
  shipping_address_line1 text not null,
  shipping_address_line2 text,
  shipping_city text not null,
  shipping_state text not null,
  shipping_pincode text not null,

  subtotal numeric(10, 2) not null check (subtotal >= 0),
  shipping_fee numeric(10, 2) not null default 0 check (shipping_fee >= 0),
  total numeric(10, 2) not null check (total >= 0),

  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),

  payment_provider text not null default 'razorpay',
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  payment_reference text,                     -- Razorpay order/payment id, once wired up

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migration for a database that already has `orders` from before
-- delivery_method existed — `create table if not exists` above is a no-op
-- there, so this adds the column/constraint explicitly. Safe to re-run, and
-- a no-op on a fresh install (the create table above already has it).
alter table orders add column if not exists delivery_method text not null default 'courier';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_delivery_method_check'
  ) then
    alter table orders
      add constraint orders_delivery_method_check
      check (delivery_method in ('local', 'courier'));
  end if;
end $$;

create index if not exists orders_customer_id_idx on orders (customer_id);

-- ---------------------------------------------------------------------
-- order_items — snapshot fields so historical orders stay accurate even
-- if the product later changes price/name or is removed.
-- ---------------------------------------------------------------------
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  product_code text not null,
  product_name text not null,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  line_total numeric(10, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on order_items (order_id);

-- ---------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at before update on products
  for each row execute function set_updated_at();

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at before update on orders
  for each row execute function set_updated_at();

-- =====================================================================
-- Row Level Security
--
-- Catalog tables: readable by anyone (anon key), restricted to
-- visible/published rows. customers/orders/order_items have RLS enabled
-- with NO policies at all — only the service-role key (used server-side
-- in /api/checkout) can read or write them, so the storefront can never
-- write directly.
-- =====================================================================

alter table categories enable row level security;
alter table hairstyles enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_hairstyles enable row level security;
alter table hairstyle_inspiration enable row level security;
alter table hairstyle_inspiration_products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists "Public read categories" on categories;
create policy "Public read categories" on categories for select using (true);

drop policy if exists "Public read hairstyles" on hairstyles;
create policy "Public read hairstyles" on hairstyles for select using (true);

drop policy if exists "Public read visible products" on products;
create policy "Public read visible products" on products for select using (is_hidden = false);

drop policy if exists "Public read product images" on product_images;
create policy "Public read product images" on product_images for select using (
  exists (select 1 from products p where p.id = product_images.product_id and p.is_hidden = false)
);

drop policy if exists "Public read product_hairstyles" on product_hairstyles;
create policy "Public read product_hairstyles" on product_hairstyles for select using (
  exists (select 1 from products p where p.id = product_hairstyles.product_id and p.is_hidden = false)
);

drop policy if exists "Public read published inspiration" on hairstyle_inspiration;
create policy "Public read published inspiration" on hairstyle_inspiration for select using (published = true);

drop policy if exists "Public read inspiration_products" on hairstyle_inspiration_products;
create policy "Public read inspiration_products" on hairstyle_inspiration_products for select using (
  exists (
    select 1 from hairstyle_inspiration hi
    where hi.id = hairstyle_inspiration_products.inspiration_id and hi.published = true
  )
);

-- No policies on customers / orders / order_items: RLS enabled + zero
-- policies means anon/authenticated roles get zero rows, in both
-- directions, unconditionally. Only the service role bypasses RLS.
