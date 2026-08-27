# 固定定價 CSV 與 Stripe 嚴格預檢
**預檢時間（UTC）：** 2026-08-27T12:20:34.993378+00:00
**方式：** 逐項讀取 CSV 指定的精確 Stripe Product／Price ID；沒有重新計算、不套用匯率、沒有建立或修改 Stripe 物件。

| 項目 | 結果 |
| --- | ---: |
| CSV 資料列 | 121 |
| 精確對應且現行活躍、可匯入 | 7 |
| 已阻擋，需修正 CSV 指向的現行 Price | 114 |

只有 `eligible_exact_active_match` 項目可在不猜測或映射新 Price ID 的情況下，嚴格按 CSV 原值匯入。完整逐項結果見 CSV。
