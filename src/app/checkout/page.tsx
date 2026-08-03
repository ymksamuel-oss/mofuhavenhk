"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FpsPaymentPanel } from "@/components/checkout/FpsPaymentPanel";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import {
  PAYMENT_METHODS,
  PaymentMethods,
  type MethodId,
} from "@/components/checkout/PaymentMethods";
import { SelectedCategoryNotice } from "@/components/checkout/SelectedCategoryNotice";
import {
  EMPTY_SHIPPING_CONTACT,
  ShippingContactForm,
  type ShippingContact,
} from "@/components/checkout/ShippingContactForm";
import { StripePaymentForm } from "@/components/checkout/StripePaymentForm";
import { WhatsAppOrder } from "@/components/checkout/WhatsAppOrder";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  calcSubtotal,
  generateOrderNumber,
  getOrderItems,
  MAX_QTY,
  MIN_QTY,
  SHIPPING,
  type OrderItem,
} from "@/lib/order";
import {
  buildFpsOrderMessage,
  buildOrderMessage,
  openWhatsAppOrder,
} from "@/lib/whatsapp";

type PayPhase =
  | "idle"
  | "preparing"
  | "ready"
  | "completing"
  | "paid"
  | "paid_notify_failed"
  | "stripe_missing"
  | "error"
  | "fps_done";

