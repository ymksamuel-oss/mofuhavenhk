import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputRoots = [path.join(root, "data"), path.join(root, "reports")];
const outputPath = path.join(root, "src/lib/catalog-image-fallback.ts");
const imageKeyPattern = /image|images|blob|cdn/i;
const productIdKeys = new Set(["product_id", "stripe_product_id", "productId", "stripeProductId"]);
const urlsByProduct = new Map();

function addUrl(productId, value) {
  if (!productId || typeof value !== "string") return;
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) return;
  const urls = urlsByProduct.get(productId) ?? [];
  if (!urls.includes(trimmed)) urls.push(trimmed);
  urlsByProduct.set(productId, urls);
}

function addImageValue(productId, value) {
  if (!productId) return;
  if (Array.isArray(value)) {
    for (const item of value) addImageValue(productId, item);
    return;
  }
  if (typeof value !== "string") return;
  const trimmed = value.trim();
  if (!trimmed) return;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed !== trimmed) {
      addImageValue(productId, parsed);
      return;
    }
  } catch {
    // Metadata and audit exports also use comma/newline separated URLs.
  }
  for (const part of trimmed.split(/[\n,|]+/)) addUrl(productId, part);
}

function visit(value, inheritedProductId) {
  if (Array.isArray(value)) {
    for (const item of value) visit(item, inheritedProductId);
    return;
  }
  if (!value || typeof value !== "object") return;

  let productId = inheritedProductId;
  for (const [key, child] of Object.entries(value)) {
    if (productIdKeys.has(key) && typeof child === "string" && /^prod_[A-Za-z0-9]+$/.test(child)) {
      productId = child;
      break;
    }
  }
  if (!productId && typeof value.id === "string" && /^prod_[A-Za-z0-9]+$/.test(value.id)) {
    productId = value.id;
  }

  for (const [key, child] of Object.entries(value)) {
    if (imageKeyPattern.test(key)) addImageValue(productId, child);
  }
  for (const child of Object.values(value)) visit(child, productId);
}

function collectFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(fullPath));
    else if (/\.jsonl?$/i.test(entry.name)) files.push(fullPath);
  }
  return files;
}

for (const file of inputRoots.flatMap(collectFiles)) {
  const text = fs.readFileSync(file, "utf8");
  if (file.endsWith(".jsonl")) {
    for (const line of text.split(/\r?\n/)) {
      if (!line.trim()) continue;
      try { visit(JSON.parse(line), undefined); } catch { /* keep other backups usable */ }
    }
    continue;
  }
  try { visit(JSON.parse(text), undefined); } catch { /* keep other backups usable */ }
}

const entries = [...urlsByProduct.entries()]
  .filter(([, urls]) => urls.length > 0)
  .sort(([left], [right]) => left.localeCompare(right));
const body = entries
  .map(([productId, urls]) => `  ${JSON.stringify(productId)}: ${JSON.stringify(urls)},`)
  .join("\n");
const output = `/** Generated from committed JSON/manifest image backups. Do not edit by hand. */\nexport const LOCAL_CATALOG_IMAGE_FALLBACKS: Readonly<Record<string, readonly string[]>> = {\n${body}\n};\n`;
fs.writeFileSync(outputPath, output, "utf8");
console.log(`Generated ${entries.length} product image fallbacks (${entries.reduce((sum, [, urls]) => sum + urls.length, 0)} URLs) at ${path.relative(root, outputPath)}`);
