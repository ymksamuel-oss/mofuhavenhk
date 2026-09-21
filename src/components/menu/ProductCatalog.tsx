"use client";

import { useEffect, useRef, useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { ProductCard } from "@/components/product/ProductCard";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getProductsByCategory, resolveCategorySubSlug } from "@/lib/products";
import { findCategoryBySlug } from "@/lib/store-categories";
import { BrandServiceStrip } from "@/components/BrandServiceStrip";
import { getCollection, getCollectionDescription, getCollectionLabel, getCollectionProducts } from "@/lib/collections";
import { getCategoryEditorialIntro } from "@/lib/seo/category-seo";

const PAGE_SIZE = 12;
type PageItem = number | "ellipsis";

function getPageNumbers(current: number, total: number): PageItem[] {
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((page) => pages.add(page));

  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  const result: PageItem[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push("ellipsis");
    result.push(page);
  });
  return result;
}

type ProductCatalogProps = {
  /** `null` = full catalog (`/menu`); otherwise a category slug page. */
  categorySlug: string | null;
  /** Child category slug for `/categories/[parent]/[child]`. */
  subcategory?: unknown;
  /** Retained only for legacy route compatibility; database category_id remains authoritative. */
  catLifeStage?: unknown;
  snackSeries?: unknown;
  /** Show the homepage-style search section on `/categories/...` pages only. */
  showProductSearch?: boolean;
  /** Special editorial filter for cat-only and cat-friendly natural products. */
  specialFilter?: "cat-zone" | null;
  ingredientFilter?: string | null;
  audienceFilter?: string | null;
  productCategory?: "treats" | null;
  collectionSlug?: string | null;
};

const INGREDIENT_FILTERS = [
  ["chicken", "\u96de\u8089", "\u9d8f chicken", "Chicken"],
  ["duck", "\u9d28\u8089", "\u9d28 duck", "Duck"],
  ["beef", "\u725b\u8089", "\u725b cow", "Beef"],
  ["pork", "\u8c6c\u8089", "\u8c5a pig", "Pork"],
  ["boar", "\u91ce\u8c6c\u8089", "\u732a boar", "Boar"],
  ["kangaroo", "\u888b\u9f20\u8089", "カンガルー kangaroo", "Kangaroo"],
  ["deer", "\u9e7f\u8089", "\u9e7f deer", "Venison"],
  ["horse", "\u99ac\u8089", "\u99ac horse", "Horse"],
  ["sheep", "\u7f8a\u8089", "\u7f8a sheep", "Lamb"],
  ["roll", "\u8089\u985e\u5377\u88fd", "\u5dfbき roll", "Roll"],
  ["chips-jerky", "\u8089\u7247・\u8089\u4e7e", "ちっぷすジャーキー", "Chips & jerky"],
  ["seafood", "\u9b5a\u4ecb\u6d77\u9bae", "\u9b5a\u4ecb seafood", "Seafood"],
  ["produce", "\u852c\u83dc・\u6c34\u679c", "\u91ce\u83dc・\u679c\u7269", "Vegetables & fruits"],
  ["snacks", "\u96f6\u98df", "おかし snacks", "Snacks"],
  ["dairy", "\u4e73\u88fd\u54c1", "\u4e73\u88fd\u54c1 dairy", "Dairy"],
  ["seasoning", "\u62cc\u98ef\u7c89・\u6492\u6599", "ふりかけ seasoning", "Seasoning"],
  ["side-dish", "\u719f\u98df\u914d\u83dc", "お\u60e3\u83dc side dish", "Side dish"],
  ["frozen", "\u51b7\u51cd\u98df\u54c1", "\u51b7\u51cd frozen", "Frozen"],
  ["food", "\u4e3b\u98df・\u98ef", "ごはん food", "Food"],
] as const;

const AUDIENCE_FILTERS = [
  ["dog", "\u72d7\u72d7\u5c08\u5340", "\u72ac\u7528", "For dogs"],
  ["cat", "\u8c93\u8c93\u5c08\u5340", "\u732b\u7528", "For cats"],
] as const;

function productFilterText(product: { name: { zh: string; en: string }; description?: { zh: string; en: string }; tags?: string[]; metadata?: Record<string, string> }) {
  return [product.name.zh, product.name.en, product.description?.zh, product.description?.en, ...(product.tags ?? []), ...Object.values(product.metadata ?? {})].filter(Boolean).join(" ").toLowerCase();
}

