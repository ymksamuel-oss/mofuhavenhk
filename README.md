# Mofu Haven HK

Japanese pet supplies storefront, delivered in Hong Kong (Next.js + Tailwind).

## Fixes in this update

1. **Checkout payment icons** — icon containers use `items-center`, horizontal/vertical padding, and `overflow: visible` so payment marks are not clipped by borders.
2. **i18n** — Chinese / English toggle updates copy **and** formatted totals together; preference is persisted in `localStorage` (`mofuhavenhk-locale`).
3. **Header** — narrow screens use `gap-1.5` between brand and nav to avoid crowding/squeezing.
4. **Category grid** — homepage pet category navigation (cats, dogs, snacks, health, cleaning, deals, best sellers, outdoor) with circular warm caramel/milk-tea icon buttons. Each category links to `/menu?category=<slug>`.
5. **Payment methods** — checkout only supports **Credit Card / Global Payments (Stripe)** and **Apple Pay**. All payment method options and rendering live in `src/components/checkout/PaymentMethods.tsx` (`PAYMENT_METHODS`) and `src/components/icons/PaymentIcons.tsx`; there is no other file in the project that defines payment options.
6. **WhatsApp ordering** — both the "Place order" button and the dedicated WhatsApp CTA generate an order number and build a fixed-format message (item names, quantities, prices, subtotal, shipping, total, and the selected payment method — `buildOrderMessage` in `src/lib/whatsapp.ts`) and open it as a WhatsApp deep link. `openWhatsAppOrder` targets the shop's own `@MofuHavenHK` WhatsApp account directly — via `NEXT_PUBLIC_WHATSAPP_LINK_CODE` (a WhatsApp Business short-link code, preferred) or `NEXT_PUBLIC_WHATSAPP_NUMBER` (the shop's number, formatting characters stripped automatically) — so the chat opens with the message pre-filled and ready to send, instead of a generic "pick a contact" dialog. See `.env.example` for setup; without either configured, it falls back to a generic share dialog and logs a console warning in development.
7. **Product catalog (`/menu`)** — full product data lives in `src/lib/products.ts` (65 Japanese pet products, 8–9 per category across all 8 categories, each with id, category, bilingual name, price, an optional bilingual `description`, an `image`, and an `icon`). Every product's `image` field points to an illustrated category artwork under `public/products/<categorySlug>.webp` (e.g. `/products/cats.webp`), rendered with `next/image` on the `/menu` product cards — there is no per-product photography yet, so all products in the same category currently share that category's artwork. There is no separate `products.ts` API or CMS; this file is the single source of truth. The `/menu` page lists products with category filter chips — this is where the homepage category grid and the "Shop Now" hero button link to, fixing a bug where every category icon pointed straight to `/checkout`. Each product card has its own "Go to Checkout" button linking to `/checkout?category=<slug>`; `src/lib/order.ts` (`getOrderItems`) reads from the shared catalog to build the checkout order summary for that category.
8. **Theme colors (Japanese milk-tea / 奶茶風)** — all theme colors are CSS custom properties defined once in `src/app/globals.css` (`:root`, the `body` background gradient, and `.hero-plane`) and consumed everywhere else via `var(--...)`, so there is no separate Tailwind config to edit. The palette is a warm, soft milk-tea style: cream/ivory backgrounds (`--background`, `--surface`), warm coffee-brown text (`--ink`, `--muted`), and caramel/toffee accents (`--accent`, `--hero-deep`, `--category-bg*`) — no cool green/teal tones. The homepage category grid (`src/components/home/CategoryGrid.tsx`) still uses the small inline SVG icon set (`src/components/icons/CategoryIcons.tsx`) on a caramel circular background for its compact nav icons, while `/menu` product cards use the larger illustrated `public/products/*.webp` artwork described above.
9. **Checkout / payment layout** — the payment method list, order summary, and WhatsApp order sections on `/checkout` all share the `.milk-tea-card` utility class (defined in `globals.css`: rounded corners + a soft warm-toned shadow) so the three sections read as one cohesive, elevated card group instead of a plain flat list. The payment method buttons use a rounded radio-style indicator and a warm highlight/shadow when selected, and the primary "確認付款" / WhatsApp CTA buttons are fully rounded with a subtle warm shadow and press feedback (`active:scale-[0.99]`) to match the softer, café-like milk-tea aesthetic. Stripe/WhatsApp ordering logic (`src/lib/whatsapp.ts`, `src/lib/order.ts`) was not touched.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), `/menu` for the product catalog, and `/checkout` for the payment UI.
