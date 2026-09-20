// Visual reference: warm Japanese editorial storefront — cream canvas, pet-and-packaging hero,
// soft gold actions, mobile-first stacked storytelling, and no video CTA in the hero.
import { HomepageProductGrid } from "@/components/home/HomepageProductGrid";
import { HomeInteractiveSections } from "@/components/home/HomeInteractiveSections";
import { HomeBulkPromotion } from "@/components/home/HomeBulkPromotion";
import { HomeBannerCarousel } from "@/components/home/HomeBannerCarousel";
import { BestPartnerValues } from "@/components/home/BestPartnerValues";
import { HomepageFeaturedShowcase } from "@/components/home/HomepageFeaturedShowcase";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import type { Product } from "@/lib/products";
import Link from "next/link";

export const revalidate = 300;

const QUICK_CATEGORY_PILLS = [
  { href: "/collections/dogs", label: "🐶 \u72d7\u72d7\u5168\u7cfb\u5217" },
  { href: "/collections/cats", label: "🐱 \u8c93\u54aa\u5c08\u5340" },
  { href: "/collections/dental-chews", label: "🦷 \u6f54\u9f52\u8010\u54ac" },
  { href: "/collections/meal-toppers", label: "✨ \u6311\u98df\u62cc\u7ce7" },
  { href: "/collections/outdoor-gear", label: "🦺 \u6236\u5916\u88dd\u5099" },
  { href: "/collections/value-bundles", label: "🎁 \u4fc3\u92b7\u7d44\u5408" },
] as const;

export default async function HomePage() {
  let products: Product[] = [];
  try {
    const catalog = await getCatalogSnapshot();
    products = catalog.products;
  } catch (error) {
    // Never let a catalog/backend outage turn the storefront shell into a 500.
    console.error("[home] catalog unavailable during SSR; rendering empty catalog", {
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }

  return (
    <>
      <HomeBannerCarousel />
      <nav aria-label="\u9996\u9801\u5feb\u6377\u5206\u985e" className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-4 py-4 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:gap-3 sm:px-6 lg:grid-cols-6 [&::-webkit-scrollbar]:hidden">
        {QUICK_CATEGORY_PILLS.map((pill) => (
          <Link key={pill.href} href={pill.href} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-[color:var(--ink)] shadow-[0_8px_20px_-16px_rgba(84,57,45,0.5)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 sm:w-full">
            {pill.label}
          </Link>
        ))}
      </nav>
      <HomeBulkPromotion />
      <HomepageProductGrid products={products} />
      <HomepageFeaturedShowcase products={products} />
      <BestPartnerValues />
      <HomeInteractiveSections />
    </>
  );
}
