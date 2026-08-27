# Mofu Haven HK：49 件圖片辨識產品核實及同步狀態

**更新日期：2026-08-27**

> **核實準則：** 「完整單品核實」必須有相符製造商官方單品頁；「包裝／品牌核實」只可使用產品正面包裝及官方品牌／系列資料清楚支持的欄位。沒有足夠證據的原料、材質、產地、營養、功效、容量或尺寸均不會估填。

## 整體結論

| 狀態 | 件數 | 現時處理結果 |
|---|---:|---|
| A．可安全同步的已核實產品 | **32** | 已寫入 Stripe；其中已同步詳細前台欄位的產品包括 4 件 PETLINE、4 件 Vet’s Labo、2 款系統貓砂及 1 件 DoggyMan。21 件 Mamacook 已同步品牌、包裝規格、適用動物、來源與保守文案，但沒有為未獲單品證據的營養欄位作推測。 |
| B．品牌／產品已辨識，仍缺精確單品來源 | **8** | Iris ONE CARE 7 件及 DoggyMan 肝臟捲 1 件。可用保守名稱與包裝可讀規格，但不應填原料、保證成分、熱量、產地或完整餵食指引。 |
| C．未能確認原廠或完整型號 | **9** | 6 款無品牌高腳食盤、PAMAX 貓砂、SNAPPY 貓砂及 complete ytf 雞肉產品。必須補供應商資料或背標。 |
| **合計** | **49** | **32 件已安全同步；17 件仍需補證據才可完整上架。** |

## 已完成 Stripe 同步及公開顯示的 32 件

### Mamacook 凍乾零食：21 件（品牌與包裝層級核實）

