"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { categoryHref, isCategorySlug } from "@/lib/categories";

/**
 * Legacy `/menu?category=dogs` → hard navigate to `/categories/dogs`.
 * Catalog stays visible until the browser completes the jump.
 */
function MenuRedirectOrCatalog() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const legacySlug =
    category && isCategorySlug(category) ? category : null;
  const catZone = category === "cat-zone";
  const ingredient = searchParams.get("ingredient");
  const audience = searchParams.get("audience");

  useEffect(() => {
    if (!legacySlug) return;
    document.body.style.overflow = "";
    window.location.replace(categoryHref(legacySlug));
  }, [legacySlug]);

  return <ProductCatalog categorySlug={legacySlug} subcategory={null} specialFilter={catZone ? "cat-zone" : null} ingredientFilter={ingredient} audienceFilter={audience} />;
}

export default function MenuPage() {
  return (
    <Suspense fallback={<ProductCatalog categorySlug={null} subcategory={null} specialFilter={null} ingredientFilter={null} audienceFilter={null} />}>
      <MenuRedirectOrCatalog />
    </Suspense>
  );
}
