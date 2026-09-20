// Visual reference: warm Japanese editorial storefront — cream canvas, pet-and-packaging hero,
// soft gold actions, mobile-first stacked storytelling, and no video CTA in the hero.
import { HomepageProductGrid } from "@/components/home/HomepageProductGrid";
import { HomeInteractiveSections } from "@/components/home/HomeInteractiveSections";
import { HomeBulkPromotion } from "@/components/home/HomeBulkPromotion";
import { HomeBannerCarousel } from "@/components/home/HomeBannerCarousel";
import { BestPartnerValues } from "@/components/home/BestPartnerValues";
import { HomepageFeaturedShowcase } from "@/components/home/HomepageFeaturedShowcase";
import { HomeDiscoveryBar } from "@/components/home/HomeDiscoveryBar";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import type { Product } from "@/lib/products";

export const revalidate = 300;


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
      <HomeDiscoveryBar />
      <HomeBulkPromotion />
      <HomepageProductGrid products={products} />
      <HomepageFeaturedShowcase products={products} />
      <BestPartnerValues />
      <HomeInteractiveSections />
    </>
  );
}
