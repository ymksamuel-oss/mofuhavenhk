"use client";

import { useEffect, useState } from "react";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import {
  PAYMENT_METHODS,
  PaymentMethods,
  type MethodId,
} from "@/components/checkout/PaymentMethods";
import { SelectedCategoryNotice } from "@/components/checkout/SelectedCategoryNotice";
import { WhatsAppOrder } from "@/components/checkout/WhatsAppOrder";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { generateOrderNumber } from "@/lib/order";
import { buildOrderMessage, openWhatsAppOrder } from "@/lib/whatsapp";

export default function CheckoutPage() {
  const { locale, t } = useI18n();
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

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <PaymentMethods selected={selectedMethod} onSelect={setSelectedMethod} />
        <div className="space-y-6 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 sm:p-6">
          <OrderSummary />
          <button
            type="button"
            onClick={handleSendToWhatsApp}
            className="w-full bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--hero-deep)]"
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
