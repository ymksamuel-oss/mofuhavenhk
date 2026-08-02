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
import { generateOrderNumber, getOrderItems } from "@/lib/order";
import { buildOrderMessage, openWhatsAppOrder } from "@/lib/whatsapp";

function CheckoutContent() {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const items = getOrderItems(searchParams.get("category"));

  const [selectedMethod, setSelectedMethod] = useState<MethodId>("card");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

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
          <button
            type="button"
            onClick={handleSendToWhatsApp}
            className="w-full rounded-2xl bg-[color:var(--accent)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(169,124,80,0.7)] transition hover:bg-[color:var(--hero-deep)] hover:shadow-[0_14px_28px_-10px_rgba(92,58,34,0.6)] active:scale-[0.99]"
          >
            {t("placeOrder")}
          </button>
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