function isFoodProduct(product: Parameters<typeof productFilterText>[0]) {
  const text = productFilterText(product);
  return !/\u7528\u54c1|\u80f8\u80cc\u5e36|\u727d\u5f15\u5e36|\u9805\u5708|\u73a9\u5177|\u8c93\u7802|\u7802\u76c6|\u5c3f\u588a|\u98df\u5668|\u9935\u98df\u5668|grooming|harness|leash|collar|toy|litter|pad|bowl|supply/i.test(text) &&
    /supplier_category:(?:chicken|duck|beef|pork|boar|kangaroo|deer|horse|sheep|roll|chips-jerky|seafood|produce|snacks|dairy|seasoning|side-dish|frozen|food)|\u98df\u54c1|\u98df\u7269|\u5c0f\u98df|\u96f6\u98df|\u4e7e\u7ce7|\u7f50\u982d|\u51cd\u4e7e|\u8089\u6ce5|\u8089\u7247|\u8089\u4e7e|\u8089\u689d|\u8089\u7c92|\u9e7f\u8089|\u7d2b\u85af|おやつ|フード|トリーツ|food|treat|snack|jerky|kibble|canned|sweet\s*potato/i.test(text);
}

function matchesIngredient(product: Parameters<typeof productFilterText>[0], filter: string | null) {
  if (!filter || filter === "all") return true;
  const text = productFilterText(product);
  const patterns: Record<string, RegExp> = {
    food: /ごはん|\u4e7e\u7ce7|\u4e3b\u98df|\u98ef|food|kibble|rice/i,
    frozen: /\u51b7\u51cd|\u51b7\u85cf|frozen/i,
    "side-dish": /お\u60e3\u83dc|\u719f\u98df|side\s*dish|\u914d\u83dc/i,
    seasoning: /ふりかけ|\u62cc\u98ef|\u62cc\u7ce7|\u6492\u6599|seasoning/i,
    dairy: /\u4e73\u88fd\u54c1|チーズ|cheese|\u5976|\u4e73\u916a|dairy/i,
    snacks: /おかし|おやつ|\u96f6\u98df|\u5c0f\u98df|\u9905\u4e7e|snack/i,
    "chips-jerky": /ちっぷす|チップ|ジャーキー|chips|jerky|\u8089\u4e7e|\u8089\u7247/i,
    roll: /\u5dfbき|\u5377|\u6372|roll/i,
    kangaroo: /カンガルー|kangaroo|\u888b\u9f20/i,
    duck: /\u9d28|\u9d28\u8089|duck|カモ/i,
    boar: /\u732a|\u91ce\u8c6c|boar/i,
    seafood: /\u6df1\u6d77\u6d77\u9bae|\u9b5a\u4ecb|\u9b5a|まぐろ|マグロ|かつお|\u9c39|きびなご|わかさぎ|たら|\u9c48|\u9bad|\u9bdb|\u9bf5|\u9bd6|\u9c67|うなぎ|\u5e06\u7acb|\u767d\u5b50|seafood|fish|tuna|bonito/i,
    deer: /\u4f4e\u654f\u9e7f\u8089|\u9e7f\u8089|\u9e7f|ベニソン|venison|deer/i,
    horse: /\u4f4e\u654f\u99ac\u8089|\u99ac\u8089|\u99ac|horse/i,
    chicken: /\u7d14\u5929\u7136\u96de\u8089|\u96de\u80f8\u8089|\u96de\u8089|\u9d8f|チキン|ささみ|chicken/i,
    beef: /\u56b4\u9078\u725b\u8089|\u725b\u8089|\u725b|ビーフ|beef/i,
    pork: /\u8c6c\u8089|\u8c5a|ポーク|pork/i,
    sheep: /\u7f8a\u8089|\u7f8a|ラム|sheep|lamb/i,
    produce: /\u852c\u83dc|\u6c34\u679c|\u91ce\u83dc|フルーツ|\u679c\u7269|vegetable|fruit|produce/i,
  };
  return patterns[filter]?.test(text) ?? false;
}

