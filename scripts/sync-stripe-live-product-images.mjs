import { readFileSync, writeFileSync } from "node:fs";

const [manifestPath, reportPath] = process.argv.slice(2);
const secret = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

if (!manifestPath || !reportPath) {
  throw new Error("Usage: node scripts/sync-stripe-live-product-images.mjs <manifest.json> <report.json>");
}
if (!secret) {
  throw new Error("Missing Stripe Live secret key.");
}

const { updates } = JSON.parse(readFileSync(manifestPath, "utf8"));
if (!Array.isArray(updates) || updates.length !== 75) {
  throw new Error("Expected an approved manifest containing exactly 75 product updates.");
}

const results = [];
for (const update of updates) {
  const body = new URLSearchParams({ "images[0]": update.images[0] });
  const response = await fetch(`https://api.stripe.com/v1/products/${encodeURIComponent(update.productId)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const payload = await response.json();
  results.push({
    productId: update.productId,
    name: update.name,
    status: response.status,
    images: payload.images ?? [],
    error: payload.error?.message ?? null,
  });
  if (!response.ok) break;
}

const succeeded = results.filter((result) => result.status >= 200 && result.status < 300).length;
const report = { attempted: results.length, succeeded, failed: results.length - succeeded, results };
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ attempted: report.attempted, succeeded: report.succeeded, failed: report.failed }, null, 2));
if (report.failed > 0) process.exitCode = 1;
