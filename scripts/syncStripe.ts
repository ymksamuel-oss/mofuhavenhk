import Stripe from "stripe";

import { parseProductCatalogCsv, type ProductSheetRecord } from "../src/lib/catalog-overrides";

const DELAY_MS = 200;
const SITE_URL = "https://mofuhavenhk.com";

type StripeCatalogProduct = {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Converts values such as "HK$425.00" to Stripe's HKD minor unit (42500). */
export function hkdToCents(price: string): number {
  const normalized = price.replace(/HK\$|\s|,/gi, "");

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error(`Invalid HKD price: ${price}`);
  }

  const cents = Math.round(Number(normalized) * 100);
  if (!Number.isSafeInteger(cents) || cents <= 0) {
    throw new Error(`Invalid HKD price: ${price}`);
  }

  return cents;
}

function normalizeImageUrl(image: string): string {
  const url = new URL(image, SITE_URL);
  if (url.protocol !== "https:") {
    throw new Error(`Product image must use HTTPS: ${image}`);
  }
  return url.toString();
}

function sheetRecordToProduct(record: ProductSheetRecord): StripeCatalogProduct {
  return {
    id: record.id,
    name: record.name.zh,
    description: record.description?.zh ?? "",
    price: `HK$${record.price.toFixed(2)}`,
    image: normalizeImageUrl(record.image),
  };
}

async function loadProductsFromSheet(): Promise<StripeCatalogProduct[]> {
  const csvUrl = process.env.STRIPE_SYNC_SHEET_CSV_URL?.trim();
  if (!csvUrl) {
    throw new Error(
      "STRIPE_SYNC_SHEET_CSV_URL is required; Stripe sync only uses the Google Sheet catalog",
    );
  }

  const url = new URL(csvUrl);
  if (url.protocol !== "https:" || url.hostname !== "docs.google.com") {
    throw new Error("STRIPE_SYNC_SHEET_CSV_URL must be an HTTPS docs.google.com CSV URL");
  }

  const response = await fetch(url, { headers: { Accept: "text/csv" } });
  if (!response.ok) {
    throw new Error(`Google Sheet returned HTTP ${response.status}`);
  }

  const parsed = parseProductCatalogCsv(await response.text());
  if (parsed.ignoredRows > 0) {
    console.warn(
      `Google Sheet skipped ${parsed.ignoredRows} invalid or incomplete row(s); syncing ${parsed.acceptedRows} valid products only.`,
    );
  }

  const products = [...parsed.records.values()]
    .map(sheetRecordToProduct)
    .sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }));
  return products;
}

async function listStripeProducts(stripe: Stripe): Promise<Stripe.Product[]> {
  const products: Stripe.Product[] = [];
  for await (const product of stripe.products.list({ limit: 100 })) {
    products.push(product);
  }
  return products;
}

async function archiveProductsMissingFromSheet(
  stripe: Stripe,
  stripeProducts: Stripe.Product[],
  sheetProductIds: Set<string>,
) {
  const staleProducts = stripeProducts.filter(
    (product) => product.active && product.metadata.id && !sheetProductIds.has(product.metadata.id),
  );

  for (const product of staleProducts) {
    await stripe.products.update(product.id, { active: false });
    console.log(`Archived ${product.id}: missing from Google Sheet`);
    await sleep(DELAY_MS);
  }
}

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required. Set it in your shell; do not add it to source control.");
  }

  const stripe = new Stripe(secretKey);
  const sheetProducts = await loadProductsFromSheet();
  if (sheetProducts.length === 0) {
    throw new Error("Google Sheet has no products to sync");
  }

  const stripeProducts = await listStripeProducts(stripe);
  const stripeProductsBySheetId = new Map<string, Stripe.Product>();
  for (const product of stripeProducts) {
    const sheetId = product.metadata.id;
    if (sheetId && (!stripeProductsBySheetId.has(sheetId) || product.active)) {
      stripeProductsBySheetId.set(sheetId, product);
    }
  }

  console.log(
    `Google Sheet accepted ${sheetProducts.length} products; syncing all products against ${stripeProducts.length} Stripe products.`,
  );
  await archiveProductsMissingFromSheet(
    stripe,
    stripeProducts,
    new Set(sheetProducts.map((product) => product.id)),
  );

  for (const product of sheetProducts) {
    const unitAmount = hkdToCents(product.price);
    const productInput = {
      active: true,
      name: product.name,
      ...(product.description ? { description: product.description } : {}),
      images: [product.image],
      metadata: { id: product.id },
    };
    const existingProduct = stripeProductsBySheetId.get(product.id);
    const stripeProduct = existingProduct
      ? await stripe.products.update(existingProduct.id, productInput)
      : await stripe.products.create(productInput);

    const existingPrices = await stripe.prices.list({
      product: stripeProduct.id,
      active: true,
      limit: 100,
    });
    const stripePrice =
      existingPrices.data.find(
        (price) => price.currency === "hkd" && price.unit_amount === unitAmount,
      ) ??
      (await stripe.prices.create({
        product: stripeProduct.id,
        currency: "hkd",
        unit_amount: unitAmount,
      }));

    console.log(
      `${existingProduct ? "Updated" : "Created"} ${product.id}: product ${stripeProduct.id}, price ${stripePrice.id} (${unitAmount} cents)`,
    );

    await sleep(DELAY_MS);
  }
}

main().catch((error: unknown) => {
  console.error("Stripe product sync failed:", error);
  process.exitCode = 1;
});
