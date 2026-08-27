import { readServerEnv } from "@/lib/serverEnv";
import { isValidEmailAddress, normalizeEmailAddress } from "@/lib/emailAddress";

export type EmailReceiptLine = {
  name: string;
  variantLabel?: string;
  mofuSku?: string;
  quantity: number;
  unitAmountHkd: number;
};

export type OrderReceiptEmailInput = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  paidAt: Date;
  paymentLabel: string;
  subtotalHkd: number;
  shippingHkd: number;
  totalHkd: number;
  items: EmailReceiptLine[];
};

export type ReceiptEmailDeliveryResult =
  | { ok: true; status: "sent"; providerMessageId: string }
  | { ok: false; status: "not_configured" | "invalid_recipient" | "send_failed"; error: string };

type ResendResponse = { id?: unknown; message?: unknown; name?: unknown };
type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

const RESEND_EMAILS_URL = "https://api.resend.com/emails";
const LOGO_PATH = "/images/mofu-haven-cat-dog-logo-transparent.png";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function money(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `HK$${safe.toFixed(2)}`;
}

function dateTime(value: Date): string {
  return new Intl.DateTimeFormat("zh-HK", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Hong_Kong",
  }).format(value);
}

function siteUrl(): string {
  const raw = readServerEnv("NEXT_PUBLIC_SITE_URL") || "https://www.mofuhavenhk.com";
  try {
    return new URL(raw).origin;
  } catch {
    return "https://www.mofuhavenhk.com";
  }
}

function logoUrl(): string {
  return new URL(LOGO_PATH, `${siteUrl()}/`).toString();
}

export function isReceiptEmailConfigured(): boolean {
  return Boolean(readServerEnv("RESEND_API_KEY") && readServerEnv("RECEIPT_FROM_EMAIL"));
}

export function receiptEmailIdempotencyKey(paymentIntentId: string): string {
  return `mofu-payment-receipt/${paymentIntentId}`;
}

export function receiptEmailHtml(input: OrderReceiptEmailInput): string {
  const rows = input.items
    .map((item) => {
      const label = [item.name, item.variantLabel].filter(Boolean).join(" · ");
      const sku = item.mofuSku ? `<div style="margin-top:4px;color:#7b6b61;font-size:12px">店內貨號：${escapeHtml(item.mofuSku)}</div>` : "";
      return `<tr><td style="padding:16px 12px;border-bottom:1px solid #eee5df"><div style="font-weight:700;color:#3f312c">${escapeHtml(label)}</div>${sku}</td><td align="center" style="padding:16px 12px;border-bottom:1px solid #eee5df;color:#5c4d45">${item.quantity}</td><td align="right" style="padding:16px 12px;border-bottom:1px solid #eee5df;color:#5c4d45">${money(item.unitAmountHkd)}</td><td align="right" style="padding:16px 12px;border-bottom:1px solid #eee5df;font-weight:700;color:#3f312c">${money(item.unitAmountHkd * item.quantity)}</td></tr>`;
    })
    .join("");
  const safeName = escapeHtml(input.customerName || "顧客");
  return `<!doctype html><html lang="zh-HK"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:0;background:#f8f4f1;color:#3f312c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans TC','PingFang HK',Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden">Mofu Haven 付款電子收據｜訂單 ${escapeHtml(input.orderNumber)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8f4f1"><tr><td align="center" style="padding:30px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(79,56,43,.08)"><tr><td style="padding:32px 32px 22px;background:#fff8f3;text-align:center;border-bottom:1px solid #f0e2d9"><img src="${escapeHtml(logoUrl())}" alt="Mofu Haven" width="96" style="width:96px;height:auto;display:inline-block;border:0"><div style="margin-top:12px;font-size:24px;letter-spacing:.04em;font-weight:800;color:#5b3c31">Mofu Haven</div><div style="margin-top:7px;font-size:14px;color:#936e5c">付款電子收據</div></td></tr><tr><td style="padding:30px 32px"><p style="margin:0 0 18px;font-size:16px;line-height:1.7">${safeName}，多謝你支持 Mofu Haven！以下係你嘅付款確認及訂單明細。</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 25px;border:1px solid #efe6e0;border-radius:12px;background:#fffcfa"><tr><td style="padding:13px 16px;color:#7b6b61;font-size:13px">訂單編號</td><td align="right" style="padding:13px 16px;font-weight:800;color:#4e3429">${escapeHtml(input.orderNumber)}</td></tr><tr><td style="padding:13px 16px;border-top:1px solid #efe6e0;color:#7b6b61;font-size:13px">購買日期</td><td align="right" style="padding:13px 16px;border-top:1px solid #efe6e0;color:#4e3429">${escapeHtml(dateTime(input.paidAt))}</td></tr><tr><td style="padding:13px 16px;border-top:1px solid #efe6e0;color:#7b6b61;font-size:13px">付款方式</td><td align="right" style="padding:13px 16px;border-top:1px solid #efe6e0;color:#4e3429">${escapeHtml(input.paymentLabel)}</td></tr></table><h2 style="margin:0 0 12px;font-size:18px;color:#4e3429">訂購產品</h2><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse"><thead><tr style="background:#f7eee8"><th align="left" style="padding:12px;font-size:12px;color:#6f574b">商品</th><th align="center" style="padding:12px;font-size:12px;color:#6f574b">數量</th><th align="right" style="padding:12px;font-size:12px;color:#6f574b">單價</th><th align="right" style="padding:12px;font-size:12px;color:#6f574b">小計</th></tr></thead><tbody>${rows}</tbody></table><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:22px"><tr><td align="right" style="padding:5px 0;color:#7b6b61">商品小計</td><td align="right" style="padding:5px 0 5px 20px;width:120px;color:#4e3429">${money(input.subtotalHkd)}</td></tr><tr><td align="right" style="padding:5px 0;color:#7b6b61">運費</td><td align="right" style="padding:5px 0 5px 20px;width:120px;color:#4e3429">${money(input.shippingHkd)}</td></tr><tr><td align="right" style="padding:13px 0 0;font-weight:800;font-size:18px;color:#4e3429;border-top:1px solid #eadbd0">總金額</td><td align="right" style="padding:13px 0 0 20px;width:120px;font-weight:800;font-size:18px;color:#8a513a;border-top:1px solid #eadbd0">${money(input.totalHkd)}</td></tr></table></td></tr><tr><td style="padding:22px 32px;background:#fff8f3;border-top:1px solid #f0e2d9;text-align:center;font-size:12px;line-height:1.7;color:#7b6b61">此電子收據由 Mofu Haven 於付款成功後自動發出。如有訂單問題，請透過網站 WhatsApp 或電郵聯絡我們。<br>© ${new Date().getUTCFullYear()} Mofu Haven</td></tr></table></td></tr></table></body></html>`;
}

