"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { type Product, uniqueProductsById } from "@/lib/products";
import { type StoreCategory } from "@/lib/store-categories";

type CatalogContextValue = {
  products: Product[];
  categories: StoreCategory[];
  getProductById: (id: string | null | undefined) => Product | null;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({
  products,
  categories,
  children,
}: {
  products: Product[];
  categories: StoreCategory[];
  children: ReactNode;
}) {
  const value = useMemo<CatalogContextValue>(() => {
    const uniqueProducts = uniqueProductsById(products);
    const byId = new Map(uniqueProducts.map((product) => [product.id, product]));
    return {
      products: uniqueProducts,
      categories,
      getProductById: (id) => (id ? byId.get(id) ?? null : null),
    };
  }, [products, categories]);

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext);
  if (!context) {
    return {
      products: [],
      categories: [],
      getProductById: () => null,
    };
  }
  return context;
}
