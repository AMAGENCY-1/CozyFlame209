# The Cozy Flame · Storefront

Website for **The Cozy Flame**, a handcrafted candle brand in California's 209. Built by AMAGENCY.

> **Status: preview build.** Products, photos and copy are drafts for client review. Checkout is disabled and every form confirms on screen without sending anything. Search engines are blocked until launch.

## Stack

- [Next.js 15](https://nextjs.org) (App Router, fully static pages) + React 19 + TypeScript
- Plain CSS design system in `app/globals.css` (palette sampled from the logo)
- Fonts: Cormorant Garamond (headings) and Jost (body) via `next/font`
- Planned at launch: Shopify (Basic) for products, orders and checkout, hosted on Vercel

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build + type check
```

## Structure

| Path | What it holds |
| --- | --- |
| `app/` | Pages: home, shop, collections, product pages, custom orders, our story, help |
| `components/` | Header, footer, bag drawer, product card, forms |
| `lib/catalog.ts` | Product and collection data (swapped for Shopify at launch) |
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