export function receiptEmailText(input: OrderReceiptEmailInput): string {
  const lines = input.items.map((item) => {
    const label = [item.name, item.variantLabel].filter(Boolean).join(" · ");
    return `- ${label}${item.mofuSku ? ` (${item.mofuSku})` : ""} × ${item.quantity}：${money(item.unitAmountHkd * item.quantity)}`;
  });
  return [
    "Mofu Haven 付款電子收據",
    `訂單編號：${input.orderNumber}`,
    `購買日期：${dateTime(input.paidAt)}`,
    `付款方式：${input.paymentLabel}`,
    "",
    "訂購產品：",
    ...lines,
    "",
    `商品小計：${money(input.subtotalHkd)}`,
    `運費：${money(input.shippingHkd)}`,
    `總金額：${money(input.totalHkd)}`,
  ].join("\n");
}

export async function sendOrderReceiptEmail(
  paymentIntentId: string,
  input: OrderReceiptEmailInput,
  fetcher: FetchLike = fetch,
): Promise<ReceiptEmailDeliveryResult> {
  const to = normalizeEmailAddress(input.customerEmail);
  if (!isValidEmailAddress(to)) {
    return { ok: false, status: "invalid_recipient", error: "invalid_recipient_email" };
  }
  const apiKey = readServerEnv("RESEND_API_KEY");
  const from = readServerEnv("RECEIPT_FROM_EMAIL");
  const replyTo = readServerEnv("RECEIPT_REPLY_TO_EMAIL");
  if (!apiKey || !from) {
    return { ok: false, status: "not_configured", error: "receipt_email_not_configured" };
  }
  try {
    const response = await fetcher(RESEND_EMAILS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": receiptEmailIdempotencyKey(paymentIntentId),
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Mofu Haven｜付款電子收據 ${input.orderNumber}`,
        html: receiptEmailHtml(input),
        text: receiptEmailText(input),
        ...(replyTo ? { reply_to: replyTo } : {}),
        tags: [
          { name: "category", value: "payment_receipt" },
          { name: "order", value: input.orderNumber },
        ],
      }),
    });
    const body = (await response.json().catch(() => ({}))) as ResendResponse;
    if (!response.ok || typeof body.id !== "string") {
      console.error("[receipt-email] provider rejected receipt", {
        paymentIntentId,
        orderNumber: input.orderNumber,
        status: response.status,
        providerError: typeof body.message === "string" ? body.message : body.name,
      });
      return { ok: false, status: "send_failed", error: "receipt_email_send_failed" };
    }
    return { ok: true, status: "sent", providerMessageId: body.id };
  } catch (error) {
    console.error("[receipt-email] provider request failed", {
      paymentIntentId,
      orderNumber: input.orderNumber,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, status: "send_failed", error: "receipt_email_send_failed" };
  }
}
