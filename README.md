# Mofu Haven HK

Japanese pet supplies storefront, delivered in Hong Kong (Next.js + Tailwind).

## Fixes in this update

1. **Checkout payment icons** — icon containers use `items-center`, horizontal/vertical padding, and `overflow: visible` so payment marks are not clipped by borders.
2. **Octopus logo** — official-style Octopus SVG mark at **24px** height (`h-6`), matching other payment icons.
3. **i18n** — Chinese / English toggle updates copy **and** formatted totals together; preference is persisted in `localStorage` (`mofuhavenhk-locale`).
4. **Header** — narrow screens use `gap-1.5` between brand and nav to avoid crowding/squeezing.
5. **Category grid** — homepage pet category navigation (cats, dogs, snacks, health, cleaning, deals, best sellers, outdoor) with circular warm-orange icon buttons.
6. **Payment methods** — checkout currently offers Credit Card and Apple Pay only.
7. **WhatsApp ordering** — both the "Place order" button and the dedicated WhatsApp CTA open a prefilled WhatsApp message with the order number, items, totals, and selected payment method.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and `/checkout` for the payment UI.
