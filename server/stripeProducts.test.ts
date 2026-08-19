import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import { stripeProductsSnapshot } from "../shared/data/stripeProductsSnapshot";
import { selectProductPrice, toStoreProduct } from "./stripeProducts";

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
});
