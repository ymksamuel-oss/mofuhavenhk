// Mofu Journal homepage: editorial storytelling with one curated product selection.
import { FAQAccordion } from "@/components/FAQAccordion";
import { WelcomeEntranceOverlay } from "@/components/WelcomeEntranceOverlay";
import { HomeJournalHero } from "@/components/home/HomeJournalHero";
import { HomeSupplierStory } from "@/components/home/HomeSupplierStory";
import { HomePetParade } from "@/components/home/HomePetParade";
import { BrandHarmonyBanner } from "@/components/home/BrandHarmonyBanner";
import { getPublicCatalogSnapshot } from "@/lib/catalog-server";
import type { Product } from "@/lib/products";

import { HomepageFeaturedShowcase } from "@/components/home/HomepageFeaturedShowcase";
import { CareMatchCard } from "@/components/home/CareMatchCard";

export const revalidate = 86400;

export default async function HomePage() {
  const catalog = await getPublicCatalogSnapshot();
  const products: Product[] = catalog.products;

  return (
    <>
      <WelcomeEntranceOverlay />
      <HomeJournalHero products={products} />
      <HomeSupplierStory />
      <HomePetParade products={products} />
      <HomepageFeaturedShowcase products={products} />
      <CareMatchCard />
      <FAQAccordion />
      <BrandHarmonyBanner
        imageSrc="/images/home-pet-companionship.webp"
        imageAlt={{ zh: "金毛幼犬與虎斑幼貓在柔軟地毯上溫柔對望", en: "A golden puppy and tabby kitten looking at each other on a soft carpet" }}
      />
    </>
  );
}
