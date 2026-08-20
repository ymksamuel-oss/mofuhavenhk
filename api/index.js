import Stripe from "stripe";
import recoveredProductImageStorageMap from "./recoveredProductImageMap.js";
const getStripe = () => {
  const secret = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("Stripe is not configured for this deployment.");
  return new Stripe(secret);
};

const normalize = (value) => String(value || "").toLocaleLowerCase("zh-HK").replace(/\s+/g, "");

function catalogFields(product) {
  const metadata = product.metadata || {};
  const source = [
    product.name,
    product.description,
    metadata.category,
    metadata.parent_category,
    metadata.Category,
    metadata.Parent_Category,
    metadata.category_zh,
  ].filter(Boolean).join(" ");
  const text = normalize(source);
  const category = /小寵物|小動物|倉鼠|天竺鼠|兔仔|兔/.test(text)
    ? "small-pets"
    : (/狗狗|狗|犬|dog/.test(text) && !/貓咪|貓貓|貓|cat/.test(text) ? "dog" : "cat");
  const existing = String(metadata.sub_category || metadata.subcategory || "");
  if (existing.startsWith(category === "small-pets" ? "small-pet-" : `${category}-`)) {
    return { category, sub_category: existing };
  }
  const details = normalize(`${product.name || ""} ${product.description || ""}`);
  const treat = /零食|小食|點心|凍乾|凍干|肉泥|肉條|雞肉卷|treat|snack|bone/.test(details);
  const dry = /乾糧|主食糧|kibble|dryfood/.test(details);
  const wet = !dry && !treat && /罐罐|罐頭|濕糧|濕食|canned|wetfood/.test(details);
  if (category === "cat") return { category, sub_category: wet ? "cat-wet-food" : dry ? "cat-dry-food" : treat ? "cat-treats" : /貓砂|litter|cleaning/.test(details) ? "cat-litter" : "cat-supplies" };
  if (category === "dog") return { category, sub_category: wet ? "dog-wet-food" : dry ? "dog-dry-food" : treat ? "dog-treats" : "dog-supplies" };
  return { category, sub_category: treat ? "small-pet-treats" : /主食|牧草|飼料|糧|hay|food/.test(details) ? "small-pet-food" : "small-pet-supplies" };
}

function selectPrice(product, prices) {
  if (product.default_price && typeof product.default_price !== "string" && product.default_price.active) return product.default_price;
  return prices.find((price) => price.active && (typeof price.product === "string" ? price.product : price.product?.id) === product.id) || null;
}