function CheckoutContent() {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const initialItems = useMemo(() => getOrderItems(category), [category]);
  const [items, setItems] = useState<OrderItem[]>(initialItems);
  const amountHkd = calcSubtotal(items) + SHIPPING;

  // Default to wallet (Apple Pay / Google Pay) for mobile one-tap checkout.
  const [selectedMethod, setSelectedMethod] = useState<MethodId>("applepay");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [phase, setPhase] = useState<PayPhase>("idle");
  const [payError, setPayError] = useState("");
  const [manualWaError, setManualWaError] = useState(false);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(
    null,
  );
  const [fpsConfirming, setFpsConfirming] = useState(false);
  const [shippingContact, setShippingContact] = useState<ShippingContact>(
    EMPTY_SHIPPING_CONTACT,
  );
  const preparingRef = useRef(false);

  const isFps = selectedMethod === "fps";
  const liveTotalHkd = amountHkd;

  const contactForMessage = useMemo(
    () => ({
      name: shippingContact.name.trim(),
      phone: shippingContact.phone.trim(),
      address: shippingContact.address.trim(),
      addressLine2: shippingContact.addressLine2.trim(),
      city: shippingContact.city.trim(),
      postalCode: shippingContact.postalCode.trim(),
    }),
    [shippingContact],
  );

  const hasRequiredContact = Boolean(
    contactForMessage.name &&
      contactForMessage.phone &&
      contactForMessage.address,
  );

  useEffect(() => {
    setItems(getOrderItems(category));
    setClientSecret(null);
    setPhase((current) =>
      current === "stripe_missing" ? current : "idle",
    );
    setFpsConfirming(false);
  }, [category]);

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

  // Switching payment method clears Stripe intent / FPS success state.
  const handleSelectMethod = (id: MethodId) => {
    setSelectedMethod(id);
    setClientSecret(null);
    setPayError("");
    setFpsConfirming(false);
    if (phase !== "stripe_missing") {
      setPhase("idle");
    }
  };

  const handleQtyChange = (id: string, qty: number) => {
    if (
      phase === "paid" ||
      phase === "paid_notify_failed" ||
      phase === "fps_done"
    ) {
      return;
    }
    const nextQty = Math.min(MAX_QTY, Math.max(MIN_QTY, qty));
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, qty: nextQty } : item,
      ),
    );
    if (clientSecret) {
      setClientSecret(null);
      setPhase("idle");
      setPayError("");
    }
  };

  /** Fully remove a line item from the order summary / cart. */
  const handleRemoveItem = (id: string) => {
    if (
      phase === "paid" ||
      phase === "paid_notify_failed" ||
      phase === "fps_done"
    ) {
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    if (clientSecret) {
      setClientSecret(null);
      setPhase("idle");
      setPayError("");
    }
  };

  const handleSendToWhatsApp = () => {
    const number = orderNumber ?? generateOrderNumber();
    const paymentLabelKey = PAYMENT_METHODS.find(
      (method) => method.id === selectedMethod,
    )?.labelKey;
    const message = isFps
      ? buildFpsOrderMessage({
          items,
          orderNumber: number,
          locale,
          t,
          contact: contactForMessage,
          totalHkd: liveTotalHkd,
        })
      : buildOrderMessage({
          items,
          orderNumber: number,
          locale,
          t,
          paymentLabel: paymentLabelKey ? t(paymentLabelKey) : undefined,
          contact: contactForMessage,
          totalHkd: liveTotalHkd,
        });
    const opened = openWhatsAppOrder(message);
    setManualWaError(!opened);
  };

  const handlePayError = useCallback((message: string) => {
    setPayError(message);
  }, []);

  const startStripePayment = useCallback(async () => {
    if (!stripeConfigured || !publishableKey) {
      setPhase("stripe_missing");
      return;
    }
    if (preparingRef.current) return;
    if (phase === "paid" || phase === "paid_notify_failed") return;
    if (items.length === 0) return;

    preparingRef.current = true;
    setPayError("");
    setPhase("preparing");

    const number = orderNumber ?? generateOrderNumber();
    setOrderNumber(number);

    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          orderNumber: number,
          locale,
          lines: items.map((item) => ({ id: item.id, qty: item.qty })),
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
    items,
    locale,
    orderNumber,
    phase,
    publishableKey,
    stripeConfigured,
    t,
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

  /**
   * FPS path: notify shop server-side (CallMeBot) + open customer WhatsApp
   * with structured order details and screenshot instructions.
   */
  const handleFpsConfirm = async () => {
    if (fpsConfirming || phase === "fps_done") return;

    if (!hasRequiredContact) {
      setPayError(t("shippingContactRequired"));
      return;
    }
    if (items.length === 0) {
      setPayError(t("stripePayFailed"));
      return;
    }

    setFpsConfirming(true);
    setPayError("");

    const number = orderNumber ?? generateOrderNumber();
    setOrderNumber(number);
    // Always recompute from live cart — never a hardcoded total.
    const confirmTotal = calcSubtotal(items) + SHIPPING;

    try {
      await fetch("/api/notify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: number,
          customerName: contactForMessage.name || "FPS 顧客",
          paymentLabel: t("payFps"),
          items: items.map((item) => ({ id: item.id, qty: item.qty })),
          total: confirmTotal,
          currency: t("currency"),
        }),
      });
    } catch {
      // Still open WhatsApp so the customer can message the shop.
    }

    const message = buildFpsOrderMessage({
      items,
      orderNumber: number,
      locale,
      t,
      contact: contactForMessage,
      totalHkd: confirmTotal,
      orderedAt: new Date(),
    });
    const opened = openWhatsAppOrder(message);
    setManualWaError(!opened);
    setPhase(opened ? "fps_done" : "error");
    if (!opened) setPayError(t("whatsappNumberMissing"));
    setFpsConfirming(false);
  };

  const showStripeForm =
    !isFps &&
    Boolean(clientSecret && publishableKey) &&
    (phase === "ready" || phase === "completing" || phase === "error");

  const qtyLocked =
    phase === "paid" ||
    phase === "paid_notify_failed" ||
    phase === "completing" ||
    phase === "fps_done";

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
        {/* Mobile-first: wallets / pay methods first for one-tap checkout */}
        <div className="space-y-6">
          <PaymentMethods
            selected={selectedMethod}
            onSelect={handleSelectMethod}
            amountHkd={amountHkd}
          />
          <div className="milk-tea-card p-5 sm:p-6">
            <ShippingContactForm
              value={shippingContact}
              onChange={setShippingContact}
              disabled={qtyLocked}
            />
          </div>
        </div>
        <div className="milk-tea-card space-y-6 p-5 sm:p-6">
          <OrderSummary
            items={items}
            onQtyChange={handleQtyChange}
            onRemoveItem={handleRemoveItem}
            qtyDisabled={qtyLocked}
          />

          {isFps ? (
            <FpsPaymentPanel
              onConfirm={() => void handleFpsConfirm()}
              confirming={fpsConfirming}
              confirmed={phase === "fps_done"}
            />
          ) : (
            <>
              {phase === "stripe_missing" ? (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-700">
                  {t("stripeNotConfigured")}
                </p>
              ) : null}

              {phase === "preparing" ? (
                <p className="text-center text-sm text-[color:var(--muted)]">
                  {t("stripePreparing")}
                </p>
              ) : null}

              {!showStripeForm &&
              phase !== "paid" &&
              phase !== "paid_notify_failed" &&
              phase !== "stripe_missing" &&
              phase !== "preparing" ? (
                <button
                  type="button"
                  onClick={() => void startStripePayment()}
                  className="w-full rounded-2xl bg-[color:var(--accent)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(169,124,80,0.7)] transition hover:bg-[color:var(--hero-deep)] hover:shadow-[0_14px_28px_-10px_rgba(92,58,34,0.6)] active:scale-[0.99]"
                >
                  {t("stripeStartPay")}
                </button>
              ) : null}

              {showStripeForm &&
              clientSecret &&
              publishableKey &&
              (selectedMethod === "card" || selectedMethod === "applepay") ? (
                <StripePaymentForm
                  clientSecret={clientSecret}
                  publishableKey={publishableKey}
                  preferredMethod={selectedMethod}
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
            </>
          )}

          {payError ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-700">
              {payError}
            </p>
          ) : null}

          <p className="text-center text-xs text-[color:var(--muted)]">
            {isFps ? t("fpsWhatsappHint") : t("secureNote")}
          </p>
          {!isFps ? (
            <p className="text-center text-[11px] text-[color:var(--muted)]">
              {t("orderNotifyServerHint")}
            </p>
          ) : null}
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
