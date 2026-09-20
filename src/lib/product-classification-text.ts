/**
 * Minimal, purpose-built Simplified → Traditional normalization for catalog
 * classification. It deliberately covers category-bearing product vocabulary
 * only; storefront display copy remains authored in its original language unless
 * explicitly corrected in Stripe metadata.
 */
const CLASSIFICATION_ALIASES: ReadonlyArray<readonly [string, string]> = [
  ["\u72d7\u72d7\u51bb\u5e72\u98df\u54c1", "\u72d7\u72d7\u51b7\u51cd\u812b\u6c34\u98df\u54c1"],
  ["\u72d7\u72d7\u51cd\u4e7e\u98df\u54c1", "\u72d7\u72d7\u51b7\u51cd\u812b\u6c34\u98df\u54c1"],
  ["\u732b\u51bb\u5e72", "\u51b7\u51cd\u812b\u6c34\u7cfb\u5217"],
  ["\u8c93\u51bb\u5e72", "\u51b7\u51cd\u812b\u6c34\u7cfb\u5217"],
  ["\u732b\u51cd\u4e7e", "\u51b7\u51cd\u812b\u6c34\u7cfb\u5217"],
  ["\u51b7\u51bb\u8131\u6c34", "\u51b7\u51cd\u812b\u6c34"],
  ["\u51bb\u5e72", "\u51cd\u4e7e"],
  ["\u732b\u54aa", "\u8c93\u54aa"],
  ["\u732b\u732b", "\u8c93\u8c93"],
  ["\u732b\u7528", "\u8c93\u7528"],
  ["\u732b\u7802", "\u8c93\u7802"],
  ["\u732b\u7f50\u5934", "\u8c93\u7f50\u982d"],
  ["\u732b\u7f50", "\u8c93\u7f50"],
  ["\u732b\u7cae", "\u8c93\u7ce7"],
  ["\u5e72\u7cae", "\u4e7e\u7ce7"],
  ["\u6e7f\u7cae", "\u6fd5\u7ce7"],
  ["\u6e7f\u98df", "\u6fd5\u98df"],
  ["\u7f50\u5934", "\u7f50\u982d"],
  ["\u96f6\u98df", "\u96f6\u98df"],
  ["\u5ba0\u7269", "\u5bf5\u7269"],
  ["\u5c0f\u52a8\u7269", "\u5c0f\u52d5\u7269"],
  ["\u5c0f\u5ba0\u7269", "\u5c0f\u5bf5\u7269"],
  ["\u4ed3\u9f20", "\u5009\u9f20"],
  ["\u9f99\u732b", "\u9f8d\u8c93"],
  ["\u8377\u5170\u732a", "\u8377\u862d\u8c6c"],
  ["\u523a\u732c", "\u523a\u875f"],
  ["\u98de\u9f20", "\u98db\u9f20"],
  ["\u5395\u6240", "\u5ec1\u6240"],
  ["\u5c3f\u57ab", "\u5c3f\u588a"],
  ["\u6e05\u6d01", "\u6e05\u6f54"],
  ["\u8425\u517b", "\u71df\u990a"],
  ["\u8bad\u7ec3", "\u8a13\u7df4"],
  ["\u62a4\u7406", "\u8b77\u7406"],
  ["\u62a4", "\u8b77"],
  ["\u7275\u5f15", "\u727d\u5f15"],
  ["\u9888\u5708", "\u9838\u5708"],
  ["\u7b3c\u820d", "\u7c60\u820d"],
  ["\u7761\u7a9d", "\u7761\u7aa9"],
  ["\u70ed\u5356", "\u71b1\u8ce3"],
  ["\u4f18\u60e0", "\u512a\u60e0"],
  ["\u732b", "\u8c93"],
  ["\u7cae", "\u7ce7"],
  ["\u6e7f", "\u6fd5"],
  ["\u51bb", "\u51cd"],
  ["\u8131", "\u812b"],
  ["\u5934", "\u982d"],
  ["\u57ab", "\u588a"],
  ["\u5ba0", "\u5bf5"],
  ["\u7b3c", "\u7c60"],
  ["\u7a9d", "\u7aa9"],
  ["\u9f99", "\u9f8d"],
  ["\u5170", "\u862d"],
  ["\u732c", "\u875f"],
  ["\u98de", "\u98db"],
  ["\u5395", "\u5ec1"],
  ["\u6d01", "\u6f54"],
  ["\u8425", "\u71df"],
  ["\u8bad", "\u8a13"],
  ["\u7ec3", "\u7df4"],
  ["\u9888", "\u9838"],
  ["\u7275", "\u727d"],
  ["\u5356", "\u8ce3"],
  ["\u4f18", "\u512a"],
  ["\u9e21", "\u96de"],
  ["\u996d", "\u98ef"],
];

/**
 * Normalize only text used for catalog routing and keyword matching.
 * The function is idempotent and leaves unrelated Simplified display text alone.
 */
export function normalizeProductClassificationText(value: string | undefined): string {
  if (!value) return "";
  return CLASSIFICATION_ALIASES.reduce(
    (text, [simplified, traditional]) => text.replaceAll(simplified, traditional),
    value,
  );
}
