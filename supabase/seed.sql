-- =====================================================================
-- SHAASH Beauty Store — Starter Catalog Seed Data
-- Run this AFTER schema.sql. Safe to re-run — every insert either
-- upserts on a natural key or skips existing rows.
--
-- This is sample data structured like your real catalog, not the final
-- catalog. Edit these rows directly in the Supabase Table Editor (or
-- with more INSERT/UPDATE statements) as you add real products.
-- =====================================================================

-- ---------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------
insert into categories (slug, name, description, sort_order) values
  ('hair-extensions', 'Hair Extensions', 'Wearable synthetic hair extensions.', 0),
  ('hair-accessories', 'Hair Accessories', 'Accessories to complete every hairstyle.', 1)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- hairstyles (Hairstyle Finder taxonomy)
-- ---------------------------------------------------------------------
insert into hairstyles (slug, name, description, sort_order) values
  ('soft-curls', 'Soft Curls', 'Loose, romantic curls for an easy, everyday look.', 0),
  ('voluminous-curls', 'Voluminous Curls', 'Big, bouncy curls that add serious volume.', 1),
  ('half-up-half-down', 'Half-Up Half-Down', 'A classic style that mixes length with face-framing volume.', 2),
  ('ponytail', 'Ponytail', 'Instant length and thickness for a high or low ponytail.', 3),
  ('braided', 'Braided Style', 'Extra length and body for braids and plaits.', 4),
  ('waterfall-braid', 'Waterfall Braid', 'Cascading texture that works beautifully in a waterfall braid.', 5),
  ('bridal', 'Bridal Hairstyle', 'Full, elegant volume for wedding and special-occasion looks.', 6),
  ('long-flowing-curls', 'Long Flowing Curls', 'Dramatic length with soft, flowing curl definition.', 7)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- products (your 8 current items)
