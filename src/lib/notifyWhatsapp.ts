/**
 * Server-side "new order" WhatsApp notification for @MofuHavenHK.
 * Only import from server code (API routes) — never from client bundles.
 *
 * Primary path: CallMeBot (free). Defaults below are the shop's CallMeBot
 * credentials so Production works even before Vercel env is filled in.
 * Override anytime with WHATSAPP_PHONE / WHATSAPP_API_KEY on Vercel.
 */

const SHOP_HANDLE = process.env.SHOP_WHATSAPP_HANDLE?.trim() || "MofuHavenHK";
const SITE_LABEL =
  process.env.SHOP_SITE_LABEL?.trim() || "mofuhavenhk.com";

/** @MofuHavenHK CallMeBot phone (digits). Overridable via WHATSAPP_PHONE. */
const DEFAULT_WHATSAPP_PHONE = "85298646585";
/** @MofuHavenHK CallMeBot apikey. Overridable via WHATSAPP_API_KEY. */
const DEFAULT_WHATSAPP_API_KEY = "6352845";

export type NotifyOrderInput = {
  orderNumber: string;
  customerName: string;
  paymentLabel: string;
  total: number;
  currency?: string;
};

export type NotifyProvider =
  | "callmebot"
  | "meta"
  | "twilio"
  | "greenapi";

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
    process.env.WHATSAPP_PHONE?.trim() ||
    process.env.SHOP_WHATSAPP_PHONE?.trim() ||
    process.env.CALLMEBOT_PHONE?.trim() ||
    process.env.TWILIO_WHATSAPP_TO?.replace(/^whatsapp:/i, "").trim() ||
    process.env.WHATSAPP_CLOUD_TO?.trim() ||
    process.env.GREEN_API_CHAT_ID?.replace(/@c\.us$/i, "").trim() ||
    DEFAULT_WHATSAPP_PHONE;
  return raw.replace(/\D/g, "");
}

/** CallMeBot API key (preferred: WHATSAPP_API_KEY). */
export function getCallMeBotApiKey(): string {
  return (
    process.env.WHATSAPP_API_KEY?.trim() ||
    process.env.CALLMEBOT_APIKEY?.trim() ||
    DEFAULT_WHATSAPP_API_KEY
  );
}

export function isCallMeBotConfigured(): boolean {
  return Boolean(getShopWhatsAppPhoneDigits() && getCallMeBotApiKey());
}

export function getConfiguredProviders(): NotifyProvider[] {
  const providers: NotifyProvider[] = [];

  // CallMeBot first — simplest free path for @MofuHavenHK
  if (isCallMeBotConfigured()) {
    providers.push("callmebot");
  }
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

/**
 * CallMeBot free WhatsApp text API.
 * GET https://api.callmebot.com/whatsapp.php?phone=...&text=...&apikey=...
 */
async function sendViaCallMeBot(message: string): Promise<NotifyResult> {
  const phone = getShopWhatsAppPhoneDigits();
  const apikey = getCallMeBotApiKey();

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

type Sender = (message: string) => Promise<NotifyResult>;

const PROVIDER_SENDERS: Record<NotifyProvider, Sender> = {
  callmebot: sendViaCallMeBot,
  meta: sendViaMetaCloud,
  twilio: sendViaTwilio,
  greenapi: sendViaGreenApi,
};

/**
 * Sends the new-order WhatsApp message to the shop (@MofuHavenHK)
 * server-side via CallMeBot (preferred). Never opens wa.me.
 */
export async function sendWhatsAppNotification(
  message: string,
): Promise<NotifyResult> {
  const providers = getConfiguredProviders();

  if (providers.length === 0) {
    console.error(
      `[notify-order] @${SHOP_HANDLE}: CallMeBot not configured. ` +
        `Set WHATSAPP_PHONE + WHATSAPP_API_KEY on Vercel.`,
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
