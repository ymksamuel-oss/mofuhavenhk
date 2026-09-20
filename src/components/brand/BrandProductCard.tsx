"use client";

import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/products";

export function BrandProductCard({ product }: { product: Product }) {
  return <ProductCard product={product} />;
}
