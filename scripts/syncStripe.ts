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

function chooseCanonicalProduct(products: Stripe.Product[]): Stripe.Product {
  return [...products].sort(
    (left, right) => Number(right.active) - Number(left.active) || left.created - right.created,
  )[0]!;
}

function buildStripeCatalogIndex(stripeProducts: Stripe.Product[]) {
  const productsBySheetId = new Map<string, Stripe.Product[]>();
  const productsWithoutSheetId: Stripe.Product[] = [];

  for (const product of stripeProducts) {
    const sheetId = product.metadata.id?.trim();
    if (!sheetId) {
      productsWithoutSheetId.push(product);
      continue;
    }
    const matchingProducts = productsBySheetId.get(sheetId) ?? [];
    matchingProducts.push(product);
    productsBySheetId.set(sheetId, matchingProducts);
  }

  return { productsBySheetId, productsWithoutSheetId };
}

function getProductsToArchive(
  stripeProducts: Stripe.Product[],
  sheetProductIds: Set<string>,
) {
  const { productsBySheetId, productsWithoutSheetId } =
    buildStripeCatalogIndex(stripeProducts);
  const productsToArchive = [...productsWithoutSheetId];
  const canonicalProductsBySheetId = new Map<string, Stripe.Product>();

  for (const [sheetId, matchingProducts] of productsBySheetId) {
    const canonicalProduct = chooseCanonicalProduct(matchingProducts);
    canonicalProductsBySheetId.set(sheetId, canonicalProduct);

    if (!sheetProductIds.has(sheetId)) {
      productsToArchive.push(...matchingProducts);
      continue;
    }
    productsToArchive.push(
      ...matchingProducts.filter((product) => product.id !== canonicalProduct.id),
    );
  }

  return { canonicalProductsBySheetId, productsToArchive };
}

async function archiveProducts(
  stripe: Stripe,
  productsToArchive: Stripe.Product[],
  dryRun: boolean,
) {
  for (const product of productsToArchive) {
    if (!product.active) continue;
    console.log(
      `${dryRun ? "Would archive" : "Archived"} ${product.id}: ${product.metadata.id || "missing metadata.id"}`,
    );
    if (!dryRun) {
      await stripe.products.update(product.id, { active: false });
      await sleep(DELAY_MS);
    }
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
  const dryRun = process.env.STRIPE_SYNC_DRY_RUN === "1";
  const { canonicalProductsBySheetId, productsToArchive } = getProductsToArchive(
    stripeProducts,
    new Set(sheetProducts.map((product) => product.id)),
  );

  console.log(
    `Google Sheet accepted ${sheetProducts.length} products; reconciling ${stripeProducts.length} Stripe products${dryRun ? " (dry run)" : ""}.`,
  );
  await archiveProducts(stripe, productsToArchive, dryRun);

  for (const product of sheetProducts) {
    const unitAmount = hkdToCents(product.price);
    const productInput = {
      active: true,
      name: product.name,
      ...(product.description ? { description: product.description } : {}),
      images: [product.image],
      metadata: { id: product.id },
    };
    const existingProduct = canonicalProductsBySheetId.get(product.id);
    if (dryRun) {
      console.log(`${existingProduct ? "Would update" : "Would create"} ${product.id}`);
      continue;
    }
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
