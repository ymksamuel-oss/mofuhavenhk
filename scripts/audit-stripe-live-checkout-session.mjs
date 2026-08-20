import { readFileSync, writeFileSync } from "node:fs";

const [checkoutResponsePath, reportPath] = process.argv.slice(2);
const secret = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
if (!checkoutResponsePath || !reportPath || !secret) {
  throw new Error("Usage: node scripts/audit-stripe-live-checkout-session.mjs <checkout-response.json> <report.json> with Stripe Live credentials.");
}

const envelope = JSON.parse(readFileSync(checkoutResponsePath, "utf8"));
const url = envelope.result?.data?.json?.url;
const sessionId = url?.match(/\/(cs_live_[^#?/]+)/)?.[1];
if (!sessionId) throw new Error("Unable to extract a live Checkout Session ID.");

const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
  headers: { Authorization: `Bearer ${secret}` },
});
const session = await response.json();
if (!response.ok) throw new Error(session.error?.message || "Unable to retrieve Checkout Session.");

const report = {
  id: session.id,
  status: session.status,
  payment_status: session.payment_status,
  mode: session.mode,
  payment_method_types: session.payment_method_types,
  payment_method_options: session.payment_method_options,
  shipping_address_collection: session.shipping_address_collection,
};
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
