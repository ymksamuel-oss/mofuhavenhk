"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

function canUseInAppBack(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const referrer = document.referrer;
    if (!referrer) return false;
    return new URL(referrer).origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Mobile-first flow chrome:
 * - Top: reliable back control (Link + same-origin history.back)
 * - Bottom: continue-shopping CTA with safe-area padding (no back-to-top)
 */
export function ShopFlowNav({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const isCategoryPage = pathname.startsWith("/categories/");
  const isProductPage = pathname.startsWith("/product/");
  const isPictureBookPage =
    pathname === "/about-dog" ||
    pathname === "/about-cat" ||
    pathname === "/cat-breeds" ||
    pathname.startsWith("/cat-breeds/");
  const showBottomContinue =
    pathname === "/checkout" || isHome || isCategoryPage || isProductPage;

  return (
    <>
      {!isHome ? (
        <div
          className={`relative z-20 border-b border-[color:var(--line)] ${
            isPictureBookPage
              ? "bg-[#FBF9F6]"
              : "bg-[color:var(--background)]/95"
          }`}
        >
          <div className="mx-auto flex w-full max-w-5xl items-center px-3 py-2 sm:px-6">
            <Link
              href="/menu"
              className="relative z-20 inline-flex min-h-11 touch-manipulation items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[color:var(--ink)] transition hover:bg-[color:var(--accent-soft)] active:scale-[0.99]"
              onClick={(event) => {
                if (!canUseInAppBack()) {
                  // Default Link → /menu (always works)
                  return;
                }
                event.preventDefault();
                const startPath = window.location.pathname;
                router.back();
                window.setTimeout(() => {
                  if (window.location.pathname === startPath) {
                    router.push("/menu");
                  }
                }, 280);
              }}
            >
              <BackChevron className="pointer-events-none h-5 w-5 shrink-0 text-[color:var(--accent)]" />
              <span className="pointer-events-none">{t("navBack")}</span>
            </Link>
          </div>
        </div>
      ) : null}

      <div className="w-full max-w-[100vw] overflow-x-clip">{children}</div>

      {showBottomContinue ? (
        <div className="relative z-20 mx-auto w-full max-w-5xl px-4 pt-3 sm:px-6 site-bottom-pad">
          <ContinueShoppingButton variant="soft" className="w-full sm:w-full" />
        </div>
      ) : (
        <div className="site-bottom-pad" aria-hidden="true" />
      )}
    </>
  );
}