**資料來源：** [Mamacook 官方網站](https://www.mamacook.co.jp/)

Mamacook 批次已同步品牌、凍乾零食／配料定位、包裝可讀重量、適用動物、官方品牌來源及非主食／非療法食品注意。產品頁**不會**填入未由相符單品官方頁核實的成分分析、熱量或產地。

| 產品 ID | 修正後名稱 | 規格 | 適用動物 |
|---|---|---:|---|
| `prod_V8W0oLt83VbMEB` | Mamacook 凍乾信州三文魚 | 17g | 貓用 |
| `prod_V8W0eQFDHSCPxC` | Mamacook 凍乾牛後腿肉 | 17g | 貓用 |
| `prod_V8W0mdB77ZJc5M` | Mamacook 凍乾吞拿魚 | 14g | 貓用 |
| `prod_V8W0xHzc6tqf3B` | Mamacook 凍乾胡瓜魚 | 10g | 貓用 |
| `prod_V8W0fChA9h4VNq` | Mamacook 凍乾虹鱒魚 | 15g | 貓用 |
| `prod_V8W0n6wDbyKpya` | Mamacook 凍乾雞柳粒 | 18g | 貓用 |
| `prod_V8W073h3MHqGhr` | Mamacook 凍乾白魚 | 10g | 貓用 |
| `prod_V8W0DDhtV271xl` | Mamacook 凍乾豬後腿肉 | 20g | 貓用 |
| `prod_V8W0LKmYo2bfxf` | Mamacook 凍乾豬心 | 25g | 貓用 |
| `prod_V8Vz4r6kx51OK2` | Mamacook 凍乾雞柳 | 150g | 貓用 |
| `prod_V8W0gp0Oink4Cg` | Mamacook 凍乾雞柳 | 150g | 犬用 |
| `prod_V8VzICRXhFqVtH` | Mamacook 凍乾雞柳 | 30g | 貓用 |
| `prod_V8W0OgEY0HBtlD` | Mamacook 凍乾雞柳粉 | 25g | 貓用 |
| `prod_V8VzG9Cs8B2Rjb` | Mamacook 凍乾雞胸肉 | 150g | 貓用 |
| `prod_V8VzTooOH64y65` | Mamacook 凍乾雞胸肉 | 30g | 貓用 |
| `prod_V8W07sgetW5UqK` | Mamacook 凍乾雞胸肉粉 | 25g | 貓用 |
| `prod_V8VzYLI6mgAR3P` | Mamacook 凍乾雞胸肉肝臟混合 | 18g | 貓用 |
| `prod_V8W06fowHsMOSF` | Mamacook 凍乾雞胸肉雞胗混合 | 120g | 貓用 |
| `prod_V8W072ieTwyOZ7` | Mamacook 凍乾雞胸肉雞胗混合 | 18g | 貓用 |
| `prod_V8W0BWVdW0bKlr` | Mamacook 凍乾帶子 | 11g | 貓用 |
| `prod_V8W0oMelOyFLhp` | Mamacook 凍乾雞胸肉肝臟混合 | 待確認 | 貓用 |

### PETLINE ごちそうタイム：4 件（完整單品核實）

| Stripe 產品 ID | 官方單品頁 | 已同步重點 |
|---|---|---|
| `prod_V8lAMmluHgtE1f` | [GPP-59](https://www.petline.co.jp/dog/GPP/GPP-59/) | 雞肉蓉牛奶啫喱芝士；100g（25g × 4）；日本製；完整原料、保證成分及約15kcal／袋。 |
| `prod_V8lAXdhHafIDnG` | [GPP-51](https://www.petline.co.jp/dog/GPP/GPP-51/) | 雞胸肉牛奶煮芝士；100g（25g × 4）；日本製；完整原料、保證成分及約11kcal／袋。 |
| `prod_V8lAt5mJJ5YOb7` | [GPP-52](https://www.petline.co.jp/dog/GPP/GPP-52/) | 雞胸肉芝士啫喱；100g（25g × 4）；日本製；完整原料、保證成分及約9kcal／袋。 |
| `prod_V8lAPSEzKs8rpv` | [GPP-60](https://www.petline.co.jp/dog/GPP/GPP-60/) | 雞胸肉、蔬菜牛肉風味啫喱；100g（25g × 4）；日本製；完整原料、保證成分及約14kcal／袋。 |

> 合規定位：全部為犬用飼料配料／零食，不是完整營養主食、處方食品或療法食品。

### Vet’s Labo MediMousse：4 件（完整單品核實）

| Stripe 產品 ID | 官方單品頁 | 已同步重點 |
|---|---|---|
| `prod_V8feexDq7xAidn` | [皮膚支持 202](https://vetslabo.com/products/202/) | 95g、日本製、穀物不使用、一般食／功能性營養補助食；完整原料、成分、能量、餵食與保存資料。 |
| `prod_V8fexvyuSOogz8` | [健康支持 196](https://vetslabo.com/products/196/) | 95g、日本製、穀物不使用、一般食／功能性營養補助食；約56kcal／包。 |
| `prod_V8fe6YUsIrEf8Q` | [體重管理支持 205](https://vetslabo.com/products/205/) | 95g、日本製、穀物不使用、一般食／功能性營養補助食；約43kcal／包。 |
| `prod_V8feViin1yPowA` | [腸胃支持 189](https://vetslabo.com/products/189/) | 95g、日本製、穀物不使用、一般食／功能性營養補助食；約49kcal／包。 |

> 合規定位：產品名稱中的「支持」只按官方一般食／營養補助食定位展示；不宣稱診斷、治療、預防、保證效果或處方用途。

### 系統貓砂：2 件（完整單品核實）

| Stripe 產品 ID | 官方單品頁 | 已同步重點 |
|---|---|---|
| `prod_V8uIOVwsFqgPTV` | [S.T. ニャンとも小粒 4.4L](https://products.st-c.co.jp/detail/16158/) | 木材、撥水劑、除臭劑；4.4L；專用系統廁所使用、保管、清潔與不可沖馬桶等注意。 |
| `prod_V8uIO7LzUQjeCT` | [Unicharm Natural Green 3.8L](https://www.d-unicharm.jp/item/200803.html) | 沸石、香料微膠囊；3.8L；日本製；僅限 Deotoilet 專用及香味／誤食注意。 |

### DoggyMan 雞肉夾心捲：1 件（完整單品核實）

| Stripe 產品 ID | 官方單品頁 | 已同步重點 |
|---|---|---|
| `prod_V8cr46ftMdO2E3` | [トロッとササミロール](https://www.doggyman.com/?p=showroom&keywords=%E3%82%B5%E3%82%B5%E3%83%9F%E3%83%AD%E3%83%BC%E3%83%AB&id=3085) | 全犬種用零食、30g、中國製；完整原料、保證成分、180kcal／100g及兩個月以下幼犬不宜餵食提示。 |

## B 級：品牌可辨識但資料不足的 8 件

| 產品 ID | 品牌／產品 | 可安全顯示 | 必須補的資料 |
|---|---|---|---|
| `prod_V8Zo9dzijaQ39p` | Iris ONE CARE 牛肉 | 品牌、犬用系列、牛肉口味、100g。 | 精確單品官方頁／背標：原料、營養、熱量、產地、餵食與保存。 |
| `prod_V8ZpWi2bc00Aty` | Iris ONE CARE 白身魚 | 品牌、犬用系列、白身魚口味、100g。 | 同上。 |
| `prod_V8ZoNtJinLFNNG` | Iris ONE CARE 牛肉及蔬菜／牛肉及米飯組合 | 品牌、犬用系列、兩款口味、每罐100g。 | 每一口味的精確單品資料與組合數量。 |
| `prod_V8ZoJ2fwrBOiHL` | Iris ONE CARE 牛肉及米飯 | 品牌、犬用系列、口味、100g。 | 原料、營養、熱量、產地、餵食與保存。 |
| `prod_V8ZorEO6daplRl` | Iris ONE CARE 牛肉及蔬菜 | 品牌、犬用系列、口味、100g。 | 原料、營養、熱量、產地、餵食與保存。 |
| `prod_V8ZpDXl9RWMDbc` | Iris ONE CARE 雞肉 | 品牌、犬用系列、雞肉口味。 | 包裝重量及所有其餘單品資料。 |
| `prod_V8ZodBXbffvz6o` | Iris ONE CARE 肝臟 | 品牌、犬用系列、肝臟口味。 | 包裝重量及所有其餘單品資料。 |
| `prod_V8cru9Bp0V6puG` | DoggyMan トロッとレバーロール | DoggyMan、犬用零食、肝臟口味、30g。 | 精確官方單品頁或背標：原料、成分、能量、產地、餵食與年齡注意。 |

**Iris 系列官方來源：** [Iris ONE CARE 發布資料](https://www.irisohyama.co.jp/news/2006/0728.html) 只可用於確認 ONE CARE 是 Iris 的犬用食品系列；由於它不是這批 100g 濕糧的單品頁，不能把該公告中的系列配方或聲稱轉寫到這 7 件產品。

## C 級：必須補供應商資料的 9 件

| 產品 ID | 暫可保留的事實性名稱 | 所需佐證 |
|---|---|---|
| `prod_V8szzgASg2ZnbO` | 白藍圖案高腳寵物食盤 | 品牌、材質、尺寸、容量、產地、清洗方式。 |
| `prod_V8szss31Rm8tiJ` | 高腳寵物食盤 | 品牌、材質、容量、尺寸、產地、清洗方式。 |
| `prod_V8t0eKeqlC0GzI` | 深藍貓耳高腳食盤 | 品牌、材質、尺寸、容量、產地、清洗方式。 |
| `prod_V8szxN4qvZQyrJ` | 藍白貓耳高腳食盤 | 品牌、材質、尺寸、容量、產地、清洗方式。 |
| `prod_V8t03LiP3rgoHN` | 白色貓耳高腳食盤 | 品牌、材質、尺寸、容量、產地、清洗方式。 |
| `prod_V8szJB1xzy0Hkm` | 藍花紋高腳食盤 | 品牌、材質、尺寸、容量、產地、清洗方式。 |
| `prod_V8ulnkIOBbpTsp` | PAMAX Miracle Series Cat Litter 2.7kg | 製造商／供應商資料、材質／配方、產地、用法、安全與棄置指引。 |
| `prod_V8ulPfhAKY5ONF` | SNAPPY 貓砂 10L | 精確口味／粗幼砂、製造商資料、材料、產地、用法、安全與棄置指引。 |
| `prod_V8sFjjO8lgpPvO` | complete ytf「ふりかける ささみ」 | 品牌全名、適用動物、重量、成分、產地、餵食及保存指引。 |

## 公開前台驗證與版本紀錄

公開前台已驗證產品詳情頁能顯示「產品規格」、「詳細資料」、「官方資料來源」及「選購注意」。代表性驗證頁及前台結果已保存於倉庫內的 `reports/public_frontend_product_details_verification_2026-08-27.md`。

| 本機 commit | 內容 | 狀態 |
|---|---|---|
| `ecb0d1a9` | Mamacook 同步工具、21 件資料及完整資料展示元件 | 已推送至 `main` 並公開顯示。 |
| `9baaa380` | PETLINE 4 件完整官方單品資料 | 已推送至 `main` 並公開顯示。 |
| `91bacd33` | Vet’s Labo 4 件完整官方單品資料 | 已推送至 `main` 並公開顯示。 |
| `9761a14d` | 系統貓砂 2 件資料及 Stripe metadata 鍵數預檢 | 已推送至 `main` 並公開顯示。 |
| `4c473108` | DoggyMan 雞肉夾心捲完整官方單品資料 | 已寫入 Stripe 並公開顯示；commit 只作版本記錄，尚未推送。 |
| `b5dd75ca`、`d83bb81a` | 前台驗證報告及免確認本機 commit 授權 | 本機版本記錄，尚未推送。 |

## 必守的上架規則

1. 「一般食」、「零食」或「營養補助食」不得改寫為「完整營養主食」、「處方食品」或「療法食品」。
2. 「腎臟、腸胃、皮膚、體重管理、除臭、抗菌」等文字只可按原廠已核實的產品定位使用；不得宣稱診斷、治療、預防、保證或替代專業處置。
3. 未有相符單品官方頁或實物背標的原料、營養、產地、熱量、尺寸和容量，應保留待確認，不能使用同系列或相似 SKU 代替。
4. 其餘 17 件要真正升級為完整資料頁，最有效的下一份資料是**每件清楚的背標相片（含成分／材質、產地、使用方法與條碼）或供應商規格表／連結**。
