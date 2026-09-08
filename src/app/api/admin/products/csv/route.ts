import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import * as XLSX from "xlsx";

const RATE = 1.88;
const MAX_ROWS = 5000;
const MAX_IMAGES = 8;
const CSV_HEADERS = [
  "id",
  "產品名稱",
  "SKU",
  "來貨價 CNY",
  "零售價 HKD",
  "庫存",
  "圖片 URL",
  "描述",
  "分類 ID",
  "品牌",
  "狀態",
  "已發布",
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
  XLSX.utils.book_append_sheet(workbook, sheet, "產品");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

function firstValue(row: Record<string, string>, names: string[]) {
  for (const name of names) if (row[name] !== undefined) return row[name].trim();
  return "";
}

function parseNumber(value: string, label: string, required = false) {
  if (!value) { if (required) throw new Error(`${label}不可為空`); return undefined; }
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(`${label}必須是有效的非負數字`);
  return number;
}

function parseBoolean(value: string, fallback: boolean) {
  if (!value) return fallback;
  return ["true", "1", "yes", "y", "是", "已發布", "published"].includes(value.toLowerCase());
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
  if (!(file instanceof File)) return NextResponse.json({ error: "請選擇 CSV 或 Excel 檔案" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "檔案不可大於 10MB" }, { status: 400 });
  const fileName = file.name || "upload.csv";
  if (!/\.(csv|xlsx|xls)$/i.test(fileName)) return NextResponse.json({ error: "只支援 .csv、.xlsx 或 .xls 檔案" }, { status: 400 });
  const parsed = parseSpreadsheet(await file.arrayBuffer(), fileName);
  if (parsed.length < 2) return NextResponse.json({ error: "檔案必須包含標題列及至少一項產品" }, { status: 400 });
  const headers = parsed[0].map((header) => header.trim());
  const requiredHeader = headers.find((header) => ["產品名稱", "name", "名稱"].includes(header));
  if (!requiredHeader) return NextResponse.json({ error: "檔案必須包含「產品名稱」欄位" }, { status: 400 });
  if (parsed.length - 1 > MAX_ROWS) return NextResponse.json({ error: `單次最多匯入 ${MAX_ROWS} 項產品` }, { status: 400 });
  const { data: existing, error: readError } = await supabase.from("products").select("*");
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });
  const rows = existing || [];
  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (let index = 1; index < parsed.length; index += 1) {
    const values = parsed[index];
    const input = Object.fromEntries(headers.map((header, column) => [header, values[column] ?? ""]));
    const name = firstValue(input, ["產品名稱", "名稱", "name"]);
    const sku = firstValue(input, ["SKU", "sku", "mofu_sku"]);
    try {
      if (!name) throw new Error("產品名稱不可為空");
      const cost = parseNumber(firstValue(input, ["來貨價 CNY", "來貨價 RMB", "cost_price_rmb", "cny_cost"]), "來貨價 CNY", true)!;
      if (cost <= 0) throw new Error("來貨價 CNY 必須大於 0");
      const matched = findMatch(rows, firstValue(input, ["id"]), sku, name);
      const payload: Record<string, unknown> = {
        name,
        mofu_sku: sku || (matched?.mofu_sku ?? null),
        cost_price_rmb: cost,
        price: Math.round(cost * RATE * 100) / 100,
        original_price: Math.round(cost * RATE * 100) / 100,
        current_hkd: Math.round(cost * RATE * 100) / 100,
      };
      const stock = parseNumber(firstValue(input, ["庫存", "stock"]), "庫存");
      if (stock !== undefined) payload.stock = Math.trunc(stock);
      const images = firstValue(input, ["圖片 URL", "圖片 URL（以 | 分隔）", "images", "image_url"]);
      if (images) payload.images = images.split(/[|\r\n,;]+/).map((value) => value.trim()).filter(Boolean).slice(0, MAX_IMAGES);
      for (const [field, names] of Object.entries({ description: ["描述", "description"], category_id: ["分類 ID", "category_id"], brand: ["品牌", "brand"], status: ["狀態", "status"] })) {
        const value = firstValue(input, names);
        if (value) payload[field] = value;
      }
      const published = firstValue(input, ["已發布", "is_published"]);
      if (published) payload.is_published = parseBoolean(published, true);
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
      errors.push(`第 ${index + 1} 行：${error instanceof Error ? error.message : "格式錯誤"}`);
    }
  }
  return NextResponse.json({ created, updated, failed: errors.length, errors });
}
