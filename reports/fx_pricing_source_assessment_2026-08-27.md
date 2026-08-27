# Mofu Haven HK 自動外匯定價來源評估

**評估時間（UTC）：** 2026-08-27

## 採用的匯率基準

自動定價服務固定使用 Frankfurter API 的 ECB 指定提供者模式，以同一日的 EUR/CNY 和 EUR/HKD 日結參考匯率交叉計算 CNY/HKD，而不是使用未指明提供者的混合報價。

```text
GET https://api.frankfurter.dev/v2/rates?base=EUR&quotes=CNY,HKD&providers=ECB
CNY/HKD = (EUR/HKD) ÷ (EUR/CNY)
```

2026-08-27 的實測 ECB 指定提供者 API 回應為：

```json
[
  {"date":"2026-08-26","base":"EUR","quote":"CNY","rate":7.8422},
  {"date":"2026-08-26","base":"EUR","quote":"HKD","rate":9.1463}
]
```

由此交叉計算之 CNY/HKD 為 `1.1662926219`。Frankfurter 無指定提供者的最新 CNY/HKD API 在 2026-08-27 回傳 `1.1679`；此自動化不採用該混合報價，以保持來源可識別及重現。

## 來源與執行限制

| 項目 | 已核實狀態 |
| --- | --- |
| Frankfurter 公開 API | 不需要 API key，可請求最新／歷史匯率及指定 provider |
| ECB 參考匯率 | 每個工作日約 16:00 CET 更新，僅作資訊用途的日結參考匯率 |
| 網站排程 | 以 Production URL 的受保護 GET 路由執行；需用 `CRON_SECRET` 驗證授權 header |
| 重複／漏跑風險 | 排程可能重複或漏跑，程式必須逐項檢查現值及使用 Stripe idempotency keys |

## 來源

1. [Frankfurter API 文件](https://frankfurter.dev/)
2. [European Central Bank — Euro foreign exchange reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)
3. [Vercel — Managing Cron Jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs)
4. [Vercel — Cron Jobs](https://vercel.com/docs/cron-jobs)
