"use client";

import {
  PaymentElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  loadStripe,
  type Stripe,
  type StripeElementsOptions,
} from "@stripe/stripe-js";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { MethodId } from "@/components/checkout/PaymentMethods";

type StripePaymentFormProps = {
  clientSecret: string;
  publishableKey: string;
  preferredMethod: MethodId;
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

function CheckoutPayForm({
  preferredMethod,
  onPaid,
  onError,
}: {
  preferredMethod: MethodId;
  onPaid: (paymentIntentId: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || submitting) return;

    setSubmitting(true);
    onError("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url:
          typeof window !== "undefined"
            ? `${window.location.origin}/checkout?paid=1`
            : undefined,
      },
    });

    if (error) {
      onError(error.message || t("stripePayFailed"));
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded" && paymentIntent.id) {
      try {
        await onPaid(paymentIntent.id);
      } catch {
        onError(t("stripePayFailed"));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    onError(t("stripePayFailed"));
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        onReady={() => setReady(true)}
        options={{
          layout: "tabs",
          wallets: {
            applePay: "auto",
            googlePay: "auto",
          },
          paymentMethodOrder:
            preferredMethod === "applepay"
              ? ["apple_pay", "card", "google_pay"]
              : ["card", "apple_pay", "google_pay"],
        }}
      />
      <button
        type="submit"
        disabled={!stripe || !elements || !ready || submitting}
        className="w-full rounded-2xl bg-[color:var(--accent)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(169,124,80,0.7)] transition hover:bg-[color:var(--hero-deep)] hover:shadow-[0_14px_28px_-10px_rgba(92,58,34,0.6)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? t("stripePaying") : t("placeOrder")}
      </button>
      <p className="text-center text-[11px] text-[color:var(--muted)]">
        {t("stripeMethodsNote")}
      </p>
    </form>
  );
}

export function StripePaymentForm({
  clientSecret,
  publishableKey,
  preferredMethod,
  onPaid,
  onError,
}: StripePaymentFormProps) {
  const stripePromise = useMemo(
    () => getStripePromise(publishableKey),
    [publishableKey],
  );

  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#a97c50",
          colorBackground: "#ffffff",
          colorText: "#4a3626",
          colorDanger: "#df1b41",
          fontFamily: "system-ui, sans-serif",
          borderRadius: "12px",
        },
      },
    }),
    [clientSecret],
  );

  // Reset error when intent changes
  useEffect(() => {
    onError("");
  }, [clientSecret, onError]);

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutPayForm
        preferredMethod={preferredMethod}
        onPaid={onPaid}
        onError={onError}
      />
    </Elements>
  );
}
