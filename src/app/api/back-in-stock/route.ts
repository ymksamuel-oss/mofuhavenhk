import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import {
  getConfiguredProviders,
  sendWhatsAppNotification,
} from "@/lib/notifyWhatsapp";
import {
  normalizeBackInStockContact,
  type BackInStockContactKind,
} from "@/lib/back-in-stock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT = 5;
const requestCounts = new Map<string, { count: number; expiresAt: number }>();

type BackInStockRequestBody = {
  productId?: unknown;
  contactKind?: unknown;
  contact?: unknown;
  consent?: unknown;
  website?: unknown;
  locale?: unknown;
};

function sameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const requestHost = request.headers.get("host")?.split(",")[0]?.trim();
  if (!requestHost) return false;
  try {
    return new URL(origin).host.toLowerCase() === requestHost.toLowerCase();
  } catch {
    return false;
  }
}

function rateLimited(key: string): boolean {
  const now = Date.now();
  if (requestCounts.size > 10_000) {
    for (const [entryKey, value] of requestCounts) {
      if (value.expiresAt <= now) requestCounts.delete(entryKey);
    }
  }
  const existing = requestCounts.get(key);
  if (!existing || existing.expiresAt <= now) {
    requestCounts.set(key, { count: 1, expiresAt: now + RATE_WINDOW_MS });
    return false;
  }
  existing.count += 1;
  return existing.count > RATE_LIMIT;
}

function requestAddress(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  const forwardedIp = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .at(-1)
    ?.trim();
  return realIp || forwardedIp || "unknown";
}

function isContactKind(value: unknown): value is BackInStockContactKind {
  return value === "email" || value === "whatsapp";
}

export async function POST(request: Request) {
  if (!sameOriginRequest(request)) {
    return NextResponse.json({ ok: false, error: "invalid_origin" }, { status: 403 });
  }

  if (rateLimited(`ip:${requestAddress(request)}`)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 5_000) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  let body: BackInStockRequestBody;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 5_000) {
      return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
    }
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
    }
    body = parsed as BackInStockRequestBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Quietly discard basic bot submissions without sending any data to the shop.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const productId = typeof body.productId === "string" ? body.productId.trim() : "";
  if (
    !productId ||
    productId.length > 160 ||
    /[\r\n\u0000]/.test(productId) ||
    !isContactKind(body.contactKind) ||
    body.consent !== true
  ) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const contact = normalizeBackInStockContact(body.contactKind, body.contact);
  if (!contact) {
    return NextResponse.json({ ok: false, error: "invalid_contact" }, { status: 400 });
  }

  const contactHash = createHash("sha256").update(contact).digest("hex");
  if (rateLimited(`contact:${contactHash}`)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  if (getConfiguredProviders().length === 0) {
    return NextResponse.json({ ok: false, error: "notification_unavailable" }, { status: 503 });
  }

  const catalog = await getCatalogSnapshot();
  if (!catalog.products.length) {
    return NextResponse.json({ ok: false, error: "catalog_unavailable" }, { status: 503 });
  }
  const product = catalog.products.find((item) => item.id === productId);
  if (!product) {
    return NextResponse.json({ ok: false, error: "product_not_found" }, { status: 404 });
  }
  if (product.inStock !== false) {
    return NextResponse.json({ ok: false, error: "product_in_stock" }, { status: 409 });
  }

  const locale = body.locale === "en" ? "en" : "zh";
  const productName =
    (locale === "en" ? product.name.en : product.name.zh) ||
    product.name.zh ||
    product.name.en ||
    product.id;
  const sku = product.metadata?.mofu_sku?.trim() || product.id;
  const message = [
    "毛毛港｜缺貨商品補貨跟進登記",
    `商品：${productName}`,
    `SKU：${sku}`,
    `商品編號：${product.id}`,
    `聯絡方式：${body.contactKind === "email" ? "Email" : "WhatsApp"}`,
    `聯絡資料：${contact}`,
    `顧客已同意將聯絡方式透過 WhatsApp 傳予店主作人工跟進。語言：${locale === "en" ? "English" : "繁體中文"}`,
  ].join("\n");

  const result = await sendWhatsAppNotification(message);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "notification_failed" }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
