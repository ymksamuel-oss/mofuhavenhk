"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BackToTopButton } from "@/components/BackToTopButton";
import { ContinueShoppingButton } from "@/components/ContinueShoppingButton";
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
 * - Bottom: continue-shopping CTA on cart/checkout (+ home), then back-to-top
 */
export function ShopFlowNav({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const showBottomContinue = pathname === "/checkout" || isHome;

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

      {showBottomContinue ? (
        <div className="mx-auto w-full max-w-5xl px-4 pb-2 pt-2 sm:px-6">
          <ContinueShoppingButton variant="soft" className="w-full sm:w-full" />
          <p className="mt-2 text-center text-xs text-[color:var(--muted)]">
            {t("navBackToMenu")}
          </p>
        </div>
      ) : null}

      <BackToTopButton />
    </>
  );
}
