"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getReceipt, saveReceipt } from "@/lib/receipt";
import { useCart } from "@/lib/shop/cart";

type CompletionState = "loading" | "success" | "error";

type CompletionResponse = {
  ok: boolean;
  error?: string;
  orderNumber?: string;
  paymentLabel?: string;
  total?: number;
};

function CheckoutSuccessContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const cart = useCart();
  const [state, setState] = useState<CompletionState>("loading");
  const [receiptHref, setReceiptHref] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setState("error");
      return;
    }

    (async () => {
      try {
        const response = await fetch("/api/stripe/complete-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkoutSessionId: sessionId }),
        });
        const data = (await response.json()) as CompletionResponse;
        if (cancelled) return;

        if (!response.ok || !data.ok || !data.orderNumber) {
          setState("error");
          return;
        }

        const existingReceipt = getReceipt(data.orderNumber);
        if (existingReceipt) {
          saveReceipt({
            ...existingReceipt,
            paymentLabel: data.paymentLabel || existingReceipt.paymentLabel,
            ...(typeof data.total === "number" ? { total: data.total } : {}),
          });
        }
        cart.clear();
        setReceiptHref(`/receipt/${data.orderNumber}`);
        setState("success");
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cart, searchParams]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-4 py-12 sm:px-6">
      <section className="milk-tea-card w-full space-y-5 p-6 text-center sm:p-10">
        {state === "loading" ? (
          <p className="text-sm text-[color:var(--muted)]">
            {t("checkoutSessionPreparing")}
          </p>
        ) : null}

        {state === "success" ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              Mofu Haven
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[color:var(--ink)]">
              {t("checkoutSessionSuccessTitle")}
            </h1>
            <p className="text-sm leading-relaxed text-[color:var(--muted)]">
              {t("checkoutSessionSuccessBody")}
            </p>
            {receiptHref ? (
              <Link
                href={receiptHref}
                className="inline-flex rounded-2xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--hero-deep)]"
              >
                {t("receiptViewCta")}
              </Link>
            ) : null}
          </>
        ) : null}

        {state === "error" ? (
          <>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[color:var(--ink)]">
              {t("checkoutSessionFailed")}
            </h1>
            <Link
              href="/checkout"
              className="inline-flex rounded-2xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--hero-deep)]"
            >
              {t("stripeStartPay")}
            </Link>
          </>
        ) : null}
      </section>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
