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
-- hairstyles (Extension Finder taxonomy)
-- Upserts on slug (so re-running this updates name/description/sort_order/
-- image on an already-seeded database, not just skips), then removes any
-- category not in this list — the taxonomy below is the full, current set.
-- ---------------------------------------------------------------------
insert into hairstyles (slug, name, description, sort_order, image_url) values
  ('soft-curls', 'Soft Curls', 'Loose, romantic curls for an easy, everyday look.', 0, '/images/hairstyles/soft-curls.jpg'),
  ('braided', 'Braids', 'Extra length and body for clean, classic braids.', 1, '/images/hairstyles/braids.jpg'),
  ('half-up-half-down', 'Half-Up Half-Down', 'A classic style that mixes length with face-framing volume.', 2, '/images/hairstyles/half-up-half-down.jpg'),
  ('heart-braids', 'Heart Braids', 'A braid styled into a romantic heart shape — a favourite for engagements and pre-wedding shoots.', 3, '/images/hairstyles/heart-braids.jpg'),
  ('voluminous-curls', 'Voluminous Curls', 'Big, bouncy curls that add serious volume.', 4, '/images/hairstyles/voluminous-curls.jpg'),
  ('messy-braids', 'Messy Braids', 'A relaxed, textured braid with pulled-apart strands for effortless volume.', 5, '/images/hairstyles/messy-braids.jpg')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  image_url = excluded.image_url;

delete from hairstyles
where slug not in ('soft-curls', 'braided', 'half-up-half-down', 'heart-braids', 'voluminous-curls', 'messy-braids');

