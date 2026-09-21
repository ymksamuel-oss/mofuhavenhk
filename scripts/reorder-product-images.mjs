import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const APPLY = process.argv.includes("--apply");
if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("SUPABASE_URL and SUPABASE_KEY are required");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const packagingPattern = /(?:official-[^/]+-0|(?:^|[/_-])(?:\d{8,14}-0|pack(?:aging)?|package|front|main))(?:\.(?:jpg|jpeg|png|webp))(?:\?|$)/i;
const closeupPattern = /(?:official-[^/]+-1|(?:^|[/_-])(?:\d{8,14}-1|close[-_]?up|detail|back|nutrition))(?:\.(?:jpg|jpeg|png|webp))(?:\?|$)/i;

function orderImages(raw) {
  if (!Array.isArray(raw)) return [];
  const unique = [...new Set(raw.filter((value) => typeof value === "string" && value.trim()).map((value) => value.trim()))];
  const packaging = unique.filter((value) => packagingPattern.test(value));
  const closeups = unique.filter((value) => closeupPattern.test(value));
  const primary = [...packaging, ...unique.filter((value) => !packaging.includes(value) && !closeups.includes(value))];
  return [...primary, ...closeups].slice(0, 8);
}

function jpegDimensions(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) { offset += 1; continue; }
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
    offset += 2 + length;
  }
  return null;
}
function pngDimensions(bytes) {
  if (bytes.toString("ascii", 1, 4) !== "PNG") return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}
async function inspectImage(url) {
  if (url.startsWith("/")) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return { url, error: `HTTP ${response.status}` };
    const buffer = Buffer.from(await response.arrayBuffer());
    return { url, bytes: buffer.length, dimensions: jpegDimensions(buffer) || pngDimensions(buffer) };
  } catch (error) {
    return { url, error: error instanceof Error ? error.message : String(error) };
  }
}

const { data, error } = await supabase.from("products").select("id,mofu_sku,name_zh,images").order("created_at", { ascending: false }).limit(256);
if (error) throw error;
const rows = data ?? [];
let changed = 0;
let multiImageRows = 0;
const lowResolution = [];
for (const row of rows) {
  const before = Array.isArray(row.images) ? row.images : [];
  const after = orderImages(before);
  if (before.length > 1) multiImageRows += 1;
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    changed += 1;
    console.log(`${APPLY ? "UPDATE" : "WOULD UPDATE"} ${row.mofu_sku || row.id}: ${before[0] || "(none)"} -> ${after[0] || "(none)"}`);
    if (APPLY) {
      const result = await supabase.from("products").update({ images: after }).eq("id", row.id);
      if (result.error) throw result.error;
    }
  }
  const checks = await Promise.all(after.slice(0, 2).map(inspectImage));
  for (const check of checks) {
    if (check?.error || (check?.dimensions?.width ?? Infinity) < 600) lowResolution.push({ sku: row.mofu_sku, name: row.name_zh, ...check });
  }
}
console.log(JSON.stringify({ mode: APPLY ? "apply" : "dry-run", rows: rows.length, multiImageRows, changed, lowResolutionCount: lowResolution.length, lowResolution }, null, 2));
if (!APPLY && changed > 0) console.log("Re-run with --apply to persist the deterministic ordering.");