-- ---------------------------------------------------------------------
insert into products (
  code, name, description, price_inr, length_label, length_inches, texture, colour,
  category_id, stock_quantity, featured, tags, seo_title, seo_description
) values
  ('201', 'Natural Wavy Highlights Hair Extension, Layered',
   'Add instant length and soft, layered movement with this Natural Wavy Highlights Hair Extension. Gently blended highlights and a relaxed wave create a natural, sun-kissed finish that layers seamlessly into your own hair.',
   600.00, '20 inch', 20.0, 'Wavy', 'Highlights',
   (select id from categories where slug = 'hair-extensions'), 25, true,
   array['layered', 'bestseller'],
   '201 Natural Wavy Highlights Hair Extension | SHAASH Beauty Store',
   'Shop the 201 Natural Wavy Highlights layered hair extension — 20 inch wavy texture with soft, sun-kissed highlights.'),

  ('202', 'Natural Wavy Black Hair Extension, Layered',
   'A rich, natural black wavy extension with soft layering for effortless volume. Blends seamlessly for a look that''s instantly longer and fuller, without changing your natural colour.',
   600.00, '20 inch', 20.0, 'Wavy', 'Natural Black',
   (select id from categories where slug = 'hair-extensions'), 18, false,
   array['layered'],
   '202 Natural Wavy Black Hair Extension | SHAASH Beauty Store',
   'Shop the 202 Natural Wavy Black layered hair extension — 20 inch wavy texture in a rich natural black.'),

  ('203', 'Natural Wavy Highlights Hair Extension',
   'Soft waves with subtle, natural-looking highlights — an easy way to add length and dimension to any look.',
   600.00, '18 inch', 18.0, 'Wavy', 'Highlights',
   (select id from categories where slug = 'hair-extensions'), 4, false,
   array[]::text[],
   '203 Natural Wavy Highlights Hair Extension | SHAASH Beauty Store',
   'Shop the 203 Natural Wavy Highlights hair extension — 18 inch wavy texture with subtle highlights.'),

  ('204', 'Natural Wavy Black Hair Extension',
   'A classic natural black wavy extension for everyday length and volume, styled straight from the pack or curled to match your look.',
   600.00, '18 inch', 18.0, 'Wavy', 'Natural Black',
   (select id from categories where slug = 'hair-extensions'), 0, false,
   array[]::text[],
   '204 Natural Wavy Black Hair Extension | SHAASH Beauty Store',
   'Shop the 204 Natural Wavy Black hair extension — 18 inch wavy texture in a rich natural black.'),

  ('205', 'Natural Curly Highlights Hair Extension, Layered',
   'Bold, bouncy curls with soft, natural-looking highlights and gentle layering for shape. Built for volume that holds — beautiful for everyday wear or dressed up for an occasion.',
   550.00, '22 inch', 22.0, 'Curly', 'Highlights',
   (select id from categories where slug = 'hair-extensions'), 30, true,
   array['layered', 'bestseller'],
   '205 Natural Curly Highlights Hair Extension | SHAASH Beauty Store',
   'Shop the 205 Natural Curly Highlights layered hair extension — 22 inch voluminous curls with soft highlights.'),

  ('206', 'Natural Curly Black Hair Extension, Layered',
   'Rich natural black curls with soft layering for shape and bounce. A go-to for full, voluminous curls that still feel natural.',
   550.00, '22 inch', 22.0, 'Curly', 'Natural Black',
   (select id from categories where slug = 'hair-extensions'), 12, true,
   array['layered', 'bestseller'],
   '206 Natural Curly Black Hair Extension | SHAASH Beauty Store',
   'Shop the 206 Natural Curly Black layered hair extension — 22 inch voluminous curls in a rich natural black.'),

  ('209', 'Curly Highlights Hair Extension',
   'Playful, defined curls with soft highlights for extra dimension — an easy way to add volume and length in one step.',
   550.00, '16 inch', 16.0, 'Curly', 'Highlights',
   (select id from categories where slug = 'hair-extensions'), 3, false,
   array['new'],
   '209 Curly Highlights Hair Extension | SHAASH Beauty Store',
   'Shop the 209 Curly Highlights hair extension — 16 inch defined curls with soft highlights.'),

  ('210', 'Curly Black Hair Extension',
   'Defined, natural black curls for instant volume and bounce — a versatile everyday extension.',
   550.00, '16 inch', 16.0, 'Curly', 'Natural Black',
   (select id from categories where slug = 'hair-extensions'), 15, true,
   array['bestseller'],
   '210 Curly Black Hair Extension | SHAASH Beauty Store',
   'Shop the 210 Curly Black hair extension — 16 inch defined curls in a rich natural black.')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- product_images
-- Paths match public/images/products/<code>/img-N.jpg, copied from your
-- Images/ folder. Add more rows here as you add more photos per product.
-- ---------------------------------------------------------------------
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, v.image_url, v.alt_text, v.sort_order, v.is_primary
from products p
join (values
  ('201', '/images/products/201/img-1.jpg', 'Natural Wavy Highlights Hair Extension, Layered — main view', 0, true),
  ('201', '/images/products/201/img-2.jpg', 'Natural Wavy Highlights Hair Extension, Layered — detail view', 1, false),
  ('202', '/images/products/202/img-1.jpg', 'Natural Wavy Black Hair Extension, Layered — main view', 0, true),
  ('202', '/images/products/202/img-2.jpg', 'Natural Wavy Black Hair Extension, Layered — detail view', 1, false),
  ('203', '/images/products/203/img-1.jpg', 'Natural Wavy Highlights Hair Extension — main view', 0, true),
  ('203', '/images/products/203/img-2.jpg', 'Natural Wavy Highlights Hair Extension — detail view', 1, false),
  ('204', '/images/products/204/img-1.jpg', 'Natural Wavy Black Hair Extension — main view', 0, true),
  ('204', '/images/products/204/img-2.jpg', 'Natural Wavy Black Hair Extension — detail view', 1, false),
  ('205', '/images/products/205/img-1.jpg', 'Natural Curly Highlights Hair Extension, Layered — main view', 0, true),
  ('205', '/images/products/205/img-2.jpg', 'Natural Curly Highlights Hair Extension, Layered — detail view', 1, false),
  ('206', '/images/products/206/img-1.jpg', 'Natural Curly Black Hair Extension, Layered — main view', 0, true),
  ('206', '/images/products/206/img-2.jpg', 'Natural Curly Black Hair Extension, Layered — detail view', 1, false),
  ('209', '/images/products/209/img-1.jpg', 'Curly Highlights Hair Extension — main view', 0, true),
  ('209', '/images/products/209/img-2.jpg', 'Curly Highlights Hair Extension — detail view', 1, false),
  ('210', '/images/products/210/img-1.jpg', 'Curly Black Hair Extension — main view', 0, true),
  ('210', '/images/products/210/img-2.jpg', 'Curly Black Hair Extension — detail view', 1, false)
) as v(code, image_url, alt_text, sort_order, is_primary) on v.code = p.code
where not exists (
  select 1 from product_images pi where pi.product_id = p.id and pi.image_url = v.image_url
);

