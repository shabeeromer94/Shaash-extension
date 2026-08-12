# SHAASH Beauty Store

E-commerce site for SHAASH Beauty Store — synthetic hair extensions and hair
accessories. Next.js (App Router) + Supabase (Postgres, RLS) + Razorpay
(architecture in place, not yet wired to live payments), deployed on Vercel.

**First time here?** See [SETUP.md](SETUP.md) — it walks through creating the
Supabase project, running the SQL, and deploying.

## Stack

- **Next.js 16 (App Router)**, TypeScript, Tailwind CSS
- **Supabase** — Postgres database, no auth (guest checkout), Row Level
  Security locks catalog tables to public reads and order tables to the
  service-role key only (see [`supabase/schema.sql`](supabase/schema.sql))
- **Razorpay** — schema and checkout flow are ready for it; no live payment
  calls yet (see `TODO: Razorpay` in [`src/app/api/checkout/route.ts`](src/app/api/checkout/route.ts))

## Project structure

```
src/app/            Routes (Home, /shop, /products/[code], /hairstyles,
                     /inspiration, /about, /cart, /checkout, /api/checkout)
src/components/      UI grouped by domain: ui/, layout/, home/, product/,
                     shop/, hairstyles/, inspiration/, cart/, checkout/
src/lib/
  supabase/          client.ts (browser), server.ts (Server Components,
                     anon key), admin.ts (service-role, route handlers only)
  queries/           All Supabase reads — products, hairstyles, inspiration,
                     categories. Pages never query Supabase directly.
  types.ts           TypeScript types mirroring the DB schema
  cart-context.tsx    Client-side cart (React Context + localStorage)
supabase/
  schema.sql         Run once in the Supabase SQL Editor
  seed.sql           Starter catalog — 8 sample products, categories,
                     hairstyles, inspiration content
```

## Local development

```powershell
npm install
npm run dev
```

Requires a `.env.local` with your Supabase credentials — see
[SETUP.md](SETUP.md). Without it, the site still builds and runs; catalog
queries fail soft and pages just render empty until Supabase is configured.

## Commands

```powershell
npm run dev     # local dev server
npm run build   # production build
npm run start   # run the production build locally
npm run lint     # ESLint
```
