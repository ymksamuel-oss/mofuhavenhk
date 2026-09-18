"use client";

import { useEffect, useRef, useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { ProductImage } from "@/components/product/ProductImage";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getProductsByCategory, productHref, resolveCategorySubSlug } from "@/lib/products";
import { findCategoryBySlug } from "@/lib/store-categories";
import { getLocalizedProductDescription, getLocalizedProductName } from "@/lib/translateProductName";
import { BrandServiceStrip } from "@/components/BrandServiceStrip";

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
  productCategory?: "treats" | "supplies" | null;
};

const INGREDIENT_FILTERS = [
  ["chicken", "雞肉", "鶏 chicken", "Chicken"],
  ["duck", "鴨肉", "鴨 duck", "Duck"],
  ["beef", "牛肉", "牛 cow", "Beef"],
  ["pork", "豬肉", "豚 pig", "Pork"],
  ["boar", "野豬肉", "猪 boar", "Boar"],
  ["kangaroo", "袋鼠肉", "カンガルー kangaroo", "Kangaroo"],
  ["deer", "鹿肉", "鹿 deer", "Venison"],
  ["horse", "馬肉", "馬 horse", "Horse"],
  ["sheep", "羊肉", "羊 sheep", "Lamb"],
  ["roll", "肉類卷製", "巻き roll", "Roll"],
  ["chips-jerky", "肉片・肉乾", "ちっぷすジャーキー", "Chips & jerky"],
  ["seafood", "魚介海鮮", "魚介 seafood", "Seafood"],
  ["produce", "蔬菜・水果", "野菜・果物", "Vegetables & fruits"],
  ["snacks", "零食", "おかし snacks", "Snacks"],
  ["dairy", "乳製品", "乳製品 dairy", "Dairy"],
  ["seasoning", "拌飯粉・撒料", "ふりかけ seasoning", "Seasoning"],
  ["side-dish", "熟食配菜", "お惣菜 side dish", "Side dish"],
  ["frozen", "冷凍食品", "冷凍 frozen", "Frozen"],
  ["food", "主食・飯", "ごはん food", "Food"],
] as const;

const AUDIENCE_FILTERS = [
  ["dog", "狗狗專區", "犬用", "For dogs"],
  ["cat", "貓貓專區", "猫用", "For cats"],
] as const;

function productFilterText(product: { name: { zh: string; en: string }; description?: { zh: string; en: string }; tags?: string[]; metadata?: Record<string, string> }) {
  return [product.name.zh, product.name.en, product.description?.zh, product.description?.en, ...(product.tags ?? []), ...Object.values(product.metadata ?? {})].filter(Boolean).join(" ").toLowerCase();
}

function isFoodProduct(product: Parameters<typeof productFilterText>[0]) {
  const text = productFilterText(product);
  return !/用品|胸背帶|牽引帶|項圈|玩具|貓砂|砂盆|尿墊|食器|餵食器|grooming|harness|leash|collar|toy|litter|pad|bowl|supply/i.test(text) &&
    /supplier_category:(?:chicken|duck|beef|pork|boar|kangaroo|deer|horse|sheep|roll|chips-jerky|seafood|produce|snacks|dairy|seasoning|side-dish|frozen|food)|食品|食物|小食|零食|乾糧|罐頭|凍乾|肉泥|肉片|肉乾|肉條|肉粒|鹿肉|紫薯|おやつ|フード|トリーツ|food|treat|snack|jerky|kibble|canned|sweet\s*potato/i.test(text);
}

function isSupplyProduct(product: Parameters<typeof productFilterText>[0]) {
  return /supplies|用品|collar|harness|leash|lead|胸背帶|胸背|項圈|頸圈|牽引繩|牽引帶|散步|日常用品/i.test(productFilterText(product));
}

