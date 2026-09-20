"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/products";

type Shelf = {
  id: string;
  title: string;
  description: string;
  href: string;
  patterns: RegExp[];
  skus?: readonly string[];
};

const SHELVES: readonly Shelf[] = [
  {
    id: "bestsellers",
    title: "🏆 Best Sellers",
    description: "Japanese favourites pets always want another serving of.",
    href: "/collections/dogs",
    patterns: [/熱賣|人氣|best.?seller|人気|推薦|featured/i],
  },
  {
    id: "dental",
    title: "🦷 Dental Chews",
    description: "Natural chewing support for daily oral care and calmer energy.",
    href: "/collections/dental-chews",
    patterns: [/潔齒|潔牙|牙棒|牛蹄|牛筋|耐咬|dental|chew|tooth/i],
  },
  {
    id: "toppers",
    title: "✨ Meal Toppers",
    description: "Add a little aroma to mealtimes and make every bowl more exciting.",
    href: "/collections/meal-toppers",
    patterns: [/拌飯|拌糧|撒料|ふりかけ|誘食|topper|topping|seasoning/i],
  },
  {
    id: "outdoor",
    title: "🦺 Outdoor Walking Gear",
    description: "Comfortable, supportive and stylish gear for better everyday walks.",
    href: "/collections/outdoor-gear",
    patterns: [/胸背|牽引|牽繩|頸圈|項圈|散步|外出|harness|leash|lead|collar|walk/i],
    skus: ["4976064026071", "4976064026088", "4976064026170", "4976064023322", "4976064015013", "4976064026231"],
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

function productsForShelf(products: Product[], shelf: Shelf): Product[] {
  if (shelf.skus) {
    const skuSet = new Set(shelf.skus);
    return products.filter((product) => {
      const sku = product.metadata?.mofu_sku?.trim() || product.tags?.find((tag) => /^\d{8,14}$/.test(tag));
      return sku ? skuSet.has(sku) : false;
    });
  }
  const matches = products.filter((product) => shelf.patterns.some((pattern) => pattern.test(searchableText(product))));
  return (matches.length >= 4 ? matches : products).slice(0, 4);
}

export function HomepageFeaturedShowcase({ products }: { products: Product[] }) {
  return (
    <section aria-labelledby="homepage-featured-showcase-title" className="bg-[#fbf7f3] px-5 py-12 sm:px-10 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-[#f1ded1] px-3 py-1 text-xs font-bold tracking-[0.12em] text-[#a36b42]">MOFU HAVEN SELECT</span>
            <h2 id="homepage-featured-showcase-title" className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-4xl">Curated Collections</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">Browse Japanese pet essentials organised around everyday needs.</p>
          </div>
        </div>

        <div className="grid gap-10">
          {SHELVES.map((shelf) => {
            const shelfProducts = productsForShelf(products, shelf);
            return (
              <section key={shelf.id} aria-labelledby={`${shelf.id}-title`}>
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <h3 id={`${shelf.id}-title`} className="text-xl font-bold text-[color:var(--ink)] sm:text-2xl">{shelf.title}</h3>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">{shelf.description}</p>
                  </div>
                  <Link href={shelf.href} className="shrink-0 rounded-full border border-[color:var(--line)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--accent)] transition hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)]">View all →</Link>
                </div>
                {shelfProducts.length > 0 ? (
                  <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {shelfProducts.map((product, index) => <li key={`${shelf.id}-${product.id}`} className="min-w-0"><ProductCard product={product} priority={index === 0} showPurchaseControls={false} /></li>)}
                  </ul>
                ) : (
                  <p className="rounded-2xl border border-dashed border-[color:var(--line)] bg-white/60 px-4 py-6 text-sm text-[color:var(--muted)]">Our product catalogue is updating. Please check back soon.</p>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
