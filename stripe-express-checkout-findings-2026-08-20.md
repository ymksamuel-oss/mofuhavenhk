# Stripe Checkout 設定研究紀錄

來源：

- https://docs.stripe.com/checkout/quickstart
- https://docs.stripe.com/payments/payment-method-configurations
- Stripe MCP `search_stripe_documentation`，查詢日期：2026-08-20。

## 官方重點

Stripe Hosted Checkout 的可用付款方式可由 Checkout Session 控制，也可由 Stripe Dashboard 的 Payment Method Configuration 管理。官方文件指出，Payment Method Configuration 可以逐項開關付款方式，並在建立 Checkout Session 時指定 configuration；Hosted Checkout 亦會根據貨幣與限制動態顯示兼容方式。

官方文件同時指出，Apple Pay、Google Pay 及 Link 不能使用 `excluded_payment_method_types` 在每筆交易層級排除。若要控制這些 wallet 的顯示，應在對應整合的 wallet 設定或 Stripe Dashboard Payment methods／Payment configurations 中停用。程式端明確設定 `payment_method_types` 可避免把 `link` 列為付款方式，但不能取代 Dashboard 對 Apple Pay wallet 的帳戶／配置層級停用。

本專案因此採用兩層防護：伺服器 Checkout Session 明確使用 `card` 及已支援的 `alipay`，不列入 `link` 或 `apple_pay`；另外提醒並保留 Stripe Dashboard 手動停用 Apple Pay／Link 的必要性，確保 Hosted Checkout 頂部快捷 wallet 不再顯示。WeChat Pay 僅在 `STRIPE_ENABLE_WECHAT_PAY=true` 且 Stripe Live 帳戶已啟用時加入，避免未啟用時令 Checkout 建立失敗。

本專案的香港收貨資料由網站先收集並以 Checkout Session metadata 傳遞；因而移除 `shipping_address_collection` 及 `phone_number_collection`，避免 Stripe Hosted Checkout 重複收集地址或電話。
