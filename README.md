# The Cozy Flame · Storefront

Website for **The Cozy Flame**, a handcrafted candle brand in California's 209. Built by AMAGENCY.

> **Status: preview build.** Products, photos and copy are drafts for client review. Checkout is disabled and every form confirms on screen without sending anything. Search engines are blocked until launch.

## Stack

- [Next.js 15](https://nextjs.org) (App Router: static store pages refreshed on every portal save) + React 19 + TypeScript
- Plain CSS design system in `app/globals.css` (palette sampled from the logo)
- Fonts: Cormorant Garamond (headings) and Jost (body) via `next/font`
- Planned at launch: Shopify (Basic) for products, orders and checkout, hosted on Vercel

## Client portal (`/portal`)

A private studio where the owner adds, edits, hides and deletes products and uploads photos. Changes go live on the store within seconds. The footer has a **Client login** link.

| Page | What it does |
| --- | --- |
| `/portal/login` | Sign in (username `thecozyflame` unless `PORTAL_USERNAME` is set) |
| `/portal/setup` | Owner creates their password; the browser turns it into a one-way studio key |
| `/portal` | Overview: live, coming soon and hidden counts, recent changes |
| `/portal/products` | Search and filter every product |
| `/portal/products/new` and `/portal/products/[slug]` | Editor with photo upload, scent notes, price, status and a live store preview |

**Switching it on in Vercel** (project `cozyflame209`):

1. **Storage:** Storage → Create → Blob → connect it to `cozyflame209`. This adds `BLOB_READ_WRITE_TOKEN`.
2. **Password:** the owner opens `/portal/setup`, picks a password and copies the studio key. Add it as `PORTAL_PASSWORD_HASH` (Production and Preview).
3. Redeploy.

**Security:** password stored only as a PBKDF2-SHA256 key (600,000 rounds); signed, HttpOnly session cookie that expires after 12 hours; every page, action and upload checks the session, with middleware in front; sign-in throttling; portal pages are never cached, framed or indexed. Changing the password signs every device out.

**Data:** the catalog is a versioned JSON file in Vercel Blob (last 20 versions kept). Photos are resized in the browser before upload. Without storage, the store shows the starting catalog and the portal can't save.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build + type check
```

To try the portal locally, put `PORTAL_LOCAL_STORE=1` and a `PORTAL_PASSWORD_HASH` (from `/portal/setup` or `npm run portal:hash -- "password"`) in `.env.local`.

## Structure

| Path | What it holds |
| --- | --- |
| `app/` | Pages: home, shop, collections, product pages, custom orders, our story, help |
| `components/` | Header, footer, bag drawer, product card, forms |
| `lib/catalog.ts` | Product types, collections and the starting catalog |
| `lib/catalog-store.ts` | Reads and saves the live catalog and photos (Vercel Blob, or `.data/` locally) |
| `lib/auth.ts`, `lib/password.ts`, `middleware.ts` | Portal sign-in and sessions |
| `app/portal/`, `components/portal/` | The client portal |
| `public/images/` | Web-ready product photos and logo |
| `brand/` | Logo source files, palette notes, client photo originals and photo log |

## Before launch

- [ ] Connect Shopify: products, cart and checkout
- [ ] Replace placeholder photos with the styled shoot
- [ ] Confirm product names, sizes and prices (see `brand/photos/README.md`)
- [ ] Wire forms to the client's inbox and email platform
- [ ] Add pickup locations, delivery zones, shipping and returns policies
- [ ] Remove the preview banner, allow indexing in `app/robots.ts` and `app/layout.tsx`, add a sitemap
- [ ] Point cozyflamecandles.com at Vercel