function matchesAudience(product: Parameters<typeof productFilterText>[0], filter: string | null) {
  if (!filter) return true;
  const text = productFilterText(product);
  const isCatOnly = /\u8c93\u5c08\u7528|\u732b\u7528|\u8c93\u7528|\u8c93\u8c93|\u732bの|ねこ|ネコ|for cats?|\bcats?\b|cat[-_ ]?only|audience:cat/i.test(text);
  const isDogOnly = /\u72d7\u5c08\u7528|\u72d7\u72d7|\u72ac\u7528|\u72ac|\u72d7\u5177|for dogs?|\bdogs?\b|dog[-_ ]?(?:only|treat|food|snack|product)/i.test(text);
  const isShared = /\u8c93\u72d7\u517c\u7528|\u8c93\u72ac\u517c\u7528|all[_ -]?pets|\u72ac\u732b\u517c\u7528|cats?\s*(?:and|&)\s*dogs?/i.test(text);
  if (filter === "cat") return !isDogOnly || isShared ? (isCatOnly || isShared) : false;
  if (filter === "dog") return !isCatOnly || isShared ? (isDogOnly || isShared) : false;
  return !/\u8c93\u5c08\u7528|\u732b\u7528|\u8c93\u7528|\u8c93\u8c93|\u72d7\u5c08\u7528|\u72d7\u72d7|\u72ac\u7528|\u72d7\u5177|for cats?|for dogs?|cat[-_ ]?(?:only|treat|food|snack|product)|dog[-_ ]?(?:only|treat|food|snack|product)/i.test(text);
}

function isCatZoneProduct(product: { name: { zh: string; en: string }; description?: { zh: string; en: string }; tags?: string[]; metadata?: Record<string, string> }) {
  const text = [product.name.zh, product.name.en, product.description?.zh, product.description?.en, ...(product.tags ?? []), ...Object.values(product.metadata ?? {})].filter(Boolean).join(" ").toLowerCase();
  return /\u8c93|\u732b|cat|にぼし|まぐろ|マグロ|かつお|\u9c39|きびなご|ひめたら|わかさぎ|\u9b5a|fish|tuna|bonito|\u9c48|\u9e7f\u8089|\u99ac\u8089|\u9e7f|\u99ac|venison|horse/.test(text);
}

/**
 * Shared catalog UI for `/menu`, `/categories/[slug]`, and
 * `/categories/[slug]/[sub]` food-zone pages.
 * Product cards hard-navigate to `/product/[id]` detail pages.
 */
