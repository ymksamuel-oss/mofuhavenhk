// Mofu Journal homepage: editorial storytelling with one curated product selection.
import type { Metadata } from "next";
import { FAQAccordion } from "@/components/FAQAccordion";
import { WelcomeEntranceOverlay } from "@/components/WelcomeEntranceOverlay";
import { HomeJournalHero } from "@/components/home/HomeJournalHero";
import { HomeSupplierStory } from "@/components/home/HomeSupplierStory";
import { HomePetParade } from "@/components/home/HomePetParade";
import { BrandHarmonyBanner } from "@/components/home/BrandHarmonyBanner";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import type { Product } from "@/lib/products";

import { HomepageFeaturedShowcase } from "@/components/home/HomepageFeaturedShowcase";
import { CareMatchCard } from "@/components/home/CareMatchCard";

export const revalidate = 86400;
export const metadata: Metadata = {
  title: { absolute: "毛毛港 Mofu Haven HK｜日本直送天然寵物零食及用品專門店" },
  description:
    "毛毛港 Mofu Haven HK 專營日本寵物零食及用品，精選貓狗天然食品、日本直送寵物食品與日常好物，為香港毛孩帶來安心選擇。",
  keywords: ["毛毛港", "日本寵物零食", "貓狗天然食品", "日本直送寵物用品", "香港寵物店"],
  alternates: { canonical: "/" },
};

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
