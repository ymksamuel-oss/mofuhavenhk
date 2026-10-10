import "server-only";

import { revalidateTag } from "next/cache";
import { STOREFRONT_CATALOG_CACHE_TAG } from "@/lib/catalog-server";

/**
 * Call only after a successful catalog mutation. This expires the shared public
 * catalog cache immediately; affected ISR pages refresh when requested, rather
 * than triggering a regeneration loop or eagerly rebuilding every route.
 */
export function revalidateStorefrontCatalog() {
  revalidateTag(STOREFRONT_CATALOG_CACHE_TAG, { expire: 0 });
}