export function ProductCatalog({
  categorySlug,
  subcategory,
  catLifeStage,
  snackSeries,
  specialFilter = null,
  ingredientFilter = null,
  audienceFilter = null,
  productCategory = null,
  collectionSlug = null,
}: ProductCatalogProps) {
  const { locale, t } = useI18n();
  const { products: catalogProducts, categories } = useCatalog();
  const liveChildCategory = typeof subcategory === "string"
    ? findCategoryBySlug(categories, subcategory.trim().toLowerCase())
    : null;
  const selectedSubcategory = typeof subcategory === "string"
    ? resolveCategorySubSlug(categorySlug || "", subcategory.trim().toLowerCase())
    : null;
  const productsInCategory = getProductsByCategory(categorySlug, catalogProducts);
  const collection = collectionSlug ? getCollection(collectionSlug) : undefined;
  const dedicatedCategoryFallback = categorySlug === "dogs"
    ? catalogProducts.filter((product) => matchesAudience(product, "dog") && isFoodProduct(product))
    : categorySlug === "cats"
      ? catalogProducts.filter((product) => matchesAudience(product, "cat"))
      : [];
  // A category route must never fall back to the complete catalog. When the
  // child slug is recognised, match the resolved database subcategory exactly;
  // an unrecognised child route is deliberately empty rather than overbroad.
  const productsByRoute = collection
    ? getCollectionProducts(catalogProducts, collection)
    : typeof subcategory === "string"
    ? liveChildCategory
      ? productsInCategory.filter((product) => product.categoryId === liveChildCategory.id)
      : selectedSubcategory
        ? productsInCategory.filter((product) => product.subcategory === selectedSubcategory)
      : []
    : productsInCategory.length > 0 ? productsInCategory : dedicatedCategoryFallback;
  const isDedicatedCategoryPage = Boolean(categorySlug) && subcategory == null;
  const isCollectionPage = Boolean(collection);
  const foodCategorySelected = productCategory === "treats";
  const ingredientEnabled = (foodCategorySelected && (audienceFilter === "dog" || audienceFilter === "cat"))
    || (categorySlug === "dogs" && isDedicatedCategoryPage);
  const products = productsByRoute.filter((product) =>
    (specialFilter !== "cat-zone" || isCatZoneProduct(product)) &&
    (categorySlug !== "dogs" || (matchesAudience(product, "dog") && isFoodProduct(product))) &&
    (!foodCategorySelected || isFoodProduct(product)) &&
    (!ingredientEnabled || matchesIngredient(product, ingredientFilter)) &&
    matchesAudience(product, audienceFilter),
  ).sort((left, right) => categorySlug === "dogs" ? Number(isFoodProduct(right)) - Number(isFoodProduct(left)) : 0);

  useEffect(() => {
    console.log("[catalog-filter]", {
      audience: audienceFilter ?? "all",
      category: productCategory ?? "all",
      ingredient: ingredientFilter ?? "all",
      sourceCount: productsByRoute.length,
      matchedCount: products.length,
      matchedProducts: products.slice(0, 20).map((product) => ({
        id: product.id,
        name: product.name,
        tags: product.tags,
      })),
    });
  }, [audienceFilter, ingredientFilter, productCategory, products.length, productsByRoute.length]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const visibleProducts = products.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categorySlug, subcategory, audienceFilter, productCategory, ingredientFilter]);

  const ingredientScrollerRef = useRef<HTMLElement | null>(null);
  const scrollIngredients = (direction: -1 | 1) => {
    ingredientScrollerRef.current?.scrollBy({ left: direction * 200, behavior: "smooth" });
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(pageCount, page)));
  };

  const title = collection
    ? getCollectionLabel(collection, locale)
    : categorySlug === "dogs"
    ? (locale === "en" ? "For Dogs" : "\u72d7\u72d7\u5c08\u5340")
    : categorySlug === "cats" || specialFilter === "cat-zone"
      ? (locale === "en" ? "For Cats" : "\u8c93\u54aa\u5c08\u5340")
      : t("menuTitle");
  return (
    <div className="mx-auto max-w-5xl px-4 pb-14 pt-8 sm:px-6 sm:py-12">
      <div className={isCollectionPage ? "mb-7" : ""}>
        <h1 className={`font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--ink)] ${isDedicatedCategoryPage || isCollectionPage ? "" : "sr-only"}`}>{title}</h1>
        {isDedicatedCategoryPage ? <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">{getCategoryEditorialIntro(locale, categorySlug ?? "")}</p> : null}
        {collection ? <>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">{getCollectionDescription(collection)}</p>
          <p className="mt-3 text-sm font-semibold text-[color:var(--accent)]">{products.length} {locale === "en" ? "products" : "\u6b3e\u5546\u54c1"}</p>
        </> : null}
      </div>
      {categorySlug === "dogs" && isDedicatedCategoryPage ? <div className="relative mb-7 px-8">
        <button type="button" aria-label={locale === "en" ? "Scroll ingredients left" : "\u5411\u5de6\u6ed1\u52d5\u5206\u985e"} onClick={() => scrollIngredients(-1)} className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[color:var(--line)] bg-white px-2 py-1 text-lg leading-none text-[color:var(--ink)] shadow-sm">‹</button>
        <nav ref={ingredientScrollerRef} aria-label={locale === "en" ? "Dog food ingredients" : "\u72d7\u72d7\u8089\u985e\u98df\u6750"} className="scroll-smooth flex flex-nowrap touch-pan-x gap-2 overflow-x-auto whitespace-nowrap border-b border-[color:var(--line)] pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ WebkitOverflowScrolling: "touch" }}>
          {INGREDIENT_FILTERS.map(([slug, zh, , en]) => {
            const active = (ingredientFilter ?? "chicken") === slug;
            const href = `/categories/dogs?ingredient=${slug}`;
            return <CategoryNavLink key={slug} href={href} className={`relative inline-flex shrink-0 items-center whitespace-nowrap rounded-xl border px-3.5 py-2 text-sm transition ${active ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] font-semibold text-[color:var(--ink)] after:absolute after:-bottom-[7px] after:left-1/2 after:h-0 after:w-0 after:-translate-x-1/2 after:border-x-[6px] after:border-t-[6px] after:border-x-transparent after:border-t-[color:var(--accent)]" : "border-[color:var(--line)] bg-white text-[color:var(--muted)] hover:bg-[color:var(--accent-soft)]"}`}>
              {locale === "en" ? en : zh}
            </CategoryNavLink>;
          })}
        </nav>
        <button type="button" aria-label={locale === "en" ? "Scroll ingredients right" : "\u5411\u53f3\u6ed1\u52d5\u5206\u985e"} onClick={() => scrollIngredients(1)} className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[color:var(--line)] bg-white px-2 py-1 text-lg leading-none text-[color:var(--ink)] shadow-sm">›</button>
      </div> : null}
      {!isDedicatedCategoryPage && !isCollectionPage ? <nav aria-label={locale === "en" ? "Audience" : "\u5c0d\u8c61\u5206\u985e"} className="mb-5 flex gap-8 border-b border-[color:var(--line)] px-1">
        {AUDIENCE_FILTERS.map(([slug, zh, ja, en]) => {
          const href = `/menu?audience=${slug}${productCategory ? `&category=${productCategory}` : ""}`;
          const active = audienceFilter === slug;
          return <CategoryNavLink key={slug} href={href} className={`relative shrink-0 pb-3 text-lg transition ${active ? "font-bold text-[color:var(--ink)] after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[color:var(--ink)]" : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"}`}>
            {locale === "en" ? en : locale === "zh" ? zh : ja}
          </CategoryNavLink>;
        })}
      </nav> : null}
      {!isDedicatedCategoryPage && !isCollectionPage ? <nav aria-label={locale === "en" ? "Product categories" : "\u5546\u54c1\u985e\u5225"} className="mb-3 flex gap-7 border-b border-[color:var(--line)] px-1">
        {(["treats"] as const).map((slug) => {
          const active = productCategory === slug;
          const href = `/menu?category=${slug}${audienceFilter ? `&audience=${audienceFilter}` : ""}`;
          return <CategoryNavLink key={slug} href={href} className={`relative shrink-0 pb-2.5 text-sm transition ${active ? "font-semibold text-[color:var(--ink)] after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[color:var(--accent)]" : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"}`}>
            {locale === "en" ? "Natural meat treats" : "\u5929\u7136\u8089\u98df\u5c0f\u98df"}
          </CategoryNavLink>;
        })}
      </nav> : null}
      {!isDedicatedCategoryPage && !isCollectionPage && ingredientEnabled ? <div className="relative mb-5">
        <nav aria-label={locale === "en" ? "Ingredient filters" : "\u8089\u6e90\u5206\u985e\u7be9\u9078"} className="flex flex-nowrap gap-2 overflow-x-auto pb-2 pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {INGREDIENT_FILTERS.map(([slug, zh, ja, en]) => {
            const active = (ingredientFilter ?? "all") === slug;
            return <CategoryNavLink key={slug} href={`/menu?audience=${audienceFilter}&category=treats&ingredient=${slug}`} className={`relative inline-flex shrink-0 items-center whitespace-nowrap px-3 py-2 text-sm transition ${active ? "font-semibold text-[color:var(--ink)] after:absolute after:-bottom-1 after:left-1/2 after:h-0 after:w-0 after:-translate-x-1/2 after:border-x-[6px] after:border-t-[6px] after:border-x-transparent after:border-t-[color:var(--ink)]" : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"}`}>
              {locale === "en" ? en : locale === "zh" ? zh : ja}
            </CategoryNavLink>;
          })}
        </nav>
      </div> : null}
      {products.length === 0 ? (
        <div className="flex flex-col items-start gap-3 py-6">
          <p className="text-sm text-[color:var(--muted)]">{t("menuEmpty")}</p>
          <CategoryNavLink
            href={audienceFilter ? `/menu?audience=${audienceFilter}${productCategory ? `&category=${productCategory}` : ""}` : "/menu"}
            className="inline-flex rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)]"
          >
            {locale === "en" ? "Clear ingredient filter" : "\u6e05\u9664\u7be9\u9078，\u8fd4\u56de\u5168\u90e8\u5546\u54c1"}
          </CategoryNavLink>
        </div>
      ) : (
        <>
          <ul id="products" className="scroll-mt-24 grid grid-cols-2 items-stretch gap-3 pb-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
        {visibleProducts.map((product, index) => {
              return (
                <li key={product.id} className="min-w-0">
                  <ProductCard product={product} priority={index < 4} />
                </li>
              );
            })}
          </ul>

          <nav
            className="mt-6 flex flex-wrap items-center justify-center gap-1.5"
            aria-label={t("productPaginationLabel")}
          >
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              aria-label={t("productPaginationPrevious")}
              className="rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm transition hover:bg-[color:var(--surface)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("productPaginationPrevious")}
            </button>
            {getPageNumbers(safeCurrentPage, pageCount).map((page, index) =>
              page === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="px-1 text-sm text-[color:var(--muted)]" aria-hidden="true">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  aria-current={page === safeCurrentPage ? "page" : undefined}
                  aria-label={t("productPaginationPage").replace("{page}", String(page))}
                  className={`min-w-9 rounded-lg px-3 py-2 text-sm transition ${
                    page === safeCurrentPage
                      ? "bg-[color:var(--ink)] text-white"
                      : "border border-[color:var(--line)] hover:bg-[color:var(--surface)]"
                  }`}
                >
                  {page}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage === pageCount}
              aria-label={t("productPaginationNext")}
              className="rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm transition hover:bg-[color:var(--surface)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("productPaginationNext")}
            </button>
          </nav>
          <BrandServiceStrip placement="catalog-bottom" />
        </>
      )}
    </div>
  );
}
