import { canonicalCategorySlug, type CategoryIconName } from "@/lib/categories";

import type { TranslationKey } from "./i18n/translations";

export type StoreCategoryRow = {
  id: string;
  name: string;
  name_zh?: string | null;
  name_en?: string | null;
  slug: string;
  parent_id?: string | null;
  image_url?: string | null;
  sort_order?: number | null;
  description?: string | null;
  icon?: CategoryIconName | null;
};

export type StoreCategory = StoreCategoryRow & {
  parent_id: string | null;
  children: StoreCategory[];
};

const DEFAULT_ICON: CategoryIconName = "bone";

export function categoryDisplayName(
  category: StoreCategory,
  t: (key: TranslationKey) => string,
): string {
  const isChinese = t("langZh") === "中";
  const localized = isChinese ? category.name_zh : category.name_en;
  return localized?.trim() || category.name.trim();
}

const KNOWN_ICONS = new Set<CategoryIconName>([
  "cat", "dog", "bone", "health", "cleaning", "clock", "fire", "bag", "toy",
]);

export function categoryIconForSlug(slug: string): CategoryIconName {
  const normalized = canonicalCategorySlug(slug) ?? slug.trim().toLowerCase();
  if (normalized.includes("cat")) return "cat";
  if (normalized.includes("dog")) return "dog";
  if (/(toy|玩具)/.test(normalized)) return "toy";
  if (/(clean|清潔|除臭)/.test(normalized)) return "cleaning";
  if (/(health|護理|健康)/.test(normalized)) return "health";
  if (/(bed|home|lifestyle|outdoor|travel|house|sleep)/.test(normalized)) return "bag";
  return DEFAULT_ICON;
}

function asSortOrder(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function compareCategories(a: StoreCategory, b: StoreCategory): number {
  return asSortOrder(a.sort_order) - asSortOrder(b.sort_order)
    || a.name.localeCompare(b.name, "zh-Hant")
    || a.id.localeCompare(b.id);
}

/**
 * Normalizes database category rows and returns a forest. Invalid/self-referential
 * parent links safely fall back to top-level entries; cycles cannot recurse.
 */
export function buildCategoryTree(rows: readonly Partial<StoreCategoryRow>[]): StoreCategory[] {
  const nodes = new Map<string, StoreCategory>();

  for (const row of rows) {
    const id = String(row.id ?? "").trim();
    const name = String(row.name ?? "").trim();
    const rawSlug = String(row.slug ?? "").trim();
    const slug = canonicalCategorySlug(rawSlug) ?? rawSlug.toLowerCase();
    if (!id || !name || !slug || nodes.has(id)) continue;
    const requestedIcon = row.icon;
    nodes.set(id, {
      id,
      name,
      name_zh: row.name_zh ? String(row.name_zh).trim() : null,
      name_en: row.name_en ? String(row.name_en).trim() : null,
      slug,
      parent_id: row.parent_id ? String(row.parent_id) : null,
      image_url: row.image_url ? String(row.image_url) : null,
      description: row.description ? String(row.description) : null,
      sort_order: asSortOrder(row.sort_order),
      icon: requestedIcon && KNOWN_ICONS.has(requestedIcon) ? requestedIcon : categoryIconForSlug(slug),
      children: [],
    });
  }

  const roots: StoreCategory[] = [];
  for (const node of nodes.values()) {
    const parent = node.parent_id ? nodes.get(node.parent_id) : null;
    if (!parent || parent.id === node.id) {
      node.parent_id = null;
      roots.push(node);
      continue;
    }

    // A parent chain that reaches this node is cyclic and must not be attached.
    let cursor: StoreCategory | undefined = parent;
    const seen = new Set<string>([node.id]);
    let cyclic = false;
    while (cursor) {
      if (seen.has(cursor.id)) {
        cyclic = true;
        break;
      }
      seen.add(cursor.id);
      cursor = cursor.parent_id ? nodes.get(cursor.parent_id) : undefined;
    }
    if (cyclic) {
      node.parent_id = null;
      roots.push(node);
    } else {
      parent.children.push(node);
    }
  }

  const sortRecursively = (items: StoreCategory[]) => {
    items.sort(compareCategories);
    for (const item of items) sortRecursively(item.children);
  };
  sortRecursively(roots);
  return roots;
}

export function flattenCategoryTree(tree: readonly StoreCategory[]): StoreCategory[] {
  const result: StoreCategory[] = [];
  const visit = (nodes: readonly StoreCategory[]) => {
    for (const node of nodes) {
      result.push(node);
      visit(node.children);
    }
  };
  visit(tree);
  return result;
}

export function findCategoryBySlug(tree: readonly StoreCategory[], slug: string | null | undefined): StoreCategory | null {
  const normalized = canonicalCategorySlug(slug) ?? slug?.trim().toLowerCase();
  if (!normalized) return null;
  return flattenCategoryTree(tree).find((category) => category.slug === normalized) ?? null;
}

export function categoryDescendantIds(category: StoreCategory | null | undefined): Set<string> {
  const ids = new Set<string>();
  if (!category) return ids;
  const visit = (node: StoreCategory) => {
    ids.add(node.id);
    for (const child of node.children) visit(child);
  };
  visit(category);
  return ids;
}
