const liveSecretKey = process.env.STRIPE_LIVE_SECRET_KEY ?? "";
const fallbackSecretKey = process.env.STRIPE_SECRET_KEY ?? "";
const livePublishableKey = process.env.VITE_STRIPE_LIVE_PUBLISHABLE_KEY ?? "";
const fallbackPublishableKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "";
const secretKey = liveSecretKey || fallbackSecretKey;
const publishableKey = livePublishableKey || fallbackPublishableKey;

const result = {
  secretSource: liveSecretKey ? "STRIPE_LIVE_SECRET_KEY" : fallbackSecretKey ? "STRIPE_SECRET_KEY" : null,
  secretPresent: Boolean(secretKey),
  secretPrefix: secretKey ? secretKey.slice(0, 8) : null,
  publishableSource: livePublishableKey ? "VITE_STRIPE_LIVE_PUBLISHABLE_KEY" : fallbackPublishableKey ? "VITE_STRIPE_PUBLISHABLE_KEY" : null,
  publishablePresent: Boolean(publishableKey),
  publishablePrefix: publishableKey ? publishableKey.slice(0, 8) : null,
  accountRequest: "not-run",
  balanceRequest: "not-run",
  livemode: null,
  accountIdPresent: false,
};

if (secretKey) {
  const response = await fetch("https://api.stripe.com/v1/account", {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  result.accountRequest = response.status;
  if (response.ok) {
    const account = await response.json();
    result.accountIdPresent = Boolean(account.id);
  } else {
    result.error = `Stripe account request returned HTTP ${response.status}`;
  }

  const balanceResponse = await fetch("https://api.stripe.com/v1/balance", {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  result.balanceRequest = balanceResponse.status;
  if (balanceResponse.ok) {
    const balance = await balanceResponse.json();
    result.livemode = balance.livemode ?? null;
  } else {
    result.balanceError = `Stripe balance request returned HTTP ${balanceResponse.status}`;
  }
}

console.log(JSON.stringify(result, null, 2));
  if (!result.secretPresent || !result.publishablePresent || result.accountRequest !== 200 || result.balanceRequest !== 200 || result.livemode !== true) {
  process.exitCode = 1;
}
