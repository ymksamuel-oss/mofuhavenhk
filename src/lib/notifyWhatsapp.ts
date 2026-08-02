/**
 * Server-side "new order" WhatsApp notification for @MofuHavenHK.
 * Only import from server code (API routes) — never from client bundles.
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

export type NotifyResult =
  | { ok: true; provider: "twilio" | "callmebot" }
  | { ok: false; error: string };

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
 * Sends the new-order WhatsApp message to the shop (@MofuHavenHK) via
 * Twilio (preferred) or CallMeBot. Never throws.
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
      `[notify-order] @${SHOP_HANDLE}: no WhatsApp provider configured (set CALLMEBOT_* or TWILIO_*).`,
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
