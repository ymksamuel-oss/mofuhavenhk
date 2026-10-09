"use client";

import { useEffect, useRef, useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { ProductCard } from "@/components/product/ProductCard";
import { BulkBundleCard } from "@/components/menu/BulkBundleCard";
import { Pagination } from "@/components/Pagination";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getProductsByCategory, resolveCategorySubSlug, type Product } from "@/lib/products";
import { findCategoryBySlug } from "@/lib/store-categories";
import { BrandServiceStrip } from "@/components/BrandServiceStrip";
import { getCollection, getCollectionDescription, getCollectionLabel, getCollectionProducts } from "@/lib/collections";
import { PetParadeSection, type PetParadeKind } from "@/components/home/HomePetParade";
import { getCategoryEditorialIntro } from "@/lib/seo/category-seo";
import { parseIngredientSelection, productMatchesIngredient, type IngredientKey } from "@/components/menu/IngredientFilterPanel";
import { ProteinPills } from "@/components/home/ProteinPills";
import { BrandHarmonyBanner } from "@/components/home/BrandHarmonyBanner";

const PAGE_SIZE = 12;
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
  return /\u8c93|\u732b|cat|にぼし|まぐろ|マグロ|かつお|\u9c39|きびなご|ひめたら|わかさぎ|\u9b5a|fish|tuna|bonito|\u9c48|\u9e7f\u8089|\u8766\u5937\u9e7f|\u9e7f\u808b\u6392|\u9e7f\u9aa8|\u9e7f\u89d2|\u99ac\u8089|\u99ac|venison|horse/.test(text);
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
  const [selectedIngredients, setSelectedIngredients] = useState<IngredientKey[]>(() => parseIngredientSelection(ingredientFilter));
  useEffect(() => {
    setSelectedIngredients(parseIngredientSelection(ingredientFilter));
  }, [ingredientFilter]);
  useEffect(() => {
    const handlePopState = () => {
      const ingredient = new URLSearchParams(window.location.search).get("ingredient");
      setSelectedIngredients(parseIngredientSelection(ingredient));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [categorySlug]);
  const updateIngredientSelection = (next: IngredientKey[]) => {
    const unique = Array.from(new Set(next));
    setSelectedIngredients(unique);
    const url = new URL(window.location.href);
    if (unique.length) url.searchParams.set("ingredient", unique.join(","));
    else url.searchParams.delete("ingredient");
    url.hash = "products";
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    requestAnimationFrame(() => document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const liveChildCategory = typeof subcategory === "string"
    ? findCategoryBySlug(categories, subcategory.trim().toLowerCase())
    : null;
  const selectedSubcategory = typeof subcategory === "string"
    ? resolveCategorySubSlug(categorySlug || "", subcategory.trim().toLowerCase())
    : null;
  const productsInCategory = getProductsByCategory(categorySlug, catalogProducts);
  const collection = collectionSlug ? getCollection(collectionSlug) : undefined;
  const isSpeciesCollection = collection?.slug === "dogs" || collection?.slug === "cats";
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
  const ingredientEnabled = isSpeciesCollection || (isDedicatedCategoryPage && (categorySlug === "dogs" || categorySlug === "cats"));
  const products = productsByRoute.filter((product) =>
    (!isSpeciesCollection || isFoodProduct(product)) &&
    (specialFilter !== "cat-zone" || isCatZoneProduct(product)) &&
    (categorySlug !== "dogs" || (matchesAudience(product, "dog") && isFoodProduct(product))) &&
    (categorySlug !== "cats" && specialFilter !== "cat-zone" || (matchesAudience(product, "cat") && isFoodProduct(product))) &&
    (!foodCategorySelected || isFoodProduct(product)) &&
    (!ingredientEnabled || productMatchesIngredient(product, selectedIngredients)) &&
    matchesAudience(product, audienceFilter),
  ).sort((left, right) => categorySlug === "dogs" ? Number(isFoodProduct(right)) - Number(isFoodProduct(left)) : 0);
  const bulkProductGroups = new Map<string, Product[]>();
  if (collection?.slug === "value-bundles") {
    for (const product of products) {
      const groupKey = product.metadata?.bulk_group;
      if (groupKey) bulkProductGroups.set(groupKey, [...(bulkProductGroups.get(groupKey) ?? []), product]);
    }
  }
  const pageProducts = collection?.slug === "value-bundles"
    ? Array.from(bulkProductGroups.values()).map((group) => group[0])
    : products;

  useEffect(() => {
    console.log("[catalog-filter]", {
      audience: audienceFilter ?? "all",
      category: productCategory ?? "all",
      ingredient: selectedIngredients.join(",") || "all",
      sourceCount: productsByRoute.length,
      matchedCount: products.length,
      matchedProducts: products.slice(0, 20).map((product) => ({
        id: product.id,
        name: product.name,
        tags: product.tags,
      })),
    });
  }, [audienceFilter, selectedIngredients, productCategory, products.length, productsByRoute.length]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = collection?.slug === "value-bundles" ? 15 : PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(pageProducts.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const visibleProducts = pageProducts.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categorySlug, subcategory, audienceFilter, productCategory, selectedIngredients]);

  const didMountPageRef = useRef(false);
  useEffect(() => {
    if (!didMountPageRef.current) {
      didMountPageRef.current = true;
      return;
    }
    const productSection = document.getElementById("products-section") || document.getElementById("products-grid");
    if (productSection) {
      productSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [safeCurrentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(pageCount, page)));
  };

  const title = collection?.slug === "value-bundles"
    ? (locale === "en" ? "Bulk-Buy Savings · Stock Up for Less" : "超市量販特惠專區・多包囤貨更划算")
    : collection
    ? getCollectionLabel(collection, locale)
    : categorySlug === "dogs"
    ? (locale === "en" ? "For Dogs" : "\u72d7\u72d7\u5c08\u5340")
    : categorySlug === "cats" || specialFilter === "cat-zone"
      ? (locale === "en" ? "For Cats" : "\u8c93\u54aa\u5c08\u5340")
      : t("menuTitle");
  const paradeKind = collection?.slug === "dogs" || collection?.slug === "cats" || collection?.slug === "value-bundles"
    ? collection.slug as PetParadeKind
    : null;
  const harmonyImage = collection?.slug === "dogs" || categorySlug === "dogs"
    ? { src: "/images/pet-companionship-dogs.jpg", zh: "金毛大狗與貓咪在家中溫柔相伴", en: "A golden retriever gently keeping a cat company at home" }
    : collection?.slug === "cats" || categorySlug === "cats" || specialFilter === "cat-zone"
      ? { src: "/images/pet-companionship-cats.jpg", zh: "狗狗與貓咪在柔軟寢具上親密相伴", en: "A cat and dogs sharing a tender moment on soft bedding" }
      : collection?.slug === "value-bundles"
        ? { src: "/images/pet-companionship-value-bundles.jpg", zh: "毛孩在溫暖日常中安心熟睡", en: "A pet sleeping peacefully in a warm everyday setting" }
        : null;
  const harmonyCopy = collection?.slug === "value-bundles"
    ? {
        title: { zh: "6／9／12包量販裝・多包囤貨更划算", en: "6-, 9- and 12-pack bulk savings" },
        description: { zh: "精選 15 款人氣日本原肉零食，全單滿 HK$399 享順豐免運直送。", en: "15 popular Japanese meat treats with free SF Express delivery on orders of HK$399 or more." },
        primaryCta: { zh: "🛒 選購量販特惠", en: "🛒 Shop bulk packs" },
        primaryHref: "/collections/value-bundles",
      }
    : undefined;
  return (
    <div className="mx-auto max-w-5xl px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-10">
      <div className={isCollectionPage ? "mb-7" : ""}>
        <h1 className={`font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--ink)] ${isDedicatedCategoryPage || isCollectionPage ? "" : "sr-only"}`}>{title}</h1>
        {isDedicatedCategoryPage ? <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">{getCategoryEditorialIntro(locale, categorySlug ?? "")}</p> : null}
        {collection ? <>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">{collection.slug === "value-bundles"
            ? (locale === "en" ? "15 best-loved Japanese meat treats in 6-, 9- and 12-pack bulk specials. Enjoy free SF Express delivery on orders of HK$399 or more." : "精選 15 款人氣日本原肉零食，6包／9包／12包特惠量販。全單滿 HK$399 享順豐免運直送。")
            : getCollectionDescription(collection)}</p>
        </> : null}
        {(isDedicatedCategoryPage && (categorySlug === "dogs" || categorySlug === "cats") || isSpeciesCollection) ? <ProteinPills audience={(categorySlug === "dogs" || collection?.slug === "dogs") ? "dogs" : "cats"} selected={selectedIngredients} onSelect={updateIngredientSelection} /> : null}
      </div>
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
      <div className="w-full">
      {products.length === 0 ? (
        <div className="flex flex-col items-start gap-3 py-6">
          <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-8 text-center">
            <p className="mt-3 text-sm font-semibold text-[color:var(--ink)]">{locale === "en" ? "This ingredient is being restocked from Japan." : "此食材商品正火速從日本補貨中"}</p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">{locale === "en" ? "Explore other delicious protein sources for now." : "先看看其他美味肉源吧！"}</p>
            <CategoryNavLink href="/menu" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#C86A2B] px-5 py-2.5 text-sm font-semibold text-white">{locale === "en" ? "Explore all products" : "探索全部商品"}</CategoryNavLink>
          </div>
        </div>
      ) : (
        <>
          <section id="products-section" className="min-h-0">
          <ul id="products" className="scroll-mt-24 grid w-full grid-cols-2 items-stretch gap-3.5 pb-2 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
        {visibleProducts.map((product, index) => {
              return (
                <li key={product.id} className="min-w-0">
                  {collection?.slug === "value-bundles" && product.metadata?.bulk_group
                    ? <BulkBundleCard products={bulkProductGroups.get(product.metadata.bulk_group) ?? [product]} priority={index < 4} />
                    : <ProductCard product={product} priority={index < 4} />}
                </li>
              );
            })}
          </ul>
          </section>

          <Pagination currentPage={safeCurrentPage} totalPages={pageCount} onPageChange={goToPage} className="mt-2" />
          <BrandServiceStrip placement="catalog-bottom" />
        </>
      )}
      </div>
      {paradeKind ? <PetParadeSection kind={paradeKind} products={catalogProducts} /> : null}
      <BrandHarmonyBanner
        imageSrc={harmonyImage?.src}
        imageAlt={harmonyImage ? { zh: harmonyImage.zh, en: harmonyImage.en } : undefined}
        title={harmonyCopy?.title}
        description={harmonyCopy?.description}
        primaryCta={harmonyCopy?.primaryCta}
        primaryHref={harmonyCopy?.primaryHref}
      />
    </div>
  );
}