function matchesIngredient(product: Parameters<typeof productFilterText>[0], filter: string | null) {
  if (!filter || filter === "all") return true;
  const text = productFilterText(product);
  const patterns: Record<string, RegExp> = {
    food: /ごはん|乾糧|主食|飯|food|kibble|rice/i,
    frozen: /冷凍|冷藏|frozen/i,
    "side-dish": /お惣菜|熟食|side\s*dish|配菜/i,
    seasoning: /ふりかけ|拌飯|拌糧|撒料|seasoning/i,
    dairy: /乳製品|チーズ|cheese|奶|乳酪|dairy/i,
    snacks: /おかし|おやつ|零食|小食|餅乾|snack/i,
    "chips-jerky": /ちっぷす|チップ|ジャーキー|chips|jerky|肉乾|肉片/i,
    roll: /巻き|卷|捲|roll/i,
    kangaroo: /カンガルー|kangaroo|袋鼠/i,
    duck: /鴨|鴨肉|duck|カモ/i,
    boar: /猪|野豬|boar/i,
    seafood: /深海海鮮|魚介|魚|まぐろ|マグロ|かつお|鰹|きびなご|わかさぎ|たら|鱈|鮭|鯛|鯵|鯖|鱧|うなぎ|帆立|白子|seafood|fish|tuna|bonito/i,
    deer: /低敏鹿肉|鹿肉|鹿|ベニソン|venison|deer/i,
    horse: /低敏馬肉|馬肉|馬|horse/i,
    chicken: /純天然雞肉|雞胸肉|雞肉|鶏|チキン|ささみ|chicken/i,
    beef: /嚴選牛肉|牛肉|牛|ビーフ|beef/i,
    pork: /豬肉|豚|ポーク|pork/i,
    sheep: /羊肉|羊|ラム|sheep|lamb/i,
    produce: /蔬菜|水果|野菜|フルーツ|果物|vegetable|fruit|produce/i,
  };
  return patterns[filter]?.test(text) ?? false;
}

function matchesAudience(product: Parameters<typeof productFilterText>[0], filter: string | null) {
  if (!filter) return true;
  const text = productFilterText(product);
  const isCatOnly = /貓專用|猫用|貓用|貓貓|猫の|ねこ|ネコ|for cats?|\bcats?\b|cat[-_ ]?only|audience:cat/i.test(text);
  const isDogOnly = /狗專用|狗狗|犬用|犬|狗具|for dogs?|\bdogs?\b|dog[-_ ]?(?:only|treat|food|snack|product)/i.test(text);
  const isShared = /貓狗兼用|貓犬兼用|all[_ -]?pets|犬猫兼用|cats?\s*(?:and|&)\s*dogs?/i.test(text);
  if (filter === "cat") return !isDogOnly || isShared ? (isCatOnly || isShared) : false;
  if (filter === "dog") return !isCatOnly || isShared ? (isDogOnly || isShared) : false;
  return !/貓專用|猫用|貓用|貓貓|狗專用|狗狗|犬用|狗具|for cats?|for dogs?|cat[-_ ]?(?:only|treat|food|snack|product)|dog[-_ ]?(?:only|treat|food|snack|product)/i.test(text);
}