-- ---------------------------------------------------------------------
-- products
--
-- Colour naming: what earlier looked like plain "black" is actually Shade
-- #4 — a warm dark brown that suits Indian skin tones — and the
-- "Highlights" pieces are specifically brown-toned highlights. Both are
-- called out in the colour field and in each description.
--
-- `on conflict (code) do nothing` here on purpose: this only inserts codes
-- that don't exist yet. It deliberately never overwrites an existing
-- product's price/stock/etc., since those may already reflect real
-- decisions made live in Supabase. The colour-naming fix for the original
-- 201–210 batch (which predates this correction) is applied by the
-- explicit UPDATE block further down instead.
-- ---------------------------------------------------------------------
insert into products (
  code, name, description, price_inr, length_label, length_inches, texture, colour,
  category_id, stock_quantity, featured, tags, seo_title, seo_description
) values
  ('201', 'Natural Wavy Highlights Hair Extension, Layered',
   'Add instant length and soft, layered movement with this Natural Wavy Highlights Hair Extension. Finished with warm, brown-toned highlights for natural-looking dimension that blends seamlessly into your own hair.',
   600.00, '20 inch', 20.0, 'Wavy', 'Highlights (Brown Tones)',
   (select id from categories where slug = 'hair-extensions'), 25, true,
   array['layered', 'bestseller'],
   '201 Natural Wavy Highlights Hair Extension | SHAASH Beauty Store',
   'Shop the 201 Natural Wavy Highlights layered hair extension — 20 inch wavy texture with warm brown-toned highlights.'),

  ('202', 'Natural Wavy Dark Brown Hair Extension, Layered',
   'A rich Shade #4 dark brown wavy extension with soft layering for effortless volume — a warm tone that flatters Indian skin tones beautifully. Blends seamlessly for a look that''s instantly longer and fuller, without changing your natural colour.',
   600.00, '20 inch', 20.0, 'Wavy', 'Dark Brown (Shade #4)',
   (select id from categories where slug = 'hair-extensions'), 18, false,
   array['layered'],
   '202 Natural Wavy Dark Brown Hair Extension | SHAASH Beauty Store',
   'Shop the 202 Natural Wavy Dark Brown (Shade #4) layered hair extension — 20 inch wavy texture in a rich dark brown.'),

  ('203', 'Natural Wavy Highlights Hair Extension',
   'Soft waves finished with warm, brown-toned highlights — an easy way to add length and dimension to any look.',
   600.00, '18 inch', 18.0, 'Wavy', 'Highlights (Brown Tones)',
   (select id from categories where slug = 'hair-extensions'), 4, false,
   array[]::text[],
   '203 Natural Wavy Highlights Hair Extension | SHAASH Beauty Store',
   'Shop the 203 Natural Wavy Highlights hair extension — 18 inch wavy texture with warm brown-toned highlights.'),

  ('204', 'Natural Wavy Dark Brown Hair Extension',
   'A classic Shade #4 dark brown wavy extension for everyday length and volume — a warm tone that flatters Indian skin tones beautifully. Style straight from the pack or curl to match your look.',
   600.00, '18 inch', 18.0, 'Wavy', 'Dark Brown (Shade #4)',
   (select id from categories where slug = 'hair-extensions'), 0, false,
   array[]::text[],
   '204 Natural Wavy Dark Brown Hair Extension | SHAASH Beauty Store',
   'Shop the 204 Natural Wavy Dark Brown (Shade #4) hair extension — 18 inch wavy texture in a rich dark brown.'),

  ('205', 'Natural Curly Highlights Hair Extension, Layered',
   'Bold, bouncy curls finished with warm, brown-toned highlights and gentle layering for shape. Built for volume that holds — beautiful for everyday wear or dressed up for an occasion.',
   550.00, '22 inch', 22.0, 'Curly', 'Highlights (Brown Tones)',
   (select id from categories where slug = 'hair-extensions'), 30, true,
   array['layered', 'bestseller'],
   '205 Natural Curly Highlights Hair Extension | SHAASH Beauty Store',
   'Shop the 205 Natural Curly Highlights layered hair extension — 22 inch voluminous curls with warm brown-toned highlights.'),

  ('206', 'Natural Curly Dark Brown Hair Extension, Layered',
   'Rich Shade #4 dark brown curls with soft layering for shape and bounce — a warm tone that flatters Indian skin tones beautifully. A go-to for full, voluminous curls that still feel natural.',
   550.00, '22 inch', 22.0, 'Curly', 'Dark Brown (Shade #4)',
   (select id from categories where slug = 'hair-extensions'), 12, true,
   array['layered', 'bestseller'],
   '206 Natural Curly Dark Brown Hair Extension | SHAASH Beauty Store',
   'Shop the 206 Natural Curly Dark Brown (Shade #4) layered hair extension — 22 inch voluminous curls in a rich dark brown.'),

  ('209', 'Curly Highlights Hair Extension',
   'Playful, defined curls finished with warm, brown-toned highlights for extra dimension — an easy way to add volume and length in one step.',
   550.00, '16 inch', 16.0, 'Curly', 'Highlights (Brown Tones)',
   (select id from categories where slug = 'hair-extensions'), 3, false,
   array['new'],
   '209 Curly Highlights Hair Extension | SHAASH Beauty Store',
   'Shop the 209 Curly Highlights hair extension — 16 inch defined curls with warm brown-toned highlights.'),

  ('210', 'Curly Dark Brown Hair Extension',
   'Defined Shade #4 dark brown curls for instant volume and bounce — a warm tone that flatters Indian skin tones beautifully. A versatile everyday extension.',
   550.00, '16 inch', 16.0, 'Curly', 'Dark Brown (Shade #4)',
   (select id from categories where slug = 'hair-extensions'), 15, true,
   array['bestseller'],
   '210 Curly Dark Brown Hair Extension | SHAASH Beauty Store',
   'Shop the 210 Curly Dark Brown (Shade #4) hair extension — 16 inch defined curls in a rich dark brown.'),

  ('222', 'Natural Straight Dark Brown Hair Extension',
   'A sleek, straight hair extension in Shade #4 — a warm dark brown that flatters Indian skin tones beautifully. Lightweight and easy to wear, for instant length with a smooth, natural fall.',
   150.00, '23 inch', 23.0, 'Straight', 'Dark Brown (Shade #4)',
   (select id from categories where slug = 'hair-extensions'), 10, false,
   array['new'],
   '222 Natural Straight Dark Brown Hair Extension | SHAASH Beauty Store',
   'Shop the 222 Natural Straight Dark Brown (Shade #4) hair extension — 23 inch sleek, straight length.'),

  ('223', 'Natural Curly Highlights Hair Extension, Full Set',
   'A fuller, multi-clip curly set finished with warm, brown-toned highlights for natural-looking dimension. Built with extra wefts for maximum volume and bounce across the whole head.',
   600.00, '22 inch', 22.0, 'Curly', 'Highlights (Brown Tones)',
   (select id from categories where slug = 'hair-extensions'), 10, false,
   array['new', 'full-set'],
   '223 Natural Curly Highlights Hair Extension, Full Set | SHAASH Beauty Store',
   'Shop the 223 Natural Curly Highlights full-set hair extension — 22 inch voluminous curls with warm brown-toned highlights.'),

  ('224', 'Natural Curly Dark Brown Hair Extension, Full Set',
   'A fuller, multi-clip curly set in Shade #4 — a warm dark brown that flatters Indian skin tones beautifully. Built with extra wefts for maximum volume and bounce across the whole head.',
   600.00, '22 inch', 22.0, 'Curly', 'Dark Brown (Shade #4)',
   (select id from categories where slug = 'hair-extensions'), 10, false,
   array['new', 'full-set'],
   '224 Natural Curly Dark Brown Hair Extension, Full Set | SHAASH Beauty Store',
   'Shop the 224 Natural Curly Dark Brown (Shade #4) full-set hair extension — 22 inch voluminous curls in a rich dark brown.'),

  ('225', 'Natural Wavy Highlights Hair Extension, Layered',
   'Soft, layered waves finished with warm, brown-toned highlights for rich, natural-looking dimension. A longer length for dramatic, flowing volume.',
   600.00, '24 inch', 24.0, 'Wavy', 'Highlights (Brown Tones)',
   (select id from categories where slug = 'hair-extensions'), 10, false,
   array['layered', 'new'],
   '225 Natural Wavy Highlights Hair Extension | SHAASH Beauty Store',
   'Shop the 225 Natural Wavy Highlights layered hair extension — 24 inch wavy texture with warm brown-toned highlights.'),

  ('226', 'Natural Wavy Dark Brown Hair Extension, Layered',
   'Soft, layered waves in Shade #4 — a warm dark brown that flatters Indian skin tones beautifully. A longer length for effortless, flowing volume.',
   600.00, '24 inch', 24.0, 'Wavy', 'Dark Brown (Shade #4)',
   (select id from categories where slug = 'hair-extensions'), 10, false,
   array['layered', 'new'],
   '226 Natural Wavy Dark Brown Hair Extension | SHAASH Beauty Store',
   'Shop the 226 Natural Wavy Dark Brown (Shade #4) layered hair extension — 24 inch wavy texture in a rich dark brown.'),

  ('227', 'Natural Curly Highlights Hair Extension',
   'Loose curls finished with warm, brown-toned highlights for natural-looking dimension — an easy way to add volume and length in one step.',
   500.00, '22 inch', 22.0, 'Curly', 'Highlights (Brown Tones)',
   (select id from categories where slug = 'hair-extensions'), 10, false,
   array['new'],
   '227 Natural Curly Highlights Hair Extension | SHAASH Beauty Store',
   'Shop the 227 Natural Curly Highlights hair extension — 22 inch curls with warm brown-toned highlights.'),

  ('228', 'Natural Wavy Dark Brown Hair Extension',
   'A wavy hair extension in Shade #4 — a warm dark brown that flatters Indian skin tones beautifully. An easy, everyday length for instant volume.',
   500.00, '20-22 inch', 22.0, 'Wavy', 'Dark Brown (Shade #4)',
   (select id from categories where slug = 'hair-extensions'), 10, false,
   array['new'],
   '228 Natural Wavy Dark Brown Hair Extension | SHAASH Beauty Store',
   'Shop the 228 Natural Wavy Dark Brown (Shade #4) hair extension — 20-22 inch wavy texture in a rich dark brown.'),

  ('229', 'Natural Curly Highlights Hair Extension, Layered',
   'Playful, defined ringlet curls finished with warm, brown-toned highlights for extra dimension — an easy way to add volume and length in one step.',
   150.00, '22 inch', 22.0, 'Curly', 'Highlights (Brown Tones)',
   (select id from categories where slug = 'hair-extensions'), 10, false,
   array['layered', 'new'],
   '229 Natural Curly Highlights Hair Extension | SHAASH Beauty Store',
   'Shop the 229 Natural Curly Highlights layered hair extension — 22 inch ringlet curls with warm brown-toned highlights.'),

  ('230', 'Natural Wavy Dark Brown Hair Extension, Layered',
   'Soft waves with gentle curl at the ends, in Shade #4 — a warm dark brown that flatters Indian skin tones beautifully. A versatile everyday extension.',
   150.00, '22 inch', 22.0, 'Wavy', 'Dark Brown (Shade #4)',
   (select id from categories where slug = 'hair-extensions'), 10, false,
   array['layered', 'new'],
   '230 Natural Wavy Dark Brown Hair Extension | SHAASH Beauty Store',
   'Shop the 230 Natural Wavy Dark Brown (Shade #4) layered hair extension — 22 inch wavy texture in a rich dark brown.'),

  -- New Hair Accessories category products. Price/stock are placeholders
  -- (0) and is_hidden is true on purpose — the owner is filling in real
  -- price, size variants, and stock directly in Supabase; flip is_hidden to
  -- false (and set a real price_inr/stock_quantity) once ready to publish.
  -- Hair Donut comes in 2 materials, each its own product.
  ('301', 'Synthetic Hair Donut',
   'A synthetic hair donut ring that shapes a full, rounded bun in seconds — wrap your hair around it and secure for an instantly voluminous, salon-neat finish. Handy for everyday buns or as a base for bridal updos.',
   0.00, null, null, null, null,
   (select id from categories where slug = 'hair-accessories'), 0, false,
   array['accessory'],
   '301 Synthetic Hair Donut | SHAASH Beauty Store',
   'Shop the Synthetic Hair Donut — shape a full, voluminous bun in seconds.'),

  ('310', 'Sponge Hair Donut',
   'A soft sponge hair donut ring that shapes a full, rounded bun in seconds — wrap your hair around it and secure for an instantly voluminous, salon-neat finish. Handy for everyday buns or as a base for bridal updos.',
   0.00, null, null, null, null,
   (select id from categories where slug = 'hair-accessories'), 0, false,
   array['accessory'],
   '310 Sponge Hair Donut | SHAASH Beauty Store',
   'Shop the Sponge Hair Donut — shape a full, voluminous bun in seconds.'),

  -- Kunjalam comes in 5 distinct designs, each its own product (different
  -- ornamentation, different price) rather than one product with 5 photos.
  ('302', 'Kunjalam - Golden Beads',
   'A traditional South Indian jada kunjalam with a gold-toned cap and pearl-bead trim, finished with a black silk thread tassel. Handcrafted; used at the end of the braid (jadai) for Mugrutham hairstyle.',
   400.00, null, null, null, null,
   (select id from categories where slug = 'hair-accessories'), 0, false,
   array['accessory'],
   'Kunjalam - Golden Beads | SHAASH Beauty Store',
   'Shop the Kunjalam - Golden Beads braid tassel — a traditional decorative finish for bridal and festive braids.'),

  ('304', 'Kunjalam - Gold Plated',
   'A traditional South Indian jada kunjalam with a plain gold-toned double-dome cap and black silk thread tassel. Handcrafted; used at the end of the braid (jadai) for Mugrutham hairstyle.',
   350.00, null, null, null, null,
   (select id from categories where slug = 'hair-accessories'), 0, false,
   array['accessory'],
   'Kunjalam - Gold Plated | SHAASH Beauty Store',
   'Shop the Kunjalam - Gold Plated braid tassel — a traditional decorative finish for bridal and festive braids.'),

  ('305', 'Kunjalam - White Stones',
   'A traditional South Indian jada kunjalam with a gold-toned cap adorned with pearls and stones, finished with a black silk thread tassel. Handcrafted; used at the end of the braid (jadai) for Mugrutham hairstyle.',
   375.00, null, null, null, null,
   (select id from categories where slug = 'hair-accessories'), 0, false,
   array['accessory'],
   'Kunjalam - White Stones | SHAASH Beauty Store',
   'Shop the Kunjalam - White Stones braid tassel — a traditional decorative finish for bridal and festive braids.'),

  ('306', 'Kunjalam - Kemp Stone Big',
   'A traditional South Indian jada kunjalam with a gold-toned cap set with colourful kundan stones and pearls, finished with a black silk thread tassel. Handcrafted; used at the end of the braid (jadai) for Mugrutham hairstyle.',
   400.00, null, null, null, null,
   (select id from categories where slug = 'hair-accessories'), 0, false,
   array['accessory'],
   'Kunjalam - Kemp Stone Big | SHAASH Beauty Store',
   'Shop the Kunjalam - Kemp Stone Big braid tassel — a traditional decorative finish for bridal and festive braids.'),

  ('307', 'Kunjalam - Kemp Small',
   'A traditional South Indian jada kunjalam with a kundan stone and pearl-set double-dome cap, finished with a black silk thread tassel. Handcrafted; used at the end of the braid (jadai) for Mugrutham hairstyle.',
   350.00, null, null, null, null,
   (select id from categories where slug = 'hair-accessories'), 0, false,
   array['accessory'],
   'Kunjalam - Kemp Small | SHAASH Beauty Store',
   'Shop the Kunjalam - Kemp Small braid tassel — a traditional decorative finish for bridal and festive braids.'),

  ('303', 'Silk Poly Thread 0/8',
   'High quality silk poly thread, strong, smooth and ideal for all kinds of hair accessories — widely used for making kunjalam, veni, and other traditional hair adornments. Tangle-free with a neat, long-lasting finish. Net weight approx. 25 gms.',
   45.00, null, null, null, 'Black',
   (select id from categories where slug = 'hair-accessories'), 0, false,
   array['accessory'],
   'Silk Poly Thread 0/8 | SHAASH Beauty Store',
   'Shop the Silk Poly Thread 0/8 — strong, smooth black thread for kunjalam, veni and hair accessory work.'),

  ('308', 'Golden Thread',
   'Shiny and durable gold maggam thread used for traditional embroidery, handwork and hair accessories — easy to use and knot, ideal for tying, wrapping and decorative handwork. Polyester metallic thread, approx. 5 to 6 metres.',
   25.00, null, null, null, 'Gold',
   (select id from categories where slug = 'hair-accessories'), 0, false,
   array['accessory'],
   'Golden Thread | SHAASH Beauty Store',
   'Shop the Golden Thread — shiny metallic thread for traditional hair accessory and embroidery work.')
