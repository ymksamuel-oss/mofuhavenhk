"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { isStorefrontReadyProduct, productHref, type Product } from "@/lib/products";

type ParadeTrackProps = {
  products: Product[];
  label: string;
};

const CAT_PICKS = [
  "4976064013897", // 黃鰭金槍魚柴魚薄片
  "4976064024725", // 貓用無鹽小魚乾
  "4976064024893", // 天然黑鮪魚肉碎
  "4976064024251", // 無添加純雞肉花撒粉
];

const DOG_PICKS = [
  "4976064026545", // 北海道蝦夷鹿原肉乾
  "4976064025623", // 低敏純馬肉能量棒
  "4976064026446", // 天然牛大筋特長大條
  "4976064025333", // 天然原隻牛蹄
  "4976064026392", // 鯊魚軟骨排
];

function productSku(product: Product): string {
  return String(product.mofuSku ?? product.metadata?.mofu_sku ?? product.tags?.find((tag) => /^\d{8,14}$/.test(tag)) ?? "").trim();
}

function ParadeTrack({ products, label }: ParadeTrackProps) {
  const duplicated = [...products, ...products];
  return (
    <div className="overflow-hidden" aria-label={label}>
      <div className="marquee-track animate-marquee flex w-max gap-3 py-1 hover:[animation-play-state:paused] active:[animation-play-state:paused]">
        {duplicated.map((product, index) => {
          const name = product.name.zh || product.name.en;
          return (
            <Link
              key={`${product.id}-${index}`}
              href={productHref(product.id)}
              className="group flex w-44 shrink-0 items-center gap-3 rounded-2xl border border-stone-100 bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-md active:[animation-play-state:paused] sm:w-52"
              aria-label={`查看商品：${name}`}
            >
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white sm:h-20 sm:w-20">
                <ProductImage src={product.images?.[0] ?? product.image} alt={name} sizes="80px" className="object-contain p-1 transition-transform duration-300 group-hover:scale-105" />
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 text-xs font-medium leading-5 text-stone-700">{name}</span>
                <span className="mt-1 block text-sm font-bold tabular-nums text-[#111111]">{formatMoney(product.price, "zh")}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function HomePetParade({ products }: { products: Product[] }) {
  const { locale } = useI18n();
  const { cats, dogs } = useMemo(() => {
    const bySku = new Map(products.filter(isStorefrontReadyProduct).map((product) => [productSku(product), product]));
    return {
      cats: CAT_PICKS.flatMap((sku) => {
        const product = bySku.get(sku);
        return product ? [product] : [];
      }),
      dogs: DOG_PICKS.flatMap((sku) => {
        const product = bySku.get(sku);
        return product ? [product] : [];
      }),
    };
  }, [products]);

  if (!cats.length && !dogs.length) return null;
  const catTrack = cats.length ? cats : dogs;
  const dogTrack = dogs.length ? dogs : cats;

  return (
    <section className="overflow-hidden bg-white px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="pet-parade-title">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">PET PARADE</p>
          <h2 id="pet-parade-title" className="mt-1 text-2xl font-bold text-[#111111] sm:text-3xl">好物持續流動中</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-stone-500">{locale === "en" ? "Curated cat and dog favourites, gently moving left for you to discover." : "精選貓咪與狗狗好物，向左輕輕流動，隨時點擊發現心水選擇。"}</p>
        </div>
        <div className="space-y-3">
          <ParadeTrack products={catTrack} label="貓咪精選商品" />
          <ParadeTrack products={dogTrack} label="狗狗精選商品" />
        </div>
      </div>
    </section>
  );
}
