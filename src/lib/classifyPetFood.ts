/**
 * Keyword-based pet food zone classifier.
 *
 * Collection folders follow「有舊用舊，冇舊先開新」:
 *   WT: 貓罐罐 · 乾糧 · 冷凍脫水系列 · 貓貓小食 · 狗狗小食
 *   New: 狗狗食品 (no WT equivalent)
 *
 * Rules (name / description / tags / specs / productType / id):
 * 1. Freeze-dried + 狗狗／狗用 → dogs / 冷凍脫水系列 (same WT folder, dog SKUs)
 * 2. Freeze-dried + 貓貓／貓用 (or unmarked freeze series) → cats / 冷凍脫水系列
 * 3. Non-freeze 狗狗／狗用 snacks → dogs / 狗狗小食
 * 4. Non-freeze 貓貓／貓用 snacks → cats / 貓貓小食
 * 5. Dog staple food → dogs / 狗狗食品 (new folder)
 * 6. Toys / gear / health keep their shelves even if title says「狗狗」
 */

export type FoodZoneSubcategory =
  | "貓罐罐"
  | "貓乾糧"
  | "貓貓小食"
  | "冷凍脫水系列"
  | "狗狗食品"
  | "狗狗小食";

export type ClassifiableProduct = {
  id: string;
  categorySlug: string;
  subcategory?: FoodZoneSubcategory | string;
  icon?: string;
  name: { zh: string; en: string };
  description?: { zh: string; en: string };
  specs?: { zh: string; en: string }[];
  tags?: string[];
  productType?: string;
};

/** Species / audience marks in titles, blurbs, and tags. */
const DOG_MARK = /狗狗|狗用|狗零食|狗肉乾|(?<!貓)狗糧|\bdog\b/i;
const CAT_MARK = /貓貓|貓用|貓咪|\bcat\b/i;
/** Shared cat+dog SKUs stay in their marketing / snacks shelf. */
const SHARED_MARK =
  /貓狗|貓與狗|cats?\s*[&＋+]\s*dogs?|cat\s*&\s*dog|for cats?\s*(&|and)\s*dogs?/i;
const FREEZE_MARK =
  /冷凍脫水|凍乾|freeze[\s-]?dried|freeze[\s-]?dry/i;
const SNACK_MARK =
  /小食|零食|肉乾|潔牙骨|treat|jerky|chew(?!\s*toy)|餅乾|脆片|點心|獎勵零食|snack|夾心餅|帆立貝乾/i;
const STAPLE_FOOD_MARK =
  /(?<!貓)狗糧|主糧|(?<!貓)乾糧|食品(?!級)|kibble|dog\s*food|staple/i;
/** Cat staple / wet-food marks — must not be swept into 貓貓小食. */
const CAT_STAPLE_MARK = /貓罐罐|貓乾糧|濕糧|乾糧|主糧|鮮肉杯|罐罐|lacto|kibble|staple|wet\s*food|dry\s*food/i;
/** Curated WT food folders that should keep their collection key. */
const CURATED_CAT_COLLECTIONS = new Set([
  "貓罐罐",
  "貓乾糧",
  "冷凍脫水系列",
]);
const CURATED_DOG_COLLECTIONS = new Set([
  "狗狗食品",
  "狗狗小食",
  "冷凍脫水系列",
]);
/** Non-food categories that must not be swallowed into food zones. */
const NON_FOOD_CATEGORY = new Set([
  "toys",
  "health",
  "cleaning",
  "outdoor",
]);
const NON_FOOD_TEXT =
  /玩具|toy|雨衣|大衣|尿墊|頸帶|胸背|飯碗|推車|牽引|座墊|發光|漱口水|營養油|保健|清潔|貓砂|litter|harness|coat|pad|carrier|stroller|leash|collar|跳台|抓板/i;

export type FoodZoneHint = {
  categorySlug: "cats" | "dogs";
  subcategory: FoodZoneSubcategory;
  /** Why the classifier chose this zone (zh). */
  reason: string;
  /** Suggested collection / tag labels. */
  tags: string[];
};

function collectText(product: ClassifiableProduct): string {
  const bits = [
    product.id,
    product.name.zh,
    product.name.en,
    product.description?.zh,
    product.description?.en,
    product.subcategory,
    product.categorySlug,
    product.productType,
    ...(product.tags ?? []),
    ...(product.specs ?? []).flatMap((s) => [s.zh, s.en]),
  ];
  return bits.filter(Boolean).join("\n");
}

function isNonFoodSku(product: ClassifiableProduct, text: string): boolean {
  if (NON_FOOD_CATEGORY.has(product.categorySlug)) return true;
  if (NON_FOOD_TEXT.test(text)) return true;
  if (/胸背帶|harness/i.test(text) && !SNACK_MARK.test(text)) return true;
  return false;
}

/**
 * Infer the cat/dog food zone from product copy and tags.
 * Returns `null` when the SKU is outside the food-zone rules
 * (toys, apparel, shared snacks, etc.).
 */
