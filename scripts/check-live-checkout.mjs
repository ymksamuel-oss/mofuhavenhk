const baseUrl = "http://127.0.0.1:3000";
const secretKey = process.env.STRIPE_LIVE_SECRET_KEY;
if (!secretKey?.startsWith("sk_live_")) throw new Error("Live Stripe secret is not configured");

const productsResponse = await fetch(`${baseUrl}/api/trpc/store.products?input=${encodeURIComponent("{}")}`);
if (!productsResponse.ok) throw new Error(`Product API returned HTTP ${productsResponse.status}`);
const productsEnvelope = await productsResponse.json();
const productsData = productsEnvelope?.result?.data?.json ?? productsEnvelope?.result?.data;
const product = productsData?.products?.find((item) => item.priceId && String(item.currency).toLowerCase() === "hkd");
if (!product?.priceId) throw new Error("No active HKD product price was returned");

const checkoutResponse = await fetch(`${baseUrl}/api/trpc/store.checkout?batch=1`, {
  method: "POST",
  headers: { "content-type": "application/json", origin: baseUrl },
  body: JSON.stringify({ "0": { json: { items: [{ priceId: product.priceId, quantity: 1 }], delivery: { recipientName: "測試收件人", contactPhone: "91234567", deliveryMethod: "sf_station", pickupCode: "SF-TEST-001" } } } }),
});
if (!checkoutResponse.ok) {
  const errorBody = await checkoutResponse.text();
  const safeMessage = errorBody.match(/"message":"([^"]+)/)?.[1] ?? `HTTP ${checkoutResponse.status}`;
  throw new Error(`Checkout API returned HTTP ${checkoutResponse.status}: ${safeMessage}`);
}
const checkoutEnvelope = await checkoutResponse.json();
const checkoutUrl = checkoutEnvelope?.[0]?.result?.data?.json?.url ?? checkoutEnvelope?.[0]?.result?.data?.url;
if (typeof checkoutUrl !== "string") throw new Error("Checkout API did not return a URL");

const sessionMatch = checkoutUrl.match(/(cs_live_[A-Za-z0-9]+)/);
if (!sessionMatch) throw new Error("Checkout URL did not contain a Live session identifier");
const sessionId = sessionMatch[1];
const sessionResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
  headers: { Authorization: `Bearer ${secretKey}` },
});
if (!sessionResponse.ok) throw new Error(`Stripe session lookup returned HTTP ${sessionResponse.status}`);
const session = await sessionResponse.json();

const paymentMethods = Array.isArray(session.payment_method_types) ? session.payment_method_types : [];
const result = {
  productApi: productsResponse.status,
  checkoutApi: checkoutResponse.status,
  priceIdPresent: true,
  liveSessionIdPresent: true,
  stripeSessionLookup: sessionResponse.status,
  livemode: session.livemode ?? null,
  currency: session.currency ?? null,
  paymentMethodTypes: paymentMethods,
  successUrl: session.success_url ?? null,
  cancelUrl: session.cancel_url ?? null,
  shippingAddressCountries: session.shipping_address_collection?.allowed_countries ?? [],
  phoneNumberCollectionEnabled: session.phone_number_collection?.enabled ?? false,
  expressCheckoutTypesPresent: paymentMethods.filter((method) => ["link", "apple_pay"].includes(method)),
  paymentStatus: session.payment_status ?? null,
};
console.log(JSON.stringify(result, null, 2));

if (session.livemode !== true || session.currency !== "hkd" || session.payment_status !== "unpaid" || !paymentMethods.includes("card") || !paymentMethods.includes("alipay") || paymentMethods.includes("link") || paymentMethods.includes("apple_pay") || !String(session.success_url).includes("/checkout/return") || session.shipping_address_collection !== null || session.phone_number_collection?.enabled === true) process.exitCode = 1;
