"use client";

import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  PaymentRequestButtonElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  loadStripe,
  type PaymentRequest,
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
import type { MethodId } from "@/components/checkout/PaymentMethods";

type StripePaymentFormProps = {
  clientSecret: string;
  publishableKey: string;
  preferredMethod: MethodId;
  customerName: string;
  amountHkd: number;
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
      color: "#4a3626",
      fontFamily: "system-ui, sans-serif",
      "::placeholder": { color: "#a89078" },
    },
    invalid: { color: "#df1b41" },
  },
  showIcon: true,
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
      <div className="rounded-xl border border-[color:var(--line)] bg-white px-3.5 py-3 shadow-[inset_0_1px_2px_rgba(74,54,38,0.04)] transition focus-within:border-[color:var(--accent)]">
        {children}
      </div>
    </label>
  );
}

function CheckoutPayForm({
  preferredMethod,
  customerName,
  amountHkd,
  clientSecret,
  onPaid,
  onError,
}: {
  preferredMethod: MethodId;
  customerName: string;
  amountHkd: number;
  clientSecret: string;
  onPaid: (paymentIntentId: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [cardComplete, setCardComplete] = useState({
    number: false,
    expiry: false,
    cvc: false,
  });
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
    null,
  );
  const [applePayAvailable, setApplePayAvailable] = useState(false);

  // Apple Pay / Payment Request Button when wallet is preferred or available.
  useEffect(() => {
    if (!stripe || amountHkd <= 0) return;

    const pr = stripe.paymentRequest({
      country: "HK",
      currency: "hkd",
      total: {
        label: "Mofu Haven",
        amount: Math.round(amountHkd * 100),
      },
      requestPayerName: true,
    });

    let cancelled = false;
    pr.canMakePayment().then((result) => {
      if (cancelled) return;
      if (result) {
        setPaymentRequest(pr);
        setApplePayAvailable(Boolean(result.applePay));
      } else {
        setPaymentRequest(null);
        setApplePayAvailable(false);
      }
    });

    pr.on("paymentmethod", async (event) => {
      setSubmitting(true);
      onError("");
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: event.paymentMethod.id },
        { handleActions: false },
      );

      if (error) {
        event.complete("fail");
        onError(error.message || t("stripePayFailed"));
        setSubmitting(false);
        return;
      }

      event.complete("success");

      if (paymentIntent?.status === "requires_action") {
        const confirmed = await stripe.confirmCardPayment(clientSecret);
        if (confirmed.error) {
          onError(confirmed.error.message || t("stripePayFailed"));
          setSubmitting(false);
          return;
        }
        if (confirmed.paymentIntent?.status === "succeeded") {
          await onPaid(confirmed.paymentIntent.id);
          setSubmitting(false);
          return;
        }
      }

      if (paymentIntent?.status === "succeeded") {
        await onPaid(paymentIntent.id);
      } else {
        onError(t("stripePayFailed"));
      }
      setSubmitting(false);
    });

    return () => {
      cancelled = true;
    };
  }, [stripe, amountHkd, clientSecret, onError, onPaid, t]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || submitting) return;

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
    onError("");

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name: customerName.trim() || undefined,
          },
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

  const showApplePayFirst = preferredMethod === "applepay" && applePayAvailable;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showApplePayFirst && paymentRequest ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[color:var(--ink)]">
            {t("payApplePay")}
          </p>
          <PaymentRequestButtonElement
            options={{
              paymentRequest,
              style: {
                paymentRequestButton: {
                  type: "buy",
                  theme: "dark",
                  height: "48px",
                },
              },
            }}
          />
          <p className="text-center text-xs text-[color:var(--muted)]">
            {t("stripeOrCard")}
          </p>
        </div>
      ) : null}

      <div className="space-y-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--accent-soft)]/35 p-4">
        <p className="text-sm font-semibold text-[color:var(--ink)]">
          {t("stripeCardFieldsTitle")}
        </p>
        <FieldShell label={t("stripeCardNumber")}>
          <CardNumberElement
            options={FIELD_STYLE}
            onChange={(event) =>
              setCardComplete((prev) => ({ ...prev, number: event.complete }))
            }
          />
        </FieldShell>
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

      {!showApplePayFirst && paymentRequest && applePayAvailable ? (
        <div className="space-y-2">
          <p className="text-center text-xs text-[color:var(--muted)]">
            {t("stripeOrApplePay")}
          </p>
          <PaymentRequestButtonElement
            options={{
              paymentRequest,
              style: {
                paymentRequestButton: {
                  type: "buy",
                  theme: "dark",
                  height: "44px",
                },
              },
            }}
          />
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
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
  customerName,
  amountHkd,
  onPaid,
  onError,
}: StripePaymentFormProps) {
  const stripePromise = useMemo(
    () => getStripePromise(publishableKey),
    [publishableKey],
  );

  const options: StripeElementsOptions = useMemo(
    () => ({
      // Card Element group does not need clientSecret on Elements root;
      // confirmCardPayment uses the PaymentIntent client secret directly.
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
      locale: "zh-HK",
    }),
    [],
  );

  useEffect(() => {
    onError("");
  }, [clientSecret, onError]);

  return (
    <Elements
      key={clientSecret}
      stripe={stripePromise}
      options={options}
    >
      <CheckoutPayForm
        preferredMethod={preferredMethod}
        customerName={customerName}
        amountHkd={amountHkd}
        clientSecret={clientSecret}
        onPaid={onPaid}
        onError={onError}
      />
    </Elements>
  );
}
