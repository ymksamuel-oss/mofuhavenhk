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

type ProductPick = { sku: string; zh: string; en: string };

const DOG_PICKS: readonly ProductPick[] = [
  { sku: "4976064026545", zh: "北海道蝦夷鹿原肉乾", en: "Hokkaido venison jerky" },
  { sku: "4976064025623", zh: "低敏純馬肉能量棒", en: "Hypoallergenic horse-meat bar" },
  { sku: "4976064026446", zh: "特長牛大筋耐咬棒", en: "Extra-long beef tendon" },
  { sku: "4976064025333", zh: "天然原隻牛蹄", en: "Whole natural beef hoof" },
  { sku: "4976064026392", zh: "鯊魚皮潔齒皮棒", en: "Shark-skin dental chew" },
  { sku: "4976064025470", zh: "天然鯊魚軟骨排", en: "Shark cartilage chew" },
  { sku: "4976064026750", zh: "京丹波野生鹿肉片", en: "Kyoto venison slices" },
  { sku: "4976064026552", zh: "厚切純馬肉條", en: "Thick-cut horse-meat strips" },
  { sku: "4976064026415", zh: "豬喉軟骨潔齒圈", en: "Pork cartilage dental ring" },
  { sku: "4976064025081", zh: "北海道鹿肉一口粒", en: "Venison bite cubes" },
];

const CAT_PICKS: readonly ProductPick[] = [
  { sku: "4976064013897", zh: "黃鰭金槍魚柴魚薄片", en: "Yellowfin tuna flakes" },
  { sku: "4976064024725", zh: "貓用無鹽小魚乾", en: "Unsalted dried fish" },
  { sku: "4976064024688", zh: "低鈉鰹魚柴魚花", en: "Low-sodium bonito flakes" },
  { sku: "4976064024336", zh: "純雞里肌拌糧碎", en: "Chicken tenderloin topper" },
  { sku: "4976064025500", zh: "純雞里肌細切條", en: "Chicken tenderloin strips" },
  { sku: "4976064015747", zh: "純雞肉薄削花", en: "Chicken floss flakes" },
  { sku: "4976064024718", zh: "雞里肌細切條 Mini", en: "Mini chicken strips" },
  { sku: "4976064024893", zh: "天然金槍魚肉碎", en: "Natural tuna topper" },
];

// Interleave the two homepage rows so the shared odd/even splitter produces
// exactly five products on each track rather than stacking dog and cat groups.
const HOME_PICKS: readonly ProductPick[] = DOG_PICKS.slice(0, 5).flatMap((pick, index) => [pick, DOG_PICKS[index + 5]]);

