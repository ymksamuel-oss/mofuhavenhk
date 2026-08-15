import Stripe from "stripe";

import { productData } from "../src/data/productsData";

const DELAY_MS = 200;

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

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required. Set it in your shell; do not add it to source control.");
  }

  const stripe = new Stripe(secretKey);

  for (const product of productData) {
    const unitAmount = hkdToCents(product.price);
    const existingProducts = await stripe.products.search({
      query: `metadata['id']:'${product.id}'`,
      limit: 1,
    });
    const stripeProduct =
      existingProducts.data[0] ??
      (await stripe.products.create({
        name: product.name,
        description: product.description,
        images: product.originalImage ? [new URL(product.originalImage).toString()] : [],
        metadata: {
          id: product.id,
          slug: product.slug,
          category: product.category,
          brand: product.brand,
        },
      }));

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
      `${existingProducts.data[0] ? "Reused" : "Created"} ${product.id}: product ${stripeProduct.id}, price ${stripePrice.id} (${unitAmount} cents)`,
    );

    await sleep(DELAY_MS);
  }
}

main().catch((error: unknown) => {
  console.error("Stripe product sync failed:", error);
  process.exitCode = 1;
});
