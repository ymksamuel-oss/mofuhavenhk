const baseUrl = "http://127.0.0.1:3000";
const response = await fetch(`${baseUrl}/api/trpc/store.checkout?batch=1`, {
  method: "POST",
  headers: { "content-type": "application/json", origin: baseUrl },
  body: JSON.stringify({ "0": { json: { priceId: "price_invalid_mofu_haven_test" } } }),
});
const body = await response.text();
const parsed = (() => {
  try { return JSON.parse(body); } catch { return null; }
})();
const errorText = JSON.stringify(parsed ?? body);
const result = {
  httpStatus: response.status,
  rejected: response.status >= 400,
  containsSuccessUrl: /checkout\.stripe\.com/.test(errorText),
  containsError: /error|invalid|no such|resource/i.test(errorText),
};
console.log(JSON.stringify(result, null, 2));
if (!result.rejected || result.containsSuccessUrl || !result.containsError) process.exitCode = 1;