on conflict (code) do nothing;

-- Correction: the insert above never listed is_hidden, so these Hair
-- Accessories placeholders defaulted to visible instead of hidden as
-- originally intended. The owner wants to preview them on the live category
-- pages now, so they're explicitly unhidden here instead — price/stock are
-- still ₹0 placeholders until set for real in Supabase. Safe to re-run.
update products set is_hidden = false
where code in ('301', '302', '303', '304', '305', '306', '307', '308', '310');

-- Groups the Hair Accessories listings that are really multiple designs/
-- materials of one family, so /shop shows one tile per family instead of
-- one card per product (see accessory_group on the products table).
update products set accessory_group = 'Kunjalam' where code in ('302', '304', '305', '306', '307');
update products set accessory_group = 'Thread' where code in ('303', '308');

-- The Hair Accessory Needle (309) was added, then the owner decided not to
-- sell it — remove it entirely so a fresh seed never recreates it. Safe to
-- re-run (a no-op once already gone).
delete from product_images where product_id = (select id from products where code = '309');
delete from products where code = '309';
update products set accessory_group = 'Hair Donuts' where code in ('301', '310');

-- Correction: 301, 302, and 303 already existed before this round of
-- renames/splits (Hair Donut Bun Maker -> Synthetic Hair Donut, generic
-- Kunjalam -> Pearl Bead design, Hair Braiding Thread -> Silk Poly Thread
-- 0/8), so `on conflict (code) do nothing` above skipped re-applying their
-- new name/description — only brand-new codes got the new text. Explicit
-- updates here bypass that. Safe to re-run.
update products set
  name = 'Synthetic Hair Donut',
  description = 'A synthetic hair donut ring that shapes a full, rounded bun in seconds — wrap your hair around it and secure for an instantly voluminous, salon-neat finish. Handy for everyday buns or as a base for bridal updos.',
  seo_title = '301 Synthetic Hair Donut | SHAASH Beauty Store',
  seo_description = 'Shop the Synthetic Hair Donut — shape a full, voluminous bun in seconds.'
