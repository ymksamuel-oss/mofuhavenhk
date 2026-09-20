import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import * as XLSX from "xlsx";

const MAX_ROWS = 5000;
const MAX_IMAGES = 8;
const CSV_HEADERS = [
  "id",
  "\u7522\u54c1\u540d\u7a31",
  "SKU",
  "\u6210\u672c\u50f9 JPY",
  "\u96f6\u552e\u50f9 HKD",
  "\u5eab\u5b58",
  "\u5716\u7247 URL",
  "\u63cf\u8ff0",
  "\u5206\u985e ID",
  "\u54c1\u724c",
  "\u72c0\u614b",
  "\u5df2\u767c\u5e03",
] as const;

type ProductRow = Record<string, unknown>;

async function isAdmin() {
  const jar = await cookies();
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

function csvCell(value: unknown) {
  const text = Array.isArray(value) ? value.join(" | ") : value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function productImages(row: ProductRow) {
  const raw = row.images ?? row.image_url ?? row.image;
  const values = Array.isArray(raw) ? raw : [raw];
  return values
    .flatMap((item) => (typeof item === "string" ? item.split(/[|\r\n,;]+/) : []))
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, MAX_IMAGES);
}

function exportCsv(rows: ProductRow[]) {
  const lines = [CSV_HEADERS.join(",")];
  for (const row of rows) {
    lines.push([
      row.id,
      row.name,
      row.mofu_sku ?? row.sku,
      row.cost_price_rmb,
      row.price,
      row.stock,
      productImages(row).join(" | "),
      row.description,
      row.category_id,
      row.brand,
      row.status,
      row.is_published,
    ].map(csvCell).join(","));
  }
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"' && cell.length === 0) quoted = true;
    else if (char === ",") { row.push(cell); cell = ""; }
    else if (char === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((current) => current.some((value) => value.trim()));
}

function parseSpreadsheet(buffer: ArrayBuffer, fileName: string): string[][] {
  if (fileName.toLowerCase().endsWith(".csv")) return parseCsv(new TextDecoder().decode(buffer).replace(/^\uFEFF/, ""));
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false, raw: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: false })
    .map((row) => row.map((cell) => String(cell ?? "").trim()));
}

