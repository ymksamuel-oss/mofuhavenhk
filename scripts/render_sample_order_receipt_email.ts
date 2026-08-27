import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { receiptEmailHtml } from "../src/lib/orderReceiptEmail";

const outputPath = resolve(
  process.cwd(),
  "reports/email_receipt_design_preview_2026-08-27.html",
);

const html = receiptEmailHtml({
  orderNumber: "MH20260827-1234",
  customerName: "陳小明",
  customerEmail: "preview@example.com",
  paidAt: new Date("2026-08-27T08:35:00.000Z"),
  paymentLabel: "信用卡／全球支付 (Stripe)",
  subtotalHkd: 100.8,
  shippingHkd: 25,
  totalHkd: 125.8,
  items: [
    {
      name: "CIAO 貓咪小食（示例）",
      variantLabel: "85g",
      mofuSku: "MH-CAT-CIAO-001",
      quantity: 2,
      unitAmountHkd: 50.4,
    },
  ],
});

writeFileSync(outputPath, html, "utf8");
console.log(`Wrote ${outputPath}`);
