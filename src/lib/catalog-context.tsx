"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { type Product, uniqueProductsById } from "@/lib/products";
import { type StoreCategory } from "@/lib/store-categories";
import { type Brand } from "@/lib/brands";
import {
  EMPTY_PAYME_CHECKOUT_SETTINGS,
  type PayMeCheckoutSettings,
} from "@/lib/payme-checkout-settings";

type CatalogContextValue = {
  products: Product[];
  categories: StoreCategory[];
  brands: Brand[];
  payMe: PayMeCheckoutSettings;
  getProductById: (id: string | null | undefined) => Product | null;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({
  products,
  categories,
  brands = [],
  payMe = EMPTY_PAYME_CHECKOUT_SETTINGS,
  children,
}: {
  products: Product[];
  categories: StoreCategory[];
  brands?: Brand[];
  payMe?: PayMeCheckoutSettings;
  children: ReactNode;
}) {
  const value = useMemo<CatalogContextValue>(() => {
    const uniqueProducts = uniqueProductsById(products);
    const byId = new Map(uniqueProducts.map((product) => [product.id, product]));
    return {
      products: uniqueProducts,
      categories,
      brands,
      payMe,
      getProductById: (id) => (id ? byId.get(id) ?? null : null),
    };
  }, [products, categories, brands, payMe]);

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
      brands: [],
      payMe: EMPTY_PAYME_CHECKOUT_SETTINGS,
      getProductById: () => null,
    };
  }
  return context;
}
