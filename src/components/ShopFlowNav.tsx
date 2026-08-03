"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";

function BackChevron({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14.5 6.5L9 12l5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Mobile-first flow chrome:
 * - Top: clear "back" control under the sticky header
 * - Bottom: prominent continue-shopping CTA above the page end / footer area
 */
export function ShopFlowNav({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const isMenu = pathname === "/menu";
  const showBottomCta = !isMenu;

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/menu");
  };

  return (
    <>
      {!isHome ? (
        <div className="border-b border-[color:var(--line)] bg-[color:var(--surface)]/70">
          <div className="mx-auto flex w-full max-w-5xl items-center px-3 py-2 sm:px-6">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm font-medium text-[color:var(--ink)] transition hover:bg-[color:var(--accent-soft)] active:scale-[0.99]"
            >
              <BackChevron className="h-5 w-5 shrink-0 text-[color:var(--accent)]" />
              <span>{t("navBack")}</span>
            </button>
          </div>
        </div>
      ) : null}

      <div className="w-full max-w-[100vw] overflow-x-clip">{children}</div>

      {showBottomCta ? (
        <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-2 sm:px-6">
          <Link
            href="/menu"
            className="flex w-full max-w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent-soft)] px-4 py-3.5 text-center text-sm font-semibold text-[color:var(--ink)] shadow-[0_10px_24px_-16px_rgba(169,124,80,0.7)] transition hover:border-[color:var(--hero-deep)] hover:bg-[color:var(--accent)] hover:text-white active:scale-[0.99]"
          >
            <BackChevron className="h-5 w-5 shrink-0" />
            <span>{t("navContinueShopping")}</span>
          </Link>
          <p className="mt-2 text-center text-xs text-[color:var(--muted)]">
            {t("navBackToMenu")}
          </p>
        </div>
      ) : null}
    </>
  );
}
