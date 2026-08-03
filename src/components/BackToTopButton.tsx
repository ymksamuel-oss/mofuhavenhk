"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";

function UpArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 19V5M5.5 11.5 12 5l6.5 6.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Smooth-scroll control shown at the bottom of every page. */
export function BackToTopButton() {
  const { t } = useI18n();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-2 sm:px-6">
      <button
        type="button"
        onClick={scrollToTop}
        className="flex w-full max-w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3.5 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)] active:scale-[0.99]"
      >
        <UpArrow className="h-5 w-5 shrink-0 text-[color:var(--accent)]" />
        <span>{t("backToTop")}</span>
      </button>
    </div>
  );
}
