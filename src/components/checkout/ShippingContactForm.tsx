"use client";

import type { InputHTMLAttributes } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export type PhoneCountryCode = "+852" | "+853" | "+86";

export type ShippingContact = {
  name: string;
  /** Local phone digits only (no country code). */
  phone: string;
  phoneCountryCode: PhoneCountryCode;
  address: string;
  addressLine2: string;
  /** Hong Kong district from the dropdown. */
  district: string;
  /** Optional SF Express station / locker code. */
  sfStationCode: string;
};

type ShippingContactFormProps = {
  value: ShippingContact;
  onChange: (next: ShippingContact) => void;
  disabled?: boolean;
  /** Show inline phone validation after blur / submit attempt. */
  showErrors?: boolean;
};

const PHONE_COUNTRY_OPTIONS: Array<{
  code: PhoneCountryCode;
  labelZh: string;
  labelEn: string;
}> = [
  { code: "+852", labelZh: "+852 香港", labelEn: "+852 Hong Kong" },
  { code: "+853", labelZh: "+853 澳門", labelEn: "+853 Macao" },
  { code: "+86", labelZh: "+86 中國大陸", labelEn: "+86 Mainland China" },
];

/** Common HK districts for a low-friction dropdown. */
export const HK_DISTRICTS = [
  "中西區",
  "灣仔",
  "東區",
  "南區",
  "油尖旺",
  "深水埗",
  "九龍城",
  "黃大仙",
  "觀塘",
  "荃灣",
  "葵青",
  "屯門",
  "元朗",
  "北區",
  "大埔",
  "沙田",
  "西貢",
  "離島",
] as const;

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
  maxLength,
  error,
  onBlur,
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
  maxLength?: number;
  error?: string;
  onBlur?: () => void;
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
        maxLength={maxLength}
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-[color:var(--ink)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] disabled:opacity-60 sm:text-sm ${
          error ? "border-red-400" : "border-[color:var(--line)]"
        }`}
      />
      {error ? (
        <span className="block text-xs font-medium text-[#8a3a2a]">{error}</span>
      ) : null}
    </label>
  );
}

export const EMPTY_SHIPPING_CONTACT: ShippingContact = {
  name: "",
  phone: "",
  phoneCountryCode: "+852",
  address: "",
  addressLine2: "",
  district: "",
  sfStationCode: "",
};

/** Digits-only local phone number. */
export function normalizeLocalPhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

/**
 * Validate local phone for the selected country code.
 * +852 → exactly 8 HK digits; others → require a sensible length.
 */
export function getPhoneValidationError(
  phone: string,
  countryCode: PhoneCountryCode,
  locale: "zh" | "en",
): string | null {
  const digits = normalizeLocalPhone(phone);
  if (!digits) {
    return locale === "zh" ? "請輸入聯絡電話。" : "Please enter a phone number.";
  }
  if (countryCode === "+852") {
    if (digits.length !== 8) {
      return locale === "zh"
        ? "香港電話須為 8 位數字（例如 91234567）。"
        : "Hong Kong numbers must be 8 digits (e.g. 91234567).";
    }
    // HK mobiles/landlines are 8 digits starting 2–9.
    if (!/^[2-9]\d{7}$/.test(digits)) {
      return locale === "zh"
        ? "請輸入有效的香港電話號碼。"
        : "Please enter a valid Hong Kong phone number.";
    }
    return null;
  }
  if (countryCode === "+853" && digits.length !== 8) {
    return locale === "zh"
      ? "澳門電話一般為 8 位數字。"
      : "Macao numbers are usually 8 digits.";
  }
  if (countryCode === "+86" && (digits.length < 11 || digits.length > 11)) {
    return locale === "zh"
      ? "中國大陸手機一般為 11 位數字。"
      : "Mainland China mobiles are usually 11 digits.";
  }
  return null;
}

export function formatPhoneForDisplay(contact: ShippingContact): string {
  const digits = normalizeLocalPhone(contact.phone);
  if (!digits) return "";
  return `${contact.phoneCountryCode} ${digits}`;
}

export function isShippingContactComplete(contact: ShippingContact): boolean {
  return Boolean(
    contact.name.trim() &&
      contact.address.trim() &&
      contact.district.trim() &&
      !getPhoneValidationError(
        contact.phone,
        contact.phoneCountryCode,
        "zh",
      ),
  );
}

/**
 * Hong Kong–localised shipping / contact form:
 * no postal code, +852 phone validation, district dropdown, optional SF code.
 */
export function ShippingContactForm({
  value,
  onChange,
  disabled = false,
  showErrors = false,
}: ShippingContactFormProps) {
  const { locale, t } = useI18n();

  const patch = (partial: Partial<ShippingContact>) => {
    onChange({ ...value, ...partial });
  };

  const phoneError =
    showErrors || normalizeLocalPhone(value.phone).length > 0
      ? getPhoneValidationError(value.phone, value.phoneCountryCode, locale)
      : null;

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
          error={
            showErrors && !value.name.trim()
              ? t("customerNameRequired")
              : undefined
          }
        />

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-[color:var(--ink)]">
            {t("customerPhoneLabel")}
            <span className="text-[#8a3a2a]"> *</span>
          </span>
          <div className="flex min-w-0 max-w-full gap-2">
            <label htmlFor="shipping-phone-country" className="sr-only">
              {t("phoneCountryLabel")}
            </label>
            <select
              id="shipping-phone-country"
              name="phone-country-code"
              value={value.phoneCountryCode}
              disabled={disabled}
              onChange={(event) =>
                patch({
                  phoneCountryCode: event.target.value as PhoneCountryCode,
                })
              }
              className="w-[7.25rem] max-w-[42%] shrink-0 rounded-xl border border-[color:var(--line)] bg-white px-2 py-2.5 text-sm font-medium text-[color:var(--ink)] outline-none focus:border-[color:var(--accent)] disabled:opacity-60 sm:w-[9.5rem] sm:max-w-none sm:px-2.5"
            >
              {PHONE_COUNTRY_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {locale === "zh" ? option.labelZh : option.labelEn}
                </option>
              ))}
            </select>
            <input
              id="shipping-tel"
              name="shipping-tel"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={value.phone}
              disabled={disabled}
              required
              maxLength={value.phoneCountryCode === "+86" ? 11 : 8}
              placeholder={
                value.phoneCountryCode === "+852"
                  ? t("customerPhonePlaceholderHk")
                  : t("customerPhonePlaceholder")
              }
              aria-invalid={phoneError ? true : undefined}
              onChange={(event) => {
                const next = normalizeLocalPhone(event.target.value);
                const max = value.phoneCountryCode === "+86" ? 11 : 8;
                patch({ phone: next.slice(0, max) });
              }}
              className={`min-w-0 flex-1 rounded-xl border bg-white px-3.5 py-2.5 text-base tabular-nums text-[color:var(--ink)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] disabled:opacity-60 sm:text-sm ${
                phoneError ? "border-red-400" : "border-[color:var(--line)]"
              }`}
            />
          </div>
          {phoneError ? (
            <p className="text-xs font-medium text-[#8a3a2a]">{phoneError}</p>
          ) : (
            <p className="text-xs text-[color:var(--muted)]">
              {t("customerPhoneHintHk")}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="shipping-district"
            className="text-sm font-medium text-[color:var(--ink)]"
          >
            {t("shippingDistrictLabel")}
            <span className="text-[#8a3a2a]"> *</span>
          </label>
          <select
            id="shipping-district"
            name="shipping-district"
            autoComplete="address-level2"
            value={value.district}
            disabled={disabled}
            required
            onChange={(event) => patch({ district: event.target.value })}
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-[color:var(--ink)] outline-none focus:border-[color:var(--accent)] disabled:opacity-60 sm:text-sm ${
              showErrors && !value.district
                ? "border-red-400"
                : "border-[color:var(--line)]"
            }`}
          >
            <option value="">{t("shippingDistrictPlaceholder")}</option>
            {HK_DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          {showErrors && !value.district ? (
            <p className="text-xs font-medium text-[#8a3a2a]">
              {t("shippingDistrictRequired")}
            </p>
          ) : null}
        </div>

        <Field
          id="shipping-address"
          label={t("shippingAddressLabel")}
          autoComplete="street-address"
          value={value.address}
          onChange={(address) => patch({ address })}
          placeholder={t("shippingAddressPlaceholder")}
          disabled={disabled}
          required
          error={
            showErrors && !value.address.trim()
              ? t("shippingAddressRequired")
              : undefined
          }
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

        <div className="space-y-1.5 rounded-xl border border-dashed border-[color:var(--line)] bg-white/70 px-3 py-3">
          <Field
            id="shipping-sf-code"
            label={t("sfStationLabel")}
            autoComplete="off"
            value={value.sfStationCode}
            onChange={(sfStationCode) =>
              patch({ sfStationCode: sfStationCode.toUpperCase() })
            }
            placeholder={t("sfStationPlaceholder")}
            disabled={disabled}
            maxLength={32}
          />
          <p className="text-xs leading-relaxed text-[color:var(--muted)]">
            {t("sfStationHint")}
          </p>
        </div>
      </div>
    </section>
  );
}
