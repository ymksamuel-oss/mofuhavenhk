#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Prepare, but never apply, stable Mofu Haven store SKUs for active Stripe products.
 * Existing mofu_sku values are preserved. New values use MH-{CATEGORY}-{BRAND}-{NNN}.
 *
 * Usage:
 *   node scripts/prepare_mofu_sku_mapping.js <output-dir>
 */

const fs = require('node:fs');
const path = require('node:path');

const outputDir = process.argv[2];
if (!outputDir) throw new Error('Usage: node scripts/prepare_mofu_sku_mapping.js <output-dir>');
const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) throw new Error('STRIPE_SECRET_KEY is required');

const BRAND_CODES = [
  [/ciao/i, 'CIAO'],
  [/combo\s*present/i, 'CMP'],
  [/^combo\b/i, 'COMBO'],
  [/d\.b\.f/i, 'DBF'],
  [/mamacook|ママクック/i, 'MCK'],
  [/mon\s*petit|モンプチ/i, 'MONP'],
  [/銀のスプーン|gin\s*no\s*spoon|silver\s*spoon/i, 'GNSP'],
  [/sunrise|aim30/i, 'SNR'],
  [/petline|ごちそうタイム/i, 'PTL'],
  [/vet.?s\s*labo|medimousse/i, 'VLB'],
  [/doggyman|ドギーマン/i, 'DGM'],
  [/iris|one\s*care|ワンケア/i, 'IRIS'],
  [/unicharm|ユニチャーム|デオトイレ/i, 'UCM'],
  [/エステー|ニャンとも/i, 'ST'],
  [/pamax/i, 'PAMAX'],
  [/snappy/i, 'SNP'],
];

function cleanText(value) {
  return String(value ?? '').trim();
}

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

function categoryCode(product) {
  const metadata = product.metadata ?? {};
  const text = [metadata.category, metadata.category_zh, metadata.subcategory, product.name]
    .map(cleanText)
    .join(' ')
    .toLowerCase();
  if (/small-pets|小寵物|小动物|兔|倉鼠|仓鼠|天竺鼠|豚鼠|龍貓|龙猫|chinchilla|hamster|rabbit/.test(text)) return 'SML';
  if (/lifestyle|寵物生活用品|食具|睡窩|睡窝|外出|清潔|清洁|梳毛|收納|收纳/.test(text)) return 'LIF';
  if (/dogs|dog|狗|犬/.test(text)) return 'DOG';
  return 'CAT';
}

function brandCode(product) {
  const metadata = product.metadata ?? {};
  const source = [metadata.brand, metadata.vendor, product.name, metadata.mofu_import_key]
    .map(cleanText)
    .join(' ');
  for (const [pattern, code] of BRAND_CODES) {
    if (pattern.test(source)) return code;
  }
  return 'GEN';
}

function csvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows) {
  const headers = [
    'mofu_sku', 'stripe_product_id', 'product_name', 'category_code', 'brand_code',
    'existing_supplier_sku', 'mofu_import_key', 'in_stock', 'show_when_out_of_stock',
    'metadata_key_count_before', 'metadata_key_count_after', 'write_status',
  ];
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(',')),
    '',
  ].join('\n');
}

function skuSerial(sku, category, brand) {
  const match = new RegExp(`^MH-${category}-${brand}-(\\d{3,})$`, 'i').exec(cleanText(sku));
  return match ? Number(match[1]) : null;
}

