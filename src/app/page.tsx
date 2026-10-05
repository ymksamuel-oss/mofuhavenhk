// Mofu Journal homepage: editorial storytelling with one curated product selection.
import { FAQAccordion } from "@/components/FAQAccordion";
import { HomeJournalHero } from "@/components/home/HomeJournalHero";
import { HomeSupplierStory } from "@/components/home/HomeSupplierStory";
import { HomePetParade } from "@/components/home/HomePetParade";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import type { Product } from "@/lib/products";

import { HomepageFeaturedShowcase } from "@/components/home/HomepageFeaturedShowcase";
import { CareMatchCard } from "@/components/home/CareMatchCard";

export const revalidate = 3600;

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
      <HomeJournalHero products={products} />
      <HomeSupplierStory />
      <HomePetParade products={products} />
      <HomepageFeaturedShowcase products={products} />
      <CareMatchCard />
      <FAQAccordion />
    </>
  );
}