where code = '301';

update products set
  name = 'Kunjalam - Golden Beads',
  description = 'A traditional South Indian jada kunjalam with a gold-toned cap and pearl-bead trim, finished with a black silk thread tassel. Handcrafted; used at the end of the braid (jadai) for Mugrutham hairstyle.',
  price_inr = 400.00,
  seo_title = 'Kunjalam - Golden Beads | SHAASH Beauty Store',
  seo_description = 'Shop the Kunjalam - Golden Beads braid tassel — a traditional decorative finish for bridal and festive braids.'
where code = '302';

update products set
  name = 'Silk Poly Thread 0/8',
  description = 'High quality silk poly thread, strong, smooth and ideal for all kinds of hair accessories — widely used for making kunjalam, veni, and other traditional hair adornments. Tangle-free with a neat, long-lasting finish. Net weight approx. 25 gms.',
  colour = 'Black',
  price_inr = 45.00,
  seo_title = 'Silk Poly Thread 0/8 | SHAASH Beauty Store',
  seo_description = 'Shop the Silk Poly Thread 0/8 — strong, smooth black thread for kunjalam, veni and hair accessory work.'
where code = '303';

-- Same three codes also carry stale product_images rows from before their
-- photos were reorganized into per-design folders (e.g. 302 still pointing
-- at the old shared Kunjalam/img-2..5.PNG paths that no longer exist on
-- disk) — the INSERT further below only adds new rows, it never removes
-- old ones, so those need an explicit cleanup. Safe to re-run.
delete from product_images
where product_id = (select id from products where code = '301')
  and image_url <> '/images/products/Hair Accessories/Hair Donut Synthetic/img-1.PNG';
