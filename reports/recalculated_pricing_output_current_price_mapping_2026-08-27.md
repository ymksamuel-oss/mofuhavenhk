# 固定定價 CSV 與現行 replacement Price 對照
**產生時間（UTC）：** 2026-08-27T18:50:06.492512+00:00
**方式：** 純讀取 Stripe。CSV 售價與成本保持原值，沒有重新計算、套用匯率或寫入 Stripe。

| 項目 | 結果 |
| --- | ---: |
| CSV 資料列 | 121 |
| 可嚴格映射至現行活躍 Price | 16 |
| 已阻擋 | 105 |

非活躍 CSV Price 只有在同一 Stripe Product 及完整 metadata 與唯一活躍 replacement Price 相同時，才可對照；任何模糊映射均會被阻擋。完整逐項結果見 CSV。
