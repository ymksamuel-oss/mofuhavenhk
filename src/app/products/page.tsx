import { ProductCatalog } from "@/components/menu/ProductCatalog";

export const revalidate = 300;

export default function ProductsPage() {
  return <ProductCatalog categorySlug={null} subcategory={null} />;
}
