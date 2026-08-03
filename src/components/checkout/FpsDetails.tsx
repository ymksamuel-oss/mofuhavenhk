"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { copyToClipboard } from "@/lib/copyToClipboard";
import {
  FPS_ACCOUNT_NAME,
  FPS_DEEP_LINK,
  FPS_ID,
  FPS_QR_SRC,
  formatFpsAmountForCopy,
  formatFpsDisplayId,
  getFpsIdForCopy,
  isLikelyMobileClient,
  tryOpenFpsDeepLink,
} from "@/lib/fps";
import { formatMoney } from "@/lib/i18n/translations";

type FpsDetailsProps = {
  amountHkd: number;
};

type FpsMethod = "proxy" | "amount" | "qr";
type ToastKind = "id" | "amount" | "fail" | null;

/**
 * FPS receiving panel with HK-bank-style transfer method selection.
 * Rendered under checkout PaymentMethods when the guest selects FPS.
 */
export function FpsDetails({ amountHkd }: FpsDetailsProps) {
  const { locale, t } = useI18n();
  const dialogTitleId = useId();
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [method, setMethod] = useState<FpsMethod>("proxy");
  const [toast, setToast] = useState<ToastKind>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [savingQr, setSavingQr] = useState(false);
  const [showDeepLink, setShowDeepLink] = useState(false);

  const displayId = formatFpsDisplayId(FPS_ID);
  const copyId = getFpsIdForCopy(FPS_ID);
  const copyAmount = formatFpsAmountForCopy(amountHkd);
  const displayAmount = formatMoney(amountHkd, locale);

  useEffect(() => {
    setShowDeepLink(Boolean(FPS_DEEP_LINK) && isLikelyMobileClient());
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!qrOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setQrOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [qrOpen]);

  const showToast = (kind: Exclude<ToastKind, null>) => {
    setToast(kind);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const handleCopy = async (value: string, kind: "id" | "amount") => {
    const ok = await copyToClipboard(value);
    showToast(ok ? kind : "fail");
  };

  const handleSelectMethod = (next: FpsMethod) => {
    setMethod(next);
    if (next === "qr") {
      // Keep QR inline by default; customers can enlarge when ready.
      setToast(null);
    }
  };

  const handleOpenBankApp = () => {
    void handleCopy(copyId, "id");
    tryOpenFpsDeepLink(FPS_DEEP_LINK);
  };

  const handleSaveQr = async () => {
    setSavingQr(true);
    try {
      const res = await fetch(FPS_QR_SRC);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const ext =
        blob.type.includes("png")
          ? "png"
          : blob.type.includes("jpeg") || blob.type.includes("jpg")
            ? "jpg"
            : blob.type.includes("webp")
              ? "webp"
              : "svg";
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `mofu-haven-fps-qr.${ext}`;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.alert(t("fpsQrSaveFailed"));
    } finally {
      setSavingQr(false);
    }
  };

  const toastMessage =
    toast === "id"
      ? t("fpsCopiedId")
      : toast === "amount"
        ? t("fpsCopiedAmount")
        : toast === "fail"
          ? t("fpsCopyFailed")
          : null;

  const methods: {
    id: FpsMethod;
    title: string;
    hint: string;
  }[] = [
    {
      id: "proxy",
      title: t("fpsMethodProxy"),
      hint: t("fpsMethodProxyHint"),
    },
    {
      id: "amount",
      title: t("fpsMethodAmount"),
      hint: t("fpsMethodAmountHint"),
    },
    {
      id: "qr",
      title: t("fpsMethodQr"),
      hint: t("fpsMethodQrHint"),
    },
  ];

  return (
    <div
      className="relative space-y-4 rounded-2xl border border-[color:var(--line)] bg-[color:var(--accent-soft)]/40 p-4"
      data-fps-panel="checkout-only"
    >
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- local official FPS mark asset */}
        <img
          src="/fps-logo.svg"
          alt="Faster Payment System (FPS) 轉數快 Logo"
          className="mt-0.5 h-10 w-auto shrink-0"
          decoding="async"
        />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[color:var(--ink)]">
            {t("fpsPanelTitle")}
          </h3>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            {t("fpsPanelHint")}
          </p>
        </div>
      </div>

      <fieldset className="space-y-2 border-0 p-0">
        <legend className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[color:var(--muted)]">
          {t("fpsMethodSelectTitle")}
        </legend>

        <ul className="space-y-2" role="list">
          {methods.map(({ id, title, hint }) => {
            const active = method === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => handleSelectMethod(id)}
                  aria-pressed={active}
                  className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] ${
                    active
                      ? "border-[color:var(--accent)] bg-white shadow-[0_6px_16px_-10px_rgba(169,124,80,0.55)]"
                      : "border-[color:var(--line)] bg-white/70 hover:border-[color:var(--accent)]/50 hover:bg-white"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
                      active
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)]"
                        : "border-[color:var(--line)] bg-transparent"
                    }`}
                    aria-hidden="true"
                  >
                    {active ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-snug text-[color:var(--ink)]">
                      {title}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-[color:var(--muted)]">
                      {hint}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="rounded-xl border border-[color:var(--line)] bg-white/90 p-3.5">
        {method === "proxy" ? (
          <CopyActionPanel
            label={t("fpsIdLabel")}
            value={displayId}
            accountName={FPS_ACCOUNT_NAME}
            accountLabel={t("fpsAccountLabel")}
            copyLabel={toast === "id" ? t("fpsCopyAgain") : t("fpsCopy")}
            copied={toast === "id"}
            copiedLabel={t("fpsCopied")}
            onCopy={() => void handleCopy(copyId, "id")}
          />
        ) : null}

        {method === "amount" ? (
          <CopyActionPanel
            label={t("fpsAmountLabel")}
            value={displayAmount}
            accountName={FPS_ACCOUNT_NAME}
            accountLabel={t("fpsAccountLabel")}
            copyLabel={toast === "amount" ? t("fpsCopyAgain") : t("fpsCopy")}
            copied={toast === "amount"}
            copiedLabel={t("fpsCopied")}
            emphasizeValue
            onCopy={() => void handleCopy(copyAmount, "amount")}
          />
        ) : null}

        {method === "qr" ? (
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-xl bg-white p-2 ring-1 ring-[color:var(--line)] transition hover:ring-[color:var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] active:scale-[0.99]"
              aria-label={t("fpsQrEnlarge")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local SVG / shop QR asset */}
              <img
                src={FPS_QR_SRC}
                alt={t("fpsQrAlt")}
                className="h-full w-full object-contain"
              />
            </button>
            <p className="text-center text-[11px] leading-relaxed text-[color:var(--muted)]">
              {t("fpsQrHint")}
            </p>
            <div className="grid w-full gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setQrOpen(true)}
                className="rounded-xl border border-[color:var(--line)] bg-[color:var(--accent-soft)]/50 px-4 py-2.5 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--accent-soft)]"
              >
                {t("fpsQrEnlarge")}
              </button>
              <button
                type="button"
                onClick={() => void handleSaveQr()}
                disabled={savingQr}
                className="rounded-xl bg-[color:var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--hero-deep)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {t("fpsQrSave")}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {showDeepLink ? (
        <button
          type="button"
          onClick={handleOpenBankApp}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-[color:var(--accent)]/55 bg-white/70 px-3.5 py-3 text-left transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] active:scale-[0.99]"
        >
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[color:var(--ink)]">
              {t("fpsOpenBankApp")}
            </span>
            <span className="mt-0.5 block text-[11px] text-[color:var(--muted)]">
              {t("fpsOpenBankAppHint")}
            </span>
          </span>
          <span aria-hidden="true" className="text-lg text-[color:var(--accent)]">
            ›
          </span>
        </button>
      ) : null}

      {toastMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute inset-x-3 bottom-3 z-10 rounded-xl bg-[color:var(--hero-deep)] px-3 py-2 text-center text-xs font-medium text-white shadow-[0_10px_24px_-12px_rgba(92,58,34,0.7)] animate-[fadeUp_0.25s_ease]"
        >
          {toastMessage}
        </div>
      ) : null}

      {qrOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[color:var(--hero-deep)]/45 p-4 sm:items-center"
          role="presentation"
          onClick={() => setQrOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            className="w-full max-w-sm rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-[0_24px_48px_-24px_rgba(74,54,38,0.55)] animate-[fadeUp_0.28s_ease]"
            onClick={(event) => event.stopPropagation()}
          >
            <h4
              id={dialogTitleId}
              className="text-center text-sm font-semibold text-[color:var(--ink)]"
            >
              {t("fpsQrViewTitle")}
            </h4>
            <div className="mx-auto mt-4 flex h-60 w-60 items-center justify-center overflow-hidden rounded-xl bg-white p-3 ring-1 ring-[color:var(--line)]">
              {/* eslint-disable-next-line @next/next/no-img-element -- local SVG / shop QR asset */}
              <img
                src={FPS_QR_SRC}
                alt={t("fpsQrAlt")}
                className="h-full w-full object-contain"
              />
            </div>
            <p className="mt-3 text-center text-xs text-[color:var(--muted)]">
              {displayAmount} · {displayId}
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void handleSaveQr()}
                disabled={savingQr}
                className="rounded-xl bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--hero-deep)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {t("fpsQrSave")}
              </button>
              <button
                type="button"
                onClick={() => setQrOpen(false)}
                className="rounded-xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--accent-soft)]/60"
              >
                {t("fpsQrClose")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CopyActionPanel({
  label,
  value,
  accountLabel,
  accountName,
  copyLabel,
  copied,
  copiedLabel,
  emphasizeValue = false,
  onCopy,
}: {
  label: string;
  value: string;
  accountLabel: string;
  accountName: string;
  copyLabel: string;
  copied: boolean;
  copiedLabel: string;
  emphasizeValue?: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-xs text-[color:var(--muted)]">{label}</p>
        <button
          type="button"
          onClick={onCopy}
          className={`block w-full rounded-lg px-1 py-0.5 text-left tabular-nums transition hover:bg-[color:var(--accent-soft)]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] ${
            emphasizeValue
              ? "text-2xl font-semibold tracking-tight text-[color:var(--ink)]"
              : "text-xl font-semibold tracking-wide text-[color:var(--ink)]"
          }`}
          aria-label={`${copyLabel} ${label}`}
        >
          {value}
        </button>
        <p className="text-[11px] text-[color:var(--muted)]">
          {accountLabel}：{accountName}
        </p>
      </div>

      <button
        type="button"
        onClick={onCopy}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] active:scale-[0.99] ${
          copied
            ? "bg-emerald-100 text-emerald-800"
            : "bg-[color:var(--accent)] text-white hover:bg-[color:var(--hero-deep)]"
        }`}
      >
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}
