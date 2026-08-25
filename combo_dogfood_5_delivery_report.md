# COMBO 720g 狗狗乾糧：五款上架交付報告

**完成日期：** 2026-08-25  
**上架批次：** COMBO 720g 狗狗乾糧五款  
**處理原則：** 先完成包裝保真去背與純白背景主圖，再建立 Stripe Product／HKD Price；未使用任何原始手機截圖作前台圖片。

## 上架摘要

五款 COMBO 狗狗乾糧已建立為五個獨立 Stripe Product，每款均有一個有效 HKD Price，並歸類於「狗狗商品 → 狗狗食品」。所有產品為現貨，使用清理後的 CDN 主圖，無劃線原價顯示，因用戶未提供真實原價。

| SKU | 產品名稱 | 規格 | 現貨 | 採購成本 | 網站售價 | Stripe Product | Stripe Price |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
| COMBO-DOG-720-01 | COMBO 牛肉小魚乾芝士蔬菜狗狗乾糧 | 720g（4 小包裝） | 是 | ¥114 ≈ HK$132.86 | HK$249.90 | `prod_V8kNSV91CKgxb8` | `price_1U8SsmRyM6dRKLtZ3iaLqEV5` |
| COMBO-DOG-720-02 | COMBO 馬蘇里拉芝士角切狗狗乾糧 | 720g（4 小包裝） | 是 | ¥114 ≈ HK$132.86 | HK$249.90 | `prod_V8kNDHKt8kCFkT` | `price_1U8SsoRyM6dRKLtZv82WvY8y` |
| COMBO-DOG-720-03 | COMBO 捲心菜牛肉狗狗乾糧 | 720g（4 小包裝） | 是 | ¥114 ≈ HK$132.86 | HK$249.90 | `prod_V8kNDRrV7QQWc8` | `price_1U8SspRyM6dRKLtZdI80zla7` |
| COMBO-DOG-720-04 | COMBO 低脂小魚乾雞肉狗狗乾糧 | 720g（4 小包裝） | 是 | ¥114 ≈ HK$132.86 | HK$249.90 | `prod_V8kNXGrzdUVGWS` | `price_1U8SsqRyM6dRKLtZP2yQef0B` |
| COMBO-DOG-720-05 | COMBO 低脂 7歲以上狗狗乾糧 | 720g（4 小包裝；7 歲以上） | 是 | ¥114 ≈ HK$132.86 | HK$249.90 | `prod_V8kNg5nRdCoND1` | `price_1U8SsrRyM6dRKLtZoKEOSOWV` |

## 定價口徑

每款採購成本為人民幣 ¥114。按照近期七日人民幣兌港元市場中間匯率平均 **1.1654**，換算商品成本為 **HK$132.8556**。用戶確認內地包郵直運到香港，故入貨運費分攤為 **HK$0**。以 45% 目標產品毛利率計算的基準售價約為 HK$241.56，按 Mofu Haven 的 `.90` 零售尾數規則定為 **HK$249.90**；相對該暫估商品成本的產品毛利率約為 46.84%。

顧客配送費並未混入產品採購成本。前台及 Checkout 沿用現有規則：全單滿 HK$450 免運；未達門檻的系統標準運費由訂單層級另行計算。

> 匯率為有日期標記的暫估基準，實際付款後應以實際扣款匯率覆核。

## 驗證結果

直接 Stripe API 驗證五款產品全部通過，逐項確認產品啟用、雙語名稱、狗狗食品分類、現貨、清理後 CDN 圖片、預設價格及 HK$249.90 價格正確。正式站狗狗食品分類已顯示新產品；其中第一款的產品頁已確認包裝圖 URL、名稱、規格、現價、現貨和「加入購物籃」控制項。

另已建立一個未付款 Hosted Checkout 測試 Session，核對所選 Stripe Price ID 為 `price_1U8SsmRyM6dRKLtZ3iaLqEV5`、商品金額 HK$249.90、系統運費 HK$25、總額 HK$274.90；Session 已立即失效，付款狀態維持未付款。

## 圖片品質結論

五張上架主圖均為 1920 × 1920 PNG，白色背景，保留完整原裝袋、品牌、原始日文包裝資訊及 720g 標示；手機介面、購物平台按鈕、售價、中文宣傳版、水印及背景雜訊已移除。

## References

[1] [XE CNY/HKD currency converter](https://www.xe.com/currencyconverter/convert/?Amount=5000&From=CNY&To=HKD)  
[2] [CNY/HKD historical exchange rates](https://www.exchangerates.org.uk/Yuan-to-Hong-Kong-Dollars-currency-conversion-page.html)
