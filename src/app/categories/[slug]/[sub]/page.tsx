import { notFound } from "next/navigation";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { isCategorySlug } from "@/lib/categories";
import {
  CAT_SUBCATEGORY_BY_SLUG,
  DOG_SUBCATEGORY_BY_SLUG,
  resolveCategorySubSlug,
  resolveDogSnackSeriesSlug,
} from "@/lib/products";

type CategorySubPageProps = {
  params: Promise<{ slug: string; sub: string }>;
  searchParams: Promise<{ series?: string | string[] }>;
};

export function generateStaticParams() {
  const catSubs = Object.keys(CAT_SUBCATEGORY_BY_SLUG).map((sub) => ({
    slug: "cats",
    sub,
  }));
  const dogSubs = Object.keys(DOG_SUBCATEGORY_BY_SLUG).map((sub) => ({
    slug: "dogs",
    sub,
  }));
  return [...catSubs, ...dogSubs];
}

/**
 * Food-zone subcategory pages with clear URLs:
 * - `/categories/cats/freeze-dried` → 貓貓小食／冷凍脫水系列
 * - `/categories/dogs/snacks` → 狗狗小食
 * - `/categories/dogs/snacks?series=biscuits|paste|cheese` → series filters
 * - `/categories/dogs/food` → 狗狗食品
 */
export default async function CategorySubPage({
  params,
  searchParams,
}: CategorySubPageProps) {
  const { slug, sub } = await params;
  const query = await searchParams;
  if (!isCategorySlug(slug) || (slug !== "cats" && slug !== "dogs")) {
    notFound();
  }

  const subcategory = resolveCategorySubSlug(slug, sub);
  if (!subcategory) {
    notFound();
  }

  const seriesParam = Array.isArray(query.series) ? query.series[0] : query.series;
  const snackSeries =
    slug === "dogs" && subcategory === "狗狗小食"
      ? resolveDogSnackSeriesSlug(seriesParam)
      : null;

  return (
    <ProductCatalog
      categorySlug={slug}
      subcategory={subcategory}
      snackSeries={snackSeries}
    />
  );
}
