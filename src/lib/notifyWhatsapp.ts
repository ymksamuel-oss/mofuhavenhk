/**
 * Server-side "new order" WhatsApp notification for @MofuHavenHK.
 * Only import from server code (API routes) — never from client bundles.
 *
 * Primary path: CallMeBot (free). Credentials must be supplied only through
 * environment variables; the repository never carries plaintext secrets.
 */

import type { OrderItem } from "@/lib/order";
import { readServerEnv } from "@/lib/serverEnv";

const SHOP_HANDLE = readServerEnv("SHOP_WHATSAPP_HANDLE") || "MofuHavenHK";
const SITE_LABEL = readServerEnv("SHOP_SITE_LABEL") || "mofuhavenhk.com";

export type NotifyOrderInput = {
  orderNumber: string;
  customerName: string;
  paymentLabel: string;
  /** Real order total in HKD (subtotal + shipping). Never hardcode. */
  total: number;
  currency?: string;
  /** Catalog-revalidated items for shop-side picking; never client-provided prices. */
  items?: OrderItem[];
};

/**
 * Format HKD for WhatsApp gateways (esp. CallMeBot).
 * CallMeBot mangles `$` + digits in GET text — e.g. `HK$329` becomes `HK29`.
 * Always keep a space after the currency symbol.
 */
export function formatHkdForWhatsApp(total: number): string {
  const amount = Number.isFinite(total) ? total : 0;
  return `HK$ ${amount.toFixed(2)}`;
}

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
 * 商品：
 * - MH-… × 1
 * 請到後台 / Blobs 核對完整訂單資料。
 * — mofuhavenhk.com
 */
export function buildNotifyMessage({
  orderNumber,
  customerName,
  paymentLabel,
  total,
  currency = "HK$",
  items = [],
}: NotifyOrderInput): string {
  // Prefer safe CallMeBot-friendly formatting. If a custom currency is passed
  // that is not HK$, keep a space between symbol and amount.
  const formattedTotal =
    currency === "HK$" || currency === "HK＄"
      ? formatHkdForWhatsApp(total)
      : `${currency} ${Number(total).toFixed(2)}`;

  const itemLines = items.slice(0, 20).map((item) => {
    const identifier = item.mofuSku || item.name.zh || item.name.en;
    const variant = item.variantLabel?.zh || item.variantLabel?.en;
    return `- ${identifier}${variant ? `（${variant}）` : ""} × ${item.qty}`;
  });

  return [
    `🛒 Mofu Haven 新訂單通知`,
    `訂單編號：${orderNumber}`,
    `付款方式：${paymentLabel}`,
    `應付總額：${formattedTotal}`,
    `顧客：${customerName}`,
    ...(itemLines.length > 0 ? ["", "商品：", ...itemLines] : []),
    `請到後台 / Blobs 核對完整訂單資料。`,
    `— ${SITE_LABEL}`,
  ].join("\n");
}

/** Digits-only international shop phone (e.g. 85212345678). */
export function getShopWhatsAppPhoneDigits(): string {
  const raw =
    readServerEnv("WHATSAPP_PHONE") ||
    readServerEnv("SHOP_WHATSAPP_PHONE") ||
    readServerEnv("CALLMEBOT_PHONE") ||
    readServerEnv("TWILIO_WHATSAPP_TO").replace(/^whatsapp:/i, "") ||
    readServerEnv("WHATSAPP_CLOUD_TO") ||
    readServerEnv("GREEN_API_CHAT_ID").replace(/@c\.us$/i, "") ||
    "";
  return raw.replace(/\D/g, "");
}