const COPY: Record<Exclude<PetParadeKind, "home">, { eyebrow: { zh: string; en: string }; title: { zh: string; en: string }; sub: { zh: string; en: string } }> = {
  dogs: {
    eyebrow: { zh: "狗狗好物漫步", en: "DOGS · PET PARADE" },
    title: { zh: "狗狗好物精選", en: "Dog essentials" },
    sub: { zh: "精選狗狗天然原肉與耐咬好物，短名稱顯示，手機瀏覽不怕截斷。", en: "Natural meat treats and long-lasting chews with short, easy-to-scan names." },
  },
  cats: {
    eyebrow: { zh: "貓咪美味漫步", en: "CATS · PET PARADE" },
    title: { zh: "貓咪好物精選", en: "Cat essentials" },
    sub: { zh: "八款貓咪小食，兩排各四款，方便手機逐格瀏覽。", en: "Eight cat favourites in two rows of four for easy mobile browsing." },
  },
  "value-bundles": {
    eyebrow: { zh: "湊單好物漫步", en: "ADD-ON · PET PARADE" },
    title: { zh: "滿額免運好物", en: "Add-on favourites" },
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
  const fromPicks = (picks: readonly ProductPick[]) => picks.flatMap((pick) => {
    const product = bySku.get(pick.sku);
    return product ? [product] : [];
  });
  if (kind === "cats") return fromPicks(CAT_PICKS);
  if (kind === "dogs") return fromPicks(DOG_PICKS);
  if (kind === "value-bundles") {
    const bundleCollection = getCollection("value-bundles");
    const bundleIds = new Set(bundleCollection ? getCollectionProducts(available, bundleCollection).map((product) => product.id) : []);
    return uniqueProducts(available.filter((product) => !bundleIds.has(product.id) && product.price >= 50 && product.price <= 70).sort((left, right) => left.price - right.price)).slice(0, 8);
  }
  return uniqueProducts([...fromPicks(CAT_PICKS), ...fromPicks(DOG_PICKS)]);
}

function ProductGroup({ picks, products, title, label, locale }: { picks: readonly ProductPick[]; products: Product[]; title: string; label: string; locale: Locale }) {
  const bySku = new Map(products.filter(isStorefrontReadyProduct).map((product) => [productSku(product), product]));
  const items = picks.flatMap((pick) => {
    const product = bySku.get(pick.sku);
    return product ? [{ pick, product }] : [];
  });
  const isZh = locale === "zh";
  const row1 = items.filter((_, index) => index % 2 === 0);
  const row2 = items.filter((_, index) => index % 2 === 1);
  if (!items.length) return null;

  return (
    <div aria-label={label}>
      <div className="mb-4 flex items-end justify-between gap-3">
        <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#2D2926] sm:text-2xl">{title}</h3>
        <span className="text-xs font-medium text-stone-500">{items.length} {isZh ? "款" : "items"}</span>
      </div>
      <div className="space-y-3">
        <ProductMarqueeTrack items={row1.length ? row1 : items} locale={locale} />
        <ProductMarqueeTrack items={row2.length ? row2 : items} locale={locale} extraClass="pl-10" />
      </div>
    </div>
  );
}

function ProductMarqueeTrack({ items, locale, extraClass = "" }: { items: Array<{ pick: ProductPick; product: Product }>; locale: Locale; extraClass?: string }) {
  const loopItems = [...items, ...items, ...items];
  const isZh = locale === "zh";
  return <div className={`flex overflow-hidden ${extraClass}`}>
    <div className="marquee-track animate-marquee flex w-max shrink-0 gap-3 py-1 hover:[animation-play-state:paused] active:[animation-play-state:paused]">
      {loopItems.map(({ pick, product }, index) => {
        const name = isZh ? pick.zh : pick.en;
        return <Link key={`${product.id}-${index}`} href={productHref(product.id)} className="group flex w-[230px] shrink-0 items-center gap-3 rounded-2xl border border-stone-100/80 bg-white p-2.5 pr-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md sm:w-[250px]" aria-label={`${isZh ? "查看商品" : "View product"}：${name}`}>
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-50 p-1 sm:h-16 sm:w-16"><ProductImage src={product.images?.[0] ?? product.image} alt={name} sizes="64px" className="object-contain" /></span>
          <span className="min-w-0"><span className="block truncate text-xs font-semibold text-stone-800">{name}</span><span className="mt-1 block text-sm font-bold tabular-nums text-stone-900">{formatMoney(product.price, locale)}</span></span>
        </Link>;
      })}
    </div>
  </div>;
}

export function PetParadeSection({ products, kind }: { products: Product[]; kind: PetParadeKind }) {
  const { locale, t } = useI18n();
  const selected = useMemo(() => selectParadeProducts(products, kind), [kind, products]);
  const copy = kind === "home" ? null : COPY[kind];
  if (!selected.length && kind !== "home") return null;
  const eyebrow = copy ? (locale === "en" ? copy.eyebrow.en : copy.eyebrow.zh) : t("homeMarqueeEyebrow");
  const title = copy ? (locale === "en" ? copy.title.en : copy.title.zh) : t("homeMarqueeTitle");
  const sub = copy ? (locale === "en" ? copy.sub.en : copy.sub.zh) : t("homeMarqueeSub");
  const selectedPicks = kind === "value-bundles"
    ? selected.map((product) => ({ sku: productSku(product), zh: sanitizeProductTitle(product.name.zh, "zh", productSku(product)), en: sanitizeProductTitle(product.name.en || product.name.zh, "en", productSku(product)) }))
    : [];

  return (
    <section className="overflow-hidden bg-white px-4 py-12 sm:px-6 sm:py-16" aria-labelledby={`pet-parade-${kind}-title`}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center sm:mb-10"><p className="text-xs font-semibold uppercase tracking-widest text-stone-500">{eyebrow}</p><h2 id={`pet-parade-${kind}-title`} className="mt-1 text-2xl font-bold text-[#111111] sm:text-3xl">{title}</h2><p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-stone-500">{sub}</p></div>
        <ProductGroup
          picks={kind === "home" ? HOME_PICKS : kind === "dogs" ? DOG_PICKS : kind === "cats" ? CAT_PICKS : selectedPicks}
          products={products}
          title={kind === "home" ? (locale === "zh" ? "🐾 好物漫步" : "🐾 Pet favourites") : title}
          label={kind === "home" ? (locale === "zh" ? "十款精選好物雙軌" : "Ten featured products in two tracks") : title}
          locale={locale}
        />
      </div>
    </section>
  );
}

export function HomePetParade({ products }: { products: Product[] }) {
  return <PetParadeSection products={products} kind="home" />;
}
