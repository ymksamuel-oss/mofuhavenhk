# Mofu Haven HK

Hong Kong silken-tofu dessert storefront (Next.js + Tailwind).

## Fixes in this update

1. **Checkout payment icons** — icon containers use `items-center`, horizontal/vertical padding, and `overflow: visible` so payment marks are not clipped by borders.
2. **Octopus logo** — official-style Octopus SVG mark at **24px** height (`h-6`), matching other payment icons.
3. **i18n** — Chinese / English toggle updates copy **and** formatted totals together; preference is persisted in `localStorage` (`mofuhavenhk-locale`).
4. **Header** — narrow screens use `gap-1.5` between brand and nav to avoid crowding/squeezing.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and `/checkout` for the payment UI.
