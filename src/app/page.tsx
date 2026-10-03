// Mofu Journal homepage: editorial storytelling, clear category paths and one curated product selection.
import { HomeBulkPromotion } from "@/components/home/HomeBulkPromotion";
import { HomeJournalHero } from "@/components/home/HomeJournalHero";
import { HomeDiscoveryBar } from "@/components/home/HomeDiscoveryBar";
import { ProteinPills } from "@/components/home/ProteinPills";
import { CareMatchCard } from "@/components/home/CareMatchCard";
import { HomeSupplierStory } from "@/components/home/HomeSupplierStory";
import dynamic from "next/dynamic";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import type { Product } from "@/lib/products";

const HomepageFeaturedShowcase = dynamic(
  () => import("@/components/home/HomepageFeaturedShowcase").then((module) => module.HomepageFeaturedShowcase),
  { loading: () => null },
);
const BestPartnerValues = dynamic(
  () => import("@/components/home/BestPartnerValues").then((module) => module.BestPartnerValues),
  { loading: () => null },
);
const HomeInteractiveSections = dynamic(
  () => import("@/components/home/HomeInteractiveSections").then((module) => module.HomeInteractiveSections),
  { loading: () => null },
);

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
      <HomeJournalHero products={products} />
      <HomeDiscoveryBar />
      <HomeSupplierStory />
      <ProteinPills />
      <CareMatchCard />
      <HomeBulkPromotion />
      <HomepageFeaturedShowcase products={products} />
      <BestPartnerValues />
      <HomeInteractiveSections />
    </>
  );
}
