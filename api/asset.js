import recoveredProductImageStorageMap from "./recoveredProductImageMap.js";

const ASSET_ORIGIN = "https://mofuhaven-5gysmfvo.manus.space";

const ASSET_PATHS = Object.freeze({
  logo: "/manus-storage/mofu-haven-logo_2a21eeab.png",
  "main-banner": "/manus-storage/mofu-haven-main-banner_e167962e.png",
  "sub-banner": "/manus-storage/mofu-haven-sub-banner_58ad8067.png",
  "product-placeholder": "/manus-storage/mofu-haven-product-placeholder_5fd6b349.svg",
});

const PET_IMAGE_STORAGE_PATHS = Object.freeze({
  "abyssinian-verified.jpg": "/manus-storage/abyssinian-verified_ad2df2c1.jpg",
  "amer-2_95dbbc70.jpg": "/manus-storage/amer-2_95dbbc70.jpg",
  "american-shorthair_9cb75e41.jpg": "/manus-storage/american-shorthair_9cb75e41.jpg",
  "bengal-verified.jpg": "/manus-storage/bengal-verified_83e2a4a5.jpg",
  "british-shorthair_828cba70.jpg": "/manus-storage/british-shorthair_828cba70.jpg",
  "maine-2_e2254aeb.jpg": "/manus-storage/maine-2_e2254aeb.jpg",
  "maine-coon_cd25cde9.jpg": "/manus-storage/maine-coon_cd25cde9.jpg",
  "norwegian-forest-verified.jpg": "/manus-storage/norwegian-forest-verified_9d4fdce3.jpg",
  "persian-verified.jpg": "/manus-storage/persian-verified_4107ae60.jpg",
  "persian-2_2f4dd7c1.jpg": "/manus-storage/persian-2_2f4dd7c1.jpg",
  "ragdoll-verified.jpg": "/manus-storage/ragdoll-verified_3c4ee5c9.jpg",
  "russian-blue-verified.jpg": "/manus-storage/russian-blue-verified_cdf1b69a.jpg",
  "scottish-fold_120a23ab.jpg": "/manus-storage/scottish-fold_120a23ab.jpg",
  "siamese_844c7708.jpg": "/manus-storage/siamese_844c7708.jpg",
  "sphynx-verified.jpg": "/manus-storage/sphynx-verified_27f4ceb6.jpg",
});

export default function handler(req, res) {
  const requested = Array.isArray(req.query.asset) ? req.query.asset[0] : req.query.asset;
  const productId = typeof requested === "string" && requested.startsWith("product/")
    ? requested.slice("product/".length)
    : null;
  const petImageName = typeof requested === "string" && requested.startsWith("pet/")
    ? requested.slice("pet/".length)
    : null;
  const path = productId
    ? recoveredProductImageStorageMap[productId]
    : petImageName
      ? PET_IMAGE_STORAGE_PATHS[petImageName]
      : ASSET_PATHS[requested];

  if (!path) {
    return res.status(404).json({ error: "Unknown storefront asset." });
  }

  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800");
  return res.redirect(307, `${ASSET_ORIGIN}${path}`);
}
