import Stripe from "stripe";

import { parseProductCatalogCsv, type ProductSheetRecord } from "../src/lib/catalog-overrides";
import { productData } from "../src/data/productsData";

const DELAY_MS = 200;
const SITE_URL = "https://mofuhavenhk.com";
const BATCH_COUNT = 3;

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

function parseBatch(value: string | undefined): number {
  const batch = Number(value ?? "1");
  if (!Number.isInteger(batch) || batch < 1 || batch > BATCH_COUNT) {
    throw new Error(`STRIPE_SYNC_BATCH must be an integer from 1 to ${BATCH_COUNT}`);
  }
  return batch;
}

function escapeStripeSearchValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
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

async function loadBatchFromSheet(): Promise<StripeCatalogProduct[]> {
  const csvUrl = process.env.STRIPE_SYNC_SHEET_CSV_URL?.trim();
  if (!csvUrl) return productData.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: normalizeImageUrl(product.image),
  }));

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
  const batch = parseBatch(process.env.STRIPE_SYNC_BATCH);
  const batchSize = Math.ceil(products.length / BATCH_COUNT);
  const selected = products.slice((batch - 1) * batchSize, batch * batchSize);
  if (selected.length === 0) {
    throw new Error(`Batch ${batch} has no products in the Google Sheet`);
  }

  console.log(`Google Sheet accepted ${products.length} products; syncing Batch ${batch}/${BATCH_COUNT} (${selected.length} products).`);
  return selected;
}

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required. Set it in your shell; do not add it to source control.");
  }

  const stripe = new Stripe(secretKey);
  const products = await loadBatchFromSheet();

  for (const product of products) {
    const unitAmount = hkdToCents(product.price);
    const existingProducts = await stripe.products.search({
      query: `metadata['id']:'${escapeStripeSearchValue(product.id)}'`,
      limit: 1,
    });
    const productInput = {
      name: product.name,
      description: product.description,
      images: [product.image],
      metadata: { id: product.id },
    };
    const existingProduct = existingProducts.data[0];
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
