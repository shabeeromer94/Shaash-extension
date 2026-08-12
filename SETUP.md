# SETUP.md — What's Left on Your End

This project is scaffolded, built, and pushed to GitHub, but it can't show
real data or take real orders until you complete the steps below. Nothing
here requires touching code.

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account/project (any region is fine; note the DB password somewhere safe).
2. Once the project is ready, open **SQL Editor** in the left sidebar.
3. Open [`supabase/schema.sql`](supabase/schema.sql) from this repo, paste its full contents into a new query, and run it. This creates every table, index, trigger and RLS policy.
4. Open [`supabase/seed.sql`](supabase/seed.sql), paste it into a new query, and run it. This loads the 8 starter products, categories, hairstyles, and inspiration content. Safe to re-run.
5. Go to **Project Settings → API**. You'll need three values from this page in the next step:
   - **Project URL**
   - **anon public** key
   - **service_role** key (click "Reveal" — keep this one secret, never put it in client-side code or commit it)

## 2. Set environment variables

Copy [`.env.example`](.env.example) to a new file named `.env.local` in the project root, and fill in the three Supabase values from above:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`.env.local` is git-ignored — it never gets committed.

## 3. Run it locally

```powershell
npm install   # if you haven't already
npm run dev
```

Open http://localhost:3000. You should see the real 8-product catalog once
`.env.local` is filled in. Without it, the site still builds and runs — every
page just shows an empty state (this is intentional; see "Why some pages show
no products" below).

## 4. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com), sign in, and "Import Project" from your GitHub repo (`shabeeromer94/Shaash-extension`).
2. In the import screen (or Project Settings → Environment Variables afterward), add the same three variables from step 2, for **Production**, **Preview**, and **Development** environments.
3. Deploy. Every push to `main` will auto-redeploy.
4. Optional: set `NEXT_PUBLIC_SITE_URL` to your real Vercel/custom domain — it's used for SEO tags (Open Graph, canonical-style metadata).

## 5. Editing your catalog

There's no admin panel yet (by design, for this phase) — edit data directly in the Supabase **Table Editor**:

- **products** — edit price, stock_quantity, is_hidden, featured, description, etc. directly. Availability badges (In Stock / Low Stock / Out of Stock) are computed automatically from `stock_quantity` / `low_stock_threshold` / `is_hidden` — there's nothing else to keep in sync.
- **product_images** — add a row per image (`product_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`). See "Adding product photos" below for the `image_url` convention.
- **product_hairstyles** — links a product to the hairstyles it suits (drives the Hairstyle Finder). Add/remove rows to change matches.
- **hairstyles**, **categories**, **hairstyle_inspiration**, **hairstyle_inspiration_products** — same idea, edit/add rows directly.
- Changes appear on the live site within 60 seconds (pages use 60s ISR caching), or immediately on next deploy.

## 6. Adding product photos

1. Drop your images into `public/images/products/<product-code>/`, e.g. `public/images/products/211/img-1.jpg`.
2. Commit and push (or deploy) so the files ship with the site.
3. Add a matching row in the `product_images` table with `image_url` set to `/images/products/211/img-1.jpg` (leading slash, no `public` in the path).

The gallery component doesn't assume a fixed number of images — add as many rows per product as you like.

## 7. Why some pages show no products right now

The catalog queries are written to **fail soft**: if Supabase isn't reachable
(no project yet, wrong keys, schema not run), pages render with empty
results instead of crashing. You'll see a `[queries/...] ... is Supabase set
up?` message in the server logs when that happens — that's expected until
step 1–2 above are done, not a bug.

## 8. What's intentionally stubbed for later

- **Razorpay payments**: `/api/checkout` creates the order in the database
  with `status = pending_payment` and `payment_status = pending`, but never
  calls Razorpay. The order/customer/order_items schema already has the
  columns a real integration needs (`payment_provider`, `payment_status`,
  `payment_reference`). Search the repo for `TODO: Razorpay` to find the
  integration point.
- **Shipping cost**: currently hardcoded to ₹0 in `/api/checkout`. Replace
  with real shipping-rate logic when ready.
- **Customer accounts**: guest checkout only — no login/signup, by your
  earlier choice. The `customers` table just captures whoever checks out.
- **Admin panel**: none yet — use the Supabase Table Editor (see above).

## 9. Content placeholders to fill in before launch

Search the repo for `PLACEHOLDER` to find every spot with generic copy that
should be reviewed/replaced with real brand info:

- [src/app/about/page.tsx](src/app/about/page.tsx) — brand story, founder story, product philosophy, quality info (all bracketed placeholders).
- [src/components/layout/Footer.tsx](src/components/layout/Footer.tsx) — real contact email/phone.
- [src/components/home/WhyChooseUs.tsx](src/components/home/WhyChooseUs.tsx) and [src/components/home/TrustSection.tsx](src/components/home/TrustSection.tsx) — generic trust copy; confirm against your actual policies.
- [src/components/checkout/CheckoutForm.tsx](src/components/checkout/CheckoutForm.tsx) and [src/components/checkout/OrderConfirmationContent.tsx](src/components/checkout/OrderConfirmationContent.tsx) — "payment isn't live yet" messaging; update once Razorpay goes live.
- Hairstyle images (`hairstyles.image_url` in Supabase) are currently empty — the Shop by Hairstyle / Hairstyle Finder cards fall back to a plain styled card without a photo until you add one per row.

## Command reference

```powershell
npm run dev     # local dev server
npm run build   # production build (what Vercel runs)
npm run start   # run the production build locally
npm run lint    # ESLint
```
