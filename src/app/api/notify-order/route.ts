import { NextResponse } from "next/server";
import {
  getCatalogDiagnostics,
  getCatalogSnapshot,
} from "@/lib/catalog-server";
import {
  buildNotifyMessage,
  getConfiguredProviders,
  isNotifyConfigured,
  sendWhatsAppNotification,
  getNotificationDiagnostics,
} from "@/lib/notifyWhatsapp";
import {
  buildOrderItemsFromLines,
  calcSubtotal,
  getShippingCost,
} from "@/lib/order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NotifyOrderRequestBody = {
  orderNumber?: unknown;
  customerName?: unknown;
  paymentLabel?: unknown;
  total?: unknown;
  currency?: unknown;
  /** Optional cart lines — when present, total is recalculated server-side. */
  items?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseOrderLines(
  raw: unknown,
): Array<{ id: string; qty: number }> | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const lines: Array<{ id: string; qty: number }> = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const id = (entry as { id?: unknown }).id;
    const qty = (entry as { qty?: unknown }).qty;
    if (typeof id !== "string" || !id.trim()) continue;
    const n = typeof qty === "number" ? qty : Number(qty);
    if (!Number.isFinite(n)) continue;
    lines.push({ id: id.trim(), qty: n });
  }
  return lines.length > 0 ? lines : null;
}

/**
 * GET /api/notify-order
 * Lightweight health check — reports whether a server-side WhatsApp
 * gateway is configured (never exposes secrets).
 */
export async function GET(request: Request) {
  const providers = getConfiguredProviders();
  const url = new URL(request.url);
  const diagnostics = url.searchParams.get("diagnostics") === "1";
  const catalog = diagnostics ? await getCatalogDiagnostics() : undefined;

  return NextResponse.json({
    ok: true,
    shopHandle: process.env.SHOP_WHATSAPP_HANDLE?.trim() || "MofuHavenHK",
    configured: providers.length > 0,
    providers,
    ...(diagnostics
      ? {
          diagnostics: {
            ...getNotificationDiagnostics(),
            catalog,
          },
        }
      : {}),
  });
}

/**
 * POST /api/notify-order
 *
 * Called from /checkout when the customer places an order. Formats the
 * shop-owner WhatsApp template and sends it **server-side** to @MofuHavenHK
 * via CallMeBot (`WHATSAPP_PHONE` + `WHATSAPP_API_KEY`).
 *
 * Prefer sending `items` so the payable total is recomputed from the catalog
 * (subtotal + shipping) and cannot drift from a stale/hardcoded client value.
 */
export async function POST(request: Request) {
  let body: NotifyOrderRequestBody;
  try {
    body = (await request.json()) as NotifyOrderRequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const { orderNumber, customerName, paymentLabel, total, currency } = body;
  const lines = parseOrderLines(body.items);

  let resolvedTotal: number | null = null;
  if (lines) {
    const catalog = await getCatalogSnapshot();
    const items = buildOrderItemsFromLines(lines, catalog.products);
    if (items.length > 0) {
      const subtotal = calcSubtotal(items);
      resolvedTotal = subtotal + getShippingCost(subtotal, items.length > 0);
    }
  } else if (typeof total === "number" && Number.isFinite(total) && total > 0) {
    resolvedTotal = total;
  }

  if (
    !isNonEmptyString(orderNumber) ||
    !isNonEmptyString(customerName) ||
    !isNonEmptyString(paymentLabel) ||
    resolvedTotal === null ||
    resolvedTotal <= 0
  ) {
    return NextResponse.json(
      { ok: false, error: "invalid_input" },
      { status: 400 },
    );
  }

  if (!isNotifyConfigured()) {
    console.error(
      "[notify-order] Rejecting order notify — no WhatsApp gateway env vars on this deployment.",
    );
    return NextResponse.json(
      {
        ok: false,
        error: "not_configured",
        hint: "Set WHATSAPP_PHONE + WHATSAPP_API_KEY on Vercel (CallMeBot) for @MofuHavenHK.",
      },
      { status: 503 },
    );
  }

  const message = buildNotifyMessage({
    orderNumber: orderNumber.trim().slice(0, 60),
    customerName: customerName.trim().slice(0, 100),
    paymentLabel: paymentLabel.trim().slice(0, 100),
    total: resolvedTotal,
    currency: isNonEmptyString(currency) ? currency.trim() : "HK$",
  });

  const result = await sendWhatsAppNotification(message);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    provider: result.provider,
    delivered: true,
    total: resolvedTotal,
  });
}
