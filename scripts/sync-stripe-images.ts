import fs from "node:fs/promises";
import fsSync from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import crypto from "node:crypto";
import Stripe from "stripe";

type Candidate = {
  url: string;
  source: "local" | "existing-stripe" | "web";
  score: number;
  reason: string;
};

type ReportRow = {
  productId: string;
  name: string;
  source: Candidate["source"] | "none";
  imageUrl?: string;
  uploadedFileId?: string;
  confidence: "exact-local" | "existing-stripe" | "web-reviewed" | "unresolved";
  status: "would-update" | "updated" | "kept" | "unresolved" | "failed";
  error?: string;
};

const ROOT = process.cwd();
const LOCAL_PRODUCT_DIR = path.join(ROOT, "public/images/products");
const WORK_DIR = path.join(ROOT, ".tmp/stripe-image-sync");
const REPORT_PATH = path.join(ROOT, "stripe-image-sync-report.json");
const DELAY_MS = 250;
const APPLY = process.argv.includes("--apply");
const REFRESH_EXISTING = process.argv.includes("--refresh-existing");
const MAX_WEB_DOWNLOAD_BYTES = 12 * 1024 * 1024;
const USER_AGENT = "MofuHavenStripeImageSync/1.0 (+https://mofuhavenhk.com)";
const execFileAsync = promisify(execFile);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeHtml(value: string): string {
  return value
    .replaceAll("\\/", "/")
    .replaceAll('\\"', '"')
    .replaceAll("\\u0026", "&")
    .replaceAll("&amp;", "&")
    .replaceAll("\\u003d", "=")
    .replaceAll("\\u0025", "%");
}

function isStripeFileLink(value: string | undefined): value is string {
  return /^https:\/\/files\.stripe\.com\/links\//i.test(value ?? "");
}

function isLegacyMofuUrl(value: string | undefined): boolean {
  return /mofuhavenhk\.com\/assets\/product\//i.test(value ?? "");
}

function safeSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function localImageForProduct(product: Stripe.Product): string | undefined {
  const metadataId = product.metadata.id?.trim();
  const exactLegacyAssetByMetadataId: Record<string, string> = {
    "snack-scallop-jerky": path.join(ROOT, "public/products/snack-scallop-jerky.webp"),
  };
  const exactLegacyAsset = metadataId ? exactLegacyAssetByMetadataId[metadataId] : undefined;
  if (exactLegacyAsset && fsSync.existsSync(exactLegacyAsset)) return exactLegacyAsset;
  if (!metadataId) return undefined;
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    const candidate = path.join(LOCAL_PRODUCT_DIR, `${metadataId}${ext}`);
    if (fsSync.existsSync(candidate)) return candidate;
  }
  return undefined;
}

function isImageContentType(contentType: string | null): boolean {
  return Boolean(contentType && /^image\/(jpeg|png|webp|gif|avif)$/i.test(contentType.split(";")[0].trim()));
}

function nameTokens(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[^a-z0-9一-龥ぁ-んァ-ン]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !/^x?\d+$/.test(token))
    .slice(0, 20);
}

