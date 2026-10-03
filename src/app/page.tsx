// Mofu Journal homepage: editorial storytelling with one curated product selection.
import { FAQAccordion } from "@/components/FAQAccordion";
import { HomeJournalHero } from "@/components/home/HomeJournalHero";
import { HomeSupplierStory } from "@/components/home/HomeSupplierStory";
import { WelcomeEntranceOverlay } from "@/components/WelcomeEntranceOverlay";
import { cookies } from "next/headers";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import type { Product } from "@/lib/products";

import { HomepageFeaturedShowcase } from "@/components/home/HomepageFeaturedShowcase";

export const revalidate = 300;

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasSeenEntrance = cookieStore.get("mofu_seen_entrance")?.value === "1";
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
      {!hasSeenEntrance && <WelcomeEntranceOverlay />}
      <HomeJournalHero products={products} />
      <HomeSupplierStory />
      <HomepageFeaturedShowcase products={products} />
      <FAQAccordion />
    </>
  );
}
