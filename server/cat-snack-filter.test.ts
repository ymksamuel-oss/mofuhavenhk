import { describe, expect, it } from "vitest";
import {
  CAT_SNACK_SERIES,
  getCatProductsBySubcategory,
  resolveCatSnackSeriesSlug,
  type Product,
} from "../src/lib/products";

const products: Product[] = CAT_SNACK_SERIES.map((snackSeries, index) => ({
  id: `cat-snack-${index}`,
  categorySlug: "cats",
  subcategory: "貓貓小食",
  snackSeries,
  image: `/placeholder-${index}.jpg`,
  name: { zh: snackSeries, en: snackSeries },
  price: 10 + index,
  icon: "cat",
}));

describe("cat snack series filtering", () => {
  it("resolves all four URL slugs", () => {
    expect(resolveCatSnackSeriesSlug("natural")).toBe("無添加天然系列");
    expect(resolveCatSnackSeriesSlug("senior")).toBe("老貓零食");
    expect(resolveCatSnackSeriesSlug("hairball")).toBe("去毛球配方");
    expect(resolveCatSnackSeriesSlug("kitten")).toBe("bb貓零食");
  });

  it("keeps already-resolved series values instead of returning null", () => {
    for (const series of CAT_SNACK_SERIES) {
      expect(resolveCatSnackSeriesSlug(series)).toBe(series);
      expect(
        getCatProductsBySubcategory("貓貓小食", series, products),
      ).toHaveLength(1);
    }
  });
});
