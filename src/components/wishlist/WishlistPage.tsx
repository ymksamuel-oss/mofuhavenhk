"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useWishlist } from "@/lib/shop/wishlist";

export function WishlistPage() {
  const { locale } = useI18n();
  const { getWishlistItems, count, clearWishlist, ready } = useWishlist();
  const items = getWishlistItems();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-[#a36b42]">{locale === "en" ? "YOUR CURATED LIST" : "毛毛港收藏清單"}</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-stone-800 sm:text-4xl">{locale === "en" ? "My Wishlist" : "我的最愛 ❤️"}</h1>
          <p className="mt-2 text-sm text-stone-500">{locale === "en" ? `${count} saved item${count === 1 ? "" : "s"}` : `已收藏 ${count} 件商品`}</p>
        </div>
        {count > 0 ? <button type="button" onClick={clearWishlist} className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-[#b84d3d] hover:text-[#b84d3d]">{locale === "en" ? "Clear all" : "清除全部"}</button> : null}
      </div>
      {!ready ? <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-500">{locale === "en" ? "Loading your wishlist…" : "正在載入我的最愛…"}</div> : items.length > 0 ? <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">{items.map((product) => <ProductCard key={product.id} product={product} showPurchaseControls />)}</div> : <div className="mt-10 rounded-3xl border border-dashed border-[#d9c8b9] bg-[#FAF7F2] px-6 py-16 text-center"><p className="text-4xl" aria-hidden="true">♡</p><h2 className="mt-4 text-lg font-bold text-stone-800">{locale === "en" ? "Your wishlist is empty" : "我的最愛暫時是空的"}</h2><p className="mt-2 text-sm text-stone-500">{locale === "en" ? "Tap the heart on any product to save it here." : "按下商品上的心心，就可以留低方便日後回購。"}</p></div>}
    </main>
  );
}
