function calculateItemPricing(basePrice, quantity) {
  const discountPercent = quantity >= 16 ? 15 : quantity >= 8 ? 10 : 0;
  const discountRate = discountPercent / 100;
  const effectiveUnitPrice = Number((basePrice * (1 - discountRate)).toFixed(2));
  const itemTotal = Number((basePrice * quantity * (1 - discountRate)).toFixed(2));
  return { discountPercent, effectiveUnitPrice, itemTotal };
}

const eight = calculateItemPricing(19.9, 8);
if (eight.discountPercent !== 10 || eight.effectiveUnitPrice !== 17.91 || eight.itemTotal !== 143.28) {
  throw new Error(`8-item pricing regression: ${JSON.stringify(eight)}`);
}
const one = calculateItemPricing(19.9, 1);
if (one.discountPercent !== 0 || one.effectiveUnitPrice !== 19.9 || one.itemTotal !== 19.9) {
  throw new Error(`1-item pricing regression: ${JSON.stringify(one)}`);
}
const sixteen = calculateItemPricing(19.9, 16);
if (sixteen.discountPercent !== 15 || sixteen.itemTotal !== 270.64) {
  throw new Error(`16-item pricing regression: ${JSON.stringify(sixteen)}`);
}
console.log("bulk pricing regression passed: 8 -> 1 removes discount; 16 uses 85% tier");
