#!/usr/bin/env node
/**
 * Read-only audit of active Stripe products' human-readable internal SKU.
 * Usage: node scripts/audit_stripe_product_skus.js <output.json>
 */

const fs = require('node:fs');
const path = require('node:path');

const outputPath = process.argv[2];
if (!outputPath) throw new Error('Usage: node scripts/audit_stripe_product_skus.js <output.json>');
const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) throw new Error('STRIPE_SECRET_KEY is required');

async function stripeGet(url) {
  const response = await fetch(url, {
    headers: { Authorization: `Basic ${Buffer.from(`${secret}:`).toString('base64')}` },
  });
  if (!response.ok) throw new Error(`Stripe API request failed (${response.status}): ${await response.text()}`);
  return response.json();
}

async function allActiveProducts() {
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

function firstValue(metadata, keys) {
  for (const key of keys) {
    const value = metadata?.[key]?.trim();
    if (value) return { key, value };
  }
  return null;
}

function summary(product, skuRecord) {
  const metadata = product.metadata ?? {};
  return {
    product_id: product.id,
    name: product.name,
    sku: skuRecord?.value ?? null,
    sku_field: skuRecord?.key ?? null,
    brand: metadata.brand ?? null,
    category: metadata.category_zh ?? metadata.category ?? null,
    subcategory: metadata.subcategory ?? null,
    mofu_import_key: metadata.mofu_import_key ?? null,
    in_stock: metadata.in_stock ?? null,
    show_when_out_of_stock: metadata.show_when_out_of_stock ?? null,
  };
}

(async () => {
  const products = await allActiveProducts();
  const skuKeys = ['sku', 'internal_sku', 'store_sku', 'item_code', 'product_code', 'model'];
  const withSku = [];
  const withoutSku = [];
  const byNormalizedSku = new Map();

  for (const product of products) {
    const skuRecord = firstValue(product.metadata ?? {}, skuKeys);
    const record = summary(product, skuRecord);
    if (!skuRecord) {
      withoutSku.push(record);
      continue;
    }
    withSku.push(record);
    const normalized = skuRecord.value.toUpperCase();
    const entries = byNormalizedSku.get(normalized) ?? [];
    entries.push(record);
    byNormalizedSku.set(normalized, entries);
  }

  const duplicateSkus = [...byNormalizedSku.entries()]
    .filter(([, productsForSku]) => productsForSku.length > 1)
    .map(([sku, productsForSku]) => ({ sku, products: productsForSku }));
  const prefixCounts = {};
  for (const { sku } of withSku) {
    const prefix = sku.split('-')[0] || 'OTHER';
    prefixCounts[prefix] = (prefixCounts[prefix] ?? 0) + 1;
  }

  const report = {
    generated_at_utc: new Date().toISOString(),
    active_product_count: products.length,
    sku_coverage: {
      with_human_readable_sku: withSku.length,
      without_human_readable_sku: withoutSku.length,
      unique_sku_count: byNormalizedSku.size,
      duplicate_sku_count: duplicateSkus.length,
    },
    sku_prefix_counts: Object.fromEntries(Object.entries(prefixCounts).sort(([a], [b]) => a.localeCompare(b))),
    duplicate_skus: duplicateSkus,
    products_with_sku: withSku.sort((a, b) => a.sku.localeCompare(b.sku)),
    products_without_sku: withoutSku.sort((a, b) => a.product_id.localeCompare(b.product_id)),
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({
    active_product_count: report.active_product_count,
    sku_coverage: report.sku_coverage,
    sku_prefix_counts: report.sku_prefix_counts,
    duplicate_skus: report.duplicate_skus,
  }, null, 2));
})();
