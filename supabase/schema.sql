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

  -- Some catalog listings are literally the same physical inventory sold
  -- under two different product codes (e.g. one styled/named for the
  -- "highlights" line, one for "dark brown" — same bundle in the stockroom).
  -- Rows sharing a non-null stock_group are kept at the same stock_quantity
  -- automatically — buying either one decrements every row in the group (see
  -- /api/checkout and /api/checkout/verify), and editing stock_quantity by
  -- hand for any one of them in the Table Editor mirrors to the rest too
  -- (see sync_stock_group() trigger below). NULL means "not shared" — the
  -- normal case.
  stock_group text,

  -- Groups several distinct product listings under one family for display —
  -- e.g. 5 different Kunjalam designs, or 2 different Hair Donut materials.
  -- When a category page has multiple products sharing the same
  -- accessory_group, /shop shows one tile per group instead of one card per
  -- product; clicking a tile filters down to that group's actual products.
  -- NULL means "stands alone" — the normal case (e.g. all Hair Extensions).
  accessory_group text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migration for a database that already has `products` from before
-- stock_group / accessory_group existed. Safe to re-run.
alter table products add column if not exists stock_group text;
alter table products add column if not exists accessory_group text;

create index if not exists products_category_id_idx on products (category_id);
create index if not exists products_texture_idx on products (texture);
create index if not exists products_featured_idx on products (featured);
create index if not exists products_stock_group_idx on products (stock_group) where stock_group is not null;
create index if not exists products_accessory_group_idx on products (accessory_group) where accessory_group is not null;

-- Mirrors any stock_quantity change on a grouped product to every other code
-- sharing its stock_group — covers BOTH the app's checkout writes AND manual
-- edits made directly in the Supabase Table Editor, so the two (or more)
-- linked listings can never show different numbers. The "is distinct from"
-- guards are what make this safe to cascade: a sibling update that already
-- matches the target value doesn't re-fire, so a 2-row group settles in one
-- hop instead of ping-ponging forever.
create or replace function sync_stock_group() returns trigger as $$
begin
  if new.stock_group is not null and new.stock_quantity is distinct from old.stock_quantity then
    update products
    set stock_quantity = new.stock_quantity
    where stock_group = new.stock_group
      and id <> new.id
      and stock_quantity is distinct from new.stock_quantity;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_stock_group on products;
create trigger trg_sync_stock_group
  after update of stock_quantity on products
  for each row
  execute function sync_stock_group();

-- ---------------------------------------------------------------------
-- product_variants — size/price options for a single product (e.g. the
-- Sponge Hair Donut comes in Small/Medium/Big at different prices). Only
-- products that need this have any rows here; a product with none is sold
-- at its own price_inr/stock_quantity as usual. When a product does have
-- variants, its own price_inr/stock_quantity are display fallbacks only
-- (kept in sync as min price / summed stock — see seed.sql) — every actual
-- purchase is priced and stocked against the chosen variant, never the
-- product row itself.
-- ---------------------------------------------------------------------
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  label text not null,                        -- e.g. "Small", "Medium", "Big"
  price_inr numeric(10, 2) not null check (price_inr >= 0),
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_variants_product_id_idx on product_variants (product_id);

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
  email text,                                 -- optional: local self-pickup orders may not collect one
  phone text not null,
  created_at timestamptz not null default now()
);

-- Migration for a database that already has `email` as NOT NULL from before
-- it became optional for local self-pickup orders. Safe to re-run (a no-op
-- once already nullable).
alter table customers alter column email drop not null;

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
  shipping_email text,                        -- optional: local self-pickup orders may not collect one
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

-- Migration for a database that already has `shipping_email` as NOT NULL
-- from before email became optional for local self-pickup orders. Safe to
-- re-run (a no-op once already nullable).
alter table orders alter column shipping_email drop not null;

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
  variant_label text,                         -- e.g. "Small" — null for products with no variants
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  line_total numeric(10, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

-- Migration for a database that already has `order_items` from before
-- variant_label existed. Safe to re-run.
alter table order_items add column if not exists variant_label text;

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
alter table product_variants enable row level security;
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

drop policy if exists "Public read product variants" on product_variants;
create policy "Public read product variants" on product_variants for select using (
  exists (select 1 from products p where p.id = product_variants.product_id and p.is_hidden = false)
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

-- =====================================================================
-- order_summary — a read-only view for browsing orders in the Supabase
-- Table Editor. Raw `orders` mixes fulfilment-critical fields (who, where,
-- what) with bookkeeping ones (payment ids, timestamps, internal uuids) in
-- an arbitrary column order, and has no single place to see what was
-- actually ordered (that's in the separate order_items table). This view
-- puts the fields you need at a glance first — customer name, phone,
-- delivery method, full address, products ordered — with everything else
-- after. It changes nothing about `orders`/`order_items` themselves and
-- nothing in the app queries it; it's purely for looking things up.
--
-- `security_invoker = true` (Postgres 15+) makes this view enforce the
-- querying role's own RLS, same as querying `orders` directly, rather than
-- running with the view creator's privileges — without it, a view can
-- silently bypass RLS for anyone who can query it. The REVOKE below is a
-- second, independent layer: it stops PostgREST (anon/authenticated, i.e.
-- the public API) from ever reaching this view at all, so it's only
-- browsable from the Supabase dashboard / SQL Editor, not the storefront.
-- =====================================================================

create or replace view order_summary
with (security_invoker = true)
as
select
  o.order_number,
  o.shipping_name as customer_name,
  o.shipping_phone as phone,
  o.delivery_method,
  concat_ws(
    ', ',
    o.shipping_address_line1,
    o.shipping_address_line2,
    o.shipping_city,
    o.shipping_state,
    o.shipping_pincode
  ) as full_address,
  coalesce(items.products_ordered, '') as products_ordered,

  -- Everything else — still here, just not first.
  o.status,
  o.payment_status,
  o.total,
  o.subtotal,
  o.shipping_fee,
  o.payment_provider,
  o.payment_reference,
  o.shipping_email as email,
  o.notes,
  o.created_at,
  o.updated_at,
  o.id as order_id,
  o.customer_id
from orders o
left join (
  select
    order_id,
    string_agg(
      '#' || product_code || ' ' || product_name
        || coalesce(' (' || variant_label || ')', '') || ' x' || quantity,
      '; ' order by created_at
    ) as products_ordered
  from order_items
  group by order_id
) items on items.order_id = o.id
order by o.created_at desc;

revoke all on order_summary from anon, authenticated;
