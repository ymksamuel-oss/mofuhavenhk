// Visual reference: warm Japanese editorial storefront — cream canvas, pet-and-packaging hero,
// soft gold actions, mobile-first stacked storytelling, and no video CTA in the hero.
import { HomepageProductGrid } from "@/components/home/HomepageProductGrid";
import { HomeInteractiveSections } from "@/components/home/HomeInteractiveSections";
import { getCatalogSnapshot } from "@/lib/catalog-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const catalog = await getCatalogSnapshot();

  return (
    <>
      <HomeInteractiveSections />
      <HomepageProductGrid products={catalog.products} />
    </>
  );
}
