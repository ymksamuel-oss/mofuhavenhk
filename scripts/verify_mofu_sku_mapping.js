#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Verify that active Stripe products match a prepared Mofu SKU mapping.
 * Usage: node scripts/verify_mofu_sku_mapping.js <mapping.json> <output.json>
 */

const fs = require('node:fs');
const path = require('node:path');

const [mappingPath, outputPath] = process.argv.slice(2);
if (!mappingPath || !outputPath) {
  throw new Error('Usage: node scripts/verify_mofu_sku_mapping.js <mapping.json> <output.json>');
}
const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) throw new Error('STRIPE_SECRET_KEY is required');

async function stripeGet(url) {
  const response = await fetch(url, {
    headers: { Authorization: `Basic ${Buffer.from(`${secret}:`).toString('base64')}` },
  });
  if (!response.ok) throw new Error(`Stripe API request failed (${response.status}): ${await response.text()}`);
  return response.json();
}

async function getAllActiveProducts() {
  const products = [];
  let startingAfter = null;
  do {
    const url = new URL('https://api.stripe.com/v1/products');
    url.searchParams.set('active', 'true');
    url.searchParams.set('limit', '100');
    if (startingAfter) url.searchParams.set('starting_after', startingAfter);
    const page = await stripeGet(url);
    products.push(...page.data);
    startingAfter = page.has_more ? page.data.at(-1)?.id : null;
    if (page.has_more && !startingAfter) throw new Error('Stripe pagination cursor missing');
  } while (startingAfter);
  return products;
}

(async () => {
  const expectedRows = JSON.parse(fs.readFileSync(mappingPath, 'utf8')).products;
  const expectedById = new Map(expectedRows.map((row) => [row.stripe_product_id, row.mofu_sku]));
  const products = await getAllActiveProducts();
  const seenSkus = new Map();
  const missingSkuProductIds = [];
  const malformedSkus = [];
  const duplicateSkus = [];
  const mismatchProductIds = [];
  const unexpectedProductIds = [];

  for (const product of products) {
    const sku = product.metadata?.mofu_sku?.trim() ?? '';
    if (!sku) {
      missingSkuProductIds.push(product.id);
      continue;
    }
    if (!/^MH-(CAT|DOG|SML|LIF)-[A-Z0-9]+-\d{3,}$/.test(sku)) {
      malformedSkus.push({ product_id: product.id, mofu_sku: sku });
    }
    const owner = seenSkus.get(sku.toUpperCase());
    if (owner && owner !== product.id) duplicateSkus.push({ mofu_sku: sku, product_ids: [owner, product.id] });
    else seenSkus.set(sku.toUpperCase(), product.id);

    const expectedSku = expectedById.get(product.id);
    if (expectedSku && expectedSku !== sku) {
      mismatchProductIds.push({ product_id: product.id, expected_mofu_sku: expectedSku, saved_mofu_sku: sku });
    }
    if (!expectedSku) unexpectedProductIds.push(product.id);
  }

  const expectedButInactiveOrMissing = expectedRows
    .filter((row) => !products.some((product) => product.id === row.stripe_product_id))
    .map((row) => row.stripe_product_id);
  const valid = (
    products.length === expectedRows.length &&
    missingSkuProductIds.length === 0 &&
    malformedSkus.length === 0 &&
    duplicateSkus.length === 0 &&
    mismatchProductIds.length === 0 &&
    unexpectedProductIds.length === 0 &&
    expectedButInactiveOrMissing.length === 0
  );
  const report = {
    verified_at_utc: new Date().toISOString(),
    valid,
    active_product_count: products.length,
    expected_mapping_count: expectedRows.length,
    saved_mofu_sku_count: seenSkus.size,
    missing_sku_product_ids: missingSkuProductIds,
    malformed_skus: malformedSkus,
    duplicate_skus: duplicateSkus,
    mapping_mismatches: mismatchProductIds,
    unexpected_active_product_ids: unexpectedProductIds,
    expected_but_not_active_or_missing_product_ids: expectedButInactiveOrMissing,
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (!valid) process.exitCode = 2;
})();
