import recoveredProductImageStorageMap from "./recoveredProductImageMap.js";

const ASSET_ORIGIN = "https://mofuhaven-5gysmfvo.manus.space";

const ASSET_PATHS = Object.freeze({
  logo: "/manus-storage/mofu-haven-logo_2a21eeab.png",
  "main-banner": "/manus-storage/mofu-haven-main-banner_e167962e.png",
  "sub-banner": "/manus-storage/mofu-haven-sub-banner_58ad8067.png",
  "product-placeholder": "/manus-storage/mofu-haven-product-placeholder_5fd6b349.svg",
});

export default function handler(req, res) {
  const requested = Array.isArray(req.query.asset) ? req.query.asset[0] : req.query.asset;
  const productId = typeof requested === "string" && requested.startsWith("product/")
    ? requested.slice("product/".length)
    : null;
  const path = productId ? recoveredProductImageStorageMap[productId] : ASSET_PATHS[requested];

  if (!path) {
    return res.status(404).json({ error: "Unknown storefront asset." });
  }

  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800");
  return res.redirect(307, `${ASSET_ORIGIN}${path}`);
}
