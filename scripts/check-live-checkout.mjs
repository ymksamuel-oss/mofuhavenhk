const baseUrl = "http://127.0.0.1:3000";
const secretKey = process.env.STRIPE_LIVE_SECRET_KEY;
if (!secretKey?.startsWith("sk_live_")) throw new Error("Live Stripe secret is not configured");

const productsResponse = await fetch(`${baseUrl}/api/trpc/store.products?input=${encodeURIComponent("{}")}`);
if (!productsResponse.ok) throw new Error(`Product API returned HTTP ${productsResponse.status}`);
const productsEnvelope = await productsResponse.json();
const productsData = productsEnvelope?.result?.data?.json ?? productsEnvelope?.result?.data;
const product = productsData?.products?.find((item) => item.priceId);
if (!product?.priceId) throw new Error("No active product price was returned");

const checkoutResponse = await fetch(`${baseUrl}/api/trpc/store.checkout?batch=1`, {
  method: "POST",
  headers: { "content-type": "application/json", origin: baseUrl },
  body: JSON.stringify({ "0": { json: { priceId: product.priceId } } }),
});
if (!checkoutResponse.ok) throw new Error(`Checkout API returned HTTP ${checkoutResponse.status}`);
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

console.log(JSON.stringify({
  productApi: productsResponse.status,
  checkoutApi: checkoutResponse.status,
  priceIdPresent: true,
  liveSessionIdPresent: true,
  stripeSessionLookup: sessionResponse.status,
  livemode: session.livemode ?? null,
  paymentStatus: session.payment_status ?? null,
}, null, 2));

if (session.livemode !== true || session.payment_status !== "unpaid") process.exitCode = 1;
