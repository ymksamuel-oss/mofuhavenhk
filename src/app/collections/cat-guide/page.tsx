import type { Metadata } from "next";
import { CatFreshFoodGuide, GUIDE_SKUS } from "@/components/collections/CatFreshFoodGuide";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import type { Product } from "@/lib/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "貓咪天然鮮食・4大食法選購指南 | 毛毛港 Mofu Haven HK",
  description: "探索 7 款 BestPartner 日本貓咪天然鮮食：無鹽小魚乾、柴魚薄片、雞肉雪花與迷你短條，配搭 4 大餵食方法，解決挑食與飲水難題。",
  alternates: { canonical: "https://www.mofuhavenhk.com/collections/cat-guide" },
  openGraph: {
    title: "貓咪天然鮮食・4大食法選購指南",
    description: "100% 日本國產，食鹽不使用，為挑食貓咪打造的和風鮮食指南。",
    url: "https://www.mofuhavenhk.com/collections/cat-guide",
    type: "website",
    locale: "zh_HK",
    siteName: "毛毛港 Mofu Haven HK",
  },
};

function getSku(product: Product) {
  return product.metadata?.mofu_sku || product.tags?.find((tag) => /^\d{13}$/.test(tag)) || "";
}

export default async function CatGuidePage() {
  let products: Product[] = [];
  try {
    const catalog = await getCatalogSnapshot();
    products = catalog.products.filter((product) => GUIDE_SKUS.includes(getSku(product) as (typeof GUIDE_SKUS)[number]));
  } catch (error) {
    console.error("[cat-guide] catalog unavailable", error);
  }

  const guideJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "貓咪天然鮮食・4大食法選購指南",
    description: "BestPartner 日本貓咪天然鮮食選購與餵食指南。",
    url: "https://www.mofuhavenhk.com/collections/cat-guide",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://www.mofuhavenhk.com/product/${product.id}`,
        name: product.name.zh,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd) }} />
      <CatFreshFoodGuide products={products} />
    </>
  );
}
