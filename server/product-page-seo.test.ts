import { createElement, isValidElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Product } from "@/lib/products";

const { getCatalogSnapshotMock } = vi.hoisted(() => ({
  getCatalogSnapshotMock: vi.fn(),
}));

vi.mock("@/lib/catalog-server", () => ({
  getCatalogSnapshot: getCatalogSnapshotMock,
}));
vi.mock("@/components/product/ProductDetail", () => ({
  ProductDetail: () => null,
}));

import ProductPage, { generateMetadata } from "@/app/product/[id]/page";
import { JsonLd } from "@/components/seo/JsonLd";

const fixture = {
  id: "best-partner-jp-treat",
  mofuSku: "4976064025609",
  categorySlug: "dogs",
  image: "/images/test-product.jpg",
  images: ["/images/test-product.jpg"],
  name: { zh: "測試狗狗零食", en: "Test Dog Treat" },
  description: { zh: "測試商品說明", en: "A test product description." },
  price: 88,
  inStock: true,
} as unknown as Product;

function mockCatalog(product: Product) {
  getCatalogSnapshotMock.mockResolvedValue({
    products: [product],
    categories: [],
    brands: [],
    source: "supabase",
    matchedRecords: 1,
  });
}

async function renderProductSchema(product: Product): Promise<Record<string, unknown>> {
  mockCatalog(product);
  const page = await ProductPage({ params: Promise.resolve({ id: product.id }) });
  if (!isValidElement(page)) throw new Error("Expected product route to return a React element");
  const children = (page as ReactElement<{ children: unknown }>).props.children;
  const productJsonLd = (Array.isArray(children) ? children[0] : children) as ReactElement<{
    data: Record<string, unknown>;
  }>;
  const html = renderToStaticMarkup(createElement(JsonLd, { data: productJsonLd.props.data }));
  const scriptJson = html.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1];
  if (!scriptJson) throw new Error("Product route did not render a JSON-LD script");
  return JSON.parse(scriptJson) as Record<string, unknown>;
}

describe("product detail SEO", () => {
  beforeEach(() => getCatalogSnapshotMock.mockReset());

  it("emits parseable Product JSON-LD with SKU, brand, price, currency, and stock status", async () => {
    const schema = await renderProductSchema(fixture);
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Product");
    expect(schema.name).toBe("Test Dog Treat");
    expect(schema.sku).toBe("4976064025609");
    expect(schema.brand).toMatchObject({ "@type": "Brand", name: "Best Partner" });
    expect(schema.image).toEqual(["https://www.mofuhavenhk.com/images/test-product.jpg"]);
    const offers = schema.offers as Record<string, unknown>;
    expect(offers).toMatchObject({
      "@type": "Offer",
      price: "88.00",
      priceCurrency: "HKD",
      availability: "https://schema.org/InStock",
    });
  });

  it("marks an out-of-stock product correctly", async () => {
    const schema = await renderProductSchema({ ...fixture, inStock: false });
    expect((schema.offers as Record<string, unknown>).availability)
      .toBe("https://schema.org/OutOfStock");
  });

  it("emits complete product Open Graph and Twitter metadata", async () => {
    mockCatalog(fixture);
    const metadata = await generateMetadata({ params: Promise.resolve({ id: fixture.id }) });
    const openGraph = metadata.openGraph as unknown as Record<string, unknown>;
    const twitter = metadata.twitter as unknown as Record<string, unknown>;
    expect(openGraph).toMatchObject({
      type: "product",
      url: `https://www.mofuhavenhk.com/product/${fixture.id}`,
      title: "Test Dog Treat | Mofu Haven",
      images: [{ url: "https://www.mofuhavenhk.com/images/test-product.jpg" }],
    });
    expect(openGraph.description).toContain("A test product description.");
    expect(twitter).toMatchObject({
      card: "summary_large_image",
      title: "Test Dog Treat | Mofu Haven",
      images: ["https://www.mofuhavenhk.com/images/test-product.jpg"],
    });
  });
});