function scoreWebCandidate(name: string, url: string): number {
  const haystack = decodeHtml(url).toLowerCase();
  const tokens = nameTokens(name);
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += token.length >= 4 ? 3 : 1;
  }
  if (/\.(jpe?g|png|webp)(?:[?#]|$)/i.test(url)) score += 2;
  if (/amazon|rakuten|yodobashi|official|inaba|sanko|marukan/i.test(haystack)) score += 1;
  if (/banner|logo|icon|category|collection|hero|sprite/i.test(haystack)) score -= 8;
  return score;
}

async function searchWebImages(name: string): Promise<Candidate[]> {
  const query = `${name} 商品 包裝 product image`;
  const endpoint = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;
  const response = await fetch(endpoint, {
    headers: { "user-agent": USER_AGENT, accept: "text/html" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Bing image search HTTP ${response.status}`);
  const html = await response.text();
  const candidates: Candidate[] = [];
  const seen = new Set<string>();
  const regex = /"murl":"(.*?)"/g;
  for (const match of html.matchAll(regex)) {
    const url = decodeHtml(match[1] ?? "");
    if (!/^https?:\/\//i.test(url) || seen.has(url)) continue;
    seen.add(url);
    candidates.push({
      url,
      source: "web",
      score: scoreWebCandidate(name, url),
      reason: "Bing Images candidate matched against product name and image URL",
    });
  }
  return candidates.sort((left, right) => right.score - left.score).slice(0, 12);
}

async function downloadImage(url: string, destination: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8" },
    redirect: "follow",
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error(`image HTTP ${response.status}`);
  const contentType = response.headers.get("content-type");
  if (!isImageContentType(contentType)) throw new Error(`not an image (${contentType ?? "unknown content type"})`);
  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > MAX_WEB_DOWNLOAD_BYTES) throw new Error("image exceeds 12 MB limit");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 1_000 || bytes.length > MAX_WEB_DOWNLOAD_BYTES) throw new Error(`invalid image size ${bytes.length}`);
  await fs.writeFile(destination, bytes);
  return contentType!.split(";")[0].trim();
}

function extensionForMime(mime: string): string {
  return mime === "image/png" ? ".png" : mime === "image/webp" ? ".webp" : mime === "image/gif" ? ".gif" : ".jpg";
}

async function listActiveProducts(stripe: Stripe): Promise<Stripe.Product[]> {
  const products: Stripe.Product[] = [];
  for await (const product of stripe.products.list({ active: true, limit: 100 })) products.push(product);
  return products;
}

async function makeSquareJpeg(localPath: string, productId: string): Promise<string> {
  const output = path.join(WORK_DIR, `${safeSlug(productId)}-square.jpg`);
  await execFileAsync("python3", [
    path.join(ROOT, "scripts/prepare-square-image.py"),
    localPath,
    output,
  ]);
  return output;
}

async function uploadToStripe(stripe: Stripe, localPath: string, filename: string): Promise<{ url: string; fileId: string }> {
  // Stripe Product.images accepts public URLs. A File Link gives us a stable
  // Stripe-hosted URL without exposing the repository or local web server.
  const data = await fs.readFile(localPath);
  const file = await stripe.files.create({
    purpose: "business_icon",
    file: {
      data,
      name: filename,
      type: "image/jpeg",
    },
  });
  const link = await stripe.fileLinks.create({ file: file.id });
  if (!link.url) throw new Error(`Stripe file ${file.id} did not return a public link`);
  return { url: link.url, fileId: file.id };
}

async function prepareCandidate(product: Stripe.Product): Promise<{ candidate: Candidate; localPath?: string }> {
  const existing = product.images?.find((image) => isStripeFileLink(image));
  if (existing && !REFRESH_EXISTING) {
    return {
      candidate: { url: existing, source: "existing-stripe", score: 100, reason: "existing Stripe-hosted image link" },
    };
  }

  const localPath = localImageForProduct(product);
  if (localPath) {
    return {
      candidate: {
        url: `file://${localPath}`,
        source: "local",
        score: 100,
        reason: `exact metadata.id match: ${product.metadata.id}`,
      },
      localPath,
    };
  }

  const webCandidates = await searchWebImages(product.name);
  for (const candidate of webCandidates) {
    if (candidate.score < 3) continue;
    const hash = crypto.createHash("sha1").update(candidate.url).digest("hex").slice(0, 12);
    const rawPath = path.join(WORK_DIR, `${safeSlug(product.id)}-${hash}`);
    try {
      const mime = await downloadImage(candidate.url, rawPath);
      return { candidate: { ...candidate, reason: `${candidate.reason}; verified ${mime}` }, localPath: rawPath };
    } catch {
      await fs.rm(rawPath, { force: true });
    }
  }
  throw new Error("no verified image candidate found");
}

async function main() {
  const secretKey = process.env.STRIPE_LIVE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_LIVE_SECRET_KEY or STRIPE_SECRET_KEY is required");
  await fs.mkdir(WORK_DIR, { recursive: true });
  const stripe = new Stripe(secretKey);
  const products = await listActiveProducts(stripe);
  if (products.length !== 89) console.warn(`Expected 89 active products, found ${products.length}`);
  const report: ReportRow[] = [];

  console.log(`${APPLY ? "APPLY" : "DRY RUN"}: processing ${products.length} active Stripe products`);
  for (const product of products) {
    try {
      const { candidate, localPath } = await prepareCandidate(product);
      if (candidate.source === "existing-stripe") {
        report.push({ productId: product.id, name: product.name, source: candidate.source, imageUrl: candidate.url, confidence: "existing-stripe", status: "kept" });
        console.log(`KEEP ${product.id} ${product.name}`);
        continue;
      }
      if (!localPath) throw new Error("candidate did not produce a local file");
      const squarePath = await makeSquareJpeg(localPath, product.id);
      const filename = `${safeSlug(product.id)}.jpg`;
      if (!APPLY) {
        report.push({ productId: product.id, name: product.name, source: candidate.source, confidence: candidate.source === "local" ? "exact-local" : "web-reviewed", status: "would-update" });
        console.log(`WOULD UPDATE ${product.id} ${product.name} [${candidate.source}]`);
        continue;
      }
      const uploaded = await uploadToStripe(stripe, squarePath, filename);
      const updated = await stripe.products.update(product.id, { images: [uploaded.url] });
      if (!updated.images?.includes(uploaded.url)) throw new Error("Stripe update response did not contain uploaded image URL");
      report.push({ productId: product.id, name: product.name, source: candidate.source, imageUrl: uploaded.url, uploadedFileId: uploaded.fileId, confidence: candidate.source === "local" ? "exact-local" : "web-reviewed", status: "updated" });
      console.log(`UPDATED ${product.id} ${product.name} -> ${uploaded.url}`);
      await sleep(DELAY_MS);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.push({ productId: product.id, name: product.name, source: "none", confidence: "unresolved", status: "unresolved", error: message });
      console.error(`UNRESOLVED ${product.id} ${product.name}: ${message}`);
    }
  }

  await fs.writeFile(REPORT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), apply: APPLY, refreshExisting: REFRESH_EXISTING, total: products.length, report }, null, 2));
  const counts = report.reduce<Record<string, number>>((acc, row) => { acc[row.status] = (acc[row.status] ?? 0) + 1; return acc; }, {});
  console.log(`REPORT ${REPORT_PATH}`);
  console.log(JSON.stringify(counts));
  if (counts.unresolved) process.exitCode = 2;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
