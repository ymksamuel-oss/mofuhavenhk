"use client";

import { useEffect, useId, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  FPS_ACCOUNT_NAME,
  FPS_QR_SRC,
  formatFpsDisplayId,
  fpsLocalDigits,
} from "@/lib/fps";
import { formatMoney } from "@/lib/i18n/translations";

type FpsDetailsProps = {
  amountHkd: number;
};

type FpsOptionId = "proxy" | "amount" | "qr";

async function copyText(value: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to legacy path.
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
 * FPS receiving details — bank-app style interactive menu shown under
 * PaymentMethods when the guest selects FPS.
 */
export function FpsDetails({ amountHkd }: FpsDetailsProps) {
  const { locale, t } = useI18n();
  const baseId = useId();
  const [active, setActive] = useState<FpsOptionId | null>(null);
  const [copied, setCopied] = useState<"proxy" | "amount" | null>(null);

  const displayId = formatFpsDisplayId();
  const amountLabel = formatMoney(amountHkd, locale);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const toggle = (id: FpsOptionId) => {
    setActive((prev) => (prev === id ? null : id));
  };

  const handleCopyProxy = async () => {
    const ok = await copyText(fpsLocalDigits());
    if (ok) setCopied("proxy");
  };

  const handleCopyAmount = async () => {
    const ok = await copyText(amountLabel);
    if (ok) setCopied("amount");
  };

  const options: {
    id: FpsOptionId;
    title: string;
    hint: string;
  }[] = [
    {
      id: "proxy",
      title: t("fpsOptionProxy"),
      hint: t("fpsOptionProxyHint"),
    },
    {
      id: "amount",
      title: t("fpsOptionAmount"),
      hint: t("fpsOptionAmountHint"),
    },
    {
      id: "qr",
      title: t("fpsOptionQr"),
      hint: t("fpsOptionQrHint"),
    },
  ];

  return (
    <div
      className="overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] shadow-[0_8px_20px_-14px_rgba(74,54,38,0.35)]"
      data-fps-panel="checkout-only"
    >
      <div className="border-b border-[color:var(--line)] bg-[color:var(--accent-soft)]/55 px-4 py-3.5">
        <h3 className="text-sm font-semibold text-[color:var(--ink)]">
          {t("fpsPanelTitle")}
        </h3>
        <p className="mt-1 text-xs font-medium text-[color:var(--muted)]">
          {t("fpsPanelHint")}
        </p>
      </div>

      <ul className="divide-y divide-[color:var(--line)]" role="list">
        {options.map(({ id, title, hint }) => {
          const open = active === id;
          const panelId = `${baseId}-${id}-panel`;
          const buttonId = `${baseId}-${id}-button`;

          return (
            <li key={id}>
              <button
                id={buttonId}
                type="button"
                onClick={() => toggle(id)}
                aria-expanded={open}
                aria-controls={panelId}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
                  open
                    ? "bg-[color:var(--accent-soft)]/70"
                    : "bg-[color:var(--surface)] hover:bg-[color:var(--accent-soft)]/35"
                }`}
              >
                <OptionIcon option={id} active={open} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-snug text-[color:var(--ink)]">
                    {title}
                  </span>
                </span>
                <Chevron open={open} />
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!open}
                className={
                  open
                    ? "border-t border-[color:var(--line)] bg-[color:var(--accent-soft)]/30 px-4 py-3.5"
                    : undefined
                }
              >
                {open ? (
                  <div className="animate-[fadeUp_0.28s_ease-out]">
                    <p className="text-xs text-[color:var(--muted)]">{hint}</p>

                    {id === "proxy" ? (
                      <div className="mt-3 space-y-3">
                        <div className="rounded-xl border border-[color:var(--line)] bg-white px-3.5 py-3">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-xs text-[color:var(--muted)]">
                              {t("fpsIdLabel")}
                            </span>
                            <span className="text-lg font-semibold tabular-nums tracking-wide text-[color:var(--ink)]">
                              {displayId}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-3 border-t border-[color:var(--line)] pt-2">
                            <span className="text-xs text-[color:var(--muted)]">
                              {t("fpsAccountLabel")}
                            </span>
                            <span className="text-sm font-medium text-[color:var(--ink)]">
                              {FPS_ACCOUNT_NAME}
                            </span>
                          </div>
                        </div>
                        <CopyButton
                          label={t("fpsCopyNumber")}
                          copiedLabel={t("fpsCopied")}
                          isCopied={copied === "proxy"}
                          onClick={() => void handleCopyProxy()}
                        />
                      </div>
                    ) : null}

                    {id === "amount" ? (
                      <div className="mt-3 space-y-3">
                        <div className="rounded-xl border border-[color:var(--line)] bg-white px-3.5 py-3">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-xs text-[color:var(--muted)]">
                              {t("fpsAmountLabel")}
                            </span>
                            <span className="text-xl font-semibold tabular-nums text-[color:var(--ink)]">
                              {amountLabel}
                            </span>
                          </div>
                        </div>
                        <CopyButton
                          label={t("fpsCopyAmount")}
                          copiedLabel={t("fpsCopied")}
                          isCopied={copied === "amount"}
                          onClick={() => void handleCopyAmount()}
                        />
                      </div>
                    ) : null}

                    {id === "qr" ? (
                      <div className="mt-3 flex flex-col items-center gap-2">
                        <div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-xl bg-white p-2 ring-1 ring-[color:var(--line)]">
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
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 text-[color:var(--muted)] transition-transform duration-200 ${
        open ? "rotate-90 text-[color:var(--accent)]" : ""
      }`}
    >
      <path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OptionIcon({
  option,
  active,
}: {
  option: FpsOptionId;
  active: boolean;
}) {
  const tone = active
    ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
    : "border-[color:var(--line)] bg-white text-[color:var(--accent)]";

  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${tone}`}
      aria-hidden="true"
    >
      {option === "proxy" ? (
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
      ) : null}
      {option === "amount" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path
            d="M12 3v18M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3 2 3 4.5 3 4.5 1.3 4.5 3-2 3-4.5 3-4.5-1.3-4.5-3"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      {option === "qr" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path
            d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M14 14h2v2h-2v-2Zm4 0h2v2h-2v-2Zm-4 4h2v2h-2v-2Zm4 0h2v2h-2v-2Zm-2 2h2v2h-2v-2Z"
            fill="currentColor"
          />
        </svg>
      ) : null}
    </span>
  );
}

function CopyButton({
  label,
  copiedLabel,
  isCopied,
  onClick,
}: {
  label: string;
  copiedLabel: string;
  isCopied: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] ${
        isCopied
          ? "bg-emerald-600 text-white"
          : "bg-[color:var(--accent)] text-white hover:bg-[color:var(--hero-deep)]"
      }`}
    >
      {isCopied ? (
        <>
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
            <path
              d="M4.5 10.5 8 14l7.5-8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
            <rect
              x="7"
              y="7"
              width="9"
              height="9"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.75"
            />
            <path
              d="M4 13V4.5A1.5 1.5 0 0 1 5.5 3H13"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
