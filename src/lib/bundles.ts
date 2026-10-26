import type { Product } from "@/lib/products";

export type BundleComponent = {
  sku: string;
  nameZh: string;
  nameEn: string;
  nameJa: string;
  weight: string;
};

export const BUNDLE_BOM: Record<string, BundleComponent[]> = {
  "MOFU-BUNDLE-PICKY-01": [
    { sku: "4976064024251", nameZh: "雞肉雪花碎", nameEn: "Chicken flakes", nameJa: "鶏ささみフレーク", weight: "50g" },
    { sku: "4976064024893", nameZh: "黑鮪魚碎", nameEn: "Bluefin tuna flakes", nameJa: "まぐろフレーク", weight: "45g" },
    { sku: "4976064025272", nameZh: "安納芋粉", nameEn: "Annou sweet potato powder", nameJa: "安納芋のふりかけ", weight: "80g" },
    { sku: "4976064024275", nameZh: "芝士粉", nameEn: "Cheese powder", nameJa: "チーズふりかけ", weight: "50g" },
  ],
};

export function getBundleComponents(mofuSku?: string | null): BundleComponent[] {
  return mofuSku ? BUNDLE_BOM[mofuSku] ?? [] : [];
}

export function getProductMofuSku(product: Product): string {
  const raw = product as unknown as Record<string, unknown>;
  const metadata = raw.metadata as Record<string, unknown> | undefined;
  return typeof metadata?.mofu_sku === "string" ? metadata.mofu_sku : "";
}

export function getBundleProducts(product: Product, catalog: Product[]): Array<BundleComponent & { product?: Product }> {
  const components = getBundleComponents(getProductMofuSku(product));
  return components.map((component) => ({
    ...component,
    product: catalog.find((candidate) => getProductMofuSku(candidate) === component.sku || candidate.metadata?.mofu_sku === component.sku),
  }));
}
