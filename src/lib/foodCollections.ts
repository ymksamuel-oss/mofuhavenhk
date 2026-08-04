/**
 * Storefront food-zone collections — reuse WT Japan collection handles
 * when they already exist; only invent a new folder when there is no
 * matching upstream collection.
 *
 * Upstream inventory (https://www.wt-japan.com/collections.json):
 *   貓罐罐 · 乾糧 · 冷凍脫水系列 · 貓貓小食 · 狗狗小食 · …
 *
 * Mapping principle: 有舊嘅資料夾就直接用舊，冇舊嘅先開新。
 */

export type CollectionOrigin = "wt-japan" | "mofu-haven-new";

export type FoodCollectionDef = {
  /** Canonical Chinese collection / subcategory key used in product data. */
  key: string;
  /** Storefront parent category slug (`cats` | `dogs`). */
  parentSlug: "cats" | "dogs";
  /** URL path segment under `/categories/{parent}/{slug}`. */
  pathSlug: string;
  /** Upstream Shopify collection handle when reusing an old folder. */
  wtHandle?: string;
  origin: CollectionOrigin;
  note: string;
};

/**
 * Authoritative food-zone collection folders for cats & dogs.
 * Do not invent alternate names (e.g. 「凍乾零食」) when an old handle exists.
 */
export const FOOD_COLLECTIONS: FoodCollectionDef[] = [
  {
    key: "貓罐罐",
    parentSlug: "cats",
    pathSlug: "wet-cans",
    wtHandle: "貓罐罐",
    origin: "wt-japan",
    note: "Reuse WT 貓罐罐",
  },
  {
    key: "貓乾糧",
    parentSlug: "cats",
    pathSlug: "dry-food",
    wtHandle: "乾糧",
    origin: "wt-japan",
    note: "Reuse WT 乾糧 (storefront label 貓乾糧)",
  },
  {
    key: "貓貓小食",
    parentSlug: "cats",
    pathSlug: "snacks",
    wtHandle: "貓貓小食",
    origin: "wt-japan",
    note: "Reuse WT 貓貓小食 — non-freeze cat treats",
  },
  {
    key: "冷凍脫水系列",
    parentSlug: "cats",
    pathSlug: "freeze-dried",
    wtHandle: "冷凍脫水系列",
    origin: "wt-japan",
    note: "Reuse WT 冷凍脫水系列 — cat SKUs only (貓貓用／貓用)",
  },
  {
    key: "狗狗食品",
    parentSlug: "dogs",
    pathSlug: "food",
    origin: "mofu-haven-new",
    note: "No WT 狗狗食品 collection — new Mofu Haven folder for staple dog food",
  },
  {
    key: "狗狗小食",
    parentSlug: "dogs",
    pathSlug: "snacks",
    wtHandle: "狗狗小食",
    origin: "wt-japan",
    note: "Reuse WT 狗狗小食 — non-freeze dog treats",
  },
  {
    key: "冷凍脫水系列",
    parentSlug: "dogs",
    pathSlug: "freeze-dried",
    wtHandle: "冷凍脫水系列",
    origin: "wt-japan",
    note: "Reuse same WT 冷凍脫水系列 — dog SKUs only (狗狗用／狗用)",
  },
];

export function foodCollectionPath(
  parentSlug: "cats" | "dogs",
  key: string,
): string | null {
  const hit = FOOD_COLLECTIONS.find(
    (c) => c.parentSlug === parentSlug && c.key === key,
  );
  return hit ? `/categories/${hit.parentSlug}/${hit.pathSlug}` : null;
}
