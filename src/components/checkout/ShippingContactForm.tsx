"use client";

import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { translations } from "@/lib/i18n/translations";
import { HK_DISTRICTS } from "@/lib/hkDistricts";
import { emailValidationMessage, isValidEmailAddress } from "@/lib/emailAddress";
import { SFExpressPickupSelector } from "@/components/checkout/SFExpressPickupSelector";
import type { SfPickupPoint } from "@/lib/sf-pickup-points";
import { useCustomerAuth } from "@/lib/account/AuthProvider";

export { HK_DISTRICTS, getDistrictLabel } from "@/lib/hkDistricts";
export type { HkDistrict } from "@/lib/hkDistricts";

export type PhoneCountryCode = "+852" | "+853" | "+86";

export type ShippingContact = {
  name: string;
  /** Required for the post-payment electronic receipt. */
  email: string;
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

type SavedCheckoutAddress = {
  id: string;
  label: string;
  address_type: "home" | "business" | "sf_pickup";
  recipient_name: string;
  recipient_phone: string;
  address: string;
  address_line2: string;
  district: string;
  pickup_point_code: string | null;
  pickup_point_name: string | null;
  is_default: boolean;
};

const PHONE_COUNTRY_OPTIONS: Array<{
  code: PhoneCountryCode;
  labelZh: string;
  labelEn: string;
  labelJa: string;
}> = [
  { code: "+852", labelZh: "+852 \u9999\u6e2f", labelEn: "+852 Hong Kong", labelJa: "+852 \u9999\u6e2f" },
  { code: "+853", labelZh: "+853 \u6fb3\u9580", labelEn: "+853 Macao", labelJa: "+853 マカオ" },
  { code: "+86", labelZh: "+86 \u4e2d\u570b\u5927\u9678", labelEn: "+86 Mainland China", labelJa: "+86 \u4e2d\u56fd\u672c\u571f" },
];

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
        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-base text-[color:var(--ink)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] disabled:opacity-60 sm:text-sm ${
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
  email: "",
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
    return translations[locale === "en" ? "en" : "zh"].phoneValidationRequired;
  }
  if (countryCode === "+852") {
    if (digits.length !== 8) {
      return translations[locale === "en" ? "en" : "zh"].phoneValidationHkLength;
    }
    // HK mobiles/landlines are 8 digits starting 2–9.
    if (!/^[2-9]\d{7}$/.test(digits)) {
      return translations[locale === "en" ? "en" : "zh"].phoneValidationHkInvalid;
    }
    return null;
  }
  if (countryCode === "+853" && digits.length !== 8) {
    return translations[locale === "en" ? "en" : "zh"].phoneValidationMacaoLength;
  }
  if (countryCode === "+86" && (digits.length < 11 || digits.length > 11)) {
    return translations[locale === "en" ? "en" : "zh"].phoneValidationMainlandLength;
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
      isValidEmailAddress(contact.email) &&
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
  const { user } = useCustomerAuth();

  const patch = (partial: Partial<ShippingContact>) => {
    onChange({ ...value, ...partial });
  };

  const [deliveryMode, setDeliveryMode] = useState<"home" | "pickup">(
    value.sfStationCode.trim() ? "pickup" : "home",
  );
  const savedHomeAddress = useRef({
    address: value.sfStationCode.trim() ? "" : value.address,
    addressLine2: value.sfStationCode.trim() ? "" : value.addressLine2,
    district: value.sfStationCode.trim() ? "" : value.district,
  });
  const loadedAddressesFor = useRef("");
  const [savedAddresses, setSavedAddresses] = useState<SavedCheckoutAddress[]>([]);
  const [savedAddressProfileName, setSavedAddressProfileName] = useState("");
  const [savedAddressEmail, setSavedAddressEmail] = useState("");
  const [savedAddressesLoading, setSavedAddressesLoading] = useState(false);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState("");

  useEffect(() => {
    if (!user?.id || loadedAddressesFor.current === user.id) return;
    loadedAddressesFor.current = user.id;
    let active = true;
    setSavedAddressesLoading(true);
    void fetch("/api/account/checkout-data", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error("saved_address_unavailable");
        if (!active) return;
        const addresses = (data.addresses ?? []) as SavedCheckoutAddress[];
        setSavedAddresses(addresses);
        setSavedAddressProfileName(String(data.profile?.displayName ?? ""));
        setSavedAddressEmail(String(data.profile?.email ?? ""));
        const defaultAddress = addresses.find((address) => address.is_default);
        const selectedAddress = defaultAddress && !value.address.trim() && !value.sfStationCode.trim() ? defaultAddress : null;
        if (selectedAddress) {
          setSelectedSavedAddressId(selectedAddress.id);
          if (selectedAddress.address_type === "sf_pickup") {
            savedHomeAddress.current = { address: value.address, addressLine2: value.addressLine2, district: value.district };
            setDeliveryMode("pickup");
          } else {
            setDeliveryMode("home");
          }
        }
        const phoneSource = String(selectedAddress?.recipient_phone ?? data.profile?.phone ?? "");
        const phoneMatch = /^(\+852|\+853|\+86)\s*(.*)$/.exec(phoneSource);
        const phoneCountryCode = (phoneMatch?.[1] ?? value.phoneCountryCode) as PhoneCountryCode;
        const phone = normalizeLocalPhone(phoneMatch?.[2] ?? phoneSource);
        onChange({
          ...value,
          name: value.name || selectedAddress?.recipient_name || String(data.profile?.displayName ?? ""),
          email: value.email || String(data.profile?.email ?? ""),
          phone: value.phone || phone,
          phoneCountryCode: value.phone ? value.phoneCountryCode : phoneCountryCode,
          address: selectedAddress?.address ?? value.address,
          addressLine2: selectedAddress?.address_type === "sf_pickup" ? (selectedAddress.pickup_point_name ?? selectedAddress.address_line2 ?? "") : (selectedAddress?.address_line2 ?? value.addressLine2),
          district: selectedAddress?.district ?? value.district,
          sfStationCode: selectedAddress?.address_type === "sf_pickup" ? (selectedAddress.pickup_point_code ?? "") : "",
        });
      })
      .catch(() => { if (active) setSavedAddresses([]); })
      .finally(() => { if (active) setSavedAddressesLoading(false); });
    return () => { active = false; };
  }, [user?.id, value, onChange]);

  const applySavedAddress = (address: SavedCheckoutAddress) => {
    const pickup = address.address_type === "sf_pickup";
    if (pickup) {
      savedHomeAddress.current = { address: value.address, addressLine2: value.addressLine2, district: value.district };
      setDeliveryMode("pickup");
    } else {
      setDeliveryMode("home");
    }
    const phoneMatch = /^(\+852|\+853|\+86)\s*(.*)$/.exec(address.recipient_phone);
    const currentPhoneMatch = /^(\+852|\+853|\+86)\s*(.*)$/.exec(value.phone);
    onChange({
      ...value,
      name: address.recipient_name || savedAddressProfileName || value.name,
      email: value.email || savedAddressEmail,
      phone: normalizeLocalPhone(phoneMatch?.[2] ?? address.recipient_phone),
      phoneCountryCode: (phoneMatch?.[1] ?? currentPhoneMatch?.[1] ?? value.phoneCountryCode) as PhoneCountryCode,
      address: address.address,
      addressLine2: pickup ? (address.pickup_point_name ?? address.address_line2 ?? "") : address.address_line2,
      district: address.district,
      sfStationCode: pickup ? (address.pickup_point_code ?? "") : "",
    });
  };
  const changeDeliveryMode = (nextMode: "home" | "pickup") => {
    if (nextMode === deliveryMode) return;
    if (nextMode === "pickup") {
      savedHomeAddress.current = {
        address: value.address,
        addressLine2: value.addressLine2,
        district: value.district,
      };
      setDeliveryMode("pickup");
      patch({ address: "", addressLine2: "", district: "", sfStationCode: "" });
      return;
    }
    setDeliveryMode("home");
    patch({ ...savedHomeAddress.current, sfStationCode: "" });
  };

  const phoneError =
    showErrors || normalizeLocalPhone(value.phone).length > 0
      ? getPhoneValidationError(value.phone, value.phoneCountryCode, locale === "en" ? "en" : "zh")
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
        {user ? (
          <div className="mt-3 space-y-2 rounded-xl border border-[color:var(--line)] bg-white p-3">
            <label htmlFor="saved-checkout-address" className="block text-sm font-medium text-[color:var(--ink)]">
              {locale === "en" ? "Use a saved address" : "快速帶入會員已儲存地址"}
            </label>
            <select id="saved-checkout-address" value={selectedSavedAddressId} disabled={savedAddressesLoading} onChange={(event) => {
              const id = event.target.value;
              setSelectedSavedAddressId(id);
              const address = savedAddresses.find((candidate) => candidate.id === id);
              if (address) applySavedAddress(address);
            }} className="min-h-12 w-full rounded-xl border border-[color:var(--line)] bg-white px-3 py-2.5 text-base text-[color:var(--ink)] disabled:opacity-60 sm:text-sm">
              <option value="">{savedAddressesLoading ? (locale === "en" ? "Loading saved addresses…" : "正在載入已儲存地址…") : (locale === "en" ? "Choose an address" : "選擇地址")}</option>
              {savedAddresses.map((address) => <option key={address.id} value={address.id}>{address.label}{address.is_default ? (locale === "en" ? " (default)" : "（預設）") : ""} · {address.address_type === "sf_pickup" ? (locale === "en" ? "SF pickup" : "順豐自提") : address.district}</option>)}
            </select>
            {!savedAddressesLoading && savedAddresses.length === 0 ? <p className="text-xs leading-5 text-[color:var(--muted)]">{locale === "en" ? "No saved addresses yet. You can still check out as a guest." : "尚未儲存地址；你仍可直接以訪客身份結帳。"}</p> : null}
          </div>
        ) : (
          <p className="mt-3 rounded-xl bg-[color:var(--background)] px-3.5 py-3 text-sm leading-5 text-[color:var(--muted)]">
            {locale === "en" ? "Already a member? " : "已有帳號？"}
            <Link href={`/account/login?returnTo=${encodeURIComponent("/checkout")}`} className="font-semibold text-[color:var(--accent)] underline underline-offset-4">{locale === "en" ? "Sign in" : "點此登入"}</Link>
            {locale === "en" ? " to use saved details, or continue as a guest." : "帶入已儲存資料；亦可繼續訪客結帳。"}
          </p>
        )}
        <div className="mt-4">
          <p id="shipping-method-label" className="mb-2 text-sm font-medium text-[color:var(--ink)]">
            {t("shippingMethodLabel")}
          </p>
          <div role="group" aria-labelledby="shipping-method-label" className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={disabled}
              aria-pressed={deliveryMode === "home"}
              onClick={() => changeDeliveryMode("home")}
              className={`min-h-12 rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${deliveryMode === "home" ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white" : "border-[color:var(--line)] bg-white text-[color:var(--ink)]"}`}
            >
              {t("shippingHomeDelivery")}
            </button>
            <button
              type="button"
              disabled={disabled}
              aria-pressed={deliveryMode === "pickup"}
              onClick={() => changeDeliveryMode("pickup")}
              className={`min-h-12 rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${deliveryMode === "pickup" ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white" : "border-[color:var(--line)] bg-white text-[color:var(--ink)]"}`}
            >
              {t("shippingSfPickup")}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-[color:var(--line)] bg-white p-4">
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

        <Field
          id="receipt-email"
          label={t("receiptEmailLabel")}
          autoComplete="email"
          type="email"
          inputMode="email"
          value={value.email}
          onChange={(email) => patch({ email })}
          placeholder={t("receiptEmailPlaceholder")}
          disabled={disabled}
          required
          maxLength={254}
          error={
            (showErrors || value.email.trim().length > 0) && !isValidEmailAddress(value.email)
              ? emailValidationMessage(locale === "en" ? "en" : "zh")
              : undefined
          }
        />

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-[color:var(--ink)]">
            {t("customerPhoneLabel")}
            <span className="text-[#8a3a2a]"> *</span>
          </span>
          <div className="grid w-full min-w-0 max-w-full grid-cols-[minmax(7.25rem,0.9fr)_minmax(0,2.1fr)] gap-1.5 sm:flex">
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
              className="w-full min-w-0 max-w-none shrink rounded-xl border border-[color:var(--line)] bg-white px-1.5 py-3 text-[0.78rem] font-medium text-[color:var(--ink)] outline-none focus:border-[color:var(--accent)] disabled:opacity-60 sm:w-[9.5rem] sm:px-2.5 sm:text-sm"
            >
              {PHONE_COUNTRY_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {false ? option.labelJa : locale === "en" ? option.labelEn : option.labelZh}
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
              className={`w-full min-w-0 rounded-xl border bg-white px-2.5 py-3 text-base tabular-nums text-[color:var(--ink)] outline-none transition placeholder:text-[0.7rem] placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] disabled:opacity-60 sm:flex-1 sm:px-3.5 sm:text-sm sm:placeholder:text-sm ${
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

        {deliveryMode === "pickup" ? (
          <SFExpressPickupSelector
            selectedCode={value.sfStationCode}
            disabled={disabled}
            onSelect={(point: SfPickupPoint) =>
              patch({
                address: point.address,
                addressLine2: point.name,
                district: point.district || value.district,
                sfStationCode: point.code,
              })
            }
            onClearSelection={() =>
              patch({ address: "", addressLine2: "", district: "", sfStationCode: "" })
            }
          />
        ) : null}

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
            className={`w-full rounded-xl border bg-white px-3.5 py-3 text-base text-[color:var(--ink)] outline-none focus:border-[color:var(--accent)] disabled:opacity-60 sm:text-sm ${
              showErrors && !value.district
                ? "border-red-400"
                : "border-[color:var(--line)]"
            }`}
          >
            <option value="">{t("shippingDistrictPlaceholder")}</option>
            {HK_DISTRICTS.map((district) => (
              <option key={district.zh} value={district.zh}>
                {false ? district.en : locale === "en" ? district.en : district.zh}
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
          disabled={disabled || deliveryMode === "pickup"}
          required
          error={
            showErrors && !value.address.trim()
              ? t("shippingAddressRequired")
              : undefined
          }
        />
        {deliveryMode === "home" ? (
          <p className="-mt-1 text-xs leading-relaxed text-[color:var(--muted)]">
            {t("sfStationHint")}
          </p>
        ) : null}
        <Field
          id="shipping-address-2"
          label={t("shippingAddressLine2Label")}
          autoComplete="address-line2"
          value={value.addressLine2}
          onChange={(addressLine2) => patch({ addressLine2 })}
          placeholder={t("shippingAddressLine2Placeholder")}
          disabled={disabled || deliveryMode === "pickup"}
        />

        <div className="space-y-1.5 rounded-xl border border-dashed border-[color:var(--line)] bg-[color:var(--background)] px-3 py-3">
          <Field
            id="shipping-sf-code"
            label={t("sfStationLabel")}
            autoComplete="off"
            value={value.sfStationCode}
            onChange={(sfStationCode) =>
              patch({ sfStationCode: sfStationCode.toUpperCase() })
            }
            placeholder={t("sfStationPlaceholder")}
            disabled={disabled || deliveryMode === "pickup"}
            maxLength={32}
          />
        </div>
      </div>
    </section>
  );
}
