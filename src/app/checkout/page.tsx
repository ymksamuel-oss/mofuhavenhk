"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import {
  FPS_ACCOUNT_NAME,
  FPS_QR_SRC,
  formatFpsDisplayId,
  fpsLocalDigits,
} from "@/lib/fps";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
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

type FpsOptionId = "proxy" | "amount" | "qr";

async function copyText(value: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to legacy path.
  }

  try {
    const el = document.createElement("textarea");
    el.value = value;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Bank-app style FPS payee menu — defined in the checkout page so it is
 * always the UI mounted when FPS is selected (no orphaned panel files).
 */
function InteractiveFpsMenu({ amountHkd }: { amountHkd: number }) {
  const { locale, t } = useI18n();
  const [active, setActive] = useState<FpsOptionId | null>(null);
  const [copied, setCopied] = useState<"proxy" | "amount" | null>(null);

  const displayId = formatFpsDisplayId();
  const amountLabel = formatMoney(amountHkd, locale);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const toggle = (id: FpsOptionId) => {
    setActive((prev) => (prev === id ? null : id));
  };

  const options: { id: FpsOptionId; title: string; hint: string }[] = [
    {
      id: "proxy",
      title: t("fpsOptionProxy"),
      hint: t("fpsOptionProxyHint"),
    },
    {
      id: "amount",
      title: t("fpsOptionAmount"),
      hint: t("fpsOptionAmountHint"),
    },
    {
      id: "qr",
      title: t("fpsOptionQr"),
      hint: t("fpsOptionQrHint"),
    },
  ];

  return (
    <div
      className="overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] shadow-[0_8px_20px_-14px_rgba(74,54,38,0.35)]"
      data-fps-interactive-menu="true"
    >
      <div className="border-b border-[color:var(--line)] bg-[color:var(--accent-soft)]/55 px-4 py-3.5">
        <h3 className="text-sm font-semibold text-[color:var(--ink)]">
          {t("fpsPanelTitle")}
        </h3>
        <p className="mt-1 text-xs font-medium text-[color:var(--muted)]">
          {t("fpsPanelHint")}
        </p>
      </div>

      <ul className="divide-y divide-[color:var(--line)]" role="list">
        {options.map(({ id, title, hint }) => {
          const open = active === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => toggle(id)}
                aria-expanded={open}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
                  open
                    ? "bg-[color:var(--accent-soft)]/70"
                    : "bg-[color:var(--surface)] hover:bg-[color:var(--accent-soft)]/35"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-bold ${
                    open
                      ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                      : "border-[color:var(--line)] bg-white text-[color:var(--accent)]"
                  }`}
                  aria-hidden="true"
                >
                  {id === "proxy" ? "1" : id === "amount" ? "2" : "3"}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-[color:var(--ink)]">
                  {title}
                </span>
                <span
                  className={`text-[color:var(--muted)] transition-transform ${
                    open ? "rotate-90 text-[color:var(--accent)]" : ""
                  }`}
                  aria-hidden="true"
                >
                  ›
                </span>
              </button>

              {open ? (
                <div className="border-t border-[color:var(--line)] bg-[color:var(--accent-soft)]/30 px-4 py-3.5">
                  <p className="text-xs text-[color:var(--muted)]">{hint}</p>

                  {id === "proxy" ? (
                    <div className="mt-3 space-y-3">
                      <div className="rounded-xl border border-[color:var(--line)] bg-white px-3.5 py-3">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-xs text-[color:var(--muted)]">
                            {t("fpsIdLabel")}
                          </span>
                          <span className="text-lg font-semibold tabular-nums tracking-wide text-[color:var(--ink)]">
                            {displayId}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3 border-t border-[color:var(--line)] pt-2">
                          <span className="text-xs text-[color:var(--muted)]">
                            {t("fpsAccountLabel")}
                          </span>
                          <span className="text-sm font-medium text-[color:var(--ink)]">
                            {FPS_ACCOUNT_NAME}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          void copyText(fpsLocalDigits()).then((ok) => {
                            if (ok) setCopied("proxy");
                          });
                        }}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] ${
                          copied === "proxy"
                            ? "bg-emerald-600 text-white"
                            : "bg-[color:var(--accent)] text-white hover:bg-[color:var(--hero-deep)]"
                        }`}
                      >
                        {copied === "proxy" ? t("fpsCopied") : t("fpsCopyNumber")}
                      </button>
                    </div>
                  ) : null}

                  {id === "amount" ? (
                    <div className="mt-3 space-y-3">
                      <div className="rounded-xl border border-[color:var(--line)] bg-white px-3.5 py-3">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-xs text-[color:var(--muted)]">
                            {t("fpsAmountLabel")}
                          </span>
                          <span className="text-xl font-semibold tabular-nums text-[color:var(--ink)]">
                            {amountLabel}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          void copyText(amountLabel).then((ok) => {
                            if (ok) setCopied("amount");
                          });
                        }}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] ${
                          copied === "amount"
                            ? "bg-emerald-600 text-white"
                            : "bg-[color:var(--accent)] text-white hover:bg-[color:var(--hero-deep)]"
                        }`}
                      >
                        {copied === "amount" ? t("fpsCopied") : t("fpsCopyAmount")}
                      </button>
                    </div>
                  ) : null}

                  {id === "qr" ? (
                    <div className="mt-3 flex flex-col items-center gap-2">
                      <div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-xl bg-white p-2 ring-1 ring-[color:var(--line)]">
                        {/* eslint-disable-next-line @next/next/no-img-element -- local SVG / shop QR asset */}
                        <img
                          src={FPS_QR_SRC}
                          alt={t("fpsQrAlt")}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <p className="text-center text-[11px] text-[color:var(--muted)]">
                        {t("fpsQrHint")}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CheckoutContent() {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const initialItems = useMemo(() => getOrderItems(category), [category]);
  const [items, setItems] = useState<OrderItem[]>(initialItems);
  const amountHkd = calcSubtotal(items) + SHIPPING;

  const [selectedMethod, setSelectedMethod] = useState<MethodId>("card");
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
  const preparingRef = useRef(false);

  const isFps = selectedMethod === "fps";

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
        })
      : buildOrderMessage({
          items,
          orderNumber: number,
          locale,
          t,
          paymentLabel: paymentLabelKey ? t(paymentLabelKey) : undefined,
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
   * with order details and screenshot instructions for @MofuHavenHK.
   */
  const handleFpsConfirm = async () => {
    if (fpsConfirming || phase === "fps_done") return;
    setFpsConfirming(true);
    setPayError("");

    const number = orderNumber ?? generateOrderNumber();
    setOrderNumber(number);

    try {
      await fetch("/api/notify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: number,
          customerName: "FPS 顧客",
          paymentLabel: t("payFps"),
          total: amountHkd,
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
        <PaymentMethods
          selected={selectedMethod}
          onSelect={handleSelectMethod}
          fpsPanel={
            isFps ? <InteractiveFpsMenu amountHkd={amountHkd} /> : null
          }
        />
        <div className="milk-tea-card space-y-6 p-5 sm:p-6">
          <OrderSummary
            items={items}
            onQtyChange={handleQtyChange}
            qtyDisabled={qtyLocked}
          />

          {isFps ? (
            <div className="space-y-3">
              {phase !== "fps_done" ? (
                <button
                  type="button"
                  onClick={() => void handleFpsConfirm()}
                  disabled={fpsConfirming}
                  className="w-full rounded-2xl bg-[color:var(--accent)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(169,124,80,0.7)] transition hover:bg-[color:var(--hero-deep)] hover:shadow-[0_14px_28px_-10px_rgba(92,58,34,0.6)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {fpsConfirming ? t("fpsConfirming") : t("fpsConfirmOrder")}
                </button>
              ) : (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700">
                  {t("fpsConfirmSuccess")}
                </p>
              )}
            </div>
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
