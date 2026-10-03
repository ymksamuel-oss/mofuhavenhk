"use client";

import Link from "next/link";
import { ProductImage } from "@/components/product/ProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { isStorefrontReadyProduct, productHref, type Product } from "@/lib/products";

type CuratedPick = {
  sku: string;
  zh: string;
  en: string;
};

const CURATED_PICKS: readonly CuratedPick[] = [
  { sku: "4976064024442", zh: "純鹿肉鬆拌糧粉", en: "Wild venison floss topper" },
  { sku: "4976064023162", zh: "蒙古馬蹄筋細切條", en: "Mongolian horse-tendon strips" },
  { sku: "4976064013897", zh: "貓用金槍魚薄片", en: "Yellowfin tuna flakes for cats" },
  { sku: "4976064024497", zh: "天然純馬肉脆片", en: "Natural horse-meat crisps" },
  { sku: "4976064023766", zh: "枕崎產鰹魚厚切片", en: "Makurazaki bonito slices" },
  { sku: "4976064025388", zh: "手撕雞里肌肉絲", en: "Hand-pulled chicken shreds" },
  { sku: "4976064025630", zh: "天然馬皮潔齒棒", en: "Natural horse-hide dental sticks" },
  { sku: "4976064025760", zh: "日本國產仔牛肉鬆", en: "Japanese veal floss" },
];

function productSku(product: Product): string {
  return String(
    product.mofuSku ??
      product.metadata?.mofu_sku ??
      product.tags?.find((tag) => /^\d{8,14}$/.test(tag)) ??
      "",
  ).trim();
}

export function HomepageFeaturedShowcase({ products }: { products: Product[] }) {
  const { locale } = useI18n();
  const isZh = locale === "zh";
  const productBySku = new Map(
    products
      .filter((product) => isStorefrontReadyProduct(product) && product.images?.[0])
      .map((product) => [productSku(product), product]),
  );
  const featured = CURATED_PICKS.flatMap((pick) => {
    const product = productBySku.get(pick.sku);
    return product ? [{ ...pick, product }] : [];
  });

  return (
    <section id="curated-picks" aria-labelledby="curated-picks-title" className="bg-[#FAF8F5] px-3 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <p className="inline-flex rounded-full bg-[#f1ded1] px-3 py-1 text-xs font-bold tracking-[0.12em] text-[#a36b42]">
            CURATED PICKS
          </p>
          <h2
            id="curated-picks-title"
            className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[#2D2926] sm:text-4xl"
          >
            {isZh ? "今期店長嚴選" : "This Season’s Shopkeeper Picks"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600 sm:text-base">
            {isZh
              ? "從天然原肉、海味拌糧到耐咬潔齒，精選八款各有特色的日本寵物零食。"
              : "Eight distinctive Japanese treats, from pure meat and seafood toppers to natural dental chews."}
          </p>
        </header>

        {featured.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {featured.map(({ product, zh, en }, index) => {
              const label = isZh ? zh : en;
              return (
                <li key={product.id} className="min-w-0">
                  <Link
                    href={productHref(product.id)}
                    aria-label={`${isZh ? "查看商品" : "View product"}：${label}`}
                    className="group block h-full overflow-hidden rounded-2xl border border-[#ECE5D8] bg-white shadow-[0_14px_32px_-26px_rgba(84,57,45,0.42)] transition-all duration-200 hover:-translate-y-1 hover:border-[#DCCBB8] hover:shadow-[0_24px_40px_-24px_rgba(84,57,45,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86A2B]"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-[#FAF7F2] p-2.5 sm:p-3">
                      <ProductImage
                        src={product.images?.[0] ?? product.image}
                        alt={label}
                        priority={index < 2}
                        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw"
                        className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="min-w-0 px-3 pb-4 pt-3 sm:px-4">
                      <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[#2D2926] sm:text-base">
                        {label}
                      </h3>
                      <p className="mt-2 text-sm font-bold tabular-nums text-[#49372c]">
                        {formatMoney(product.price, locale)}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white/70 px-4 py-8 text-center text-sm text-stone-600">
            {isZh ? "商品目錄正在更新，請稍後再來。" : "Our product catalogue is updating. Please check back soon."}
          </p>
        )}

        <div className="mt-8 text-center sm:mt-10">
          <Link
            href="/menu"
            className="inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded-full bg-[#C86A2B] px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#B25B20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86A2B] focus-visible:ring-offset-2 sm:px-8"
          >
            {isZh
              ? "查看完整商品目錄（全 11 款肉源食材專業篩選）→"
              : "Explore the full catalogue and 11 protein-source filters →"}
          </Link>
        </div>
      </div>
    </section>
  );
}
