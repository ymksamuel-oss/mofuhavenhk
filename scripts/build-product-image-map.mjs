import { basename } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";

const [stripeResultPath, uploadLogPath, storageMapPath, storefrontMapPath, apiMapPath] = process.argv.slice(2);

if (!stripeResultPath || !uploadLogPath || !storageMapPath || !storefrontMapPath || !apiMapPath) {
  throw new Error("Usage: node scripts/build-product-image-map.mjs <stripe-result> <upload-log> <storage-map> <storefront-map> <api-map>");
}

const envelope = JSON.parse(readFileSync(stripeResultPath, "utf8"));
const payload = envelope.content?.map((entry) => entry.text ?? "").join("") ?? "";
const products = JSON.parse(payload).data ?? [];
const uploadLines = readFileSync(uploadLogPath, "utf8").split("\n");
const uploads = new Map();

for (let index = 0; index < uploadLines.length; index += 1) {
  const source = uploadLines[index].match(/Uploading file \(webdev private\): (.+?) \(size:/)?.[1];
  const storagePath = uploadLines[index + 2]?.match(/Storage Path: (\/manus-storage\/\S+)/)?.[1];
  if (source && storagePath) uploads.set(basename(source), storagePath);
}

const storageMap = {};
for (const product of products) {
  const image = product.images?.[0];
  const match = typeof image === "string" && image.match(/^https:\/\/mofuhavenhk\.com\/(?:images\/products|products)\/([^/?#]+)/);
  const storagePath = match ? uploads.get(match[1]) : null;
  if (storagePath) storageMap[product.id] = storagePath;
}

const storefrontMap = Object.fromEntries(
  Object.keys(storageMap).map((productId) => [productId, `/assets/product/${productId}`]),
);

writeFileSync(storageMapPath, `${JSON.stringify(storageMap, null, 2)}\n`);
writeFileSync(storefrontMapPath, `export const recoveredProductImageMap: Record<string, string> = ${JSON.stringify(storefrontMap, null, 2)};\n`);
writeFileSync(apiMapPath, `const recoveredProductImageStorageMap = ${JSON.stringify(storageMap, null, 2)};\n\nexport default recoveredProductImageStorageMap;\n`);
console.log(JSON.stringify({ mappedProducts: Object.keys(storageMap).length, uploadedAssets: uploads.size }, null, 2));
