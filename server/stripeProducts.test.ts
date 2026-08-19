import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import { stripeProductsSnapshot } from "../shared/data/stripeProductsSnapshot";
import { filterCatalogProducts, normalizeProductCategories } from "../shared/productCatalog";
import { sanitizeProductImages, selectProductPrice, toStoreProduct } from "./stripeProducts";

function product(overrides: Partial<Stripe.Product> = {}): Stripe.Product {
  return {
    id: "prod_cat_food",
    object: "product",
    active: true,
    created: 1,
    default_price: null,
    description: "天然貓咪小食",
    images: ["https://images.example/cat-food.jpg"],
    livemode: false,
    metadata: { category: "cat" },
    name: "貓咪天然小食",
    package_dimensions: null,
    shippable: true,
    statement_descriptor: null,
    tax_code: null,
    type: "service",
    unit_label: null,
    updated: 1,
    url: null,
    ...overrides,
  } as Stripe.Product;
}

function price(overrides: Partial<Stripe.Price> = {}): Stripe.Price {
  return {
    id: "price_cat_food",
    object: "price",
    active: true,
    billing_scheme: "per_unit",
    created: 2,
    currency: "hkd",
    custom_unit_amount: null,
    livemode: false,
    lookup_key: null,
    metadata: {},
    nickname: null,
    product: "prod_cat_food",
    recurring: null,
    tax_behavior: "unspecified",
    tiers_mode: null,
    transform_quantity: null,
    type: "one_time",
    unit_amount: 8800,
    unit_amount_decimal: "8800",
    ...overrides,
  } as Stripe.Price;
}

describe("Stripe store product mapping", () => {
  it("uses the active default price when available", () => {
    const selected = selectProductPrice(product({ default_price: price({ id: "price_default" }) }), [price()]);
    expect(selected?.id).toBe("price_default");
  });

  it("falls back to the newest active price for the product", () => {
    const selected = selectProductPrice(product(), [
      price({ id: "price_old", created: 1 }),
      price({ id: "price_new", created: 3 }),
      price({ id: "price_other", product: "prod_other", created: 99 }),
    ]);
    expect(selected?.id).toBe("price_new");
  });

  it("filters known legacy 404 image URLs without removing valid image assets", () => {
    expect(sanitizeProductImages([
      "https://mofuhavenhk.com/images/products/wt-product-10.jpg",
      "https://files.stripe.com/links/valid-image",
      "https://images.example/cat-food.jpg",
    ])).toEqual([
      "https://files.stripe.com/links/valid-image",
      "https://images.example/cat-food.jpg",
    ]);
  });

  it("returns frontend-safe product fields without duplicating Stripe data", () => {
    const mapped = toStoreProduct(product(), [price()]);
    expect(mapped).toMatchObject({
      id: "prod_cat_food",
      name: "貓咪天然小食",
      image: "https://images.example/cat-food.jpg",
      priceId: "price_cat_food",
      unitAmount: 8800,
      currency: "hkd",
      active: true,
      metadata: { category: "cat" },
    });
  });

  it("contains the MCP-verified Live storefront inventory", () => {
    expect(stripeProductsSnapshot).toHaveLength(91);
    expect(stripeProductsSnapshot.every((item) => item.active && item.priceId && item.images.length > 0)).toBe(true);
    expect(stripeProductsSnapshot.some((item) => item.metadata.category === "cats")).toBe(true);
    expect(stripeProductsSnapshot.some((item) => item.metadata.category === "dogs")).toBe(true);
  });

  it("normalizes mixed metadata for cat food, treats, and wet cans", () => {
    const catProducts = filterCatalogProducts(stripeProductsSnapshot, "cats");
    const treats = filterCatalogProducts(stripeProductsSnapshot, "treats");
    const wetCans = filterCatalogProducts(stripeProductsSnapshot, "wet-cans");

    expect(catProducts.length).toBeGreaterThan(0);
    expect(treats.length).toBeGreaterThan(0);
    expect(wetCans).toHaveLength(9);
    expect(wetCans.every((item) => /(罐罐|罐頭|濕糧|濕食|鮮肉杯|wet|canned)/i.test(item.name))).toBe(true);
    expect(wetCans.some((item) => item.name.includes("CIAO 貓罐罐"))).toBe(true);
    expect(wetCans.some((item) => item.name.includes("1兆個乳酸菌乾糧"))).toBe(false);
    expect(wetCans.some((item) => item.name.includes("冷凍脫水"))).toBe(false);
    expect(normalizeProductCategories(catProducts[0]!)).toContain("cats");
  });

  it("matches product search terms across names and metadata", () => {
    const results = filterCatalogProducts(stripeProductsSnapshot, "all", "CIAO");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.name.includes("CIAO") || Object.values(item.metadata).some((value) => value.includes("CIAO")))).toBe(true);
  });
});
