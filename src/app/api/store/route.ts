import { NextResponse } from "next/server";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { flattenCategoryTree } from "@/lib/store-categories";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
