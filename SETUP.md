# SETUP.md — What's Left on Your End

This project is scaffolded, built, and pushed to GitHub, but it can't show
real data or take real orders until you complete the steps below. Nothing
here requires touching code.

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account/project (any region is fine; note the DB password somewhere safe).
2. Once the project is ready, open **SQL Editor** in the left sidebar.
3. Open [`supabase/schema.sql`](supabase/schema.sql) from this repo, paste its full contents into a new query, and run it. This creates every table, index, trigger and RLS policy.
4. Open [`supabase/seed.sql`](supabase/seed.sql), paste it into a new query, and run it. This loads the 8 starter products, categories, hairstyles, and inspiration content. Safe to re-run.
   - `schema.sql` itself is also safe to re-run any time — whenever you pull code that touches it (new columns, new migration blocks), just re-run the whole file in the SQL Editor again. Existing tables/data are left alone; only the new bits get applied.
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
4. Set `NEXT_PUBLIC_SITE_URL` to whatever's actually live right now (the `*.vercel.app` URL Vercel gives you, or `https://shaashbeautystore.com` once step 5 below is done) — it's used for SEO tags (Open Graph, canonical-style metadata).

## 5. Connect shaashbeautystore.com

The site defaults to `shaashbeautystore.com` in its SEO tags already
([layout.tsx](src/app/layout.tsx)), so this is just plugging the domain in —
no further code changes needed.

1. In Vercel: your project → **Settings → Domains** → enter
   `shaashbeautystore.com` → **Add**. Also add `www.shaashbeautystore.com`
   if you want both to work (Vercel will offer to redirect one to the
   other — pick whichever you want as the canonical address).
2. Vercel shows you the exact DNS record(s) to add — usually an `A` record
   (for the root domain) and/or a `CNAME` (for `www`).
3. Go to wherever you bought the domain (registrar) → DNS settings → add
   those records exactly as Vercel shows them.
4. Wait for DNS to propagate (usually minutes, can take a few hours) —
   Vercel's Domains page shows a ✓ once it's verified, and issues an SSL
   certificate automatically.
5. Update `NEXT_PUBLIC_SITE_URL` in Vercel's **Environment Variables**
   (Production) to `https://shaashbeautystore.com`, then redeploy.

I can't do any of this part myself — it needs your Vercel and domain
registrar logins.

## 6. Editing your catalog

There's no admin panel yet (by design, for this phase) — edit data directly in the Supabase **Table Editor**:

