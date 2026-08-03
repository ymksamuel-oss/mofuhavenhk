"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  FPS_ACCOUNT_NAME,
  FPS_ID,
  FPS_QR_SRC,
  formatFpsDisplayId,
} from "@/lib/fps";
import { formatMoney } from "@/lib/i18n/translations";

type FpsDetailsProps = {
  amountHkd: number;
};

type MenuKey = "proxy" | "amount" | "qr";

async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // fall through
  }
  try {
    const el = document.createElement("textarea");
    el.value = value;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
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
 * Bank-app style FPS interactive menu — only shown under checkout
 * PaymentMethods when FPS is selected.
 */
export function FpsDetails({ amountHkd }: FpsDetailsProps) {
  const { locale, t } = useI18n();
  const [active, setActive] = useState<MenuKey | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fpsDisplay = formatFpsDisplayId(FPS_ID);
  const amountDisplay = formatMoney(amountHkd, locale);
  // Bank apps usually paste a plain number; keep 2 d.p. for HKD.
  const amountCopy = amountHkd.toLocaleString("en-HK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const showToast = (message: string) => setToast(message);

  const handleProxy = async () => {
    setActive("proxy");
    const ok = await copyText(fpsDisplay);
    showToast(ok ? t("fpsCopiedId") : t("fpsCopyFailed"));
  };

  const handleAmount = async () => {
    setActive("amount");
    const ok = await copyText(amountCopy);
    showToast(ok ? t("fpsCopiedAmount") : t("fpsCopyFailed"));
  };

  const handleQr = () => {
    setActive((current) => (current === "qr" ? null : "qr"));
    setToast(null);
  };

  const optionClass = (key: MenuKey) =>
    `flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3.5 text-left transition active:scale-[0.99] ${
      active === key
        ? "border-[color:var(--accent)] bg-white shadow-[0_6px_16px_-10px_rgba(169,124,80,0.55)]"
        : "border-[color:var(--line)] bg-white/80 hover:border-[color:var(--accent)]/45 hover:bg-white"
    }`;

  return (
    <div
      className="relative space-y-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--accent-soft)]/35 p-4"
      data-fps-panel="checkout-only"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-[color:var(--line)]">
          <FpsBrandMark />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[color:var(--ink)]">
            {t("fpsMenuTitle")}
          </h3>
          <p className="mt-0.5 text-xs text-[color:var(--muted)]">
            {t("fpsMenuHint")}
          </p>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            {t("fpsAccountLabel")}：
            <span className="font-medium text-[color:var(--ink)]">
              {FPS_ACCOUNT_NAME}
            </span>
          </p>
        </div>
      </div>

      <ul className="space-y-2" role="list">
        <li>
          <button
            type="button"
            onClick={() => void handleProxy()}
            className={optionClass("proxy")}
          >
            <OptionIcon kind="proxy" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-[color:var(--ink)]">
                {t("fpsOptionProxy")}
              </span>
              <span className="mt-0.5 block text-xs tabular-nums text-[color:var(--muted)]">
                {fpsDisplay} · {t("fpsTapToCopy")}
              </span>
            </span>
            <Chevron />
          </button>
        </li>

        <li>
          <button
            type="button"
            onClick={() => void handleAmount()}
            className={optionClass("amount")}
          >
            <OptionIcon kind="amount" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-[color:var(--ink)]">
                {t("fpsOptionAmount")}
              </span>
              <span className="mt-0.5 block text-xs tabular-nums text-[color:var(--muted)]">
                {amountDisplay} · {t("fpsTapToCopy")}
              </span>
            </span>
            <Chevron />
          </button>
        </li>

        <li>
          <button
            type="button"
            onClick={handleQr}
            className={optionClass("qr")}
            aria-expanded={active === "qr"}
          >
            <OptionIcon kind="qr" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-[color:var(--ink)]">
                {t("fpsOptionQr")}
              </span>
              <span className="mt-0.5 block text-xs text-[color:var(--muted)]">
                {active === "qr" ? t("fpsQrExpanded") : t("fpsTapToExpand")}
              </span>
            </span>
            <Chevron open={active === "qr"} />
          </button>

          {active === "qr" ? (
            <div className="mt-2 flex flex-col items-center gap-2 rounded-2xl border border-[color:var(--line)] bg-white p-4 animate-[fadeUp_0.35s_ease_both]">
              <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-xl bg-white p-2 ring-1 ring-[color:var(--line)]">
                {/* eslint-disable-next-line @next/next/no-img-element -- local SVG / shop QR asset */}
                <img
                  src={FPS_QR_SRC}
                  alt={t("fpsQrAlt")}
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="text-center text-[11px] text-[color:var(--muted)]">
                {t("fpsQrHint")}
              </p>
            </div>
          ) : null}
        </li>
      </ul>

      {toast ? (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-3 top-3 z-10 rounded-xl bg-[color:var(--ink)] px-3 py-2 text-center text-xs font-medium text-white shadow-lg animate-[fadeUp_0.25s_ease_both]"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function FpsBrandMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#E8F6E9" />
      <path
        d="M12 18c6-6.5 20-6.8 27-.4"
        fill="none"
        stroke="#4DA3E0"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path d="M36.5 13.2l4.4 5-6.2.8z" fill="#4DA3E0" />
      <path
        d="M36 30c-6 6.5-20 6.8-27 .4"
        fill="none"
        stroke="#1E6BB8"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path d="M11.5 34.8l-4.4-5 6.2-.8z" fill="#1E6BB8" />
      <text
        x="24"
        y="28"
        textAnchor="middle"
        fill="#3CA54B"
        fontSize="12"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontStyle="italic"
      >
        FPS
      </text>
    </svg>
  );
}

function OptionIcon({ kind }: { kind: MenuKey }) {
  if (kind === "proxy") {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F6E9] text-[#3CA54B]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <rect
            x="7"
            y="3"
            width="10"
            height="18"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="12" cy="17.5" r="1" fill="currentColor" />
        </svg>
      </span>
    );
  }
  if (kind === "amount") {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#1E6BB8]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 7.5v9M9.2 9.8c.7-.9 1.7-1.3 2.8-1.3 1.6 0 2.8.9 2.8 2.2S13.7 13 12 13s-2.8.8-2.8 2.1c0 1.3 1.3 2.2 2.9 2.2 1.1 0 2-.4 2.7-1.2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF3E8] text-[#E35205]">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <rect
          x="4"
          y="4"
          width="7"
          height="7"
          rx="1.2"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <rect
          x="13"
          y="4"
          width="7"
          height="7"
          rx="1.2"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <rect
          x="4"
          y="13"
          width="7"
          height="7"
          rx="1.2"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M13 16.5h2.5V19H19v-2.5h-2.2V14H19"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function Chevron({ open = false }: { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-4 w-4 shrink-0 text-[color:var(--muted)] transition-transform ${
        open ? "rotate-90" : ""
      }`}
      aria-hidden
    >
      <path
        d="M7.5 4.5L13 10l-5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
