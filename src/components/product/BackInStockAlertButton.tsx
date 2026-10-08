"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  normalizeBackInStockContact,
  type BackInStockContactKind,
} from "@/lib/back-in-stock";

type BackInStockAlertButtonProps = {
  productId: string;
};

type SubmitState = "idle" | "error" | "success";

export function BackInStockAlertButton({ productId }: BackInStockAlertButtonProps) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<BackInStockContactKind>("email");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, submitting]);

  const close = () => {
    if (submitting) return;
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consent || submitting) return;
    const normalizedContact = normalizeBackInStockContact(kind, contact);
    if (!normalizedContact) {
      setSubmitState("error");
      return;
    }

    setSubmitting(true);
    setSubmitState("idle");
    try {
      const response = await fetch("/api/back-in-stock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId,
          contactKind: kind,
          contact: normalizedContact,
          consent: true,
          website,
          locale: locale === "en" ? "en" : "zh",
        }),
      });
      if (!response.ok) throw new Error("request_failed");
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setSubmitState("idle");
          setOpen(true);
        }}
        className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#111111] px-4 py-3 text-sm font-bold text-white transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
      >
        {t("backInStockButtonLabel")}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="back-in-stock-title"
            aria-describedby="back-in-stock-description"
            className="max-h-[min(90dvh,42rem)] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom,1rem))] shadow-2xl sm:rounded-3xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="back-in-stock-title" className="text-xl font-bold text-stone-900">
                  {t("backInStockModalTitle")}
                </h2>
                <p id="back-in-stock-description" className="mt-2 text-sm leading-6 text-stone-600">
                  {t("backInStockModalDescription")}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={submitting}
                aria-label={t("backInStockClose")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-200 text-xl text-stone-700 disabled:opacity-60"
              >
                ×
              </button>
            </div>

            {submitState === "success" ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4" role="status">
                <p className="text-sm font-semibold leading-6 text-emerald-900">
                  {t("backInStockSuccess")}
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-4 min-h-11 rounded-xl bg-[#111111] px-4 py-2 text-sm font-semibold text-white"
                >
                  {t("backInStockClose")}
                </button>
              </div>
            ) : (
              <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-stone-800">
                    {t("backInStockContactLabel")}
                  </legend>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("backInStockContactLabel")}>
                    {(["email", "whatsapp"] as const).map((option) => {
                      const active = kind === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => {
                            setKind(option);
                            setSubmitState("idle");
                          }}
                          className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold ${active ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-700"}`}
                        >
                          {option === "email" ? t("backInStockChannelEmail") : t("backInStockChannelWhatsApp")}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <label htmlFor="back-in-stock-contact" className="block space-y-1.5">
                  <span className="text-sm font-medium text-stone-800">
                    {kind === "email" ? t("backInStockChannelEmail") : t("backInStockChannelWhatsApp")}
                  </span>
                  <input
                    ref={inputRef}
                    id="back-in-stock-contact"
                    type={kind === "email" ? "email" : "tel"}
                    inputMode={kind === "email" ? "email" : "tel"}
                    autoComplete={kind === "email" ? "email" : "tel"}
                    value={contact}
                    onChange={(event) => {
                      setContact(event.target.value.slice(0, 254));
                      setSubmitState("idle");
                    }}
                    maxLength={254}
                    required
                    placeholder={kind === "email" ? t("backInStockEmailPlaceholder") : t("backInStockWhatsAppPlaceholder")}
                    className="min-h-12 w-full rounded-xl border border-stone-300 px-3.5 py-3 text-base text-stone-900 outline-none focus:border-stone-700 sm:text-sm"
                  />
                </label>

                <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="back-in-stock-website">Website</label>
                  <input
                    id="back-in-stock-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value.slice(0, 200))}
                  />
                </div>

                <label className="flex items-start gap-3 rounded-xl bg-white p-3 text-sm leading-5 text-stone-700">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-stone-900"
                    required
                  />
                  <span>{t("backInStockConsentLabel")}</span>
                </label>

                {submitState === "error" ? (
                  <p className="text-sm font-medium text-red-700" role="alert">
                    {t("backInStockError")}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting || !contact.trim() || !consent}
                  className="min-h-12 w-full rounded-xl bg-[#111111] px-4 py-3 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  {submitting ? t("backInStockSubmitting") : t("backInStockSubmit")}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
