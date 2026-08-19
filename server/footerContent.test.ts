import { describe, expect, it } from "vitest";
import { footerContactEmail, footerContactMailto, footerQuickLinks } from "../shared/footerContent";

describe("footer contact and quick links", () => {
  it("uses the requested contact email in display and mailto values", () => {
    expect(footerContactEmail).toBe("MofuHavenHK@Gmail.com");
    expect(footerContactMailto).toBe("mailto:MofuHavenHK@Gmail.com");
  });

  it("removes all-products and includes the pet world entry", () => {
    expect(footerQuickLinks).toEqual([
      { label: "關於我們", href: "/about" },
      { label: "探索寵物世界", href: "/pet-world" },
      { label: "常見問題", href: "/faq" },
    ]);
    expect(footerQuickLinks.some((link) => link.label === "全部商品")).toBe(false);
  });
});
