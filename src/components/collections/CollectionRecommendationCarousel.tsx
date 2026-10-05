"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Product } from "@/lib/products";

export type CollectionRecommendationKind = "dogs" | "cats" | "value-bundles";

type CollectionRecommendationCarouselProps = {
  kind: CollectionRecommendationKind;
  products: Product[];
};

const COPY: Record<CollectionRecommendationKind, { zh: string; en: string }> = {
  dogs: { zh: "🎁 超值組合・多件更優惠", en: "🎁 Value bundles · Save more together" },
  cats: { zh: "🐟 挑食貓咪最愛・熱銷天然點心", en: "🐟 Picky cats' favourites · Natural bestsellers" },
  "value-bundles": { zh: "🚚 湊單好物推薦・全單滿 HK$399 享順豐免運", en: "🚚 Add-on picks · Free SF shipping over HK$399" },
};

export function CollectionRecommendationCarousel({ kind, products }: CollectionRecommendationCarouselProps) {
  const { locale } = useI18n();
  if (!products.length) return null;

  const title = locale === "en" ? COPY[kind].en : COPY[kind].zh;
  return (
    <section className="mt-10 border-t border-stone-100 pt-8" aria-labelledby={`collection-recommendations-${kind}`}>
      <div className="mb-4">
        <p className="text-[11px] font-bold tracking-[0.16em] text-stone-500">MOFU HAVEN PICKS</p>
        <h2 id={`collection-recommendations-${kind}`} className="mt-1 text-lg font-bold text-stone-900 sm:text-xl">{title}</h2>
      </div>
      <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={title}>
        {products.map((product, index) => (
          <li key={product.id} className="w-[68vw] min-w-[68vw] max-w-[220px] shrink-0 snap-start sm:w-[220px] sm:min-w-[220px] sm:max-w-none">
            <ProductCard product={product} priority={index < 2} showPurchaseControls />
          </li>
        ))}
      </ul>
    </section>
  );
}
