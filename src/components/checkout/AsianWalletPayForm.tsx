"use client";

import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlipayHkLogo, WeChatPayLogo } from "@/components/icons/PaymentIcons";
import { useI18n } from "@/lib/i18n/I18nProvider";

export type AsianWalletMethod = "wechatpay" | "alipayhk";

type AsianWalletPayFormProps = {
  method: AsianWalletMethod;
  clientSecret: string;
  publishableKey: string;
  customerName?: string;
  returnUrl: string;
  onPaid: (paymentIntentId: string) => Promise<void>;
  onError: (message: string) => void;
};

let stripePromiseCache: { key: string; promise: Promise<Stripe | null> } | null =
  null;

function getStripePromise(publishableKey: string) {
  if (!stripePromiseCache || stripePromiseCache.key !== publishableKey) {
    stripePromiseCache = {
      key: publishableKey,
      promise: loadStripe(publishableKey),
    };
  }
  return stripePromiseCache.promise;
}

async function persistCustomerName(
  paymentIntentId: string,
  customerName: string,
) {
  if (!customerName.trim()) return;
  try {
    await fetch("/api/stripe/update-customer-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentIntentId,
        customerName: customerName.trim(),
      }),
    });
  } catch {
    // complete-order may still succeed with shipping metadata from PI create
  }
}

/**
 * Stripe WeChat Pay (QR) + Alipay / AlipayHK (redirect) confirm UI.
 * Requires the methods to be enabled on the Stripe Dashboard for HKD.
 */
export function AsianWalletPayForm({
  method,
  clientSecret,
  publishableKey,
  customerName = "",
  returnUrl,
  onPaid,
  onError,
}: AsianWalletPayFormProps) {
  const { t } = useI18n();
  const stripePromise = useMemo(
    () => getStripePromise(publishableKey),
    [publishableKey],
  );
  const [submitting, setSubmitting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [waitingScan, setWaitingScan] = useState(false);
  const pollRef = useRef<number | null>(null);
  const paidRef = useRef(false);

  const paymentIntentId = clientSecret.split("_secret")[0] || "";

  const stopPolling = useCallback(() => {
    if (pollRef.current != null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  useEffect(() => {
    onError("");
    setQrDataUrl(null);
    setWaitingScan(false);
    setSubmitting(false);
    paidRef.current = false;
    stopPolling();
  }, [clientSecret, method, onError, stopPolling]);

  const finishPaid = useCallback(
    async (intentId: string) => {
      if (paidRef.current) return;
      paidRef.current = true;
      stopPolling();
      setWaitingScan(false);
      setSubmitting(false);
      await onPaid(intentId);
    },
    [onPaid, stopPolling],
  );

  const startWechatPolling = useCallback(
    (stripe: Stripe) => {
      stopPolling();
      setWaitingScan(true);
      pollRef.current = window.setInterval(() => {
        void (async () => {
          const { paymentIntent, error } =
            await stripe.retrievePaymentIntent(clientSecret);
          if (error) {
            stopPolling();
            setWaitingScan(false);
            onError(error.message || t("stripePayFailed"));
            return;
          }
          if (!paymentIntent) return;
          if (paymentIntent.status === "succeeded") {
            await finishPaid(paymentIntent.id);
            return;
          }
          if (
            paymentIntent.status === "canceled" ||
            paymentIntent.status === "requires_payment_method"
          ) {
            stopPolling();
            setWaitingScan(false);
            setQrDataUrl(null);
            onError(t("stripePayFailed"));
          }
        })();
      }, 2500);
    },
    [clientSecret, finishPaid, onError, stopPolling, t],
  );

  const handlePay = async () => {
    if (submitting) return;
    setSubmitting(true);
    onError("");

    const stripe = await stripePromise;
    if (!stripe) {
      onError(t("stripePayFailed"));
      setSubmitting(false);
      return;
    }

    if (paymentIntentId) {
      await persistCustomerName(paymentIntentId, customerName);
    }

    if (method === "alipayhk") {
      const { error } = await stripe.confirmAlipayPayment(clientSecret, {
        return_url: returnUrl,
        payment_method: {
          billing_details: customerName.trim()
            ? { name: customerName.trim() }
            : undefined,
        },
      });
      if (error) {
        onError(error.message || t("stripePayFailed"));
        setSubmitting(false);
      }
      // Successful path redirects away from this page.
      return;
    }

    // WeChat Pay — confirm then show QR; poll until paid.
    const { error, paymentIntent } = await stripe.confirmWechatPayPayment(
      clientSecret,
      {
        payment_method_options: {
          wechat_pay: { client: "web" },
        },
        payment_method: {
          billing_details: customerName.trim()
            ? { name: customerName.trim() }
            : undefined,
        },
      },
      { handleActions: false },
    );

    if (error) {
      onError(error.message || t("stripePayFailed"));
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      await finishPaid(paymentIntent.id);
      return;
    }

    const qr =
      paymentIntent?.next_action?.wechat_pay_display_qr_code?.image_data_url ||
      null;
    if (qr) {
      setQrDataUrl(qr);
      setSubmitting(false);
      startWechatPolling(stripe);
      return;
    }

    onError(t("stripePayFailed"));
    setSubmitting(false);
  };

  const isWechat = method === "wechatpay";
  const brandColor = isWechat ? "#09BB07" : "#00A0E9";
  const Logo = isWechat ? WeChatPayLogo : AlipayHkLogo;

  return (
    <div className="space-y-4" data-asian-wallet={method}>
      <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--accent-soft)]/35 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[color:var(--line)] bg-white">
            <Logo />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[color:var(--ink)]">
              {isWechat ? t("payWeChatPay") : t("payAlipayHk")}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-[color:var(--muted)]">
              {isWechat ? t("wechatPayHint") : t("alipayHkHint")}
            </p>
          </div>
        </div>
      </div>

      {qrDataUrl ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[color:var(--line)] bg-white px-4 py-5">
          {/* eslint-disable-next-line @next/next/no-img-element -- Stripe-provided WeChat QR data URL */}
          <img
            src={qrDataUrl}
            alt={t("wechatPayQrAlt")}
            width={220}
            height={220}
            className="h-[220px] w-[220px] max-w-full object-contain"
          />
          <p className="text-center text-xs font-medium text-[color:var(--muted)]">
            {waitingScan ? t("wechatPayWaiting") : t("wechatPayScanHint")}
          </p>
        </div>
      ) : null}

      {!qrDataUrl ? (
        <button
          type="button"
          onClick={() => void handlePay()}
          disabled={submitting}
          className="w-full rounded-2xl px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,0,0,0.35)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          style={{ backgroundColor: brandColor }}
        >
          {submitting
            ? t("stripePaying")
            : isWechat
              ? t("wechatPayCta")
              : t("alipayHkCta")}
        </button>
      ) : null}

      <p className="text-center text-[11px] text-[color:var(--muted)]">
        {t("walletMethodsNote")}
      </p>
    </div>
  );
}
