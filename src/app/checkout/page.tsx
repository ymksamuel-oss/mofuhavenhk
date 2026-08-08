"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { AsianWalletPayForm } from "@/components/checkout/AsianWalletPayForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import {
  PAYMENT_METHODS,
  PaymentMethods,
  type MethodId,
} from "@/components/checkout/PaymentMethods";
import {
  EMPTY_SHIPPING_CONTACT,
  formatPhoneForDisplay,
  ShippingContactForm,
  type ShippingContact,
} from "@/components/checkout/ShippingContactForm";
import { StripePaymentForm } from "@/components/checkout/StripePaymentForm";
import { WhatsAppOrder } from "@/components/checkout/WhatsAppOrder";
import { ContinueShoppingButton } from "@/components/ContinueShoppingButton";
import { useCatalog } from "@/lib/catalog-context";
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
import { useCart } from "@/lib/shop/cart";
import { saveReceipt } from "@/lib/receipt";
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

function isAsianWalletMethod(
  method: MethodId,
): method is "wechatpay" | "alipayhk" {
  return method === "wechatpay" || method === "alipayhk";
}

function CheckoutContent() {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const { products } = useCatalog();
  const cart = useCart();

  const [items, setItems] = useState<OrderItem[]>(() =>
    getOrderItems(category, products),
  );
  const [hydratedFromCart, setHydratedFromCart] = useState(false);
  const amountHkd =
    items.length > 0 ? calcSubtotal(items) + SHIPPING : 0;

  // Default to Apple Pay for mobile one-tap checkout.
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
  const [shippingContact, setShippingContact] = useState<ShippingContact>(
    EMPTY_SHIPPING_CONTACT,
  );
  const [alipayReturning, setAlipayReturning] = useState(false);
  const [receiptHref, setReceiptHref] = useState<string | null>(null);
  const preparingRef = useRef(false);
  const alipayReturnHandled = useRef(false);

  const liveTotalHkd = amountHkd;

  const contactForMessage = useMemo(
    () => ({
      name: shippingContact.name.trim(),
      phone: formatPhoneForDisplay(shippingContact),
      address: shippingContact.address.trim(),
      addressLine2: shippingContact.addressLine2.trim(),
      district: shippingContact.district.trim(),
      sfStationCode: shippingContact.sfStationCode.trim(),
    }),
    [shippingContact],
  );

  const alipayReturnUrl = useMemo(() => {
    if (typeof window === "undefined") return "/checkout";
    const url = new URL(window.location.href);
    url.searchParams.set("method", "alipayhk");
    // Drop prior Stripe redirect params so retries stay clean.
    url.searchParams.delete("payment_intent");
    url.searchParams.delete("payment_intent_client_secret");
    url.searchParams.delete("redirect_status");
    return url.toString();
  }, []);

  // Prefer the shared shopping basket once localStorage cart is ready.
  useEffect(() => {
    if (!cart.ready || hydratedFromCart) return;
    if (cart.lines.length > 0) {
      setItems(cart.toOrderItems());
    }
    setHydratedFromCart(true);
  }, [cart, hydratedFromCart]);

  useEffect(() => {
    // Category deep-links only apply when the basket is empty.
    // Skip after a successful pay — clearing the cart must not refill
    // defaults or wipe the paid / notify-failed success state.
    if (!cart.ready) return;
    if (cart.lines.length > 0) return;
    if (
      phase === "paid" ||
      phase === "paid_notify_failed" ||
      phase === "completing"
    ) {
      return;
    }
    setItems(getOrderItems(category, products));
    setClientSecret(null);
    setPhase((current) =>
      current === "stripe_missing" ? current : "idle",
    );
  }, [category, cart.ready, cart.lines.length, phase, products]);

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

  const handlePaid = useCallback(async (paymentIntentId: string) => {
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
        paymentLabel?: string;
      };

      if (!res.ok || !data.ok) {
        setPayError(t("stripePayFailed"));
        setPhase("ready");
        return;
      }

      const finalOrderNumber = data.orderNumber || orderNumber || generateOrderNumber();
      setOrderNumber(finalOrderNumber);
      setReceiptHref(`/receipt/${finalOrderNumber}`);

      saveReceipt({
        orderNumber: finalOrderNumber,
        createdAt: new Date().toISOString(),
        items,
        subtotal: calcSubtotal(items),
        shipping: items.length > 0 ? SHIPPING : 0,
        total: liveTotalHkd,
        paymentLabel:
          data.paymentLabel ||
          (PAYMENT_METHODS.find((method) => method.id === selectedMethod)?.labelKey
            ? t(
                PAYMENT_METHODS.find((method) => method.id === selectedMethod)!
                  .labelKey,
              )
            : "Stripe") ||
          "Stripe",
        customerName: shippingContact.name.trim() || "顧客",
        contact: shippingContact,
      });

      // Payment confirmed — empty the shared basket (state + localStorage)
      // so the navbar cart badge drops to 0 immediately.
      cart.clear();
      setItems([]);

      if (data.notified || data.alreadyNotified) {
        setPhase("paid");
      } else {
        setPhase("paid_notify_failed");
      }
    } catch {
      // Stripe already charged; still clear the basket even if notify failed.
      cart.clear();
      setItems([]);
      setPhase("paid_notify_failed");
    }
  }, [
    cart,
    items,
    liveTotalHkd,
    orderNumber,
    selectedMethod,
    shippingContact,
    t,
  ]);

  // AlipayHK redirect return — Stripe appends payment_intent* query params.
  useEffect(() => {
    if (alipayReturnHandled.current) return;
    if (!publishableKey) return;

    const intentId = searchParams.get("payment_intent");
    const returnedSecret = searchParams.get("payment_intent_client_secret");
    const redirectStatus = searchParams.get("redirect_status");
    if (!intentId || !returnedSecret) return;

    alipayReturnHandled.current = true;
    setSelectedMethod("alipayhk");
    setClientSecret(returnedSecret);
    setAlipayReturning(true);
    setPayError("");

    void (async () => {
      try {
        const stripe = await loadStripe(publishableKey);
        if (!stripe) {
          setPayError(t("stripePayFailed"));
          setPhase("error");
          setAlipayReturning(false);
          return;
        }
        const { paymentIntent, error } =
          await stripe.retrievePaymentIntent(returnedSecret);
        if (error || !paymentIntent) {
          setPayError(error?.message || t("stripePayFailed"));
          setPhase("error");
          setAlipayReturning(false);
          return;
        }
        if (
          paymentIntent.status === "succeeded" ||
          redirectStatus === "succeeded"
        ) {
          await handlePaid(paymentIntent.id);
        } else {
          setPayError(t("stripePayFailed"));
          setPhase("error");
        }
      } catch {
        setPayError(t("stripePayFailed"));
        setPhase("error");
      } finally {
        setAlipayReturning(false);
        if (typeof window !== "undefined") {
          const clean = new URL(window.location.href);
          clean.searchParams.delete("payment_intent");
          clean.searchParams.delete("payment_intent_client_secret");
          clean.searchParams.delete("redirect_status");
          window.history.replaceState({}, "", clean.toString());
        }
      }
    })();
  }, [handlePaid, publishableKey, searchParams, t]);

  // Switching payment method clears Stripe intent / success state.
  const handleSelectMethod = (id: MethodId) => {
    setSelectedMethod(id);
    setClientSecret(null);
    setPayError("");
    if (phase !== "stripe_missing") {
      setPhase("idle");
    }
  };

  const handleQtyChange = (id: string, qty: number) => {
    if (
      phase === "paid" ||
      phase === "paid_notify_failed"
    ) {
      return;
    }
    const nextQty = Math.min(MAX_QTY, Math.max(MIN_QTY, qty));
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, qty: nextQty } : item,
      ),
    );
    cart.setQty(id, nextQty);
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
      phase === "paid_notify_failed"
    ) {
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    cart.removeItem(id);
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
    const message = buildOrderMessage({
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
          paymentMethod: selectedMethod,
          customerName: shippingContact.name.trim(),
          lines: items.map((item) => ({ id: item.id, qty: item.qty })),
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        clientSecret?: string;
        orderNumber?: string;
        detail?: string;
        items?: OrderItem[];
      };

      if (data.error === "stripe_not_configured" || res.status === 503) {
        setPhase("stripe_missing");
        return;
      }
      if (!res.ok || !data.ok || !data.clientSecret) {
        setPayError(data.detail || t("stripePayFailed"));
        setPhase("error");
        return;
      }

      if (data.orderNumber) setOrderNumber(data.orderNumber);
      if (Array.isArray(data.items) && data.items.length > 0) {
        setItems(data.items);
      }
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
    selectedMethod,
    shippingContact.name,
    stripeConfigured,
    t,
  ]);

  const showStripeForm =
    Boolean(clientSecret && publishableKey) &&
    (phase === "ready" || phase === "completing" || phase === "error");

  const qtyLocked =
    phase === "paid" ||
    phase === "paid_notify_failed" ||
    phase === "completing" ||
    alipayReturning;

  return (
    <div className="checkout-shell mx-auto w-full max-w-5xl overflow-x-clip px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-2xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em] text-[color:var(--ink)] sm:text-4xl">
            {t("checkoutTitle")}
          </h1>
          <p className="mt-2 text-[0.95rem] leading-relaxed tracking-[0.01em] text-[color:var(--muted)]">
            {t("checkoutSubtitle")}
          </p>
        </div>
        <ContinueShoppingButton variant="primary" className="sm:shrink-0" />
      </header>

      <div className="grid w-full max-w-full items-start gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        {/* Mobile-first: wallets / pay methods first for one-tap checkout */}
        <div className="min-w-0 space-y-6">
          <PaymentMethods
            selected={selectedMethod}
            onSelect={handleSelectMethod}
          />
          <div className="milk-tea-card max-w-full p-5 sm:p-6">
            <ShippingContactForm
              value={shippingContact}
              onChange={setShippingContact}
              disabled={qtyLocked}
            />
          </div>
        </div>
        <div className="milk-tea-card min-w-0 max-w-full space-y-6 p-5 sm:p-6">
          <OrderSummary
            items={items}
            onQtyChange={handleQtyChange}
            onRemoveItem={handleRemoveItem}
            qtyDisabled={qtyLocked}
          />

          {phase === "stripe_missing" ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-700">
              {t("stripeNotConfigured")}
            </p>
          ) : null}

          {phase === "preparing" || alipayReturning ? (
            <p className="text-center text-sm text-[color:var(--muted)]">
              {alipayReturning
                ? t("alipayReturnProcessing")
                : t("stripePreparing")}
            </p>
          ) : null}

          {!showStripeForm &&
          !alipayReturning &&
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

          {showStripeForm &&
          clientSecret &&
          publishableKey &&
          isAsianWalletMethod(selectedMethod) ? (
            <AsianWalletPayForm
              method={selectedMethod}
              clientSecret={clientSecret}
              publishableKey={publishableKey}
              customerName={shippingContact.name}
              returnUrl={alipayReturnUrl}
              onPaid={handlePaid}
              onError={handlePayError}
            />
          ) : null}

          {phase === "paid" ? (
            <div className="space-y-3">
              <p className="rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700">
                {t("stripePaidSuccess")}
              </p>
              {receiptHref ? (
                <Link
                  href={receiptHref}
                  className="block w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-center text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                >
                  {t("receiptViewCta")}
                </Link>
              ) : null}
            </div>
          ) : null}
          {phase === "paid_notify_failed" ? (
            <div className="space-y-3">
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-700">
                {t("stripePaidNotifyFailed")}
              </p>
              {receiptHref ? (
                <Link
                  href={receiptHref}
                  className="block w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-center text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                >
                  {t("receiptViewCta")}
                </Link>
              ) : null}
            </div>
          ) : null}

          {payError ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-700">
              {payError}
            </p>
          ) : null}

          <p className="text-center text-xs leading-relaxed tracking-[0.01em] text-[color:var(--muted)]">
            {t("secureNote")}
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
