import { readFileSync, writeFileSync } from "node:fs";

const [manifestPath, stripeResultPath, reportPath] = process.argv.slice(2);
if (!manifestPath || !stripeResultPath || !reportPath) {
  throw new Error("Usage: node scripts/verify-stripe-live-image-sync.mjs <manifest.json> <stripe-result.json> <report.json>");
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const envelope = JSON.parse(readFileSync(stripeResultPath, "utf8"));
const payload = envelope.content?.map((entry) => entry.text ?? "").join("") ?? "";
const products = JSON.parse(payload).data ?? [];
const byId = new Map(products.map((product) => [product.id, product]));
const results = manifest.updates.map((update) => {
  const product = byId.get(update.productId);
  const actualImage = product?.images?.[0] ?? null;
  return {
    productId: update.productId,
    expectedImage: update.images[0],
    actualImage,
    matches: actualImage === update.images[0],
  };
});
const verified = results.filter((result) => result.matches).length;
const report = { expected: manifest.updates.length, verified, mismatched: results.length - verified, results };
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ expected: report.expected, verified: report.verified, mismatched: report.mismatched }, null, 2));
if (report.mismatched > 0) process.exitCode = 1;