function exportXlsx(rows: ProductRow[]) {
  const values = [CSV_HEADERS as unknown as string[], ...rows.map((row) => [
    row.id, row.name, row.mofu_sku ?? row.sku, row.cost_price_rmb, row.price, row.stock,
    productImages(row).join(" | "), row.description, row.category_id, row.brand, row.status, row.is_published,
  ])];
  const sheet = XLSX.utils.aoa_to_sheet(values);
  sheet["!cols"] = [{ wch: 28 }, { wch: 34 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 52 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "\u7522\u54c1");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

function firstValue(row: Record<string, string>, names: string[]) {
  for (const name of names) if (row[name] !== undefined) return row[name].trim();
  return "";
}

function parseNumber(value: string, label: string, required = false) {
  if (!value) { if (required) throw new Error(`${label}\u4e0d\u53ef\u70ba\u7a7a`); return undefined; }
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(`${label}\u5fc5\u9808\u662f\u6709\u6548\u7684\u975e\u8ca0\u6578\u5b57`);
  return number;
}

function parseBoolean(value: string, fallback: boolean) {
  if (!value) return fallback;
  return ["true", "1", "yes", "y", "\u662f", "\u5df2\u767c\u5e03", "published"].includes(value.toLowerCase());
}

function findMatch(rows: ProductRow[], id: string, sku: string, name: string) {
  if (id) { const byId = rows.find((row) => String(row.id) === id); if (byId) return byId; }
  if (sku) { const bySku = rows.find((row) => String(row.mofu_sku ?? row.sku ?? "").trim().toLowerCase() === sku.toLowerCase()); if (bySku) return bySku; }
  if (name) return rows.find((row) => String(row.name ?? "").trim() === name);
  return undefined;
}

export async function GET(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const isExcel = new URL(request.url).searchParams.get("format") === "xlsx";
  if (isExcel) return new NextResponse(exportXlsx(data || []) as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="mofu-products-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
  return new NextResponse(exportCsv(data || []), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mofu-products-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "\u8acb\u9078\u64c7 CSV \u6216 Excel \u6a94\u6848" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "\u6a94\u6848\u4e0d\u53ef\u5927\u65bc 10MB" }, { status: 400 });
  const fileName = file.name || "upload.csv";
  if (!/\.(csv|xlsx|xls)$/i.test(fileName)) return NextResponse.json({ error: "\u53ea\u652f\u63f4 .csv、.xlsx \u6216 .xls \u6a94\u6848" }, { status: 400 });
  const parsed = parseSpreadsheet(await file.arrayBuffer(), fileName);
  if (parsed.length < 2) return NextResponse.json({ error: "\u6a94\u6848\u5fc5\u9808\u5305\u542b\u6a19\u984c\u5217\u53ca\u81f3\u5c11\u4e00\u9805\u7522\u54c1" }, { status: 400 });
  const headers = parsed[0].map((header) => header.trim());
  const requiredHeader = headers.find((header) => ["\u7522\u54c1\u540d\u7a31", "name", "\u540d\u7a31"].includes(header));
  if (!requiredHeader) return NextResponse.json({ error: "\u6a94\u6848\u5fc5\u9808\u5305\u542b「\u7522\u54c1\u540d\u7a31」\u6b04\u4f4d" }, { status: 400 });
  if (parsed.length - 1 > MAX_ROWS) return NextResponse.json({ error: `\u55ae\u6b21\u6700\u591a\u532f\u5165 ${MAX_ROWS} \u9805\u7522\u54c1` }, { status: 400 });
  const { data: existing, error: readError } = await supabase.from("products").select("*");
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });
  const rows = existing || [];
  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (let index = 1; index < parsed.length; index += 1) {
    const values = parsed[index];
    const input = Object.fromEntries(headers.map((header, column) => [header, values[column] ?? ""]));
    const name = firstValue(input, ["\u7522\u54c1\u540d\u7a31", "\u540d\u7a31", "name"]);
    const sku = firstValue(input, ["SKU", "sku", "mofu_sku"]);
    try {
      if (!name) throw new Error("\u7522\u54c1\u540d\u7a31\u4e0d\u53ef\u70ba\u7a7a");
      const cost = parseNumber(firstValue(input, ["\u6210\u672c\u50f9 JPY", "\u4f86\u8ca8\u50f9 JPY", "\u4f86\u8ca8\u50f9 CNY", "\u4f86\u8ca8\u50f9 RMB", "cost_price_rmb", "cost_price_jpy"]), "\u6210\u672c\u50f9", true)!;
      if (cost <= 0) throw new Error("\u6210\u672c\u50f9\u5fc5\u9808\u5927\u65bc 0");
      const retailPrice = parseNumber(firstValue(input, ["\u96f6\u552e\u50f9 HKD", "\u552e\u50f9 HKD", "price"]), "\u96f6\u552e\u50f9 HKD", true)!;
      if (retailPrice <= 0) throw new Error("\u96f6\u552e\u50f9 HKD \u5fc5\u9808\u5927\u65bc 0");
      const originalPrice = parseNumber(firstValue(input, ["\u539f\u50f9 HKD", "original_price"]), "\u539f\u50f9 HKD") ?? retailPrice;
      const matched = findMatch(rows, firstValue(input, ["id"]), sku, name);
      const payload: Record<string, unknown> = {
        name,
        mofu_sku: sku || (matched?.mofu_sku ?? null),
        cost_price_rmb: cost,
        price: retailPrice,
        original_price: originalPrice,
        current_hkd: retailPrice,
      };
      const stock = parseNumber(firstValue(input, ["\u5eab\u5b58", "stock"]), "\u5eab\u5b58");
      if (stock !== undefined) payload.stock = Math.trunc(stock);
      const images = firstValue(input, ["\u5716\u7247 URL", "\u5716\u7247 URL（\u4ee5 | \u5206\u9694）", "images", "image_url"]);
      if (images) payload.images = images.split(/[|\r\n,;]+/).map((value) => value.trim()).filter(Boolean).slice(0, MAX_IMAGES);
      for (const [field, names] of Object.entries({ description: ["\u63cf\u8ff0", "description"], category_id: ["\u5206\u985e ID", "category_id"], brand: ["\u54c1\u724c", "brand"], status: ["\u72c0\u614b", "status"] })) {
        const value = firstValue(input, names);
        if (value) payload[field] = value;
      }
      const published = firstValue(input, ["\u5df2\u767c\u5e03", "is_published"]);
      if (published) payload.is_published = parseBoolean(published, true);
      const wantsPublished = payload.status === "published" || payload.is_published === true;
      if (wantsPublished) {
        const missing: string[] = [];
        if (!firstValue(input, ["\u82f1\u6587\u54c1\u540d", "name_en"])) missing.push("\u82f1\u6587\u54c1\u540d");
        if (!firstValue(input, ["\u63cf\u8ff0", "description"])) missing.push("\u4e2d\u6587\u8a73\u7d30\u6558\u8ff0");
        if (!firstValue(input, ["\u82f1\u6587\u63cf\u8ff0", "description_en"])) missing.push("\u82f1\u6587\u8a73\u7d30\u6558\u8ff0");
        if (stock === undefined || stock <= 0) missing.push("\u5eab\u5b58（\u9700\u5927\u65bc 0）");
        if (!images || !images.split(/[|\r\n,;]+/).some((value) => /^https?:\/\/\S+$/i.test(value.trim()))) missing.push("\u5716\u7247 URL");
        if (missing.length) throw new Error(`\u7522\u54c1\u672a\u80fd\u4e0a\u67b6，\u8acb\u5148\u88dc\u9f4a：${missing.join("、")}`);
      }
      if (matched) {
        const { error } = await supabase.from("products").update(payload).eq("id", matched.id);
        if (error) throw new Error(error.message);
        Object.assign(matched, payload);
        updated += 1;
      } else {
        const { data: inserted, error } = await supabase.from("products").insert(payload).select().single();
        if (error) throw new Error(error.message);
        rows.push(inserted);
        created += 1;
      }
    } catch (error) {
      errors.push(`\u7b2c ${index + 1} \u884c：${error instanceof Error ? error.message : "\u683c\u5f0f\u932f\u8aa4"}`);
    }
  }
  return NextResponse.json({ created, updated, failed: errors.length, errors });
}
