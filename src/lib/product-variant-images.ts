/**
 * Variant image rules for the Mofu Haven product catalog.
 * Product pages must prefer explicit Stripe price metadata, then use a verified
 * product/variant fallback. Never infer a product image from display position.
 */

type VariantImageRule = {
  productId: string;
  key: string;
  labelZh: string;
  labelEn?: string;
  image: string;
};

const VERIFIED_VARIANT_IMAGE_RULES: readonly VariantImageRule[] = [
  {
    productId: "prod_V8szxN4qvZQyrJ",
    key: "cat-ear-zizai-rufeng-blue",
    labelZh: "自在如風（藍色插畫）",
    labelEn: "Zizai Rufeng (blue illustration)",
    image: "/images/product-variants/cat-bowls/cat-ear-zizai-rufeng.png",
  },
  {
    productId: "prod_V8szxN4qvZQyrJ",
    key: "cat-ear-persimmon-ruyi-green",
    labelZh: "柿柿如意（綠色插畫）",
    labelEn: "Persimmon Ruyi (green illustration)",
    image: "/images/product-variants/cat-bowls/cat-ear-persimmon-ruiyi.png",
  },
  {
    productId: "prod_V8szxN4qvZQyrJ",
    key: "cat-ear-blue-chubby",
    labelZh: "藍胖胖",
    labelEn: "Blue chubby cat",
    image: "/images/product-variants/cat-bowls/cat-ear-blue-chubby.png",
  },
  {
    productId: "prod_V8szxN4qvZQyrJ",
    key: "cat-ear-green-chubby",
    labelZh: "綠胖胖",
    labelEn: "Green chubby cat",
    image: "/images/product-variants/cat-bowls/cat-ear-green-chubby.png",
  },
  {
    productId: "prod_V8szss31Rm8tiJ",
    key: "raised-flat-green-leaf",
    labelZh: "綠葉圖案",
    labelEn: "Green leaf pattern",
    image: "/images/product-variants/cat-bowls/raised-flat-green-leaf.png",
  },
  {
    productId: "prod_V8szss31Rm8tiJ",
    key: "raised-flat-feather",
    labelZh: "羽毛圖案",
    labelEn: "Feather pattern",
    image: "/images/product-variants/cat-bowls/raised-flat-feather.png",
  },
  {
    productId: "prod_V8t03LiP3rgoHN",
    key: "cat-face-slanted-orange",
    labelZh: "橘色",
    labelEn: "Orange",
    image: "/images/product-variants/cat-bowls/cat-face-slanted-orange.png",
  },
  {
    productId: "prod_V8t03LiP3rgoHN",
    key: "cat-face-slanted-blue",
    labelZh: "藍色",
    labelEn: "Blue",
    image: "/images/product-variants/cat-bowls/cat-face-slanted-blue.png",
  },
];

const RULES_BY_PRODUCT_ID = new Map<string, readonly VariantImageRule[]>();
for (const rule of VERIFIED_VARIANT_IMAGE_RULES) {
  const rules = RULES_BY_PRODUCT_ID.get(rule.productId) ?? [];
  RULES_BY_PRODUCT_ID.set(rule.productId, [...rules, rule]);
}

function normalized(value: string | undefined): string {
  return value?.trim().normalize("NFKC") ?? "";
}

export type ProductVariantImageInput = {
  productId: string;
  variantKey?: string;
  labelZh?: string;
  labelEn?: string;
  explicitImage?: string;
};

/**
 * Resolve an option image without ever relying on option array position.
 * Stripe metadata is the source of truth; the verified registry only fills the
 * gap for legacy prices that predate variant_image_url metadata.
 */
export function resolveProductVariantImage({
  productId,
  variantKey,
  labelZh,
  labelEn,
  explicitImage,
}: ProductVariantImageInput): string | undefined {
  const direct = normalized(explicitImage);
  if (direct) return direct;

  const key = normalized(variantKey);
  const zh = normalized(labelZh);
  const en = normalized(labelEn);
  const rule = (RULES_BY_PRODUCT_ID.get(productId) ?? []).find(
    (candidate) =>
      (key && candidate.key === key) ||
      (zh && candidate.labelZh === zh) ||
      (en && candidate.labelEn === en),
  );
  return rule?.image;
}

export function getVerifiedVariantImageRules(): readonly VariantImageRule[] {
  return VERIFIED_VARIANT_IMAGE_RULES;
}
