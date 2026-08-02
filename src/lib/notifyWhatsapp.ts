/**
 * Server-side "new order" WhatsApp notification for @MofuHavenHK.
 * Only import from server code (API routes) — never from client bundles.
 *
 * Delivery is fully server-side via a configured WhatsApp gateway
 * (Meta Cloud API → Twilio → Green API → CallMeBot). This must never
 * fall back to opening wa.me / Click-to-Chat in the customer's browser.
 */

const SHOP_HANDLE = process.env.SHOP_WHATSAPP_HANDLE?.trim() || "MofuHavenHK";
const SITE_LABEL =
  process.env.SHOP_SITE_LABEL?.trim() || "mofuhavenhk.com";

export type NotifyOrderInput = {
  orderNumber: string;
  customerName: string;
  paymentLabel: string;
  total: number;
  currency?: string;
};

export type NotifyProvider =
  | "meta"
  | "twilio"
  | "greenapi"
  | "callmebot";

export type NotifyResult =
  | { ok: true; provider: NotifyProvider }
  | { ok: false; error: string };

/**
 * Exact shop-owner notification template (must stay in this shape):
 *
 * 🛒 Mofu Haven 新訂單通知
 * 訂單編號：MH…
 * 付款方式：…
 * 應付總額：HK$…
 * 顧客：…
 * 請到後台 / Blobs 核對完整訂單資料。
 * — mofuhavenhk.com
 */
