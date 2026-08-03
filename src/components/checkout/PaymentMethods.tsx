"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { ApplePayLogo, CardLogo } from "@/components/icons/PaymentIcons";
import { FpsQrExpandPanel } from "@/components/checkout/FpsQrExpandPanel";
import { fpsLocalDigits } from "@/lib/fps";

export type MethodId = "card" | "applepay" | "fps";

export type PaymentMethodDef = {
  id: MethodId;
  labelKey: "payCard" | "payApplePay" | "payFps";
  Icon?: typeof CardLogo;
};

export const PAYMENT_METHODS: PaymentMethodDef[] = [
  { id: "card", labelKey: "payCard", Icon: CardLogo },
  { id: "applepay", labelKey: "payApplePay", Icon: ApplePayLogo },
  { id: "fps", labelKey: "payFps" },
];

type PaymentMethodsProps = {
  selected: MethodId;
  onSelect: (id: MethodId) => void;
  /** Drives the amount shown / copied in the FPS bank-style menu. */
  amountHkd?: number;
};

async function copyText(value: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through.
  }
  try {
    const el = document.createElement("textarea");
    el.value = value;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Hong Kong bank-app style FPS payee picker — shown under SC Pay 轉數快.
 */
function FpsBankMenu({
  amountHkd,
  onCancel,
}: {
  amountHkd: number;
  onCancel: () => void;
}) {
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [phoneCopied, setPhoneCopied] = useState(false);

  // Continuous 8-digit local number for display + copy (no mid-number spaces).
  const phoneDigits = fpsLocalDigits(); // e.g. 98646585
  const amountPlain = amountHkd.toFixed(2); // e.g. 439.00

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleCopyPhone = async () => {
    const ok = await copyText(phoneDigits);
    if (ok) {
      setPhoneCopied(true);
      setToast("已複製電話");
      window.setTimeout(() => setPhoneCopied(false), 2200);
    }
  };

  const handleCopyAmount = async () => {
    const ok = await copyText(amountPlain);
    if (ok) setToast("已複製金額");
  };

  const togglePhone = () => {
    setPhoneOpen((open) => !open);
    setQrOpen(false);
  };

  const toggleQr = () => {
    setQrOpen((open) => !open);
    setPhoneOpen(false);
  };

  return (
    <div
      className="relative rounded-2xl border border-[color:var(--line)] bg-white shadow-[0_10px_28px_-16px_rgba(74,54,38,0.45)]"
      data-fps-bank-menu="true"
      role="dialog"
      aria-label="請選擇收款人類別以繼續"
    >
      <div className="border-b border-[color:var(--line)] px-4 py-3.5 text-center">
        <p className="text-sm font-semibold text-[color:var(--ink)]">
          請選擇收款人類別以繼續
        </p>
      </div>

      <ul className="divide-y divide-[color:var(--line)]" role="list">
        <li>
          <button
            type="button"
            onClick={togglePhone}
            aria-expanded={phoneOpen}
            className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-[color:var(--accent-soft)]/40 active:bg-[color:var(--accent-soft)]/60"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0072AA]/10 text-[#0072AA]"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                <rect
                  x="7"
                  y="3"
                  width="10"
                  height="18"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.75"
                />
                <path
                  d="M10 17h4"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-[color:var(--ink)]">
                手提電話號碼 / 電郵地址 / 轉數快識別碼
              </span>
              <span className="mt-0.5 block text-xs tabular-nums tracking-normal text-[color:var(--muted)]">
                {phoneDigits}
              </span>
            </span>
            <span
              className={`text-[color:var(--muted)] transition-transform ${
                phoneOpen ? "rotate-90" : ""
              }`}
              aria-hidden="true"
            >
              ›
            </span>
          </button>

          {phoneOpen ? (
            <div className="space-y-3 bg-white px-4 pb-4 pt-1">
              <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--accent-soft)]/35 px-4 py-3">
                <p className="text-xs text-[color:var(--muted)]">
                  收款電話／轉數快識別碼
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-normal tabular-nums text-[color:var(--ink)]">
                  {phoneDigits}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleCopyPhone()}
                className={`flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.99] ${
                  phoneCopied
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-[color:var(--accent)] text-white hover:bg-[color:var(--hero-deep)]"
                }`}
              >
                {phoneCopied ? "已複製" : "一鍵複製"}
              </button>

              <p className="rounded-xl border border-[#c48a4a] bg-[#fff4e5] px-3 py-2.5 text-center text-sm font-semibold leading-relaxed text-[#5c3a22]">
                複製號碼後，請前往您的銀行 App 透過轉數快付款，然後點擊下方按鈕確認訂單。
              </p>
            </div>
          ) : null}
        </li>

        <li>
          <button
            type="button"
            onClick={() => void handleCopyAmount()}
            className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-[color:var(--accent-soft)]/40 active:bg-[color:var(--accent-soft)]/60"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0072AA]/10 text-[#0072AA]"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                <path
                  d="M12 3v18M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3 2 3 4.5 3 4.5 1.3 4.5 3-2 3-4.5 3-4.5-1.3-4.5-3"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-[color:var(--ink)]">
                轉帳金額快速複製
              </span>
              <span className="mt-0.5 block text-xs tabular-nums text-[color:var(--muted)]">
                HK$ {amountPlain}
              </span>
            </span>
            <span className="text-[color:var(--muted)]" aria-hidden="true">
              ›
            </span>
          </button>
        </li>

        <li>
          <button
            type="button"
            onClick={toggleQr}
            aria-expanded={qrOpen}
            className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-[color:var(--accent-soft)]/40 active:bg-[color:var(--accent-soft)]/60"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0072AA]/10 text-[#0072AA]"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                <path
                  d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 14h2v2h-2v-2Zm4 0h2v2h-2v-2Zm-4 4h2v2h-2v-2Zm4 0h2v2h-2v-2Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="min-w-0 flex-1 text-sm font-medium text-[color:var(--ink)]">
              轉數快二維碼 (QR Code)
            </span>
            <span
              className={`text-[color:var(--muted)] transition-transform ${
                qrOpen ? "rotate-90" : ""
              }`}
              aria-hidden="true"
            >
              ›
            </span>
          </button>

          {qrOpen ? <FpsQrExpandPanel /> : null}
        </li>
      </ul>

      <div className="border-t border-[color:var(--line)] p-3">
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-[color:var(--muted)] transition hover:bg-[color:var(--accent-soft)]/50 hover:text-[color:var(--ink)]"
        >
          取消
        </button>
      </div>

      {toast ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-16 z-10 flex justify-center px-4"
          role="status"
          aria-live="polite"
        >
          <span className="rounded-full bg-[color:var(--ink)] px-4 py-2 text-xs font-semibold text-white shadow-lg">
            {toast}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function PaymentMethods({
  selected,
  onSelect,
  amountHkd = 0,
}: PaymentMethodsProps) {
  const { t } = useI18n();

  return (
    <section
      aria-labelledby="payment-title"
      className="milk-tea-card space-y-4 p-5 sm:p-6"
    >
      <div>
        <h2
          id="payment-title"
          className="font-[family-name:var(--font-display)] text-xl text-[color:var(--ink)]"
        >
          {t("paymentTitle")}
        </h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          {t("paymentHint")}
        </p>
      </div>

      <ul className="space-y-3">
        {PAYMENT_METHODS.map(({ id, labelKey, Icon }) => {
          const active = selected === id;
          const isFps = id === "fps";

          return (
            <li key={id} className="relative space-y-3">
              <button
                type="button"
                onClick={() => onSelect(id)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                  active
                    ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] shadow-[0_6px_16px_-8px_rgba(169,124,80,0.55)]"
                    : "border-[color:var(--line)] bg-[color:var(--surface)] hover:border-[color:var(--accent)]/50 hover:bg-[color:var(--accent-soft)]/40"
                }`}
                aria-pressed={active}
              >
                <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg border border-[color:var(--line)] bg-white px-1">
                  {isFps ? (
                    // eslint-disable-next-line @next/next/no-img-element -- official blue double-arrow 轉數快 mark
                    <img
                      src="/images/fps-official-logo.png"
                      alt="轉數快 FPS"
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  ) : Icon ? (
                    <Icon />
                  ) : null}
                </span>

                <span className="min-w-0 flex-1 text-left text-sm font-medium whitespace-nowrap text-[color:var(--ink)]">
                  {isFps ? "SC Pay 轉數快" : t(labelKey)}
                </span>

                <span
                  className={`ml-auto h-4 w-4 shrink-0 rounded-full border transition ${
                    active
                      ? "border-[color:var(--accent)] bg-[color:var(--accent)]"
                      : "border-[color:var(--line)] bg-transparent"
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isFps && active ? (
                <FpsBankMenu
                  amountHkd={amountHkd}
                  onCancel={() => onSelect("card")}
                />
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="text-xs leading-relaxed text-[color:var(--muted)]">
        {selected === "fps" ? t("fpsMethodsNote") : t("stripeMethodsNote")}
      </p>
    </section>
  );
}
