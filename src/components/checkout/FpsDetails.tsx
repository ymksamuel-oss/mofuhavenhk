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

type ToastKind = "id" | "amount" | "fail" | null;

/**
 * FPS receiving details + HK-bank-style shortcuts — only rendered inside
 * checkout PaymentMethods when the guest selects FPS.
 */
export function FpsDetails({ amountHkd }: FpsDetailsProps) {
  const { locale, t } = useI18n();
  const dialogTitleId = useId();
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <div
      className="relative space-y-4 rounded-2xl border border-[color:var(--line)] bg-[color:var(--accent-soft)]/40 p-4"
      data-fps-panel="checkout-only"
    >
      <div>
        <h3 className="text-sm font-semibold text-[color:var(--ink)]">
          {t("fpsPanelTitle")}
        </h3>
        <p className="mt-1 text-xs text-[color:var(--muted)]">{t("fpsPanelHint")}</p>
      </div>

      <div className="space-y-2" aria-label={t("fpsShortcutsTitle")}>
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[color:var(--muted)]">
          {t("fpsShortcutsTitle")}
        </p>

        <ShortcutButton
          title={t("fpsCopyIdAction")}
          hint={t("fpsCopyIdActionHint")}
          value={displayId}
          onClick={() => void handleCopy(copyId, "id")}
        />
        <ShortcutButton
          title={t("fpsCopyAmountAction")}
          hint={t("fpsCopyAmountActionHint")}
          value={displayAmount}
          onClick={() => void handleCopy(copyAmount, "amount")}
        />
        <ShortcutButton
          title={t("fpsQrAction")}
          hint={t("fpsQrActionHint")}
          onClick={() => setQrOpen(true)}
        />

        {showDeepLink ? (
          <ShortcutButton
            title={t("fpsOpenBankApp")}
            hint={t("fpsOpenBankAppHint")}
            onClick={handleOpenBankApp}
            emphasis="soft"
          />
        ) : null}
      </div>

      <dl className="space-y-2 border-t border-[color:var(--line)] pt-3 text-sm">
        <CopyRow
          label={t("fpsIdLabel")}
          value={displayId}
          copyLabel={t("fpsCopy")}
          copiedLabel={t("fpsCopied")}
          justCopied={toast === "id"}
          onCopy={() => void handleCopy(copyId, "id")}
        />
        <div className="flex justify-between gap-3">
          <dt className="text-[color:var(--muted)]">{t("fpsAccountLabel")}</dt>
          <dd className="font-medium text-[color:var(--ink)]">
            {FPS_ACCOUNT_NAME}
          </dd>
        </div>
        <CopyRow
          label={t("fpsAmountLabel")}
          value={displayAmount}
          copyLabel={t("fpsCopy")}
          copiedLabel={t("fpsCopied")}
          justCopied={toast === "amount"}
          emphasize
          onCopy={() => void handleCopy(copyAmount, "amount")}
        />
      </dl>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => setQrOpen(true)}
          className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-xl bg-white p-2 ring-1 ring-[color:var(--line)] transition hover:ring-[color:var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] active:scale-[0.99]"
          aria-label={t("fpsQrAction")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- local SVG / shop QR asset */}
          <img
            src={FPS_QR_SRC}
            alt={t("fpsQrAlt")}
            className="h-full w-full object-contain"
          />
        </button>
        <p className="text-center text-[11px] text-[color:var(--muted)]">
          {t("fpsQrHint")}
        </p>
      </div>

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
            <div className="mx-auto mt-4 flex h-56 w-56 items-center justify-center overflow-hidden rounded-xl bg-white p-3 ring-1 ring-[color:var(--line)]">
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

function ShortcutButton({
  title,
  hint,
  value,
  onClick,
  emphasis = "default",
}: {
  title: string;
  hint: string;
  value?: string;
  onClick: () => void;
  emphasis?: "default" | "soft";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] ${
        emphasis === "soft"
          ? "border-dashed border-[color:var(--accent)]/55 bg-white/70 hover:bg-white"
          : "border-[color:var(--line)] bg-white/85 hover:border-[color:var(--accent)]/55 hover:bg-white"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[color:var(--ink)]">
          {title}
        </span>
        <span className="mt-0.5 block text-[11px] leading-snug text-[color:var(--muted)]">
          {hint}
        </span>
        {value ? (
          <span className="mt-1 block truncate text-xs font-medium tabular-nums text-[color:var(--hero-deep)]">
            {value}
          </span>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className="shrink-0 text-lg leading-none text-[color:var(--accent)]"
      >
        ›
      </span>
    </button>
  );
}

function CopyRow({
  label,
  value,
  copyLabel,
  copiedLabel,
  justCopied,
  emphasize = false,
  onCopy,
}: {
  label: string;
  value: string;
  copyLabel: string;
  copiedLabel: string;
  justCopied: boolean;
  emphasize?: boolean;
  onCopy: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${
        emphasize ? "border-t border-[color:var(--line)] pt-2" : ""
      }`}
    >
      <dt className="text-[color:var(--muted)]">{label}</dt>
      <dd className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onCopy}
          className={`rounded-lg px-1.5 py-0.5 text-right tabular-nums transition hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] ${
            emphasize
              ? "font-semibold text-[color:var(--ink)]"
              : "font-medium text-[color:var(--ink)]"
          }`}
          aria-label={`${copyLabel} ${label}`}
        >
          {value}
        </button>
        <button
          type="button"
          onClick={onCopy}
          className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] ${
            justCopied
              ? "bg-emerald-100 text-emerald-800"
              : "bg-white text-[color:var(--accent)] ring-1 ring-[color:var(--line)] hover:bg-[color:var(--accent-soft)]"
          }`}
        >
          {justCopied ? copiedLabel : copyLabel}
        </button>
      </dd>
    </div>
  );
}