(async () => {
  const products = await getAllActiveProducts();
  const existingSkuOwners = new Map();
  const existingSequenceByGroup = new Map();
  const duplicateExistingSkus = [];

  for (const product of products) {
    const metadata = product.metadata ?? {};
    const existing = cleanText(metadata.mofu_sku);
    if (!existing) continue;
    const normalized = existing.toUpperCase();
    const currentOwner = existingSkuOwners.get(normalized);
    if (currentOwner && currentOwner !== product.id) duplicateExistingSkus.push({ sku: existing, product_ids: [currentOwner, product.id] });
    else existingSkuOwners.set(normalized, product.id);
    const category = categoryCode(product);
    const brand = brandCode(product);
    const serial = skuSerial(existing, category, brand);
    if (serial !== null) {
      const key = `${category}::${brand}`;
      existingSequenceByGroup.set(key, Math.max(existingSequenceByGroup.get(key) ?? 0, serial));
    }
  }

  if (duplicateExistingSkus.length) {
    throw new Error(`Existing mofu_sku collision(s) detected: ${JSON.stringify(duplicateExistingSkus)}`);
  }

  const prepared = [];
  const groups = new Map();
  for (const product of products) {
    const category = categoryCode(product);
    const brand = brandCode(product);
    const key = `${category}::${brand}`;
    const records = groups.get(key) ?? [];
    records.push(product);
    groups.set(key, records);
  }

  for (const [groupKey, groupProducts] of groups) {
    const [category, brand] = groupKey.split('::');
    let nextSerial = existingSequenceByGroup.get(groupKey) ?? 0;
    const ordered = groupProducts.sort((left, right) => {
      const leftKey = `${cleanText(left.metadata?.mofu_import_key)}\u0000${cleanText(left.name)}\u0000${left.id}`;
      const rightKey = `${cleanText(right.metadata?.mofu_import_key)}\u0000${cleanText(right.name)}\u0000${right.id}`;
      return leftKey.localeCompare(rightKey, 'en');
    });

    for (const product of ordered) {
      const metadata = product.metadata ?? {};
      const existing = cleanText(metadata.mofu_sku);
      const mofuSku = existing || `MH-${category}-${brand}-${String(++nextSerial).padStart(3, '0')}`;
      const finalKeyCount = new Set([...Object.keys(metadata), ...(existing ? [] : ['mofu_sku'])]).size;
      prepared.push({
        mofu_sku: mofuSku,
        stripe_product_id: product.id,
        product_name: product.name,
        category_code: category,
        brand_code: brand,
        existing_supplier_sku: cleanText(metadata.sku) || null,
        mofu_import_key: cleanText(metadata.mofu_import_key) || null,
        in_stock: cleanText(metadata.in_stock) || null,
        show_when_out_of_stock: cleanText(metadata.show_when_out_of_stock) || null,
        metadata_key_count_before: Object.keys(metadata).length,
        metadata_key_count_after: finalKeyCount,
        write_status: existing ? 'preserve_existing_mofu_sku' : finalKeyCount > 50 ? 'blocked_metadata_limit' : 'ready_to_write',
      });
    }
  }

  prepared.sort((left, right) => left.mofu_sku.localeCompare(right.mofu_sku, 'en'));
  const generatedSkus = new Map();
  const generatedCollisions = [];
  for (const row of prepared) {
    const normalized = row.mofu_sku.toUpperCase();
    const owner = generatedSkus.get(normalized);
    if (owner && owner !== row.stripe_product_id) generatedCollisions.push({ sku: row.mofu_sku, product_ids: [owner, row.stripe_product_id] });
    else generatedSkus.set(normalized, row.stripe_product_id);
  }
  if (generatedCollisions.length) throw new Error(`Generated SKU collision(s) detected: ${JSON.stringify(generatedCollisions)}`);

  const rowsToWrite = prepared.filter((row) => row.write_status === 'ready_to_write');
  const blockedRows = prepared.filter((row) => row.write_status === 'blocked_metadata_limit');
  const batches = [];
  const batchSize = 50;
  for (let index = 0; index < rowsToWrite.length; index += batchSize) {
    const batchRows = rowsToWrite.slice(index, index + batchSize);
    batches.push({
      batch: `mofu_sku_assignment_batch_${String(batches.length + 1).padStart(2, '0')}_of_${Math.ceil(rowsToWrite.length / batchSize)}`,
      source: 'Generated from current active Stripe products. Only adds a unique mofu_sku metadata field; preserves original Stripe Product IDs and existing supplier SKU values.',
      metadata_defaults: {},
      products: batchRows.map((row) => ({
        stripe_product_id: row.stripe_product_id,
        metadata: { mofu_sku: row.mofu_sku },
      })),
    });
  }

  const summary = {
    generated_at_utc: new Date().toISOString(),
    active_product_count: products.length,
    existing_mofu_sku_count: prepared.filter((row) => row.write_status === 'preserve_existing_mofu_sku').length,
    new_mofu_sku_ready_to_write_count: rowsToWrite.length,
    blocked_by_metadata_limit_count: blockedRows.length,
    unique_mofu_sku_count: generatedSkus.size,
    generated_collision_count: generatedCollisions.length,
    batch_count: batches.length,
    format: 'MH-{CATEGORY}-{BRAND}-{NNN}',
  };

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'batches'), { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'mofu_sku_mapping.json'), `${JSON.stringify({ summary, products: prepared, blocked_products: blockedRows }, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, 'mofu_sku_mapping.csv'), toCsv(prepared));
  for (const batch of batches) {
    fs.writeFileSync(path.join(outputDir, 'batches', `${batch.batch}.json`), `${JSON.stringify(batch, null, 2)}\n`);
  }
  fs.writeFileSync(path.join(outputDir, 'mofu_sku_generation_summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify(summary, null, 2));
})();
