import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { isCategorySlug } from "@/lib/categories";
import { getCategoryPageMetadata } from "@/lib/seo/category-seo";
import {
  CAT_SUBCATEGORY_BY_SLUG,
  DOG_SUBCATEGORY_BY_SLUG,
  LIFESTYLE_SUBCATEGORY_BY_SLUG,
  SMALL_PET_SUBCATEGORY_BY_SLUG,
  resolveCategorySubSlug,
  resolveCatLifeStageSlug,
  resolveCatSnackSeriesSlug,
} from "@/lib/products";

type CategorySubPageProps = {
  params: Promise<{ slug: string; sub: string }>;
  searchParams: Promise<{ series?: string | string[]; lang?: string | string[] }>;
};

export function generateStaticParams() {
  const catSubs = Object.keys(CAT_SUBCATEGORY_BY_SLUG).map((sub) => ({
    slug: "cats",
    sub,
  }));
  const catLifeStages = ["kitten", "adult", "senior"].map((sub) => ({
    slug: "cats",
    sub,
  }));
  const dogSubs = Object.keys(DOG_SUBCATEGORY_BY_SLUG).map((sub) => ({
    slug: "dogs",
    sub,
  }));
  const smallPetSubs = Object.keys(SMALL_PET_SUBCATEGORY_BY_SLUG).map((sub) => ({
    slug: "small-pets",
    sub,
  }));
  const lifestyleSubs = Object.keys(LIFESTYLE_SUBCATEGORY_BY_SLUG).map((sub) => ({
    slug: "lifestyle",
    sub,
  }));
  return [...catSubs, ...catLifeStages, ...dogSubs, ...smallPetSubs, ...lifestyleSubs];
}

export async function generateMetadata({
  params,
  searchParams,
}: CategorySubPageProps): Promise<Metadata> {
  const { slug, sub } = await params;
  const query = await searchParams;
  if (!isCategorySlug(slug) || !["cats", "dogs", "small-pets", "lifestyle"].includes(slug)) {
    return { robots: { index: false, follow: false } };
  }

  const lang = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  const subcategory = resolveCategorySubSlug(slug, sub);
  const catLifeStage = slug === "cats" ? resolveCatLifeStageSlug(sub) : null;
  if (!subcategory && !catLifeStage) return { robots: { index: false, follow: false } };
  if (catLifeStage) {
    const stageLabels = {
      kitten: { zh: "幼貓", en: "Kitten" },
      adult: { zh: "成貓", en: "Adult Cat" },
      senior: { zh: "老貓", en: "Senior Cat" },
    } as const;
    const stage = stageLabels[catLifeStage];
    const english = lang === "en";
    return {
      title: `${english ? stage.en : stage.zh}｜Mofu Haven HK`,
      description: english
        ? `Strictly filtered cat products with verified ${stage.en.toLowerCase()} suitability.`
        : `只顯示已核對適合${stage.zh}的貓咪產品。`,
    };
  }

  const seriesParam = Array.isArray(query.series) ? query.series[0] : query.series;
  const snackSeries =
    slug === "cats" && subcategory === "貓貓小食"
      ? resolveCatSnackSeriesSlug(seriesParam)
      : null;
  return getCategoryPageMetadata(lang === "en" ? "en" : "zh", {
    categorySlug: slug,
    subcategory,
    snackSeries,
  });
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
  if (!isCategorySlug(slug) || !["cats", "dogs", "small-pets", "lifestyle"].includes(slug)) {
    notFound();
  }

  const subcategory = resolveCategorySubSlug(slug, sub);
  const catLifeStage = slug === "cats" ? resolveCatLifeStageSlug(sub) : null;
  if (!subcategory && !catLifeStage) {
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
      catLifeStage={catLifeStage}
      snackSeries={snackSeries}
      showProductSearch
    />
  );
}
