"use client";

import Image from "next/image";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { useI18n } from "@/lib/i18n/I18nProvider";

/**
 * Single official Best Partner campaign poster.
 * The artwork is intentionally rendered at its native 1194:671 ratio so the
 * Japanese copy and dog portraits are never cropped or stretched on mobile.
 */
export function HomeBannerCarousel() {
  const { t } = useI18n();

  return (
    <section
      aria-label={t("homeBannerAriaLabel")}
      className="mobile-home-soft-surface relative z-0 bg-[color:var(--background)] px-0 py-3 sm:px-6 sm:py-6 lg:px-10 lg:py-8"
    >
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-none border-y border-[#d7b893]/70 bg-[#f7efe4] shadow-[0_22px_52px_-38px_rgba(75,54,33,0.58)] sm:rounded-[1.5rem] sm:border">
        <CategoryNavLink
          href="/categories/dogs"
          aria-label="前往狗狗專區"
          className="group block w-full touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-inset"
        >
          <div className="relative aspect-[1194/671] w-full bg-[#f7efe4]">
            <Image
              src="/images/best-partner-plain-pack-series.png"
              alt="Best Partner PLAIN PACK SERIES：國產、無添加、無着色的狗狗天然食品宣傳海報"
              fill
              priority
              sizes="100vw"
              className="object-contain object-center transition-transform duration-300 ease-out group-hover:scale-[1.01]"
            />
          </div>
        </CategoryNavLink>
      </div>
    </section>
  );
}
