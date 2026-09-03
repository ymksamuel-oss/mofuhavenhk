// Visual reference: warm Japanese editorial storefront — cream canvas, pet-and-packaging hero,
// soft gold actions, mobile-first stacked storytelling, and no video CTA in the hero.
import { HomepageProductGrid } from "@/components/home/HomepageProductGrid";
import { HomeInteractiveSections } from "@/components/home/HomeInteractiveSections";
import { HomeBannerCarousel } from "@/components/home/HomeBannerCarousel";
import { FeaturedPetGallery } from "@/components/home/FeaturedPetGallery";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { getFeaturedPets } from "@/lib/featured-pets-server";
import type { FeaturedPet } from "@/lib/featured-pets";
import type { Product } from "@/lib/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let products: Product[] = [];
  let featuredPets: FeaturedPet[] = [];
  try {
    const [catalog, featuredPetEntries] = await Promise.all([
      getCatalogSnapshot(),
      getFeaturedPets(),
    ]);
    products = catalog.products;
    featuredPets = featuredPetEntries;
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
      <HomepageProductGrid products={products} />
      <FeaturedPetGallery pets={featuredPets} />
      <HomeInteractiveSections />
    </>
  );
}
