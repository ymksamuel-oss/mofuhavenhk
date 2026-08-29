# 新系列陶瓷寵物食碗 Stripe 驗證（2026-08-30）

## Product

- Stripe mode: live
- Stripe account: `acct_1TxSYXRyM6dRKLtZ`
- Product ID: `prod_VAEW6CWhv8mNOy`
- Product status: active
- Shippable: true
- Default Price ID: `price_1U9u3oRyM6dRKLtZ8OADS69r`
- Product cost: CNY 34.00
- Retail price: HKD 69.90
- Image status: cleaned, no Simplified Chinese, ivory background `#F7F1E6`

## Variants

1. 老鼠音符圖案 — SKU `mofu-ceramic-pet-bowl-illustration-mice-music` — Price `price_1U9u3oRyM6dRKLtZ8OADS69r` — HKD 69.90
2. 熊仔曲奇圖案 — SKU `mofu-ceramic-pet-bowl-illustration-bears-cookies` — Price `price_1U9u42RyM6dRKLtZ2xmrOxwf` — HKD 69.90
3. 彩虹雨天圖案 — SKU `mofu-ceramic-pet-bowl-illustration-rainbow-raincoat` — Price `price_1U9u4ERyM6dRKLtZIB68KYCR` — HKD 69.90

## Notes

The three images show the same bowl shape and series, with different printed patterns, so they were correctly grouped as one product with three selectable pattern variants. The first local script attempt did not write to Stripe because the expected environment variable was unavailable; the final live sync was completed through the authorized Stripe connector.
