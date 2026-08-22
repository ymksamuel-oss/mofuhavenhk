import Stripe from "stripe";

import {
  parseProductCatalogCsv,
  type ProductSheetRecord,
} from "../src/lib/catalog-overrides";

const DELAY_MS = 200;

function activeSyncEnabled(): boolean {
  return process.env.SYNC_STRIPE_IMAGES_ON_BUILD === "1";
}

function getStripeSecretKey(): string {
  const key =
    process.env.STRIPE_LIVE_SECRET_KEY?.trim() ??
    process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("Stripe image sync requires a configured server-side Stripe secret key");
  }
  return key;
}

function getSheetUrl(): string {
  const value = process.env.STRIPE_SYNC_SHEET_CSV_URL?.trim();
  if (!value) {
    throw new Error("Stripe image sync requires STRIPE_SYNC_SHEET_CSV_URL");
  }

  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== "docs.google.com") {
    throw new Error("STRIPE_SYNC_SHEET_CSV_URL must use HTTPS docs.google.com");
  }
  return url.toString();
}

async function loadImageRecords(): Promise<ProductSheetRecord[]> {
  const response = await fetch(getSheetUrl(), { headers: { Accept: "text/csv" } });
  if (!response.ok) {
    throw new Error(`Google Sheet returned HTTP ${response.status}`);
  }

  const catalog = parseProductCatalogCsv(await response.text());
  return [...catalog.records.values()].filter(
    (record) => typeof record.sourceImageUrl === "string" && record.sourceImageUrl.length > 0,
  );
}

async function listStripeProducts(stripe: Stripe): Promise<Stripe.Product[]> {
  const products: Stripe.Product[] = [];
  for await (const product of stripe.products.list({ limit: 100 })) {
    products.push(product);
  }
  return products;
}

async function syncImages(): Promise<void> {
  const stripe = new Stripe(getStripeSecretKey());
  const [records, stripeProducts] = await Promise.all([loadImageRecords(), listStripeProducts(stripe)]);
  const productsBySheetId = new Map<string, Stripe.Product>();

  for (const product of stripeProducts) {
    const sheetId = product.metadata.id?.trim();
    if (!sheetId || !product.active) continue;
    const current = productsBySheetId.get(sheetId);
    if (!current || product.created > current.created) {
      productsBySheetId.set(sheetId, product);
    }
  }

  let changed = 0;
  for (const record of records) {
    const product = productsBySheetId.get(record.id);
    const sourceImageUrl = record.sourceImageUrl!;
    if (!product || product.images?.[0] === sourceImageUrl) continue;

    await stripe.products.update(product.id, { images: [sourceImageUrl] });
    changed += 1;
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  }

  console.log(`Stripe image sync completed: updated ${changed} product image(s).`);
}

if (activeSyncEnabled()) {
  syncImages().catch((error: unknown) => {
    console.error("Stripe image sync failed:", error);
    process.exitCode = 1;
  });
} else {
  console.log("Stripe image sync skipped: SYNC_STRIPE_IMAGES_ON_BUILD is not enabled.");
}