delete from product_images
where product_id = (select id from products where code = '302')
  and image_url <> '/images/products/Hair Accessories/Kunjalam - Pearl Bead/img-1.PNG';
delete from product_images
where product_id = (select id from products where code = '303')
  and image_url <> '/images/products/Hair Accessories/Thread/img-1.PNG';

-- ---------------------------------------------------------------------
-- Colour-naming correction for the original 201–210 batch, seeded before
-- "Natural Black" was corrected to Shade #4 dark brown. Only touches
-- name/colour/description/SEO text — never price, stock_quantity,
-- featured or is_hidden. Safe to re-run (a no-op once already corrected).
-- ---------------------------------------------------------------------
update products set
  name = 'Wavy Layered Soft Curls',
  colour = 'Highlights (Brown Tones)',
  description = 'Add instant length and soft, layered movement with this Natural Wavy Highlights Hair Extension. Finished with warm, brown-toned highlights for natural-looking dimension that blends seamlessly into your own hair.',
  seo_title = 'Wavy Layered Soft Curls | SHAASH Beauty Store',
  seo_description = 'Shop the Wavy Layered Soft Curls hair extension — 20 inch wavy texture with warm brown-toned highlights.'
where code = '201';

update products set
  name = 'Wavy Layered Soft Curls',
  colour = 'Dark Brown (Shade #4)',
  description = 'A rich Shade #4 dark brown wavy extension with soft layering for effortless volume — a warm tone that flatters Indian skin tones beautifully. Blends seamlessly for a look that''s instantly longer and fuller, without changing your natural colour.',
  seo_title = 'Wavy Layered Soft Curls | SHAASH Beauty Store',
  seo_description = 'Shop the Wavy Layered Soft Curls hair extension — 20 inch wavy texture in a rich dark brown.'
where code = '202';

update products set
  name = 'Wavy Soft Curls',
  colour = 'Highlights (Brown Tones)',
  description = 'Soft waves finished with warm, brown-toned highlights — an easy way to add length and dimension to any look.',
  seo_title = 'Wavy Soft Curls | SHAASH Beauty Store',
  seo_description = 'Shop the Wavy Soft Curls hair extension — 18 inch wavy texture with warm brown-toned highlights.'
where code = '203';

update products set
  name = 'Wavy Soft Curls',
  colour = 'Dark Brown (Shade #4)',
  description = 'A classic Shade #4 dark brown wavy extension for everyday length and volume — a warm tone that flatters Indian skin tones beautifully. Style straight from the pack or curl to match your look.',
  seo_title = 'Wavy Soft Curls | SHAASH Beauty Store',
  seo_description = 'Shop the Wavy Soft Curls hair extension — 18 inch wavy texture in a rich dark brown.'
where code = '204';

update products set
  name = 'Layered Curls',
  colour = 'Highlights (Brown Tones)',
  description = 'Bold, bouncy curls finished with warm, brown-toned highlights and gentle layering for shape. Built for volume that holds — beautiful for everyday wear or dressed up for an occasion.',
  seo_title = 'Layered Curls | SHAASH Beauty Store',
  seo_description = 'Shop the Layered Curls hair extension — 22 inch voluminous curls with warm brown-toned highlights.'
where code = '205';

update products set
  name = 'Layered Curls',
  colour = 'Dark Brown (Shade #4)',
  description = 'Rich Shade #4 dark brown curls with soft layering for shape and bounce — a warm tone that flatters Indian skin tones beautifully. A go-to for full, voluminous curls that still feel natural.',
  seo_title = 'Layered Curls | SHAASH Beauty Store',
  seo_description = 'Shop the Layered Curls hair extension — 22 inch voluminous curls in a rich dark brown.'
where code = '206';

update products set
  name = 'Wedding Open Curls',
  colour = 'Highlights (Brown Tones)',
  description = 'Playful, defined curls finished with warm, brown-toned highlights for extra dimension — an easy way to add volume and length in one step.',
  seo_title = 'Wedding Open Curls | SHAASH Beauty Store',
  seo_description = 'Shop the Wedding Open Curls hair extension — 16 inch defined curls with warm brown-toned highlights.'
where code = '209';

update products set
  name = 'Wedding Open Curls',
  colour = 'Dark Brown (Shade #4)',
  description = 'Defined Shade #4 dark brown curls for instant volume and bounce — a warm tone that flatters Indian skin tones beautifully. A versatile everyday extension.',
  seo_title = 'Wedding Open Curls | SHAASH Beauty Store',
  seo_description = 'Shop the Wedding Open Curls hair extension — 16 inch defined curls in a rich dark brown.'
where code = '210';

-- Matching fix for photo alt text on the same 4 renamed codes (202/204/206/210).
update product_images set alt_text = replace(alt_text, 'Natural Wavy Black', 'Natural Wavy Dark Brown')
where product_id = (select id from products where code = '202');
update product_images set alt_text = replace(alt_text, 'Natural Wavy Black', 'Natural Wavy Dark Brown')
where product_id = (select id from products where code = '204');
update product_images set alt_text = replace(alt_text, 'Natural Curly Black', 'Natural Curly Dark Brown')
where product_id = (select id from products where code = '206');
update product_images set alt_text = replace(alt_text, 'Curly Black', 'Curly Dark Brown')
where product_id = (select id from products where code = '210');