-- ---------------------------------------------------------------------
-- product_hairstyles — which hairstyles each product suits.
-- This is what the Hairstyle Finder matches against.
-- ---------------------------------------------------------------------
insert into product_hairstyles (product_id, hairstyle_id)
select p.id, h.id
from (values
  ('201', 'soft-curls'), ('201', 'half-up-half-down'), ('201', 'long-flowing-curls'),
  ('202', 'soft-curls'), ('202', 'ponytail'), ('202', 'half-up-half-down'),
  ('203', 'soft-curls'), ('203', 'ponytail'),
  ('204', 'soft-curls'), ('204', 'half-up-half-down'),
  ('205', 'voluminous-curls'), ('205', 'bridal'), ('205', 'long-flowing-curls'),
  ('206', 'voluminous-curls'), ('206', 'braided'), ('206', 'bridal'),
  ('209', 'voluminous-curls'), ('209', 'waterfall-braid'),
  ('210', 'voluminous-curls'), ('210', 'ponytail'), ('210', 'braided')
) as v(code, style_slug)
join products p on p.code = v.code
join hairstyles h on h.slug = v.style_slug
on conflict (product_id, hairstyle_id) do nothing;

-- ---------------------------------------------------------------------
-- hairstyle_inspiration — Bridal / Hairstyle Inspiration content
-- ---------------------------------------------------------------------
insert into hairstyle_inspiration (slug, title, short_description, body, image_url, sort_order) values
  ('soft-curls-everyday-look', 'Soft Curls for an Everyday Glow',
   'Effortless, romantic waves you can wear any day of the week.',
   'Soft curls are the easiest way to add texture and movement without looking overdone. Clip in a wavy extension, run a curling wand through the ends for blend, and you''re ready — perfect for work, brunch, or a casual date.',
   '/images/products/201/img-1.jpg', 0),

  ('curly-bridal-hairstyle', 'Bridal Hairstyle: Voluminous Curls',
   'Full, elegant volume built to hold through your whole wedding day.',
   'For a bridal look that photographs beautifully and lasts from ceremony to reception, voluminous curly extensions add the fullness fine hair often needs. Pair with soft face-framing pieces for a timeless, romantic finish.',
   '/images/products/205/img-1.jpg', 1),

  ('long-ponytail-instant-length', 'The High Ponytail, Instantly Longer',
   'Add length and thickness to your go-to high pony in minutes.',
   'A high ponytail is a five-minute hairstyle — until you want it longer and fuller than your natural hair allows. Clip a wavy or curly extension underneath your own ponytail for instant length with no visible tracks.',
   '/images/products/210/img-1.jpg', 2)
on conflict (slug) do nothing;

insert into hairstyle_inspiration_products (inspiration_id, product_id, sort_order)
select i.id, p.id, v.sort_order
from (values
  ('soft-curls-everyday-look', '201', 0),
  ('soft-curls-everyday-look', '203', 1),
  ('curly-bridal-hairstyle', '205', 0),
  ('curly-bridal-hairstyle', '206', 1),
  ('long-ponytail-instant-length', '210', 0),
  ('long-ponytail-instant-length', '202', 1)
) as v(inspiration_slug, code, sort_order)
join hairstyle_inspiration i on i.slug = v.inspiration_slug
join products p on p.code = v.code
on conflict (inspiration_id, product_id) do nothing;