export function inferFoodZone(
  product: ClassifiableProduct,
): FoodZoneHint | null {
  const text = collectText(product);
  const hasDog = DOG_MARK.test(text);
  const hasCat = CAT_MARK.test(text);
  const hasShared = SHARED_MARK.test(text);
  const hasFreeze = FREEZE_MARK.test(text);
  const hasSnack = SNACK_MARK.test(text);
  const hasStaple = STAPLE_FOOD_MARK.test(text);

  // Shared cat+dog food/treat deals stay on their original shelf (deals/snacks).
  if (hasShared && !hasFreeze) {
    return null;
  }

  // ——— Freeze-dried series ———
  if (hasFreeze) {
    if (hasDog && !hasCat) {
      return {
        categorySlug: "dogs",
        subcategory: "冷凍脫水系列",
        reason: "冷凍脫水系列 + 狗狗／狗用 → dogs/freeze-dried（沿用舊 Collection）",
        tags: ["冷凍脫水系列", "狗狗小食", "狗用"],
      };
    }
    return {
      categorySlug: "cats",
      subcategory: "冷凍脫水系列",
      reason: hasCat
        ? "冷凍脫水系列 + 貓貓／貓用 → cats/freeze-dried（沿用舊 Collection）"
        : "冷凍脫水系列未標狗用 → 預設貓貓專區（沿用舊 Collection）",
      tags: ["冷凍脫水系列", "貓貓小食", "貓用"],
    };
  }

  // Keep curated WT can / dry folders — never overwrite with 貓貓小食.
  if (
    product.subcategory &&
    CURATED_CAT_COLLECTIONS.has(product.subcategory) &&
    product.subcategory !== "冷凍脫水系列"
  ) {
    return {
      categorySlug: "cats",
      subcategory: product.subcategory as FoodZoneSubcategory,
      reason: `保留舊 Collection「${product.subcategory}」`,
      tags: [product.subcategory],
    };
  }

  // Keep curated dog food-zone folders when already stamped.
  if (
    product.subcategory &&
    CURATED_DOG_COLLECTIONS.has(product.subcategory) &&
    product.categorySlug === "dogs" &&
    product.subcategory !== "冷凍脫水系列"
  ) {
    return {
      categorySlug: "dogs",
      subcategory: product.subcategory as FoodZoneSubcategory,
      reason: `保留 Collection「${product.subcategory}」`,
      tags: [product.subcategory],
    };
  }

  // ——— Dog snacks / staple ———
  if (hasDog && !isNonFoodSku(product, text)) {
    if (hasSnack || (!hasStaple && /禮盒|gift|組合/i.test(text))) {
      return {
        categorySlug: "dogs",
        subcategory: "狗狗小食",
        reason: "狗狗／狗用小食 → 狗狗小食（沿用舊 Collection）",
        tags: ["狗狗小食", "狗用"],
      };
    }
    if (
      hasStaple ||
      product.categorySlug === "dogs" ||
      product.categorySlug === "snacks" ||
      product.categorySlug === "bestsellers" ||
      product.categorySlug === "deals"
    ) {
      return {
        categorySlug: "dogs",
        subcategory: "狗狗食品",
        reason: "狗狗主糧／食品 → 狗狗食品（新建資料夾）",
        tags: ["狗狗食品", "狗用"],
      };
    }
  }

  if (
    product.categorySlug === "dogs" &&
    hasStaple &&
    !isNonFoodSku(product, text)
  ) {
    return {
      categorySlug: "dogs",
      subcategory: "狗狗食品",
      reason: "狗糧／主糧 → 狗狗食品（新建資料夾）",
      tags: ["狗狗食品"],
    };
  }

  // ——— Cat snacks (貓貓小食) ———
  // Only from the snacks shelf or explicit 貓貓小食 tags — never cans / dry food.
  const explicitCatSnack =
    product.productType === "貓貓小食" ||
    (product.tags ?? []).includes("貓貓小食") ||
    product.subcategory === "貓貓小食";
  if (
    hasCat &&
    !hasDog &&
    !CAT_STAPLE_MARK.test(text) &&
    !isNonFoodSku(product, text) &&
    (explicitCatSnack ||
      (hasSnack && product.categorySlug === "snacks") ||
      (hasSnack &&
        explicitCatSnack === false &&
        product.categorySlug === "cats" &&
        !product.subcategory))
  ) {
    return {
      categorySlug: "cats",
      subcategory: "貓貓小食",
      reason: "貓貓／貓用小食 → 貓貓小食（沿用舊 Collection）",
      tags: ["貓貓小食", "貓用"],
    };
  }

  return null;
}

/** Merge inferred food-zone category / subcategory onto a product. */
export function applyFoodZoneClassification<T extends ClassifiableProduct>(
  product: T,
): T {
  const hint = inferFoodZone(product);
  if (!hint) return product;

  return {
    ...product,
    categorySlug: hint.categorySlug,
    subcategory: hint.subcategory,
    ...(product.icon !== undefined
      ? {
          icon:
            hint.categorySlug === "cats"
              ? "cat"
              : hint.categorySlug === "dogs" &&
                  (product.icon === "bone" || product.icon === "fire")
                ? "dog"
                : product.icon,
        }
      : {}),
  };
}

/** Apply classification across a catalog list. */
export function classifyCatalogProducts<T extends ClassifiableProduct>(
  products: T[],
): T[] {
  return products.map(applyFoodZoneClassification);
}

/** Audit helper: list products whose stored zone disagrees with keywords. */
export function findFoodZoneMismatches<T extends ClassifiableProduct>(
  products: T[],
): Array<{
  id: string;
  current: string;
  expected: string;
  reason: string;
}> {
  const out: Array<{
    id: string;
    current: string;
    expected: string;
    reason: string;
  }> = [];
  for (const product of products) {
    const hint = inferFoodZone(product);
    if (!hint) continue;
    const current = `${product.categorySlug}/${product.subcategory ?? "-"}`;
    const expected = `${hint.categorySlug}/${hint.subcategory}`;
    if (current !== expected) {
      out.push({
        id: product.id,
        current,
        expected,
        reason: hint.reason,
      });
    }
  }
  return out;
}
