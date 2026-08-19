import { catalogHierarchy, type CatalogKey, type SubCatalogDefinition, type SubCatalogKey } from "./catalogHierarchy";

export type StorefrontCategory = CatalogKey;
export type StorefrontSubCategory = SubCatalogKey;

export type StorefrontCategoryItem = {
  slug: StorefrontCategory;
  label: string;
  desc: string;
  subCatalogs: readonly SubCatalogDefinition[];
};

export const storefrontCategories: StorefrontCategoryItem[] = catalogHierarchy.map((category) => ({
  slug: category.key,
  label: category.label,
  desc: category.description,
  subCatalogs: category.subCatalogs,
}));

export const storefrontCategorySlugs = storefrontCategories.map(({ slug }) => slug);
