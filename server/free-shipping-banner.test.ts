import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const brandServiceStrip = fs.readFileSync(
  path.join(process.cwd(), "src/components/BrandServiceStrip.tsx"),
  "utf8",
);
const productDetail = fs.readFileSync(
  path.join(process.cwd(), "src/components/product/ProductDetail.tsx"),
  "utf8",
);

describe("storewide free-shipping announcement", () => {
  it("renders the free-shipping promise as text rather than a link", () => {
    expect(brandServiceStrip).toContain('text: "全店滿 HK$399 享順豐免運。"');
    expect(brandServiceStrip).toContain('text: "Free SF shipping on orders over HK$399."');
    expect(brandServiceStrip).toContain("{item.href ? (");
    expect(brandServiceStrip).toContain("<span><span aria-hidden=\"true\">{item.icon}</span> {item.text}</span>");
    expect(brandServiceStrip).not.toContain('href: "/collections/value-bundles"');

    const productShippingSection = productDetail.match(/<section aria-label=\{locale === "en" \? "Delivery trust information"[\s\S]*?<\/section>/)?.[0];
    expect(productShippingSection).toBeTruthy();
    expect(productShippingSection).not.toContain("href=");
    expect(productShippingSection).not.toContain("<Link");
  });
});
