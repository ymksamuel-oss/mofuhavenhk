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
  /** Explicit catalog SKU allowlist. Homepage shelves must never infer membership from copy. */
  skus: readonly string[];
};

/**
 * Homepage merchandising is intentionally whitelist-driven. Product names, tags and
 * descriptions are not reliable category boundaries: a bundle can mention every
 * component it contains and would otherwise leak into several shelves.
 */
const SHELVES: readonly Shelf[] = [
  {
    id: "bundles",
    title: { zh: "🎁 限時超值套裝", en: "🎁 Value Bundles" },
    description: { zh: "四款精選套裝，一次配齊日常所需，送禮自用都更划算。", en: "Four curated bundles for easy gifting and better everyday value." },
    href: "/collections/value-bundles",
    skus: [
      "MOFU-BUNDLE-PICKY-01",
      "MOFU-BUNDLE-DENTAL-02",
      "MOFU-BUNDLE-SEAFOOD-03",
      "MOFU-BUNDLE-WALK-04",
    ],
  },
  {
    id: "meat",
    title: { zh: "🥩 天然原肉與低敏零食", en: "🥩 Pure Meat Treats" },
    description: { zh: "單一肉源、純粹肉香，精選日本原肉乾照顧挑食與敏感毛孩。", en: "Single-protein Japanese treats for sensitive appetites." },
    href: "/collections/horse-meat",
    skus: [
      "4976064026545",
      "4976064025623",
      "4976064025791",
      "4976064025210",
    ],
  },
  {
    id: "dental",
    title: { zh: "🦷 物理潔齒・耐咬解悶防拆家專區", en: "🦷 Dental & Chews" },
    description: { zh: "天然耐咬單品，支援日常口腔護理並釋放毛孩旺盛精力。", en: "Natural chews for daily oral care and calmer energy." },
    href: "/collections/dental-chews",
    skus: [
      "4976064025333",
      "4976064026446",
      "4976064025661",
      "4976064022301",
    ],
  },
  {
    id: "cats",
    title: { zh: "🐱 貓咪專屬・挑食與美毛專區", en: "🐱 Cat Picks for Picky Appetites & Shine" },
    description: { zh: "貓咪專屬單品，為挑食與日常美毛補充鮮味。", en: "Cat-only treats for picky appetites and healthy-looking coats." },
    href: "/collections/cats",
    skus: [
      "4976064013897",
      "4976064024725",
      "4976064015747",
      "4976064024688",
    ],
  },
];

function productSku(product: Product): string {
  return String(
    product.metadata?.mofu_sku ??
      product.tags?.find((tag) => /^MOFU-|^\d{8,14}$/.test(tag)) ??
      "",
  ).trim();
}

/**
 * Resolve each shelf only from its allowlist, then enforce a second global identity
 * guard so a future catalog mistake cannot render a product twice on the homepage.
 */
function productsForShelves(products: Product[]): Map<string, Product[]> {
  const claimedSkus = new Set<string>();
  const result = new Map<string, Product[]>();

  for (const shelf of SHELVES) {
    const allowed = new Set(shelf.skus);
    const shelfProducts: Product[] = [];
    for (const product of products) {
      const sku = productSku(product);
      if (!sku || !allowed.has(sku) || claimedSkus.has(sku)) continue;
      claimedSkus.add(sku);
      shelfProducts.push(product);
    }
    result.set(shelf.id, shelfProducts);
  }

  return result;
}

export function HomepageFeaturedShowcase({ products }: { products: Product[] }) {
  const { locale } = useI18n();
  const isZh = locale === "zh";
  const shelfProducts = productsForShelves(products);

  return (
    <section aria-labelledby="homepage-featured-showcase-title" className="bg-[#fbf7f3] px-5 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-[#f1ded1] px-3 py-1 text-xs font-bold tracking-[0.12em] text-[#a36b42]">{isZh ? "毛毛港精選" : "MOFU HAVEN SELECT"}</span>
            <h2 id="homepage-featured-showcase-title" className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-4xl">{isZh ? "店長嚴選・毛孩人氣特輯" : "Shopkeeper's Picks for Happy Pets"}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">{isZh ? "針對挑食、潔齒磨牙、深海美毛等日常需求，為愛寵精選最安心的日本天然食品。" : "Thoughtfully selected Japanese natural foods for picky appetites, dental care, deep-sea nourishment and everyday pet needs."}</p>
          </div>
        </div>

        <div className="grid gap-6">
          {SHELVES.map((shelf) => {
            const products = shelfProducts.get(shelf.id) ?? [];
            return (
              <section key={shelf.id} aria-labelledby={`${shelf.id}-title`}>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <h3 id={`${shelf.id}-title`} className="text-xl font-bold text-[color:var(--ink)] sm:text-2xl">{isZh ? shelf.title.zh : shelf.title.en}</h3>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">{isZh ? shelf.description.zh : shelf.description.en}</p>
                  </div>
                  <Link href={shelf.href} className="shrink-0 rounded-full border border-[color:var(--line)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--accent)] transition hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)]">{isZh ? "查看全部 →" : "View all →"}</Link>
                </div>
                {products.length > 0 ? (
                  <ul className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
                    {products.map((product, index) => (
                      <li key={`${shelf.id}-${product.id}`} className="flex min-w-0 flex-col">
                        <div className="mb-1.5 h-7" aria-hidden="true" />
                        <ProductCard product={product} priority={index === 0} showPurchaseControls={false} />
                      </li>
                    ))}
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

export { SHELVES, productSku, productsForShelves };