export function buildNotifyMessage({
  orderNumber,
  customerName,
  paymentLabel,
  total,
  currency = "HK$",
}: NotifyOrderInput): string {
  const formattedTotal = `${currency}${total.toLocaleString("en-HK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

  return [
    `🛒 Mofu Haven 新訂單通知`,
    `訂單編號：${orderNumber}`,
    `付款方式：${paymentLabel}`,
    `應付總額：${formattedTotal}`,
    `顧客：${customerName}`,
    `請到後台 / Blobs 核對完整訂單資料。`,
    `— ${SITE_LABEL}`,
  ].join("\n");
}

/** Digits-only international shop phone (e.g. 85212345678). */
export function getShopWhatsAppPhoneDigits(): string {
  const raw =
    process.env.SHOP_WHATSAPP_PHONE?.trim() ||
    process.env.CALLMEBOT_PHONE?.trim() ||
    process.env.TWILIO_WHATSAPP_TO?.replace(/^whatsapp:/i, "").trim() ||
    process.env.WHATSAPP_CLOUD_TO?.trim() ||
    process.env.GREEN_API_CHAT_ID?.replace(/@c\.us$/i, "").trim() ||
    "";
  return raw.replace(/\D/g, "");
}

export function getConfiguredProviders(): NotifyProvider[] {
  const providers: NotifyProvider[] = [];
  if (
    process.env.WHATSAPP_CLOUD_TOKEN &&
    process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID &&
    (process.env.WHATSAPP_CLOUD_TO || getShopWhatsAppPhoneDigits())
  ) {
    providers.push("meta");
  }
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_FROM &&
    (process.env.TWILIO_WHATSAPP_TO || getShopWhatsAppPhoneDigits())
  ) {
    providers.push("twilio");
  }
  if (
    process.env.GREEN_API_INSTANCE_ID &&
    process.env.GREEN_API_TOKEN &&
    (process.env.GREEN_API_CHAT_ID || getShopWhatsAppPhoneDigits())
  ) {
    providers.push("greenapi");
  }
  if (
    process.env.CALLMEBOT_APIKEY &&
    (process.env.CALLMEBOT_PHONE || getShopWhatsAppPhoneDigits())
  ) {
    providers.push("callmebot");
  }
  return providers;
}

export function isNotifyConfigured(): boolean {
  return getConfiguredProviders().length > 0;
}

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

async function sendViaMetaCloud(message: string): Promise<NotifyResult> {
  const token = process.env.WHATSAPP_CLOUD_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID?.trim();
  const to =
    process.env.WHATSAPP_CLOUD_TO?.replace(/\D/g, "") ||
    getShopWhatsAppPhoneDigits();

  if (!token || !phoneNumberId || !to) {
    return { ok: false, error: "meta_not_configured" };
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  try {
    const res = await fetchWithRetry(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { preview_url: false, body: message },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        error: `meta_error_${res.status}: ${text.slice(0, 200)}`,
      };
    }
    return { ok: true, provider: "meta" };
  } catch (err) {
    return {
      ok: false,
      error: `meta_network_error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function sendViaTwilio(message: string): Promise<NotifyResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_WHATSAPP_FROM?.trim();
  const shopDigits = getShopWhatsAppPhoneDigits();
  const to =
    process.env.TWILIO_WHATSAPP_TO?.trim() ||
    (shopDigits ? `whatsapp:+${shopDigits}` : "");

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

async function sendViaGreenApi(message: string): Promise<NotifyResult> {
  const instanceId = process.env.GREEN_API_INSTANCE_ID?.trim();
  const token = process.env.GREEN_API_TOKEN?.trim();
  const shopDigits = getShopWhatsAppPhoneDigits();
  const chatId =
    process.env.GREEN_API_CHAT_ID?.trim() ||
    (shopDigits ? `${shopDigits}@c.us` : "");

  if (!instanceId || !token || !chatId) {
    return { ok: false, error: "greenapi_not_configured" };
  }

  const url = `https://api.green-api.com/waInstance${instanceId}/sendMessage/${token}`;

  try {
    const res = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, message }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        error: `greenapi_error_${res.status}: ${text.slice(0, 200)}`,
      };
    }
    return { ok: true, provider: "greenapi" };
  } catch (err) {
    return {
      ok: false,
      error: `greenapi_network_error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function sendViaCallMeBot(message: string): Promise<NotifyResult> {
  const phone =
    process.env.CALLMEBOT_PHONE?.replace(/\D/g, "") ||
    getShopWhatsAppPhoneDigits();
  const apikey = process.env.CALLMEBOT_APIKEY?.trim();

  if (!phone || !apikey) {
    return { ok: false, error: "callmebot_not_configured" };
  }

  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
    phone,
  )}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(apikey)}`;

  try {
    const res = await fetchWithRetry(url, { method: "GET" });
    const text = await res.text().catch(() => "");

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

type Sender = (message: string) => Promise<NotifyResult>;

const PROVIDER_SENDERS: Record<NotifyProvider, Sender> = {
  meta: sendViaMetaCloud,
  twilio: sendViaTwilio,
  greenapi: sendViaGreenApi,
  callmebot: sendViaCallMeBot,
};

/**
 * Sends the new-order WhatsApp message to the shop (@MofuHavenHK)
 * server-side. Tries every configured provider in priority order until one
 * succeeds. Never throws. Never opens a browser / wa.me link.
 */
export async function sendWhatsAppNotification(
  message: string,
): Promise<NotifyResult> {
  const providers = getConfiguredProviders();

  if (providers.length === 0) {
    console.error(
      `[notify-order] @${SHOP_HANDLE}: no WhatsApp gateway configured. ` +
        `Set WHATSAPP_CLOUD_*, TWILIO_*, GREEN_API_*, or CALLMEBOT_* ` +
        `(plus SHOP_WHATSAPP_PHONE for @${SHOP_HANDLE}).`,
    );
    return { ok: false, error: "not_configured" };
  }

  let lastError = "send_failed";
  for (const provider of providers) {
    const result = await PROVIDER_SENDERS[provider](message);
    if (result.ok) {
      console.log(
        `[notify-order] @${SHOP_HANDLE}: WhatsApp notification sent via ${result.provider}.`,
      );
      return result;
    }
    lastError = result.error;
    console.error(
      `[notify-order] @${SHOP_HANDLE}: ${provider} failed — ${result.error}`,
    );
  }

  return { ok: false, error: lastError };
}
