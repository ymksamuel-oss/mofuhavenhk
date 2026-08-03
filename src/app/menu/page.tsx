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

  useEffect(() => {
    if (!legacySlug) return;
    document.body.style.overflow = "";
    window.location.replace(categoryHref(legacySlug));
  }, [legacySlug]);

  return <ProductCatalog categorySlug={legacySlug} />;
}

export default function MenuPage() {
  return (
    <Suspense fallback={<ProductCatalog categorySlug={null} />}>
      <MenuRedirectOrCatalog />
    </Suspense>
  );
}
