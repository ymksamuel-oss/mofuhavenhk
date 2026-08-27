# 產品店內 SKU 整理方案

**制定日期：2026-08-27**

## 現況

Stripe 共有 226 件啟用產品。當中 **123 件已經有可讀 SKU，且沒有重複碼**；另有 **103 件未有任何人手易讀貨號**。現有 SKU 前綴包括 `aim30`、`B24`、`CIAOVL`、`CIC`、`COMBO`、`DBF` 和 `monpetit`，格式並不完全一致。

> Stripe 的 `prod_...` 是系統 ID，應保留作為付款、API 與除錯對應；它不適合作為日常 WhatsApp、補貨或揀貨編號。

## 建議：新增獨立的店內 SKU，不改動 Stripe 系統 ID

建議把**店內 SKU**設為日常營運的主識別碼，格式如下：

```text
MH-{類別}-{品牌}-{流水號}
```

| 段落 | 例子 | 用途 |
|---|---|---|
| `MH` | `MH` | 固定店舖前綴（Mofu Haven）。 |
| 類別 | `CAT`、`DOG`、`SML`、`LIF` | 分別代表貓咪、狗狗、小寵物、生活用品。 |
| 品牌 | `CIAO`、`DBF`、`MCK`、`CMP`、`GEN` | 使用短品牌碼；無品牌商品以 `GEN`（generic）處理。 |
| 流水號 | `001`、`002` | 同一類別及品牌下永不重用的三位數編號。 |

| 商品示例 | 建議店內 SKU | 現有 Stripe ID |
|---|---|---|
| CIAO 11歲以上鰹魚白肉貓罐頭 | `MH-CAT-CIAO-001` | `prod_V90y14gfPJNkP3` |
| d.b.f 成犬之食事 雞肉 85g | `MH-DOG-DBF-018` | `prod_V8e2MnRWL8I3ON` |
| Mamacook 凍乾三文魚 17g | `MH-CAT-MCK-001` | `prod_V8W0oLt83VbMEB` |
| 無品牌高腳食盤 | `MH-LIF-GEN-001` | 保留對應的 Stripe `prod_...` |

## 實施原則

1. **不改寫、不刪除** Stripe 的 `prod_...` 系統 ID，也不覆蓋現有供應商 SKU。
2. 在 Stripe metadata 新增獨立欄位 `mofu_sku`；既有的 `sku` 會保留，避免影響舊訂單、採購或資料對應。
3. 對 123 件已有 SKU 的產品，先建立 `mofu_sku`，並把舊 `sku` 保留為「既有／供應商貨號」。對 103 件沒有 SKU 的產品，直接建立首個店內貨號。
4. SKU 一經分配即固定；停售、缺貨或改價都不會更改，也不會把舊號重新分配給新產品。
5. 前台商品頁應顯示「店內貨號：`MH-...`」，而 WhatsApp 訂貨查詢會優先預填店內貨號，同時保留產品名稱；前台不必向客戶顯示 Stripe 系統 ID。
6. 付款成功後的店主訂單通知、訂單匯出與補貨表亦應顯示店內 SKU，讓你可以直接按貨號揀貨與回覆客人。

## 建議分批實施

| 批次 | 工作 | 風險控制 |
|---|---|---|
| 1 | 產生完整 226 件 SKU 對照表並先做碰撞檢查。 | 僅產生預覽 CSV／JSON，零 Stripe 寫入。 |
| 2 | 將 `mofu_sku` 寫入 Stripe metadata，逐批讀回驗證。 | 不改價格、圖片、庫存、商品啟用狀態或現有 `sku`。 |
| 3 | 在產品頁、缺貨 WhatsApp 查詢及店主訂單通知中使用店內 SKU。 | 缺貨商品仍然不能直接結帳。 |
| 4 | 前台、正常結帳及 WhatsApp 訊息驗證。 | 每批完成後自動 Git commit；只有需要上線的前台程式才推送部署。 |

## 本次唯讀審計來源

- `reports/stripe_product_sku_audit_2026-08-27.json`
- `scripts/audit_stripe_product_skus.js`

本文件僅提出規格與實施方法，**尚未分配或寫入任何新 SKU**。