-- ---------------------------------------------------------------------
-- Name correction for the 222–230 batch, seeded before these got their
-- style-based names. Only touches name/colour(222 only)/seo_title/
-- seo_description — never price, stock_quantity, featured or is_hidden.
-- Safe to re-run (a no-op once already corrected).
-- ---------------------------------------------------------------------
update products set
  name = 'Straight Patch',
  colour = 'Shade #2',
  seo_title = 'Straight Patch | SHAASH Beauty Store',
  seo_description = 'Shop the Straight Patch hair extension — 23 inch straight texture.'
where code = '222';

update products set
  name = 'Curly Patches',
  seo_title = 'Curly Patches | SHAASH Beauty Store',
  seo_description = 'Shop the Curly Patches hair extension — 22 inch curly texture with warm brown-toned highlights.'
where code = '223';

update products set
  name = 'Curly Patches',
  seo_title = 'Curly Patches | SHAASH Beauty Store',
  seo_description = 'Shop the Curly Patches hair extension — 22 inch curly texture in a rich dark brown.'
where code = '224';

update products set
  name = 'Long Messy Wavy Curls',
  seo_title = 'Long Messy Wavy Curls | SHAASH Beauty Store',
  seo_description = 'Shop the Long Messy Wavy Curls hair extension — 24 inch wavy texture with warm brown-toned highlights.'
where code = '225';

update products set
  name = 'Long Messy Wavy Curls',
  seo_title = 'Long Messy Wavy Curls | SHAASH Beauty Store',
  seo_description = 'Shop the Long Messy Wavy Curls hair extension — 24 inch wavy texture in a rich dark brown.'
where code = '226';

update products set
  name = 'Short Soft Curls',
  seo_title = 'Short Soft Curls | SHAASH Beauty Store',
  seo_description = 'Shop the Short Soft Curls hair extension — 22 inch curly texture with warm brown-toned highlights.'
where code = '227';

update products set
  name = 'Short Soft Curls',
  seo_title = 'Short Soft Curls | SHAASH Beauty Store',
  seo_description = 'Shop the Short Soft Curls hair extension — 20-22 inch wavy texture in a rich dark brown.'
where code = '228';

update products set
  name = 'Curls Patch',
  seo_title = 'Curls Patch | SHAASH Beauty Store',
  seo_description = 'Shop the Curls Patch hair extension — 22 inch curly texture with warm brown-toned highlights.'
where code = '229';

update products set
  name = 'Curls Patch',
  seo_title = 'Curls Patch | SHAASH Beauty Store',
  seo_description = 'Shop the Curls Patch hair extension — 22 inch wavy texture in a rich dark brown.'
where code = '230';

-- ---------------------------------------------------------------------
-- Shared inventory: these 4 pairs are the same physical stock listed under
-- two product codes (e.g. 210 and 204 are one bundle in the stockroom, sold
-- as two catalog entries). Grouping them here means /api/checkout and
-- /api/checkout/verify keep both codes' stock_quantity in sync automatically
-- from now on — buying either one decrements both. Only touches
-- stock_group; never price/stock_quantity/featured/is_hidden. Safe to re-run.
-- ---------------------------------------------------------------------
update products set stock_group = 'group-201-205' where code in ('201', '205');
update products set stock_group = 'group-202-206' where code in ('202', '206');
update products set stock_group = 'group-203-209' where code in ('203', '209');
update products set stock_group = 'group-204-210' where code in ('204', '210');

-- Correction: the 22 original Hair Extensions codes (201-210, 222-230) had
-- their photos moved from public/images/products/<code>/ into
-- public/images/products/Hair Extensions/<code>/ earlier — but the insert
-- below only ever adds rows for the new path, it never removes the old flat
-- path rows from before the move, so every one of these products ended up
-- with both a working row and a dead one, and the page was randomly
-- picking whichever sorted first. This removes anything that isn't under
-- the current Hair Extensions/ folder. Safe to re-run.
delete from product_images pi
using products p
where pi.product_id = p.id
  and p.code in ('201', '202', '203', '204', '205', '206', '209', '210',
                 '222', '223', '224', '225', '226', '227', '228', '229', '230')
  and pi.image_url not like '/images/products/Hair Extensions/%';

