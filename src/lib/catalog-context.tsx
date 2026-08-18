"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { type Product, uniqueProductsById } from "@/lib/products";

type CatalogContextValue = {
  products: Product[];
  getProductById: (id: string | null | undefined) => Product | null;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({
  products,
  children,
}: {
  products: Product[];
  children: ReactNode;
}) {
  const value = useMemo<CatalogContextValue>(() => {
    const uniqueProducts = uniqueProductsById(products);
    const byId = new Map(uniqueProducts.map((product) => [product.id, product]));
    return {
      products: uniqueProducts,
      getProductById: (id) => (id ? byId.get(id) ?? null : null),
    };
  }, [products]);

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used within CatalogProvider");
  }
  return context;
}
