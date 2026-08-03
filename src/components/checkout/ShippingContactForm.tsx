"use client";

import type { InputHTMLAttributes } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export type ShippingContact = {
  name: string;
  phone: string;
  address: string;
  addressLine2: string;
  city: string;
  postalCode: string;
};

type ShippingContactFormProps = {
  value: ShippingContact;
  onChange: (next: ShippingContact) => void;
  disabled?: boolean;
};

function Field({
  id,
  label,
  autoComplete,
  type = "text",
  inputMode,
  value,
  onChange,
  placeholder,
  disabled,
  required,
}: {
  id: string;
  label: string;
  autoComplete: string;
  type?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="text-sm font-medium text-[color:var(--ink)]">
        {label}
        {required ? <span className="text-[#8a3a2a]"> *</span> : null}
      </span>
      <input
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[color:var(--line)] bg-white px-3.5 py-2.5 text-base text-[color:var(--ink)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] disabled:opacity-60 sm:text-sm"
      />
    </label>
  );
}

export const EMPTY_SHIPPING_CONTACT: ShippingContact = {
  name: "",
  phone: "",
  address: "",
  addressLine2: "",
  city: "",
  postalCode: "",
};

/**
 * Mobile-first shipping / contact form with browser autofill attributes
 * for Safari/Chrome one-tap fill.
 */
export function ShippingContactForm({
  value,
  onChange,
  disabled = false,
}: ShippingContactFormProps) {
  const { t } = useI18n();

  const patch = (partial: Partial<ShippingContact>) => {
    onChange({ ...value, ...partial });
  };

  return (
    <section
      aria-labelledby="shipping-contact-title"
      className="space-y-3"
      data-shipping-contact="true"
    >
      <div>
        <h2
          id="shipping-contact-title"
          className="font-[family-name:var(--font-display)] text-xl text-[color:var(--ink)]"
        >
          {t("shippingContactTitle")}
        </h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          {t("shippingContactHint")}
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--accent-soft)]/25 p-4">
        <Field
          id="shipping-name"
          label={t("customerNameLabel")}
          autoComplete="name"
          value={value.name}
          onChange={(name) => patch({ name })}
          placeholder={t("customerNamePlaceholder")}
          disabled={disabled}
          required
        />
        <Field
          id="shipping-tel"
          label={t("customerPhoneLabel")}
          autoComplete="tel"
          type="tel"
          inputMode="tel"
          value={value.phone}
          onChange={(phone) => patch({ phone })}
          placeholder={t("customerPhonePlaceholder")}
          disabled={disabled}
          required
        />
        <Field
          id="shipping-address"
          label={t("shippingAddressLabel")}
          autoComplete="street-address"
          value={value.address}
          onChange={(address) => patch({ address })}
          placeholder={t("shippingAddressPlaceholder")}
          disabled={disabled}
          required
        />
        <Field
          id="shipping-address-2"
          label={t("shippingAddressLine2Label")}
          autoComplete="address-line2"
          value={value.addressLine2}
          onChange={(addressLine2) => patch({ addressLine2 })}
          placeholder={t("shippingAddressLine2Placeholder")}
          disabled={disabled}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            id="shipping-city"
            label={t("shippingCityLabel")}
            autoComplete="address-level2"
            value={value.city}
            onChange={(city) => patch({ city })}
            placeholder={t("shippingCityPlaceholder")}
            disabled={disabled}
          />
          <Field
            id="shipping-postal"
            label={t("shippingPostalLabel")}
            autoComplete="postal-code"
            value={value.postalCode}
            onChange={(postalCode) => patch({ postalCode })}
            placeholder={t("shippingPostalPlaceholder")}
            disabled={disabled}
          />
        </div>
      </div>
    </section>
  );
}
