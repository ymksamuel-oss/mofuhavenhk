"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { categoryHref, isCategorySlug } from "@/lib/categories";

/**
 * Legacy `/menu?category=dogs` → `/categories/dogs`.
 * While redirecting, still render that category so the UI never blanks / freezes.
 */
function MenuRedirectOrCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const legacySlug =
    category && isCategorySlug(category) ? category : null;

  useEffect(() => {
    if (legacySlug) {
      router.replace(categoryHref(legacySlug));
    }
  }, [legacySlug, router]);

  return <ProductCatalog categorySlug={legacySlug} />;
}

export default function MenuPage() {
  return (
    <Suspense fallback={<ProductCatalog categorySlug={null} />}>
      <MenuRedirectOrCatalog />
    </Suspense>
  );
}
