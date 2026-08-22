"use client";

import {
  Elements,
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  loadStripe,
  type Stripe,
  type StripeElementsOptions,
} from "@stripe/stripe-js";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

type StripePaymentFormProps = {
  clientSecret: string;
  publishableKey: string;
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

function CheckoutPayForm({
  clientSecret,
  returnUrl,
  onPaid,
  onError,
}: Omit<StripePaymentFormProps, "publishableKey">) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [expressAvailable, setExpressAvailable] = useState(true);

  const confirm = async () => {
    if (!stripe || !elements || submitting) return;

    setSubmitting(true);
    onError("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: { return_url: returnUrl },
      // Wallets and cards complete in place. Redirect methods return to checkout.
      redirect: "if_required",
    });

    if (error) {
      onError(error.message || t("stripePayFailed"));
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
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
    <div className="space-y-4">
      {expressAvailable ? (
        <div className="rounded-2xl border border-[color:var(--line)] bg-white p-3 shadow-[0_10px_28px_-18px_rgba(74,54,38,0.45)]">
          <ExpressCheckoutElement
            onConfirm={() => void confirm()}
            onReady={({ availablePaymentMethods }) =>
              setExpressAvailable(Boolean(availablePaymentMethods))
            }
            options={{
              buttonType: { applePay: "buy", googlePay: "buy" },
              buttonTheme: { applePay: "black", googlePay: "black" },
              buttonHeight: 48,
              layout: { maxColumns: 2, maxRows: 1, overflow: "never" },
              wallets: { applePay: "auto", googlePay: "auto", link: "never" },
            }}
          />
        </div>
      ) : null}

      <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--accent-soft)]/35 p-4">
        <PaymentElement options={{ layout: "tabs", wallets: { link: "never" } }} />
      </div>

      <button
        type="button"
        onClick={() => void confirm()}
        disabled={!stripe || !elements || submitting}
        className="w-full rounded-2xl bg-[color:var(--accent)] px-4 py-3.5 text-sm font-semibold tracking-[0.01em] text-white shadow-[0_10px_24px_-12px_rgba(122,75,49,0.58)] transition hover:bg-[color:var(--hero-deep)] hover:shadow-[0_14px_28px_-14px_rgba(84,57,45,0.6)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? t("stripePaying") : t("placeOrder")}
      </button>
    </div>
  );
}

export function StripePaymentForm({
  clientSecret,
  publishableKey,
  returnUrl,
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
          colorPrimary: "#7A4B31",
          colorBackground: "#ffffff",
          colorText: "#2B2623",
          colorDanger: "#df1b41",
          fontFamily: "system-ui, sans-serif",
          borderRadius: "12px",
        },
      },
      locale: "zh-HK",
    }),
    [clientSecret],
  );

  useEffect(() => {
    onError("");
  }, [clientSecret, onError]);

  return (
    <Elements key={clientSecret} stripe={stripePromise} options={options}>
      <CheckoutPayForm
        clientSecret={clientSecret}
        returnUrl={returnUrl}
        onPaid={onPaid}
        onError={onError}
      />
    </Elements>
  );
}
