import type { Metadata } from "next";
import { CatFreshFoodGuide, GUIDE_SKUS } from "@/components/collections/CatFreshFoodGuide";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import type { Product } from "@/lib/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "\u8c93\u54aa\u5929\u7136\u9bae\u98df・4\u5927\u98df\u6cd5\u9078\u8cfc\u6307\u5357 | \u6bdb\u6bdb\u6e2f Mofu Haven HK",
  description: "\u63a2\u7d22 7 \u6b3e BestPartner \u65e5\u672c\u8c93\u54aa\u5929\u7136\u9bae\u98df：\u7121\u9e7d\u5c0f\u9b5a\u4e7e、\u67f4\u9b5a\u8584\u7247、\u96de\u8089\u96ea\u82b1\u8207\u8ff7\u4f60\u77ed\u689d，\u914d\u642d 4 \u5927\u9935\u98df\u65b9\u6cd5，\u89e3\u6c7a\u6311\u98df\u8207\u98f2\u6c34\u96e3\u984c。",
  alternates: { canonical: "https://www.mofuhavenhk.com/collections/cat-guide" },
  openGraph: {
    title: "\u8c93\u54aa\u5929\u7136\u9bae\u98df・4\u5927\u98df\u6cd5\u9078\u8cfc\u6307\u5357",
    description: "100% \u65e5\u672c\u570b\u7522，\u98df\u9e7d\u4e0d\u4f7f\u7528，\u70ba\u6311\u98df\u8c93\u54aa\u6253\u9020\u7684\u548c\u98a8\u9bae\u98df\u6307\u5357。",
    url: "https://www.mofuhavenhk.com/collections/cat-guide",
    type: "website",
    locale: "zh_HK",
    siteName: "\u6bdb\u6bdb\u6e2f Mofu Haven HK",
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
    name: "\u8c93\u54aa\u5929\u7136\u9bae\u98df・4\u5927\u98df\u6cd5\u9078\u8cfc\u6307\u5357",
    description: "BestPartner \u65e5\u672c\u8c93\u54aa\u5929\u7136\u9bae\u98df\u9078\u8cfc\u8207\u9935\u98df\u6307\u5357。",
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
