/**
 * Server-side "new order" WhatsApp notification, sent automatically to the
 * shop's own WhatsApp number whenever a customer places an order at
 * /checkout. This is separate from src/lib/whatsapp.ts, which builds a
 * customer-facing "send to WhatsApp" link the *customer* triggers manually.
 *
 * This module must only ever be imported from server code (API routes /
 * server actions) — it reads secret API credentials from process.env and
 * must never be bundled into client JavaScript.
 */

// Shown in the notification header so it's unambiguous which shop account
// this order belongs to (useful if a shared number/provider account is ever
// reused across multiple stores). Override with SHOP_WHATSAPP_HANDLE if the
// account is ever renamed.
const SHOP_HANDLE = process.env.SHOP_WHATSAPP_HANDLE?.trim() || "MofuHavenHK";

export type NotifyOrderInput = {
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  paymentLabel: string;
  total: number;
  currency: string;
  siteUrl: string;
};

export function buildNotifyMessage({
  orderNumber,
  customerName,
  customerPhone,
  paymentLabel,
  total,
  currency,
  siteUrl,
}: NotifyOrderInput): string {
  const formattedTotal = `${currency}${total.toLocaleString("en-HK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const lines = [
    `🛎️ 新訂單通知 / New Order Notification — @${SHOP_HANDLE}`,
    "",
    `訂單編號 / Order No.: ${orderNumber}`,
    `顧客姓名 / Customer: ${customerName}`,
  ];

  if (customerPhone) {
    lines.push(`顧客電話 / Phone: ${customerPhone}`);
  }

  lines.push(
    `付款方式 / Payment method: ${paymentLabel}`,
    `應付總額 / Total due: ${formattedTotal}`,
    `網店連結 / Website: ${siteUrl}`,
  );

  return lines.join("\n");
}

export type NotifyResult =
  | { ok: true; provider: "twilio" | "callmebot" }
  | { ok: false; error: string };

/**
 * Runs a fetch call and retries once after a short delay if the network
 * request itself throws (DNS/timeout/connection reset, etc.). A malformed
 * response (bad status, bad credentials) is NOT retried since a second
 * attempt would fail the same way.
 */
async function fetchWithRetry(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return fetch(input, init);
  }
}

async function sendViaTwilio(message: string): Promise<NotifyResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.TWILIO_WHATSAPP_TO;

  if (!accountSid || !authToken || !from || !to) {
    return { ok: false, error: "twilio_not_configured" };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const body = new URLSearchParams({ From: from, To: to, Body: message });
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  try {
    const res = await fetchWithRetry(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        error: `twilio_error_${res.status}: ${text.slice(0, 200)}`,
      };
    }
    return { ok: true, provider: "twilio" };
  } catch (err) {
    return {
      ok: false,
      error: `twilio_network_error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function sendViaCallMeBot(message: string): Promise<NotifyResult> {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;

  if (!phone || !apikey) {
    return { ok: false, error: "callmebot_not_configured" };
  }

  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
    phone,
  )}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(apikey)}`;

  try {
    const res = await fetchWithRetry(url, { method: "GET" });
    const text = await res.text().catch(() => "");

    // CallMeBot returns HTTP 200 even for invalid credentials/config, with
    // an "ERROR: ..." message in the body, so the status code alone isn't
    // enough to tell success from failure.
    if (!res.ok || /^\s*error/i.test(text)) {
      return {
        ok: false,
        error: `callmebot_error_${res.status}: ${text.slice(0, 200)}`,
      };
    }
    return { ok: true, provider: "callmebot" };
  } catch (err) {
    return {
      ok: false,
      error: `callmebot_network_error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Sends the new-order WhatsApp notification via whichever provider is
 * configured (Twilio WhatsApp API is tried first, falling back to
 * CallMeBot). Never throws — always resolves to a result object so callers
 * (the /api/notify-order route) can respond gracefully and the checkout
 * flow is never blocked by a missing/failed integration. Logs the outcome
 * server-side (visible in your hosting provider's function logs, e.g.
 * Vercel → Project → Logs) so delivery issues can be diagnosed without
 * exposing anything to the customer.
 */
export async function sendWhatsAppNotification(
  message: string,
): Promise<NotifyResult> {
  const hasTwilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_FROM &&
      process.env.TWILIO_WHATSAPP_TO,
  );
  const hasCallMeBot = Boolean(
    process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_APIKEY,
  );

  if (!hasTwilio && !hasCallMeBot) {
    console.error(
      `[notify-order] @${SHOP_HANDLE}: no WhatsApp provider configured (set CALLMEBOT_PHONE/CALLMEBOT_APIKEY or the TWILIO_* variables).`,
    );
    return { ok: false, error: "not_configured" };
  }

  let result: NotifyResult;
  if (hasTwilio) {
    result = await sendViaTwilio(message);
    if (!result.ok && hasCallMeBot) {
      result = await sendViaCallMeBot(message);
    }
  } else {
    result = await sendViaCallMeBot(message);
  }

  if (result.ok) {
    console.log(
      `[notify-order] @${SHOP_HANDLE}: WhatsApp notification sent via ${result.provider}.`,
    );
  } else {
    console.error(
      `[notify-order] @${SHOP_HANDLE}: WhatsApp notification failed — ${result.error}`,
    );
  }

  return result;
}
