"use client";

import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  loadStripe,
  type Stripe,
  type StripeCardNumberElementOptions,
  type StripeElementsOptions,
} from "@stripe/stripe-js";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
type StripePaymentFormProps = {
  clientSecret: string;
  publishableKey: string;
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

const FIELD_STYLE: StripeCardNumberElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#2B2623",
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      letterSpacing: "0.04em",
      "::placeholder": { color: "#756962" },
    },
    invalid: { color: "#df1b41" },
  },
  // Stripe CardNumberElement formats as 1234 5678 9012 3456 by default.
  showIcon: true,
  disableLink: true,
};

function FieldShell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-[color:var(--ink)]">{label}</span>
      <div className="rounded-xl border border-[color:var(--line)] bg-white px-3.5 py-3 shadow-[inset_0_1px_2px_rgba(43,38,35,0.04)] transition focus-within:border-[color:var(--accent)]">
        {children}
      </div>
    </label>
  );
}

function CheckoutPayForm({
  clientSecret,
  onPaid,
  onError,
}: {
  clientSecret: string;
  onPaid: (paymentIntentId: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useI18n();
  const [cardholderName, setCardholderName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cardComplete, setCardComplete] = useState({
    number: false,
    expiry: false,
    cvc: false,
  });
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || submitting) return;

    if (!cardholderName.trim()) {
      setNameError(true);
      onError(t("customerNameRequired"));
      return;
    }

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      onError(t("stripePayFailed"));
      return;
    }

    if (!cardComplete.number || !cardComplete.expiry || !cardComplete.cvc) {
      onError(t("stripeCardIncomplete"));
      return;
    }

    setSubmitting(true);
    setNameError(false);
    onError("");

    const name = cardholderName.trim();

    // Store name on the PaymentIntent before confirm so WhatsApp notify has it.
    try {
      await fetch("/api/stripe/update-customer-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: clientSecret.split("_secret")[0],
          customerName: name,
        }),
      });
    } catch {
      // billing_details below is the fallback source of truth
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardNumber,
          billing_details: { name },
        },
      },
    );

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
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
      <div className="space-y-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--accent-soft)]/35 p-4">
        <p className="text-sm font-semibold text-[color:var(--ink)]">
          {t("stripeCardFieldsTitle")}
        </p>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[color:var(--ink)]">
            {t("stripeCardholderName")}
          </span>
          <input
            type="text"
            value={cardholderName}
            onChange={(event) => {
              setCardholderName(event.target.value);
              if (nameError) setNameError(false);
            }}
            placeholder={t("customerNamePlaceholder")}
            autoComplete="cc-name"
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-[color:var(--ink)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] sm:text-sm ${
              nameError ? "border-red-400" : "border-[color:var(--line)]"
            }`}
          />
        </label>

        <div className="space-y-1.5">
          <FieldShell label={t("stripeCardNumber")}>
            <CardNumberElement
              options={FIELD_STYLE}
              onChange={(event) =>
                setCardComplete((prev) => ({
                  ...prev,
                  number: event.complete,
                }))
              }
            />
          </FieldShell>
          <p className="text-xs leading-relaxed text-[color:var(--muted)]">
            {t("stripeCardNumberHint")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldShell label={t("stripeCardExpiry")}>
            <CardExpiryElement
              options={{ style: FIELD_STYLE.style }}
              onChange={(event) =>
                setCardComplete((prev) => ({ ...prev, expiry: event.complete }))
              }
            />
          </FieldShell>
          <FieldShell label={t("stripeCardCvc")}>
            <CardCvcElement
              options={{ style: FIELD_STYLE.style }}
              onChange={(event) =>
                setCardComplete((prev) => ({ ...prev, cvc: event.complete }))
              }
            />
          </FieldShell>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="w-full rounded-2xl bg-[color:var(--accent)] px-4 py-3.5 text-sm font-semibold tracking-[0.01em] text-white shadow-[0_10px_24px_-12px_rgba(122,75,49,0.58)] transition hover:bg-[color:var(--hero-deep)] hover:shadow-[0_14px_28px_-14px_rgba(84,57,45,0.6)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? t("stripePaying") : t("placeOrder")}
      </button>
    </form>
  );
}

export function StripePaymentForm({
  clientSecret,
  publishableKey,
  onPaid,
  onError,
}: StripePaymentFormProps) {
  const stripePromise = useMemo(
    () => getStripePromise(publishableKey),
    [publishableKey],
  );

  const options: StripeElementsOptions = useMemo(
    () => ({
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
    [],
  );

  useEffect(() => {
    onError("");
  }, [clientSecret, onError]);

  return (
    <Elements key={clientSecret} stripe={stripePromise} options={options}>
      <CheckoutPayForm
        clientSecret={clientSecret}
        onPaid={onPaid}
        onError={onError}
      />
    </Elements>
  );
}
