"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { useWishlist } from "@/lib/shop/wishlist";

type WishlistHeartButtonProps = {
  productId: string;
  className?: string;
};

function HeartIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M12 21s-6.2-4.35-9.05-8.2C1.1 10.35 1.35 6.9 3.8 5.05 6.05 3.35 8.9 3.9 12 6.55c3.1-2.65 5.95-3.2 8.2-1.5 2.45 1.85 2.7 5.3.85 7.75C18.2 16.65 12 21 12 21z"
          fill="#c0483a"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 21s-6.2-4.35-9.05-8.2C1.1 10.35 1.35 6.9 3.8 5.05 6.05 3.35 8.9 3.9 12 6.55c3.1-2.65 5.95-3.2 8.2-1.5 2.45 1.85 2.7 5.3.85 7.75C18.2 16.65 12 21 12 21z"
        fill="none"
        stroke="#8a7360"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Overlay heart for product cards — toggles 「我的收藏」 (localStorage).
 */
export function WishlistHeartButton({
  productId,
  className = "",
}: WishlistHeartButtonProps) {
  const { t } = useI18n();
  const { has, toggle } = useWishlist();
  const saved = has(productId);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(productId);
      }}
      aria-pressed={saved}
      aria-label={saved ? t("wishlistRemove") : t("wishlistAdd")}
      title={saved ? t("wishlistRemove") : t("wishlistAdd")}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-[color:var(--line)] backdrop-blur-sm transition hover:scale-105 hover:bg-white active:scale-95 ${
        saved ? "text-[#c0483a]" : "text-[color:var(--muted)]"
      } ${className}`}
    >
      <HeartIcon filled={saved} />
    </button>
  );
}
