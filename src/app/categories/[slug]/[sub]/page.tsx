import { notFound } from "next/navigation";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { isCategorySlug } from "@/lib/categories";
import {
  CAT_SUBCATEGORY_BY_SLUG,
  DOG_SUBCATEGORY_BY_SLUG,
  resolveCategorySubSlug,
  resolveCatSnackSeriesSlug,
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
 * - `/categories/cats/freeze-dried` → 冷凍脫水系列
 * - `/categories/cats/snacks` → 貓貓小食
 * - `/categories/cats/snacks?series=natural|senior|hairball|kitten` → series filters
 * - `/categories/cats/pill-treats` → 貓用投藥餵藥專用小食
 * - `/categories/dogs/snacks` → 狗狗小食
 * - `/categories/dogs/food` → 狗狗食品
 * - `/categories/dogs/pill-treats` → 狗用投藥餵藥專用小食
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
    slug === "cats" && subcategory === "貓貓小食"
      ? resolveCatSnackSeriesSlug(seriesParam)
      : null;

  return (
    <ProductCatalog
      categorySlug={slug}
      subcategory={subcategory}
      snackSeries={snackSeries}
      showProductSearch
    />
  );
}
