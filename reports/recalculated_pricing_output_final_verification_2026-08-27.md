# 店主固定售價 CSV 匯入最終核對
**核對時間（UTC）：** 2026-08-27T12:46:18.390593+00:00
**方式：** 唯讀 Stripe 核對；沒有重新計算、不讀取匯率、沒有建立、更新或停用任何 Stripe 物件。

| 項目 | 結果 |
| --- | ---: |
| CSV 匯入記錄 | 121 |
| replacement Price 已建立 | 116 |
| 現有 Price metadata 已更新 | 5 |
| 售價、cost_cny、Price 狀態及預設價格關係全部通過 | 121 |
| 核對失敗 | 0 |

每項 `proposed_hkd` 及 `cost_cny` 均直接等於上載 CSV 原值；既有反向定價基準 metadata 已移除。完整逐項清單見 CSV。
