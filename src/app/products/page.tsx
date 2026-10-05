import { ProductCatalog } from "@/components/menu/ProductCatalog";

export const revalidate = 86400;

export default function ProductsPage() {
  return <ProductCatalog categorySlug={null} subcategory={null} />;
}
