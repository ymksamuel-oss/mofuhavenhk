import { describe, expect, it } from "vitest";
import { normalizeBackInStockContact } from "@/lib/back-in-stock";

describe("normalizeBackInStockContact", () => {
  it("normalizes valid email addresses", () => {
    expect(normalizeBackInStockContact("email", "  PET@Example.com ")).toBe(
      "pet@example.com",
    );
  });

  it("adds Hong Kong's country code to a local WhatsApp number", () => {
    expect(normalizeBackInStockContact("whatsapp", "9123 4567")).toBe(
      "+85291234567",
    );
  });

  it("accepts international WhatsApp numbers and normalizes the plus sign", () => {
    expect(normalizeBackInStockContact("whatsapp", "+447911123456")).toBe(
      "+447911123456",
    );
    expect(normalizeBackInStockContact("whatsapp", "+1 (202) 555-0123")).toBe(
      "+12025550123",
    );
  });

  it("rejects invalid email, phone, contact kind, and oversized inputs", () => {
    expect(normalizeBackInStockContact("email", "not-an-email")).toBeNull();
    expect(normalizeBackInStockContact("whatsapp", "1234 5678")).toBeNull();
    expect(normalizeBackInStockContact("phone", "91234567")).toBeNull();
    expect(normalizeBackInStockContact("email", "x".repeat(255))).toBeNull();
  });
});
