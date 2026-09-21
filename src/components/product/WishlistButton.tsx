"use client";

import { useWishlist } from "@/lib/shop/wishlist";

export function WishlistButton({ productId, className = "" }: { productId: string; className?: string }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const active = isWishlisted(productId);

  return (
    <button
      type="button"
      aria-label={active ? "從我的最愛移除" : "加入我的最愛"}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleWishlist(productId);
      }}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/85 text-lg shadow-sm backdrop-blur transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b84d3d] focus-visible:ring-offset-2 active:scale-90 ${active ? "text-[#c0483a]" : "text-stone-500"} ${className}`}
    >
      <span className={active ? "scale-110 transition-transform" : "transition-transform"} aria-hidden="true">{active ? "♥" : "♡"}</span>
    </button>
  );
}