function isCatZoneProduct(product: { name: { zh: string; en: string }; description?: { zh: string; en: string }; tags?: string[]; metadata?: Record<string, string> }) {
  const text = [product.name.zh, product.name.en, product.description?.zh, product.description?.en, ...(product.tags ?? []), ...Object.values(product.metadata ?? {})].filter(Boolean).join(" ").toLowerCase();
  return /貓|猫|cat|にぼし|まぐろ|マグロ|かつお|鰹|きびなご|ひめたら|わかさぎ|魚|fish|tuna|bonito|鱈|鹿肉|馬肉|鹿|馬|venison|horse/.test(text);
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
  const dedicatedCategoryFallback = categorySlug === "dogs"
    ? catalogProducts.filter((product) => matchesAudience(product, "dog") && isFoodProduct(product))
    : categorySlug === "cats"
      ? catalogProducts.filter((product) => matchesAudience(product, "cat"))
      : categorySlug === "supplies"
        ? catalogProducts.filter(isSupplyProduct)
        : [];
  // A category route must never fall back to the complete catalog. When the
  // child slug is recognised, match the resolved database subcategory exactly;
  // an unrecognised child route is deliberately empty rather than overbroad.
  const productsByRoute = typeof subcategory === "string"
    ? liveChildCategory
      ? productsInCategory.filter((product) => product.categoryId === liveChildCategory.id)
      : selectedSubcategory
        ? productsInCategory.filter((product) => product.subcategory === selectedSubcategory)
      : []
    : productsInCategory.length > 0 ? productsInCategory : dedicatedCategoryFallback;
  const isDedicatedCategoryPage = Boolean(categorySlug) && subcategory == null;
  const foodCategorySelected = productCategory === "treats";
  const suppliesCategorySelected = productCategory === "supplies";
  const ingredientEnabled = (foodCategorySelected && (audienceFilter === "dog" || audienceFilter === "cat"))
    || (categorySlug === "dogs" && isDedicatedCategoryPage);
  const products = productsByRoute.filter((product) =>
    (specialFilter !== "cat-zone" || isCatZoneProduct(product)) &&
    (categorySlug !== "dogs" || (matchesAudience(product, "dog") && isFoodProduct(product) && !isSupplyProduct(product))) &&
    (categorySlug !== "supplies" || isSupplyProduct(product)) &&
    (!suppliesCategorySelected || isSupplyProduct(product)) &&
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

  const title = categorySlug === "dogs"
    ? (locale === "en" ? "For Dogs" : "狗狗專區")
    : categorySlug === "cats" || specialFilter === "cat-zone"
      ? (locale === "en" ? "For Cats" : "貓咪專區")
      : categorySlug === "supplies"
        ? (locale === "en" ? "Pet Supplies" : "寵物用品")
        : t("menuTitle");
  return (
    <div className="mx-auto max-w-5xl px-4 pb-14 pt-8 sm:px-6 sm:py-12">
      <h1 className={`font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--ink)] ${isDedicatedCategoryPage ? "mb-6" : "sr-only"}`}>{title}</h1>
      {categorySlug === "dogs" && isDedicatedCategoryPage ? <div className="relative mb-7 px-8">
        <button type="button" aria-label={locale === "en" ? "Scroll ingredients left" : "向左滑動分類"} onClick={() => scrollIngredients(-1)} className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[color:var(--line)] bg-white px-2 py-1 text-lg leading-none text-[color:var(--ink)] shadow-sm">‹</button>
        <nav ref={ingredientScrollerRef} aria-label={locale === "en" ? "Dog food ingredients" : "狗狗肉類食材"} className="scroll-smooth flex flex-nowrap touch-pan-x gap-2 overflow-x-auto whitespace-nowrap border-b border-[color:var(--line)] pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ WebkitOverflowScrolling: "touch" }}>
          {INGREDIENT_FILTERS.map(([slug, zh, , en]) => {
            const active = (ingredientFilter ?? "chicken") === slug;
            const href = `/categories/dogs?ingredient=${slug}`;
            return <CategoryNavLink key={slug} href={href} className={`relative inline-flex shrink-0 items-center whitespace-nowrap rounded-xl border px-3.5 py-2 text-sm transition ${active ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] font-semibold text-[color:var(--ink)] after:absolute after:-bottom-[7px] after:left-1/2 after:h-0 after:w-0 after:-translate-x-1/2 after:border-x-[6px] after:border-t-[6px] after:border-x-transparent after:border-t-[color:var(--accent)]" : "border-[color:var(--line)] bg-white text-[color:var(--muted)] hover:bg-[color:var(--accent-soft)]"}`}>
              {locale === "en" ? en : zh}
            </CategoryNavLink>;
          })}
        </nav>
        <button type="button" aria-label={locale === "en" ? "Scroll ingredients right" : "向右滑動分類"} onClick={() => scrollIngredients(1)} className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[color:var(--line)] bg-white px-2 py-1 text-lg leading-none text-[color:var(--ink)] shadow-sm">›</button>
      </div> : null}
      {!isDedicatedCategoryPage ? <nav aria-label={locale === "en" ? "Audience" : "對象分類"} className="mb-5 flex gap-8 border-b border-[color:var(--line)] px-1">
        {AUDIENCE_FILTERS.map(([slug, zh, ja, en]) => {
          const href = `/menu?audience=${slug}${productCategory ? `&category=${productCategory}` : ""}`;
          const active = audienceFilter === slug;
          return <CategoryNavLink key={slug} href={href} className={`relative shrink-0 pb-3 text-lg transition ${active ? "font-bold text-[color:var(--ink)] after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[color:var(--ink)]" : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"}`}>
            {locale === "en" ? en : locale === "zh" ? zh : ja}
          </CategoryNavLink>;
        })}
      </nav> : null}
      {!isDedicatedCategoryPage ? <nav aria-label={locale === "en" ? "Product categories" : "商品類別"} className="mb-3 flex gap-7 border-b border-[color:var(--line)] px-1">
        {["treats", "supplies"].map((slug) => {
          const active = productCategory === slug;
          const href = `/menu?category=${slug}${audienceFilter ? `&audience=${audienceFilter}` : ""}`;
          return <CategoryNavLink key={slug} href={href} className={`relative shrink-0 pb-2.5 text-sm transition ${active ? "font-semibold text-[color:var(--ink)] after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[color:var(--accent)]" : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"}`}>
            {locale === "en" ? (slug === "treats" ? "Natural meat treats" : "Outdoors & daily supplies") : (slug === "treats" ? "天然肉食小食" : "外出及日常用品")}
          </CategoryNavLink>;
        })}
      </nav> : null}
      {!isDedicatedCategoryPage && ingredientEnabled ? <div className="relative mb-5">
        <nav aria-label={locale === "en" ? "Ingredient filters" : "肉源分類篩選"} className="flex flex-nowrap gap-2 overflow-x-auto pb-2 pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
            {locale === "en" ? "Clear ingredient filter" : "清除篩選，返回全部商品"}
          </CategoryNavLink>
        </div>
      ) : (
        <>
          <ul id="products" className="scroll-mt-24 grid grid-cols-2 items-stretch gap-4 pb-2 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {visibleProducts.map((product, index) => {
              const href = productHref(product.id);
              // The URL is resolved inside this map iteration from the
              // verified Supabase `images` array, so every card is independent.
              const imageUrl = product.images?.[0] ?? "catalog-placeholder";
              const localizedName = getLocalizedProductName(product, locale);
              const localizedDescription = getLocalizedProductDescription(product, locale);
              return (
                <li key={product.id} className="min-w-0">
                  <CategoryNavLink
                    href={href}
                    aria-label={`${t("productViewDetails")}: ${localizedName}`}
                    className="milk-tea-card group flex h-full min-w-0 flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgba(43,38,35,0.3)]"
                  >
                    <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[color:var(--product-image-surface)]">
                      <ProductImage
                        key={`${product.id}-${imageUrl}`}
                        src={imageUrl}
                        alt={localizedName}
                        priority={index < 4}
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                        className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:p-4">
                      <h2 className="line-clamp-2 min-w-0 break-words text-left text-sm font-semibold leading-6 text-[color:var(--ink)] transition-colors group-hover:text-[color:var(--accent)]">
                        {localizedName}
                      </h2>
                      {localizedDescription ? <p className="line-clamp-2 text-xs leading-5 text-[color:var(--muted)]">{localizedDescription}</p> : null}
                    </div>
                  </CategoryNavLink>
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