function toStoreProduct(product, prices) {
  const price = selectPrice(product, prices);
  const recoveredImage = recoveredProductImageStorageMap[product.id];
  const images = recoveredImage
    ? [`/assets/product/${product.id}`]
    : (product.images || []).filter((url) => /^https?:\/\//.test(url));
  const metadata = Object.fromEntries(Object.entries(product.metadata || {}).filter(([, value]) => typeof value === "string"));
  const fields = catalogFields({ ...product, metadata });
  return {
    id: product.id,
    name: product.name,
    description: product.description || null,
    image: images[0] || null,
    images,
    priceId: price?.id || null,
    unitAmount: price?.unit_amount || null,
    currency: price?.currency || null,
    active: product.active,
    ...fields,
    metadata: { ...metadata, ...fields, parent_category: fields.category },
  };
}

function readInput(req) {
  const raw = req.method === "POST" ? req.body : req.query.input;
  if (!raw) return {};
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  const entry = parsed?.["0"] ?? parsed;
  return entry?.json ?? entry ?? {};
}

function isBatch(req) {
  return req.query?.batch === "1" || Boolean(req.body?.["0"]);
}

function sendResult(req, res, value) {
  const payload = { result: { data: { json: value } } };
  res.status(200).json(isBatch(req) ? [payload] : payload);
}

function sendError(req, res, error, status = 500) {
  const payload = { error: { json: { message: error instanceof Error ? error.message : "Unable to process request.", code: -32603, data: { code: "INTERNAL_SERVER_ERROR", httpStatus: status } } } };
  res.status(status).json(isBatch(req) ? [payload] : payload);
}

function matchesSearch(product, query) {
  if (!query) return true;
  const text = normalize([product.name, product.description, product.category, product.sub_category, ...Object.values(product.metadata || {})].join(" "));
  const groups = [
    ["罐罐", "罐頭", "主食罐", "副食罐", "濕糧", "濕食"],
    ["零食", "小食", "treat", "snack"],
    ["雞肉", "雞胸肉", "chicken"],
    ["貓", "貓咪", "貓貓", "cat"],
    ["狗", "狗狗", "犬", "dog"],
  ];
  const normalizedQuery = normalize(query);
  const synonyms = groups.find((group) => group.some((term) => normalizedQuery.includes(normalize(term)))) || [normalizedQuery];
  return synonyms.some((term) => text.includes(normalize(term)));
}

function normalizeCategory(value) {
  const aliases = { cats: "cat", dogs: "dog", cleaning: "small-pets", snacks: "treats", snack: "treats", "寵物零食": "treats", "寵物小食": "treats" };
  const key = String(value || "all").toLocaleLowerCase("zh-HK").trim();
  return aliases[key] || key;
}

async function productsHandler(req, res, input) {
  const stripe = getStripe();
  const [productsResult, pricesResult] = await Promise.all([
    stripe.products.list({ active: true, limit: 100, expand: ["data.default_price"] }),
    stripe.prices.list({ active: true, limit: 100 }),
  ]);
  const category = normalizeCategory(input.category);
  const q = String(input.q || "");
  const products = productsResult.data
    .map((product) => toStoreProduct(product, pricesResult.data))
    .filter((product) => (category === "all" || !category ? true : category === "treats" ? /treats$/.test(product.sub_category) : product.category === category || product.sub_category === category))
    .filter((product) => matchesSearch(product, q));
  sendResult(req, res, { products, total: products.length, totalAvailable: productsResult.data.length, source: "stripe", filter: { category, q } });
}

function isWeChatPayUnavailable(error) {
  const message = error instanceof Error ? error.message : String(error);
  return /wechat_pay|wechat pay/i.test(message) && /invalid|activated|enabled/i.test(message);
}

async function checkoutHandler(req, res, input) {
  if (!Array.isArray(input.items) || input.items.length === 0) throw new Error("購物車沒有有效商品。");
  const delivery = input.delivery || {};
  if (!delivery.recipientName || !delivery.contactPhone || !delivery.deliveryMethod) throw new Error("請完整填寫香港收貨資料。");
  if (delivery.deliveryMethod !== "home_delivery" && !delivery.pickupCode) throw new Error("選擇自取方式時必須提供站點或櫃點資料。");
  const stripe = getStripe();
  const priceIds = input.items.map((item) => item.priceId);
  const prices = await Promise.all(priceIds.map((id) => stripe.prices.retrieve(id)));
  if (prices.some((price) => !price.active || String(price.currency).toLowerCase() !== "hkd")) throw new Error("購物車內有未啟用或非 HKD 商品，請重新整理後再試。");
  const origin = req.headers.origin || `https://${req.headers.host}`;
  const methods = ["card", "alipay"];
  const wechatPayEnabled = process.env.STRIPE_ENABLE_WECHAT_PAY === "true";
  if (wechatPayEnabled) methods.push("wechat_pay");
  const paymentMethodOptions = {
    card: { request_three_d_secure: "any" },
    ...(wechatPayEnabled ? { wechat_pay: { client: "web" } } : {}),
  };
  const sessionParams = {
    mode: "payment",
    submit_type: "pay",
    line_items: input.items.map((item) => ({ price: item.priceId, quantity: Math.min(99, Math.max(1, Number(item.quantity) || 1)) })),
    payment_method_types: methods,
    payment_method_options: paymentMethodOptions,
    metadata: {
      recipient_name: delivery.recipientName,
      contact_phone: delivery.contactPhone,
      delivery_method: delivery.deliveryMethod,
      ...(delivery.pickupCode ? { pickup_code: delivery.pickupCode } : {}),
    },
    allow_promotion_codes: true,
    success_url: `${origin}/checkout/return?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/return?status=cancelled`,
  };
  let session;
  try {
    session = await stripe.checkout.sessions.create(sessionParams);
  } catch (error) {
    if (!wechatPayEnabled || !isWeChatPayUnavailable(error)) throw error;
    console.warn("[Vercel API] WeChat Pay is not enabled for this Stripe account; retrying Checkout with card and Alipay.");
    session = await stripe.checkout.sessions.create({
      ...sessionParams,
      payment_method_types: ["card", "alipay"],
      payment_method_options: { card: { request_three_d_secure: "any" } },
    });
  }
  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  sendResult(req, res, { url: session.url });
}

export default async function handler(req, res) {
  try {
    const procedure = String(req.query.procedure || "");
    const input = readInput(req);
    if (procedure === "store.products") return await productsHandler(req, res, input);
    if (procedure === "store.checkout") return await checkoutHandler(req, res, input);
    return sendError(req, res, new Error("Unknown API procedure."), 404);
  } catch (error) {
    console.error("[Vercel API]", error);
    return sendError(req, res, error);
  }
}
