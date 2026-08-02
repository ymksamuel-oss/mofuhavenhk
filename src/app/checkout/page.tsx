"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import {
  PAYMENT_METHODS,
  PaymentMethods,
  type MethodId,
} from "@/components/checkout/PaymentMethods";
import { SelectedCategoryNotice } from "@/components/checkout/SelectedCategoryNotice";
import { WhatsAppOrder } from "@/components/checkout/WhatsAppOrder";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { calcSubtotal, generateOrderNumber, getOrderItems, SHIPPING } from "@/lib/order";
import { buildOrderMessage, openWhatsAppOrder } from "@/lib/whatsapp";

type NotifyStatus = "idle" | "sending" | "success" | "error";

function CheckoutContent() {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const items = getOrderItems(searchParams.get("category"));

  const [selectedMethod, setSelectedMethod] = useState<MethodId>("card");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [nameError, setNameError] = useState(false);
  const [notifyStatus, setNotifyStatus] = useState<NotifyStatus>("idle");

  useEffect(() => {
    setOrderNumber(generateOrderNumber());
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
    openWhatsAppOrder(message);
  };

  /**
   * Fires when the customer confirms payment: validates the name field,
   * then calls the /api/notify-order route so the shop's WhatsApp number
   * is notified automatically — no action required from the customer.
   */
  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);

    const number = orderNumber ?? generateOrderNumber();
    setOrderNumber(number);

    const paymentLabelKey = PAYMENT_METHODS.find(
      (method) => method.id === selectedMethod,
    )?.labelKey;
    const paymentLabel = paymentLabelKey ? t(paymentLabelKey) : selectedMethod;
    const total = calcSubtotal(items) + SHIPPING;

    setNotifyStatus("sending");
    try {
      const res = await fetch("/api/notify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: number,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim() || undefined,
          paymentLabel,
          total,
          currency: t("currency"),
          siteUrl:
            typeof window !== "undefined" ? window.location.origin : undefined,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setNotifyStatus("error");
        return;
      }
      setNotifyStatus("success");
    } catch {
      setNotifyStatus("error");
    }
  };

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
              }}
              placeholder={t("customerNamePlaceholder")}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[color:var(--ink)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] ${
                nameError ? "border-red-400" : "border-[color:var(--line)]"
              }`}
            />
            {nameError ? (
              <p className="mt-1.5 text-xs text-red-500">
                {t("customerNameRequired")}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="customer-phone"
              className="mb-1.5 block text-sm font-medium text-[color:var(--ink)]"
            >
              {t("customerPhoneLabel")}
            </label>
            <input
              id="customer-phone"
              type="tel"
              inputMode="tel"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder={t("customerPhonePlaceholder")}
              className="w-full rounded-xl border border-[color:var(--line)] bg-white px-3.5 py-2.5 text-sm text-[color:var(--ink)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]"
            />
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={notifyStatus === "sending"}
            className="w-full rounded-2xl bg-[color:var(--accent)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(169,124,80,0.7)] transition hover:bg-[color:var(--hero-deep)] hover:shadow-[0_14px_28px_-10px_rgba(92,58,34,0.6)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {notifyStatus === "sending" ? t("orderNotifySending") : t("placeOrder")}
          </button>

          {notifyStatus === "success" ? (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700">
              {t("orderNotifySuccess")}
            </p>
          ) : null}
          {notifyStatus === "error" ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-700">
              {t("orderNotifyError")}
            </p>
          ) : null}

          <p className="text-center text-xs text-[color:var(--muted)]">
            {t("secureNote")}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <WhatsAppOrder orderNumber={orderNumber} onSend={handleSendToWhatsApp} />
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
