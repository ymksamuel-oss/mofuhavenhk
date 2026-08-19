const baseUrl = "http://127.0.0.1:3000";
const invalidPriceId = "price_invalid_mofu_haven";
const response = await fetch(`${baseUrl}/api/trpc/store.checkout?batch=1`, {
  method: "POST",
  headers: { "content-type": "application/json", origin: baseUrl },
  body: JSON.stringify({ "0": { json: { items: [{ priceId: invalidPriceId, quantity: 1 }] } } }),
});
const body = await response.text();
const hasCheckoutUrl = /https:\/\/checkout\.stripe\.com/.test(body);
const rejected = response.status >= 400 && !hasCheckoutUrl;
console.log(JSON.stringify({ status: response.status, rejected, hasCheckoutUrl, errorMentioned: /invalid|No such price|price/i.test(body) }, null, 2));
if (!rejected) process.exitCode = 1;
