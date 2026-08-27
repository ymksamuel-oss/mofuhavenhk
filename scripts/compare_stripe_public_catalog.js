#!/usr/bin/env node
/**
 * Compare the exported active Stripe product list with a public storefront
 * inventory extraction. This is read-only and writes only a local report.
 *
 * Usage:
 *   node scripts/compare_stripe_public_catalog.js \
 *     reports/stripe_active_products_2026-08-27.json \
 *     /home/ubuntu/mofu_audit/public_catalog_inventory.json \
 *     reports/stripe_public_catalog_difference_2026-08-27.json
 */

const fs = require('node:fs');
const path = require('node:path');

const [stripePath, publicPath, outputPath] = process.argv.slice(2);
if (!stripePath || !publicPath || !outputPath) {
  throw new Error('Expected <stripe-export.json> <public-inventory.json> <output.json>.');
}

const stripeExport = JSON.parse(fs.readFileSync(stripePath, 'utf8'));
const publicInventory = JSON.parse(fs.readFileSync(publicPath, 'utf8'));
const stripeProducts = stripeExport.active_products ?? [];
const publicProducts = publicInventory.products ?? [];

function requireId(record, label) {
  const id = record?.id ?? record?.product_id;
  if (typeof id !== 'string' || !id.startsWith('prod_')) {
    throw new Error(`${label} is missing a valid product ID.`);
  }
  return id;
}

function buildIndex(items, label) {
  const index = new Map();
  const duplicates = [];
  for (const item of items) {
    const id = requireId(item, label);
    if (index.has(id)) duplicates.push(id);
    index.set(id, item);
  }
  return { index, duplicates: [...new Set(duplicates)].sort() };
}

const stripe = buildIndex(stripeProducts, 'Stripe product');
const publicCatalog = buildIndex(publicProducts, 'Public catalogue product');

function stripeSummary(product) {
  return {
    product_id: product.id,
    name: product.name,
    active: product.active,
    created: product.created,
    updated: product.updated,
    default_price: product.default_price,
    mofu_import_key: product.metadata?.mofu_import_key ?? null,
    category: product.metadata?.category ?? null,
    category_zh: product.metadata?.category_zh ?? null,
    subcategory: product.metadata?.subcategory ?? null,
    show_when_out_of_stock: product.metadata?.show_when_out_of_stock ?? null,
    in_stock: product.metadata?.in_stock ?? null,
    availability: product.metadata?.availability ?? null,
    image_pending: product.metadata?.image_pending ?? null,
  };
}

function publicSummary(product) {
  return {
    product_id: product.product_id,
    name: product.name,
    categories: product.categories ?? [],
    public_url: product.public_url ?? product.url ?? null,
    image_url: product.image_url ?? null,
    price: product.price ?? null,
    availability: product.availability ?? null,
  };
}

const stripeOnly = [...stripe.index.keys()]
  .filter((id) => !publicCatalog.index.has(id))
  .sort()
  .map((id) => stripeSummary(stripe.index.get(id)));
const publicOnly = [...publicCatalog.index.keys()]
  .filter((id) => !stripe.index.has(id))
  .sort()
  .map((id) => publicSummary(publicCatalog.index.get(id)));

const report = {
  generated_at_utc: new Date().toISOString(),
  stripe_active_product_count: stripeProducts.length,
  public_catalog_product_count: publicProducts.length,
  unique_stripe_active_product_count: stripe.index.size,
  unique_public_catalog_product_count: publicCatalog.index.size,
  stripe_duplicate_ids: stripe.duplicates,
  public_catalog_duplicate_ids: publicCatalog.duplicates,
  stripe_only_products: stripeOnly,
  public_only_products: publicOnly,
  common_product_count: [...stripe.index.keys()].filter((id) => publicCatalog.index.has(id)).length,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  stripe_active_product_count: report.stripe_active_product_count,
  public_catalog_product_count: report.public_catalog_product_count,
  unique_stripe_active_product_count: report.unique_stripe_active_product_count,
  unique_public_catalog_product_count: report.unique_public_catalog_product_count,
  stripe_only_products: report.stripe_only_products,
  public_only_products: report.public_only_products,
}, null, 2));
