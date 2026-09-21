"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Product } from "@/lib/products";

type Shelf = {
  id: string;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  href: string;
  patterns: RegExp[];
  skus?: readonly string[];
};

const SHELVES: readonly Shelf[] = [
  {
    id: "bestsellers",
    title: { zh: "🏆 熱賣排行榜", en: "🏆 Top Sellers" },
    description: { zh: "毛孩總想再來一份的日本人氣好物。", en: "Japanese favourites pets always want another serving of." },
    href: "/collections/dogs",
    patterns: [/\u71b1\u8ce3|\u4eba\u6c23|best.?seller|\u4eba\u6c17|\u63a8\u85a6|featured/i],
  },
  {
    id: "dental",
    title: { zh: "🦷 物理潔齒耐咬專區", en: "🦷 Dental & Chews" },
    description: { zh: "以天然咀嚼支援日常口腔護理，消耗旺盛精力。", en: "Natural chewing support for daily oral care and calmer energy." },
    href: "/collections/dental-chews",
    patterns: [/\u6f54\u9f52|\u6f54\u7259|\u7259\u68d2|\u725b\u8e44|\u725b\u7b4b|\u8010\u54ac|dental|chew|tooth/i],
  },
  {
    id: "meat",
    title: { zh: "🥩 天然原肉與低敏零食", en: "🥩 Pure Meat Treats" },
    description: { zh: "單一肉源、純粹肉香，溫柔照顧挑食與敏感毛孩。", en: "Single-protein treats with clean flavour for sensitive appetites." },
    href: "/collections/horse-meat",
    patterns: [/\u9e7f|\u99ac|\u725b|\u7f8a|\u9bca\u9b5a|\u9e7f\u8089|\u99ac\u8089|beef|venison|horse|shark|meat|jerky/i],
  },
  {
    id: "bundles",
    title: { zh: "🎁 限時超值套裝", en: "🎁 Value Bundles" },
    description: { zh: "一次配齊日常所需，送禮自用都更划算。", en: "Thoughtful Japanese bundles for better value and easy gifting." },
    href: "/collections/value-bundles",
    patterns: [/bundle|value|set|\u5957\u88dd|\u7d44\u5408|\u7279\u60e0/i],
  },
];

function searchableText(product: Product): string {
  return [
    product.name.zh,
    product.name.en,
    product.name.ja,
    product.description?.zh,
    product.description?.en,
    product.categorySlug,
    product.subcategory,
    ...(product.tags ?? []),
    ...Object.values(product.metadata ?? {}),
  ].filter(Boolean).join(" ");
}

function productSku(product: Product): string {
  return String(product.metadata?.mofu_sku ?? product.tags?.find((tag) => /^MOFU-|^\d{8,14}$/.test(tag)) ?? "").trim();
}

function productsForShelf(products: Product[], shelf: Shelf): Product[] {
  if (shelf.skus) {
    const skuSet = new Set(shelf.skus);
    return products.filter((product) => {
      const sku = product.metadata?.mofu_sku?.trim() || product.tags?.find((tag) => /^\d{8,14}$/.test(tag));
      return sku ? skuSet.has(sku) : false;
    });
  }
  const matches = products.filter((product) => {
    const sku = productSku(product);
    const isSeafoodBundle = sku === "MOFU-BUNDLE-SEAFOOD-03" || product.tags?.includes("seafood-bundle");
    if (shelf.id === "dental" && isSeafoodBundle) return false;
    return shelf.patterns.some((pattern) => pattern.test(searchableText(product)));
  });
  return matches.slice(0, 4);
}

export function HomepageFeaturedShowcase({ products }: { products: Product[] }) {
  const { locale } = useI18n();
  const isZh = locale === "zh";
  return (
    <section aria-labelledby="homepage-featured-showcase-title" className="bg-[#fbf7f3] px-5 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-[#f1ded1] px-3 py-1 text-xs font-bold tracking-[0.12em] text-[#a36b42]">{isZh ? "毛毛港精選" : "MOFU HAVEN SELECT"}</span>
            <h2 id="homepage-featured-showcase-title" className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-4xl">{isZh ? "日系主題策展" : "Curated Collections"}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">{isZh ? "按毛孩日常需要，精選日本寵物好物。" : "Browse Japanese pet essentials organised around everyday needs."}</p>
          </div>
        </div>

        <div className="grid gap-6">
          {SHELVES.map((shelf) => {
            const shelfProducts = productsForShelf(products, shelf);
            return (
              <section key={shelf.id} aria-labelledby={`${shelf.id}-title`}>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <h3 id={`${shelf.id}-title`} className="text-xl font-bold text-[color:var(--ink)] sm:text-2xl">{isZh ? shelf.title.zh : shelf.title.en}</h3>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">{isZh ? shelf.description.zh : shelf.description.en}</p>
                  </div>
                  <Link href={shelf.href} className="shrink-0 rounded-full border border-[color:var(--line)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--accent)] transition hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)]">{isZh ? "查看全部 →" : "View all →"}</Link>
                </div>
                {shelfProducts.length > 0 ? (
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
                    {shelfProducts.map((product, index) => <li key={`${shelf.id}-${product.id}`} className="min-w-0">{shelf.id === "bestsellers" && index < 3 ? <span className="mb-1.5 inline-flex rounded-full bg-[#8b573f] px-2 py-1 text-[10px] font-bold text-white shadow-sm">{isZh ? `第 ${index + 1} 名` : `${index + 1}${index === 0 ? "st" : index === 1 ? "nd" : "rd"}`}</span> : null}<ProductCard product={product} priority={index === 0} showPurchaseControls={false} /></li>)}
                  </ul>
                ) : (
                  <p className="rounded-2xl border border-dashed border-[color:var(--line)] bg-white/60 px-4 py-6 text-sm text-[color:var(--muted)]">{isZh ? "商品目錄正在更新，請稍後再來。" : "Our product catalogue is updating. Please check back soon."}</p>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
