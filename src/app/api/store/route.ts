import { NextResponse } from "next/server";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { flattenCategoryTree } from "@/lib/store-categories";

export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  const catalog = await getCatalogSnapshot();
  return NextResponse.json({
    configured: true,
    degraded: false,
    categories: catalog.categories,
    categoryTree: catalog.categories,
    categoryList: flattenCategoryTree(catalog.categories),
    products: catalog.products,
    banners: [],
    settings: {},
  }, {
    status: 200,
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
