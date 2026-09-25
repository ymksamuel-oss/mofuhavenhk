import type { MetadataRoute } from "next";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { isStorefrontReadyProduct } from "@/lib/products";
import { COLLECTIONS } from "@/lib/collections";

const SITE_URL = "https://www.mofuhavenhk.com";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.95 },
    { url: `${SITE_URL}/categories/dogs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/categories/cats`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/knowledge`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/blog/dog-food-venison-benefits`, changeFrequency: "monthly", priority: 0.8 },
    ...["venison-benefits", "picky-eater-toppings", "can-cats-eat-dog-food", "hypoallergenic-red-meat", "soft-vs-hard-treats"].map((slug) => ({ url: `${SITE_URL}/blog/${slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
  const collectionRoutes: MetadataRoute.Sitemap = COLLECTIONS.map((collection) => ({
    url: `${SITE_URL}/collections/${collection.slug}`,
    changeFrequency: "weekly",
    priority: collection.slug === "value-bundles" ? 0.9 : 0.8,
  }));

  try {
    const { products } = await getCatalogSnapshot();
    const productRoutes = products
      .filter(isStorefrontReadyProduct)
      .map((product) => ({
        url: `${SITE_URL}/product/${encodeURIComponent(product.id)}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    return [...staticRoutes, ...collectionRoutes, ...productRoutes];
  } catch (error) {
    console.error("[seo] sitemap catalog unavailable", error);
    return [...staticRoutes, ...collectionRoutes];
  }
}
