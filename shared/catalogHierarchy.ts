export type CatalogKey = "cat" | "dog" | "small-pets";

export type SubCatalogKey =
  | "cat-wet-food"
  | "cat-dry-food"
  | "cat-litter"
  | "cat-treats"
  | "cat-supplies"
  | "dog-wet-food"
  | "dog-dry-food"
  | "dog-treats"
  | "dog-supplies"
  | "small-pet-food"
  | "small-pet-treats"
  | "small-pet-supplies";

export type CatalogDefinition = {
  key: CatalogKey;
  label: string;
  description: string;
  subCatalogs: readonly SubCatalogDefinition[];
};

export type SubCatalogDefinition = {
  key: SubCatalogKey;
  parentKey: CatalogKey;
  label: string;
};

export const catalogHierarchy: readonly CatalogDefinition[] = [
  {
    key: "cat",
    label: "貓咪商品",
    description: "為貓咪精心挑選",
    subCatalogs: [
      { key: "cat-wet-food", parentKey: "cat", label: "貓罐頭／濕糧" },
      { key: "cat-dry-food", parentKey: "cat", label: "乾糧／主食糧" },
      { key: "cat-litter", parentKey: "cat", label: "貓砂／清潔用品" },
      { key: "cat-treats", parentKey: "cat", label: "貓咪零食／凍乾" },
      { key: "cat-supplies", parentKey: "cat", label: "用品／玩具／保健" },
    ],
  },
  {
    key: "dog",
    label: "狗狗商品",
    description: "狗狗的日常好物",
    subCatalogs: [
      { key: "dog-wet-food", parentKey: "dog", label: "狗狗罐頭／濕糧" },
      { key: "dog-dry-food", parentKey: "dog", label: "乾糧／主食糧" },
      { key: "dog-treats", parentKey: "dog", label: "狗狗零食／骨頭" },
      { key: "dog-supplies", parentKey: "dog", label: "用品／玩具／保健" },
    ],
  },
  {
    key: "small-pets",
    label: "小寵物商品",
    description: "小動物的貼心照護",
    subCatalogs: [
      { key: "small-pet-food", parentKey: "small-pets", label: "主食／牧草" },
      { key: "small-pet-treats", parentKey: "small-pets", label: "零食／點心" },
      { key: "small-pet-supplies", parentKey: "small-pets", label: "墊材／用品" },
    ],
  },
] as const;

export const catalogKeys = catalogHierarchy.map(({ key }) => key) as CatalogKey[];
export const subCatalogKeys = catalogHierarchy.flatMap(({ subCatalogs }) => subCatalogs.map(({ key }) => key)) as SubCatalogKey[];

const catalogKeySet = new Set<string>(catalogKeys);
const subCatalogKeySet = new Set<string>(subCatalogKeys);

export function isCatalogKey(value: string | null | undefined): value is CatalogKey {
  return Boolean(value && catalogKeySet.has(value));
}

export function isSubCatalogKey(value: string | null | undefined): value is SubCatalogKey {
  return Boolean(value && subCatalogKeySet.has(value));
}

export function getCatalogDefinition(key: CatalogKey): CatalogDefinition {
  return catalogHierarchy.find((catalog) => catalog.key === key)!;
}

export function getSubCatalogDefinition(key: SubCatalogKey): SubCatalogDefinition {
  return catalogHierarchy.flatMap((catalog) => catalog.subCatalogs).find((subCatalog) => subCatalog.key === key)!;
}

export function getParentCatalogKey(filterKey: CatalogKey | SubCatalogKey): CatalogKey {
  if (isCatalogKey(filterKey)) return filterKey;
  return getSubCatalogDefinition(filterKey).parentKey;
}
