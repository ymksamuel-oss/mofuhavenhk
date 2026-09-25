import { describe, expect, it } from "vitest";

function sanitizeProductPayload(input: Record<string, unknown>) {
  const payload = { ...input };
  delete payload.name_ja;
  delete payload.description_ja;
  return payload;
}

describe("admin product update payload", () => {
  it("does not send legacy Japanese fields to products.update", () => {
    expect(sanitizeProductPayload({ name_en: "English name", description_en: "Description", name_ja: "日本語", description_ja: "説明" }))
      .toEqual({ name_en: "English name", description_en: "Description" });
  });
});