/** CallMeBot API key (preferred: WHATSAPP_API_KEY). */
export function getCallMeBotApiKey(): string {
  return readServerEnv("WHATSAPP_API_KEY") || readServerEnv("CALLMEBOT_APIKEY");
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
    readServerEnv("WHATSAPP_CLOUD_TOKEN") &&
    readServerEnv("WHATSAPP_CLOUD_PHONE_NUMBER_ID") &&
    (readServerEnv("WHATSAPP_CLOUD_TO") || getShopWhatsAppPhoneDigits())
  ) {
    providers.push("meta");
  }
  if (
    readServerEnv("TWILIO_ACCOUNT_SID") &&
    readServerEnv("TWILIO_AUTH_TOKEN") &&
    readServerEnv("TWILIO_WHATSAPP_FROM") &&
    (readServerEnv("TWILIO_WHATSAPP_TO") || getShopWhatsAppPhoneDigits())
  ) {
    providers.push("twilio");
  }
  if (
    readServerEnv("GREEN_API_INSTANCE_ID") &&
    readServerEnv("GREEN_API_TOKEN") &&
    (readServerEnv("GREEN_API_CHAT_ID") || getShopWhatsAppPhoneDigits())
  ) {
    providers.push("greenapi");
  }
  return providers;
}

export function isNotifyConfigured(): boolean {
  return getConfiguredProviders().length > 0;
}

function safeEnvShape(value: string | undefined, pattern?: RegExp) {
  const normalized = value?.trim() || "";
  return {
    set: Boolean(normalized),
    length: normalized.length,
    formatOk: pattern ? pattern.test(normalized) : undefined,
  };
}

/**
 * Safe diagnostics for Vercel logs/health checks. Never return a secret value,
 * a token fragment, or a phone number; only presence, length and format.
 */
export function getNotificationDiagnostics() {
  const providerValue = readServerEnv("WHATSAPP_PROVIDER").toLowerCase();
  const knownProviders = new Set(["callmebot", "meta", "twilio", "greenapi"]);
  const phone = getShopWhatsAppPhoneDigits();
  const apiKey = getCallMeBotApiKey();

  return {
    runtime: {
      vercelEnv: process.env.VERCEL_ENV || "unknown",
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID || "unknown",
      gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
      gitCommitRef: process.env.VERCEL_GIT_COMMIT_REF || "unknown",
      gitRepoOwner: process.env.VERCEL_GIT_REPO_OWNER || "unknown",
      gitRepoSlug: process.env.VERCEL_GIT_REPO_SLUG || "unknown",
    },
    variables: {
      whatsappPhone: {
        set: Boolean(phone),
        digits: phone.length,
        internationalFormat: /^852\d{8}$/.test(phone),
      },
      whatsappApiKey: safeEnvShape(apiKey),
      whatsappProvider: {
        set: Boolean(providerValue),
        recognized: knownProviders.has(providerValue),
      },
      stripeWebhookSecret: safeEnvShape(
        readServerEnv("STRIPE_WEBHOOK_SECRET"),
        /^whsec_[A-Za-z0-9]+$/,
      ),
    },
    configuredProviders: getConfiguredProviders(),
  };
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
  const token = readServerEnv("WHATSAPP_CLOUD_TOKEN");
  const phoneNumberId = readServerEnv("WHATSAPP_CLOUD_PHONE_NUMBER_ID");
  const to =
    readServerEnv("WHATSAPP_CLOUD_TO").replace(/\D/g, "") ||
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
  const accountSid = readServerEnv("TWILIO_ACCOUNT_SID");
  const authToken = readServerEnv("TWILIO_AUTH_TOKEN");
  const from = readServerEnv("TWILIO_WHATSAPP_FROM");
  const shopDigits = getShopWhatsAppPhoneDigits();
  const to =
    readServerEnv("TWILIO_WHATSAPP_TO") ||
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
  const instanceId = readServerEnv("GREEN_API_INSTANCE_ID");
  const token = readServerEnv("GREEN_API_TOKEN");
  const shopDigits = getShopWhatsAppPhoneDigits();
  const chatId =
    readServerEnv("GREEN_API_CHAT_ID") ||
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
        `Set WHATSAPP_PHONE + WHATSAPP_API_KEY in the server environment.`,
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