- **products** — edit price, stock_quantity, is_hidden, featured, description, etc. directly. Availability badges (In Stock / Low Stock / Out of Stock) are computed automatically from `stock_quantity` / `low_stock_threshold` / `is_hidden` — there's nothing else to keep in sync.
  - **Shared inventory**: a few codes are the same physical stock listed under two product pages — 201/205, 202/206, 203/209, and 204/210. These stay in sync automatically no matter how the number changes — a customer buying either one, or you typing a new `stock_quantity` into either row in the Table Editor, mirrors to its paired code within the database itself (a trigger — see `sync_stock_group()` in `schema.sql`). You only ever need to edit one of the two; the other updates itself a moment later (Table Editor may need a refresh to show it). (A product's `stock_group` column being non-null is what marks it as shared, and shows which codes are linked — codes with a blank/null `stock_group` are normal, independent stock.)
- **product_images** — add a row per image (`product_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`). See "Adding product photos" below for the `image_url` convention.
- **product_variants** — size/price options for a single product page (e.g. the Sponge Hair Donut's Small/Medium/Big). Add a row per size (`product_id`, `label`, `price_inr`, `stock_quantity`, `sort_order`) and the product page automatically shows a size picker instead of a single price — customers pick one before adding to cart, and stock/price are tracked per size from then on (checkout, order emails, and the order_summary view all show which size was bought). A product with zero rows here is just sold at its own price/stock as normal — nothing else to configure.
- **product_hairstyles** — links a product to the hairstyles it suits (drives the Hairstyle Finder). Add/remove rows to change matches.
- **hairstyles**, **categories**, **hairstyle_inspiration**, **hairstyle_inspiration_products** — same idea, edit/add rows directly.
- Changes appear on the live site within 60 seconds (pages use 60s ISR caching), or immediately on next deploy.

## 7. Adding product photos

1. Drop your images into `public/images/products/<Category Folder>/<product-code-or-name>/`, matching the existing layout — e.g. `public/images/products/Hair Extensions/211/img-1.jpg` or `public/images/products/Hair Accessories/Kunjalam/img-1.PNG`.
2. Commit and push (or deploy) so the files ship with the site.
3. Add a matching row in the `product_images` table with `image_url` set to the same path with a leading slash and no `public` — e.g. `/images/products/Hair Extensions/211/img-1.jpg`.

The gallery component doesn't assume a fixed number of images — add as many rows per product as you like.

**Important — spelling and capitalization must match exactly.** Your computer treats `Hair Accessories` and `hair accessories` as the same folder, but the live site (Vercel, running on Linux) does not — a mismatch between the folder name on disk and the `image_url` you type into Supabase will 404 in production even though it looks fine locally. Stick to whatever exact casing you've already used for a category/product folder once you've picked it.

## 8. Why some pages show no products right now

The catalog queries are written to **fail soft**: if Supabase isn't reachable
(no project yet, wrong keys, schema not run), pages render with empty
results instead of crashing. You'll see a `[queries/...] ... is Supabase set
up?` message in the server logs when that happens — that's expected until
step 1–2 above are done, not a bug.

## 9. Set up Razorpay (test mode)

Checkout is wired to Razorpay end-to-end: `/api/checkout` opens a Razorpay
order (writing nothing to Supabase yet), the browser opens Razorpay's
Checkout modal, and only once `/api/checkout/verify` confirms the payment
signature server-side does it create the actual order — as `confirmed` /
`paid` directly. No npm package involved — it's plain REST calls plus
Node's `crypto` for signature verification.

This means a failed, cancelled, or abandoned payment never creates an order
row or touches stock — there's nothing to clean up in Supabase for it. The
customer just lands back on the checkout page with an error and a "Retry
Payment" button, reusing the same Razorpay order rather than starting over.

1. Create a free [Razorpay](https://dashboard.razorpay.com/signup) account.
2. In the dashboard, make sure you're in **Test Mode** (toggle top-right).
3. Go to **Settings → API Keys** and generate a Test key pair.
4. Add both to `.env.local`:
   ```
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   ```
5. Restart `npm run dev`. Checkout now opens a real Razorpay modal — use
   [Razorpay's test card numbers](https://razorpay.com/docs/payments/payments/test-card-details/)
   (e.g. `4111 1111 1111 1111`, any future expiry, any CVV) to complete a
   test payment.
6. **Going live**: once your Razorpay account passes KYC/activation, generate
   a Live Mode key pair from the same **Settings → API Keys** page and swap
   the two env vars (locally and in Vercel's Project Settings → Environment
   Variables). Nothing in the code changes — the key id/secret are read from
   env on every request.

   The "(test mode)" wording on the checkout and confirmation pages is
   **not** hardcoded — it's computed from whether `RAZORPAY_KEY_ID` starts
   with `rzp_live_` vs `rzp_test_`. If the site still shows "test mode"
   after you've generated live keys, it means the `rzp_live_...` pair hasn't
   actually been set yet in whichever environment you're looking at:
   `.env.local` for `npm run dev`, or Vercel's **Project Settings →
   Environment Variables** (Production) for the deployed site — these are
   separate, updating one doesn't update the other. Redeploy (or restart
   `npm run dev`) after changing either.

- **Shipping cost**: currently hardcoded to ₹0 in `/api/checkout`. Replace
  with real shipping-rate logic when ready.
- **Customer accounts**: guest checkout only — no login/signup, by your
  earlier choice. The `customers` table just captures whoever checks out.
- **Admin panel**: none yet — use the Supabase Table Editor (see above).

## 10. Get order notifications on Telegram (optional)

Every time a payment is verified, `/api/checkout/verify` sends a message —
customer name, phone, full address, and the products ordered — to a
Telegram chat of your choice. It's entirely optional: if it's not
configured, checkout just skips this step silently.

1. **Create a bot**: message [@BotFather](https://t.me/BotFather) on
   Telegram, send `/newbot`, and follow the prompts. It replies with a
   token that looks like `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` —
   that's `TELEGRAM_BOT_TOKEN`.
2. **Get your chat id**:
   - For a personal chat: open a chat with your new bot and send it any
     message first (bots can't message you until you've messaged them).
     Then visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a
     browser — your chat id is the number at `result[0].message.chat.id`.
   - For a group: add the bot to the group, send a message in the group,
     then visit the same URL — the group's chat id will be a negative
     number.
3. Add both to `.env.local`:
   ```
   TELEGRAM_BOT_TOKEN=123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TELEGRAM_CHAT_ID=your-chat-id
   ```
4. Restart `npm run dev` (or redeploy, if setting this in Vercel). Complete
   a test payment — you should get a message within a couple of seconds of
   landing on the confirmation page.

Since this only fires from `/api/checkout/verify`, you'll only ever be
notified for orders that were actually paid — never for failed or abandoned
payments.

## 11. Content placeholders to fill in before launch

Search the repo for `PLACEHOLDER` to find every spot with generic copy that
should be reviewed/replaced with real brand info:

- [src/components/layout/Footer.tsx](src/components/layout/Footer.tsx) — real support email (the WhatsApp number is already real).
- [src/components/home/WhyChooseUs.tsx](src/components/home/WhyChooseUs.tsx) and [src/components/home/TrustSection.tsx](src/components/home/TrustSection.tsx) — generic trust copy; confirm against your actual policies.
- Razorpay checkout copy already says "test mode" in [CheckoutForm.tsx](src/components/checkout/CheckoutForm.tsx) and [OrderConfirmationContent.tsx](src/components/checkout/OrderConfirmationContent.tsx) — drop that phrase from both once you've switched to Live Mode keys (step 9 above).

## 12. Browsing orders

The raw `orders` table mixes fulfilment fields (name, address, phone) with
bookkeeping ones (payment ids, timestamps) in no particular order, and
doesn't show what was actually purchased (that's in a separate
`order_items` table). For a cleaner view, use the **`order_summary`** view
instead — it's created by `schema.sql`, so re-run that file in the SQL
Editor if you set up your database before this existed.

In Supabase: **Table Editor → order_summary**. It surfaces, in this order:
`order_number`, `customer_name`, `phone`, `delivery_method`, `full_address`,
`products_ordered` — then every other order field afterward. It's read-only
and only visible from the dashboard/SQL Editor (not the public API), so it's
safe to browse without affecting the storefront or exposing customer data
publicly.

## Command reference

```powershell
npm run dev     # local dev server
npm run build   # production build (what Vercel runs)
npm run start   # run the production build locally
npm run lint    # ESLint
```