-- ---------------------------------------------------------------------
-- product_images
-- Paths match public/images/products/<Category Folder>/<code-or-name>/img-N.ext
-- — e.g. Hair Extensions/201/img-1.jpg, Hair Accessories/Kunjalam/img-1.PNG.
-- Add more rows here as you add more photos per product.
-- ---------------------------------------------------------------------
insert into product_images (product_id, image_url, alt_text, sort_order, is_primary)
select p.id, v.image_url, v.alt_text, v.sort_order, v.is_primary
from products p
join (values
  ('201', '/images/products/Hair Extensions/201/img-1.jpg', 'Natural Wavy Highlights Hair Extension, Layered — main view', 0, true),
  ('201', '/images/products/Hair Extensions/201/img-2.jpg', 'Natural Wavy Highlights Hair Extension, Layered — detail view', 1, false),
  ('202', '/images/products/Hair Extensions/202/img-1.jpg', 'Natural Wavy Dark Brown Hair Extension, Layered — main view', 0, true),
  ('202', '/images/products/Hair Extensions/202/img-2.jpg', 'Natural Wavy Dark Brown Hair Extension, Layered — detail view', 1, false),
  ('203', '/images/products/Hair Extensions/203/img-1.jpg', 'Natural Wavy Highlights Hair Extension — main view', 0, true),
  ('203', '/images/products/Hair Extensions/203/img-2.jpg', 'Natural Wavy Highlights Hair Extension — detail view', 1, false),
  ('204', '/images/products/Hair Extensions/204/img-1.jpg', 'Natural Wavy Dark Brown Hair Extension — main view', 0, true),
  ('204', '/images/products/Hair Extensions/204/img-2.jpg', 'Natural Wavy Dark Brown Hair Extension — detail view', 1, false),
  ('205', '/images/products/Hair Extensions/205/img-1.jpg', 'Natural Curly Highlights Hair Extension, Layered — main view', 0, true),
  ('205', '/images/products/Hair Extensions/205/img-2.jpg', 'Natural Curly Highlights Hair Extension, Layered — detail view', 1, false),
  ('206', '/images/products/Hair Extensions/206/img-1.jpg', 'Natural Curly Dark Brown Hair Extension, Layered — main view', 0, true),
  ('206', '/images/products/Hair Extensions/206/img-2.jpg', 'Natural Curly Dark Brown Hair Extension, Layered — detail view', 1, false),
  ('209', '/images/products/Hair Extensions/209/img-1.jpg', 'Curly Highlights Hair Extension — main view', 0, true),
  ('209', '/images/products/Hair Extensions/209/img-2.jpg', 'Curly Highlights Hair Extension — detail view', 1, false),
  ('210', '/images/products/Hair Extensions/210/img-1.jpg', 'Curly Dark Brown Hair Extension — main view', 0, true),
  ('210', '/images/products/Hair Extensions/210/img-2.jpg', 'Curly Dark Brown Hair Extension — detail view', 1, false),
  ('222', '/images/products/Hair Extensions/222/img-1.jpg', 'Natural Straight Dark Brown Hair Extension — main view', 0, true),
  ('222', '/images/products/Hair Extensions/222/img-2.jpg', 'Natural Straight Dark Brown Hair Extension — detail view', 1, false),
  ('223', '/images/products/Hair Extensions/223/img-1.jpg', 'Natural Curly Highlights Hair Extension, Full Set — main view', 0, true),
  ('223', '/images/products/Hair Extensions/223/img-2.jpg', 'Natural Curly Highlights Hair Extension, Full Set — detail view', 1, false),
  ('224', '/images/products/Hair Extensions/224/img-1.jpg', 'Natural Curly Dark Brown Hair Extension, Full Set — main view', 0, true),
  ('224', '/images/products/Hair Extensions/224/img-2.jpg', 'Natural Curly Dark Brown Hair Extension, Full Set — detail view', 1, false),
  ('225', '/images/products/Hair Extensions/225/img-1.jpg', 'Natural Wavy Highlights Hair Extension, Layered — main view', 0, true),
  ('225', '/images/products/Hair Extensions/225/img-2.jpg', 'Natural Wavy Highlights Hair Extension, Layered — detail view', 1, false),
  ('226', '/images/products/Hair Extensions/226/img-1.jpg', 'Natural Wavy Dark Brown Hair Extension, Layered — main view', 0, true),
  ('226', '/images/products/Hair Extensions/226/img-2.jpg', 'Natural Wavy Dark Brown Hair Extension, Layered — detail view', 1, false),
  ('227', '/images/products/Hair Extensions/227/img-1.jpg', 'Natural Curly Highlights Hair Extension — main view', 0, true),
  ('227', '/images/products/Hair Extensions/227/img-2.jpg', 'Natural Curly Highlights Hair Extension — detail view', 1, false),
  ('228', '/images/products/Hair Extensions/228/img-1.jpg', 'Natural Wavy Dark Brown Hair Extension — main view', 0, true),
  ('228', '/images/products/Hair Extensions/228/img-2.jpg', 'Natural Wavy Dark Brown Hair Extension — detail view', 1, false),
  ('229', '/images/products/Hair Extensions/229/img-1.jpg', 'Natural Curly Highlights Hair Extension, Layered — main view', 0, true),
  ('229', '/images/products/Hair Extensions/229/img-2.jpg', 'Natural Curly Highlights Hair Extension, Layered — detail view', 1, false),
  ('230', '/images/products/Hair Extensions/230/img-1.jpg', 'Natural Wavy Dark Brown Hair Extension, Layered — main view', 0, true),
  ('230', '/images/products/Hair Extensions/230/img-2.jpg', 'Natural Wavy Dark Brown Hair Extension, Layered — detail view', 1, false),
  ('301', '/images/products/Hair Accessories/Hair Donut Synthetic/img-1.PNG', 'Synthetic Hair Donut — main view', 0, true),
  ('310', '/images/products/Hair Accessories/Hair Donut Sponge/img-1.PNG', 'Sponge Hair Donut — main view', 0, true),
  ('310', '/images/products/Hair Accessories/Hair Donut Sponge/img-2.PNG', 'Sponge Hair Donut — size variant', 1, false),
  ('302', '/images/products/Hair Accessories/Kunjalam - Pearl Bead/img-1.PNG', 'Kunjalam - Golden Beads', 0, true),
  ('304', '/images/products/Hair Accessories/Kunjalam - Double Dome Plain/img-1.PNG', 'Kunjalam - Gold Plated', 0, true),
  ('305', '/images/products/Hair Accessories/Kunjalam - Pearl Stone/img-1.PNG', 'Kunjalam - White Stones', 0, true),
  ('306', '/images/products/Hair Accessories/Kunjalam - Kundan Stone/img-1.PNG', 'Kunjalam - Kemp Stone Big', 0, true),
  ('307', '/images/products/Hair Accessories/Kunjalam - Kundan Double Dome/img-1.PNG', 'Kunjalam - Kemp Small', 0, true),
  ('303', '/images/products/Hair Accessories/Thread/img-1.PNG', 'Silk Poly Thread 0/8 — main view', 0, true),
  ('308', '/images/products/Hair Accessories/Maggam Thread Gold/img-1.PNG', 'Golden Thread — main view', 0, true)
) as v(code, image_url, alt_text, sort_order, is_primary) on v.code = p.code
where not exists (
  select 1 from product_images pi where pi.product_id = p.id and pi.image_url = v.image_url
);

