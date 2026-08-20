import { readFileSync, writeFileSync } from "node:fs";

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  throw new Error("Usage: node scripts/build-stripe-live-image-sync.mjs <products-api-json> <output-json>");
}

const envelope = JSON.parse(readFileSync(inputPath, "utf8"));
const products = envelope.result?.data?.json?.products ?? envelope[0]?.result?.data?.json?.products ?? [];
const updates = products
  .filter((product) => typeof product.image === "string" && product.image.startsWith("/assets/product/"))
  .map((product) => ({
    productId: product.id,
    name: product.name,
    images: [`https://www.mofuhavenhk.com${product.image}`],
  }));

if (updates.length !== 75) {
  throw new Error(`Expected 75 controlled product image routes, received ${updates.length}.`);
}

writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), updates }, null, 2)}\n`);
console.log(JSON.stringify({ updates: updates.length, sample: updates.slice(0, 3) }, null, 2));
