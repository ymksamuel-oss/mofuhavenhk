// Visual reference: warm Japanese editorial storefront — cream canvas, pet-and-packaging hero,
// soft gold actions, mobile-first stacked storytelling, and no video CTA in the hero.
import { HomepageProductGrid } from "@/components/home/HomepageProductGrid";
import { HomeInteractiveSections } from "@/components/home/HomeInteractiveSections";
import { HomeBannerCarousel } from "@/components/home/HomeBannerCarousel";
import { HomeCategoryVisualNav } from "@/components/home/HomeCategoryVisualNav";
import { HomeBulkPromotion } from "@/components/home/HomeBulkPromotion";
import { HomeBrandGrid } from "@/components/home/HomeBrandGrid";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import type { Product } from "@/lib/products";
import type { StoreCategory } from "@/lib/store-categories";
import type { Brand } from "@/lib/brands";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let products: Product[] = [];
  let categories: StoreCategory[] = [];
  let brands: Brand[] = [];
  try {
    const catalog = await getCatalogSnapshot();
    products = catalog.products;
    categories = catalog.categories;
    brands = catalog.brands.filter((brand) => catalog.products.some((product) => product.brandId === brand.id || (!product.brandId && product.brandName?.toLowerCase() === brand.name.toLowerCase())));
  } catch (error) {
    // Never let a catalog/backend outage turn the storefront shell into a 500.
    console.error("[home] catalog unavailable during SSR; rendering empty catalog", {
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }

  return (
    <>
      <HomeBulkPromotion />
      <HomeBannerCarousel />
      <HomepageProductGrid products={products} />
      <HomeCategoryVisualNav categories={categories} products={products} />
      <HomeBrandGrid brands={brands} />
      <HomeInteractiveSections />
    </>
  );
}
