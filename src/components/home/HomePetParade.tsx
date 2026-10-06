"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney, type Locale } from "@/lib/i18n/translations";
import { getCollection, getCollectionProducts } from "@/lib/collections";
import { isStorefrontReadyProduct, productHref, type Product } from "@/lib/products";
import { sanitizeProductTitle } from "@/lib/product-title";

export type PetParadeKind = "home" | "dogs" | "cats" | "value-bundles";

type ParadeTrackProps = {
  products: Product[];
  label: string;
  locale: Locale;
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

const COPY: Record<Exclude<PetParadeKind, "home">, { eyebrow: { zh: string; en: string }; title: { zh: string; en: string }; sub: { zh: string; en: string } }> = {
  dogs: {
    eyebrow: { zh: "狗狗好物漫步", en: "DOGS · PET PARADE" },
    title: { zh: "好物持續流動中", en: "Good things keep moving" },
    sub: { zh: "精選狗狗天然原肉與耐咬好物，向左輕輕流動，隨時點擊發現心水選擇。", en: "Natural meat treats and long-lasting chews for dogs, gently gliding left for easy discovery." },
  },
  cats: {
    eyebrow: { zh: "貓咪美味漫步", en: "CATS · PET PARADE" },
    title: { zh: "鮮味持續流動中", en: "Fresh flavour keeps moving" },
    sub: { zh: "精選挑嘴貓咪喜愛的無鹽魚乾、金槍魚薄片與凍乾，隨時點擊選購。", en: "Salt-free fish, tuna flakes and freeze-dried favourites for discerning cats, ready to discover." },
  },
  "value-bundles": {
    eyebrow: { zh: "湊單好物漫步", en: "ADD-ON · PET PARADE" },
    title: { zh: "滿額免運好物流動中", en: "Add-on favourites keep moving" },
    sub: { zh: "全店滿 HK$399 享順豐免運，精選超值好物任你隨心湊單。", en: "Build your basket with popular add-ons and enjoy free SF shipping on orders over HK$399." },
  },
};

function productSku(product: Product): string {
  return String(product.mofuSku ?? product.metadata?.mofu_sku ?? product.tags?.find((tag) => /^\d{8,14}$/.test(tag)) ?? "").trim();
}

function uniqueProducts(products: Product[]): Product[] {
  return Array.from(new Map(products.map((product) => [product.id, product])).values());
}

function selectParadeProducts(products: Product[], kind: PetParadeKind): Product[] {
  const available = products.filter((product) => product.inStock !== false && isStorefrontReadyProduct(product));
  const bySku = new Map(available.map((product) => [productSku(product), product]));
  const fromSkus = (skus: string[]) => skus.flatMap((sku) => {
    const product = bySku.get(sku);
    return product ? [product] : [];
  });

  if (kind === "cats") return fromSkus(CAT_PICKS);
  if (kind === "dogs") return fromSkus(DOG_PICKS);
  if (kind === "value-bundles") {
    const bundleCollection = getCollection("value-bundles");
    const bundleIds = new Set(bundleCollection ? getCollectionProducts(available, bundleCollection).map((product) => product.id) : []);
    const addOns = available
      .filter((product) => !bundleIds.has(product.id) && product.price >= 50 && product.price <= 70)
      .sort((left, right) => left.price - right.price);
    return uniqueProducts(addOns).slice(0, 8);
  }
  return uniqueProducts([...fromSkus(CAT_PICKS), ...fromSkus(DOG_PICKS)]);
}

function ParadeTrack({ products, label, locale }: ParadeTrackProps) {
  const duplicated = [...products, ...products];
  return (
    <div className="overflow-hidden" aria-label={label}>
      <div className="marquee-track animate-marquee flex w-max gap-3 py-1 hover:[animation-play-state:paused] active:[animation-play-state:paused]">
        {duplicated.map((product, index) => {
          const name = sanitizeProductTitle(locale === "en" ? (product.name.en || product.name.zh) : (product.name.zh || product.name.en), locale === "en" ? "en" : "zh", productSku(product));
          return (
            <Link
              key={`${product.id}-${index}`}
              href={productHref(product.id)}
              className="group flex w-44 shrink-0 items-center gap-3 rounded-2xl border border-stone-100 bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-md active:[animation-play-state:paused] sm:w-52"
              aria-label={locale === "en" ? `View product: ${name}` : `查看商品：${name}`}
            >
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white sm:h-20 sm:w-20">
                <ProductImage src={product.images?.[0] ?? product.image} alt={name} sizes="80px" className="object-contain p-1 transition-transform duration-300 group-hover:scale-105" />
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 text-xs font-medium leading-5 text-stone-700">{name}</span>
                <span className="mt-1 block text-sm font-bold tabular-nums text-[#111111]">{formatMoney(product.price, locale)}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function PetParadeSection({ products, kind }: { products: Product[]; kind: PetParadeKind }) {
  const { locale, t } = useI18n();
  const selected = useMemo(() => selectParadeProducts(products, kind), [kind, products]);
  if (!selected.length) return null;

  const catTrack = kind === "cats" ? selected : kind === "dogs" ? selected : selected.filter((product) => CAT_PICKS.includes(productSku(product)));
  const dogTrack = kind === "dogs" ? selected : kind === "cats" ? selected : selected.filter((product) => DOG_PICKS.includes(productSku(product)));
  const firstTrack = catTrack.length ? catTrack : selected;
  const secondTrack = dogTrack.length ? dogTrack : selected;
  const copy = kind === "home" ? null : COPY[kind];
  const eyebrow = copy ? (locale === "en" ? copy.eyebrow.en : copy.eyebrow.zh) : t("homeMarqueeEyebrow");
  const title = copy ? (locale === "en" ? copy.title.en : copy.title.zh) : t("homeMarqueeTitle");
  const sub = copy ? (locale === "en" ? copy.sub.en : copy.sub.zh) : t("homeMarqueeSub");

  return (
    <section className="overflow-hidden bg-white px-4 py-12 sm:px-6 sm:py-16" aria-labelledby={`pet-parade-${kind}-title`}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">{eyebrow}</p>
          <h2 id={`pet-parade-${kind}-title`} className="mt-1 text-2xl font-bold text-[#111111] sm:text-3xl">{title}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-stone-500">{sub}</p>
        </div>
        <div className="space-y-3">
          <ParadeTrack products={firstTrack} label={locale === "en" ? `${title} first row` : `${title} 第一排`} locale={locale} />
          <ParadeTrack products={secondTrack} label={locale === "en" ? `${title} second row` : `${title} 第二排`} locale={locale} />
        </div>
      </div>
    </section>
  );
}

export function HomePetParade({ products }: { products: Product[] }) {
  return <PetParadeSection products={products} kind="home" />;
}
