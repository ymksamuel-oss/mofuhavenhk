"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import {
  PAYMENT_METHODS,
  PaymentMethods,
  type MethodId,
} from "@/components/checkout/PaymentMethods";
import { SelectedCategoryNotice } from "@/components/checkout/SelectedCategoryNotice";
import { StripePaymentForm } from "@/components/checkout/StripePaymentForm";
import { WhatsAppOrder } from "@/components/checkout/WhatsAppOrder";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  calcSubtotal,
  generateOrderNumber,
  getOrderItems,
  SHIPPING,
} from "@/lib/order";
import { buildOrderMessage, openWhatsAppOrder } from "@/lib/whatsapp";

type PayPhase =
  | "idle"
  | "preparing"
  | "ready"
  | "completing"
  | "paid"
  | "paid_notify_failed"
  | "stripe_missing"
  | "error";

function CheckoutContent() {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const items = getOrderItems(category);
  const amountHkd = calcSubtotal(items) + SHIPPING;

  const [selectedMethod, setSelectedMethod] = useState<MethodId>("card");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [phase, setPhase] = useState<PayPhase>("idle");
  const [payError, setPayError] = useState("");
  const [manualWaError, setManualWaError] = useState(false);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(
    null,
  );
  const preparingRef = useRef(false);

  useEffect(() => {
    setOrderNumber(generateOrderNumber());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/stripe/config");
        const data = (await res.json()) as {
          configured?: boolean;
          publishableKey?: string | null;
        };
        if (cancelled) return;
        setStripeConfigured(Boolean(data.configured));
        setPublishableKey(data.publishableKey ?? null);
        if (!data.configured) setPhase("stripe_missing");
      } catch {
        if (!cancelled) {
          setStripeConfigured(false);
          setPhase("stripe_missing");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSendToWhatsApp = () => {
    const number = orderNumber ?? generateOrderNumber();
    const paymentLabelKey = PAYMENT_METHODS.find(
      (method) => method.id === selectedMethod,
    )?.labelKey;
    const message = buildOrderMessage({
      items,
      orderNumber: number,
      locale,
      t,
      paymentLabel: paymentLabelKey ? t(paymentLabelKey) : undefined,
    });
    const opened = openWhatsAppOrder(message);
    setManualWaError(!opened);
  };

  /** Keep card fields mounted — only clear/set the inline error text. */
  const handlePayError = useCallback((message: string) => {
    setPayError(message);
  }, []);

  const startStripePayment = useCallback(async () => {
    if (!customerName.trim()) {
      setNameError(true);
      return;
    }
    if (!stripeConfigured || !publishableKey) {
      setPhase("stripe_missing");
      return;
    }
    if (preparingRef.current) return;
    if (phase === "paid" || phase === "paid_notify_failed") return;

    preparingRef.current = true;
    setNameError(false);
    setPayError("");
    setPhase("preparing");

    const number = orderNumber ?? generateOrderNumber();
    setOrderNumber(number);

    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          category,
          orderNumber: number,
          locale,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        clientSecret?: string;
        orderNumber?: string;
      };

      if (data.error === "stripe_not_configured" || res.status === 503) {
        setPhase("stripe_missing");
        return;
      }
      if (!res.ok || !data.ok || !data.clientSecret) {
        setPayError(t("stripePayFailed"));
        setPhase("error");
        return;
      }

      if (data.orderNumber) setOrderNumber(data.orderNumber);
      setClientSecret(data.clientSecret);
      setPhase("ready");
    } catch {
      setPayError(t("stripePayFailed"));
      setPhase("error");
    } finally {
      preparingRef.current = false;
    }
  }, [
    category,
    customerName,
    locale,
    orderNumber,
    phase,
    publishableKey,
    stripeConfigured,
    t,
  ]);

  // After the guest enters a name, prepare the PaymentIntent so card fields appear.
  useEffect(() => {
    if (!stripeConfigured || !publishableKey) return;
    if (!customerName.trim()) return;
    if (clientSecret && (phase === "ready" || phase === "completing")) return;
    if (phase === "paid" || phase === "paid_notify_failed") return;

    const timer = window.setTimeout(() => {
      void startStripePayment();
    }, 450);
    return () => window.clearTimeout(timer);
  }, [
    clientSecret,
    customerName,
    phase,
    publishableKey,
    startStripePayment,
    stripeConfigured,
  ]);

  const handlePaid = async (paymentIntentId: string) => {
    setPhase("completing");
    setPayError("");
    try {
      const res = await fetch("/api/stripe/complete-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        notified?: boolean;
        alreadyNotified?: boolean;
        orderNumber?: string;
      };

      if (!res.ok || !data.ok) {
        setPayError(t("stripePayFailed"));
        // Keep Elements mounted if payment already succeeded on Stripe side.
        setPhase("ready");
        return;
      }

      if (data.orderNumber) setOrderNumber(data.orderNumber);

      if (data.notified || data.alreadyNotified) {
        setPhase("paid");
      } else {
        setPhase("paid_notify_failed");
      }
    } catch {
      setPhase("paid_notify_failed");
    }
  };

  const showForm =
    Boolean(clientSecret && publishableKey) &&
    (phase === "ready" || phase === "completing" || phase === "error");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-4xl">
          {t("checkoutTitle")}
        </h1>
        <p className="mt-2 text-[color:var(--muted)]">{t("checkoutSubtitle")}</p>
        <SelectedCategoryNotice />
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <PaymentMethods selected={selectedMethod} onSelect={setSelectedMethod} />
        <div className="milk-tea-card space-y-6 p-5 sm:p-6">
          <OrderSummary items={items} />

          <div>
            <label
              htmlFor="customer-name"
              className="mb-1.5 block text-sm font-medium text-[color:var(--ink)]"
            >
              {t("customerNameLabel")}
            </label>
            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(event) => {
                setCustomerName(event.target.value);
                if (nameError) setNameError(false);
                // Changing name after an intent was created: reset so a fresh
                // PaymentIntent is prepared with the updated name.
                if (clientSecret && phase === "ready") {
                  setClientSecret(null);
                  setPhase("idle");
                }
              }}
              placeholder={t("customerNamePlaceholder")}
              autoComplete="name"
              disabled={phase === "paid" || phase === "paid_notify_failed"}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[color:var(--ink)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] disabled:opacity-60 ${
                nameError ? "border-red-400" : "border-[color:var(--line)]"
              }`}
            />
            {nameError ? (
              <p className="mt-1.5 text-xs text-red-500">
                {t("customerNameRequired")}
              </p>
            ) : null}
          </div>

          {phase === "stripe_missing" ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-700">
              {t("stripeNotConfigured")}
            </p>
          ) : null}

          {phase === "preparing" ||
          (phase === "idle" &&
            customerName.trim() &&
            stripeConfigured &&
            !clientSecret) ? (
            <p className="text-center text-sm text-[color:var(--muted)]">
              {t("stripePreparing")}
            </p>
          ) : null}

          {!showForm &&
          !customerName.trim() &&
          phase !== "paid" &&
          phase !== "paid_notify_failed" &&
          phase !== "stripe_missing" ? (
            <p className="rounded-xl border border-dashed border-[color:var(--line)] bg-white/70 px-3 py-4 text-center text-sm text-[color:var(--muted)]">
              {t("stripeEnterNameForCard")}
            </p>
          ) : null}

          {!showForm &&
          customerName.trim() &&
          phase === "error" &&
          !clientSecret ? (
            <button
              type="button"
              onClick={() => void startStripePayment()}
              className="w-full rounded-2xl bg-[color:var(--accent)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(169,124,80,0.7)] transition hover:bg-[color:var(--hero-deep)] active:scale-[0.99]"
            >
              {t("stripeStartPay")}
            </button>
          ) : null}

          {showForm && clientSecret && publishableKey ? (
            <StripePaymentForm
              clientSecret={clientSecret}
              publishableKey={publishableKey}
              preferredMethod={selectedMethod}
              customerName={customerName}
              amountHkd={amountHkd}
              onPaid={handlePaid}
              onError={handlePayError}
            />
          ) : null}

          {phase === "paid" ? (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700">
              {t("stripePaidSuccess")}
            </p>
          ) : null}
          {phase === "paid_notify_failed" ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-700">
              {t("stripePaidNotifyFailed")}
            </p>
          ) : null}
          {payError ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-700">
              {payError}
            </p>
          ) : null}

          <p className="text-center text-xs text-[color:var(--muted)]">
            {t("secureNote")}
          </p>
          <p className="text-center text-[11px] text-[color:var(--muted)]">
            {t("orderNotifyServerHint")}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <WhatsAppOrder orderNumber={orderNumber} onSend={handleSendToWhatsApp} />
        {manualWaError ? (
          <p className="mt-2 text-center text-xs text-amber-700">
            {t("whatsappNumberMissing")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}
