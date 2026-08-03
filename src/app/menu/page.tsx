"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { categoryHref, isCategorySlug } from "@/lib/categories";

/**
 * Legacy `/menu?category=dogs` → `/categories/dogs`.
 * `/menu` itself remains the full-catalog page.
 */
function MenuRedirectOrCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  useEffect(() => {
    if (category && isCategorySlug(category)) {
      router.replace(categoryHref(category));
    }
  }, [category, router]);

  if (category && isCategorySlug(category)) {
    return null;
  }

  return <ProductCatalog categorySlug={null} />;
}

export default function MenuPage() {
  return (
    <Suspense fallback={null}>
      <MenuRedirectOrCatalog />
    </Suspense>
  );
}