-- ---------------------------------------------------------------------
-- product_variants — size/price options. Only the Sponge Hair Donut has
-- these for now; stock_quantity per size is left at 0 (placeholder) until
-- the owner sets real counts in Supabase, same as every other new product.
-- ---------------------------------------------------------------------
insert into product_variants (product_id, label, price_inr, stock_quantity, sort_order)
select p.id, v.label, v.price_inr, v.stock_quantity, v.sort_order
from products p
join (values
  ('310', 'Small', 40.00, 0, 0),
  ('310', 'Medium', 55.00, 0, 1),
  ('310', 'Big', 75.00, 0, 2)
) as v(code, label, price_inr, stock_quantity, sort_order) on v.code = p.code
where not exists (
  select 1 from product_variants pv where pv.product_id = p.id and pv.label = v.label
);

-- The product row's own price_inr/stock_quantity are display fallbacks for
-- a variant product (see product_variants above) — set to the cheapest
-- size so "From ₹..." on /shop shows something sensible even before any
-- individual variant stock is confirmed.
update products set price_inr = 40.00 where code = '310';

-- ---------------------------------------------------------------------
-- product_hairstyles — which hairstyles each product suits.
-- This is what the Extension Finder matches against. Cleared and
-- reinserted in full each run (rather than on-conflict-skip) since the
-- mapping below is a complete redefinition, not an incremental addition —
-- re-running this always converges to exactly this set.
-- ---------------------------------------------------------------------
delete from product_hairstyles;

insert into product_hairstyles (product_id, hairstyle_id)
select p.id, h.id
from (values
  ('204', 'soft-curls'), ('202', 'soft-curls'), ('203', 'soft-curls'), ('201', 'soft-curls'),
  ('206', 'braided'), ('205', 'braided'),
  ('210', 'half-up-half-down'), ('209', 'half-up-half-down'),
  ('210', 'heart-braids'), ('204', 'heart-braids'), ('209', 'heart-braids'), ('203', 'heart-braids'),
  ('210', 'voluminous-curls'), ('209', 'voluminous-curls'),
  ('206', 'messy-braids'), ('205', 'messy-braids'),

  ('222', 'half-up-half-down'), ('222', 'heart-braids'),
  ('223', 'voluminous-curls'), ('223', 'messy-braids'), ('223', 'braided'),
  ('224', 'voluminous-curls'), ('224', 'braided'), ('224', 'messy-braids'),
  ('225', 'soft-curls'), ('225', 'half-up-half-down'),
  ('226', 'soft-curls'), ('226', 'half-up-half-down'), ('226', 'heart-braids'),
  ('227', 'half-up-half-down'), ('227', 'voluminous-curls'), ('227', 'heart-braids'),
  ('228', 'soft-curls'), ('228', 'heart-braids'),
  ('229', 'voluminous-curls'), ('229', 'heart-braids'), ('229', 'messy-braids'),
  ('230', 'soft-curls'), ('230', 'half-up-half-down'),

  -- Hair Accessories: thread works with any hairstyle, so it's linked to
  -- all six; kunjalam (all 5 designs) is specifically a messy-braids piece.
  ('303', 'soft-curls'), ('303', 'braided'), ('303', 'half-up-half-down'),
  ('303', 'heart-braids'), ('303', 'voluminous-curls'), ('303', 'messy-braids'),
  ('308', 'soft-curls'), ('308', 'braided'), ('308', 'half-up-half-down'),
  ('308', 'heart-braids'), ('308', 'voluminous-curls'), ('308', 'messy-braids'),
  ('302', 'messy-braids'), ('304', 'messy-braids'), ('305', 'messy-braids'),
  ('306', 'messy-braids'), ('307', 'messy-braids')
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
   '/images/products/Hair Extensions/201/img-1.jpg', 0),

  ('curly-bridal-hairstyle', 'Bridal Hairstyle: Voluminous Curls',
   'Full, elegant volume built to hold through your whole wedding day.',
   'For a bridal look that photographs beautifully and lasts from ceremony to reception, voluminous curly extensions add the fullness fine hair often needs. Pair with soft face-framing pieces for a timeless, romantic finish.',
   '/images/products/Hair Extensions/205/img-1.jpg', 1),

  ('long-ponytail-instant-length', 'The High Ponytail, Instantly Longer',
   'Add length and thickness to your go-to high pony in minutes.',
   'A high ponytail is a five-minute hairstyle — until you want it longer and fuller than your natural hair allows. Clip a wavy or curly extension underneath your own ponytail for instant length with no visible tracks.',
   '/images/products/Hair Extensions/210/img-1.jpg', 2)
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
