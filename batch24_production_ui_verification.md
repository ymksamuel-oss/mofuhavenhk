# 批次 24：正式前台驗證記錄

**驗證日期：** 2026-08-25

| 驗證頁面 | 核對結果 |
| --- | --- |
| `https://www.mofuhavenhk.com/categories/dogs/snacks?lang=zh#products` | 新增 COMBO Pure 狗狗小食已從 Stripe 即時出現於狗狗小食分類，並提供清理後 CDN 圖片及產品頁連結。 |
| `https://www.mofuhavenhk.com/product/prod_V8lAPSEzKs8rpv?lang=zh` | PETLINE 雞胸肉蔬菜牛肉風味果凍包顯示 HK$49.90、清理後 CDN 圖片 URL、已修正的自然中文描述、規格選擇及加入購物籃控制項。 |

## 待修正項目

產品頁的規格狀態字串顯示為「現貨｜25g×4｜狗狗狗狗小食」，原因為匯入 metadata 同時串接動物標籤及已帶有動物標籤的子分類。將修正為「現貨｜25g×4｜狗狗小食」並安全重跑本批 metadata 更新；不建立額外產品或價格。

## 修正後複核

| 商品頁 | 最終結果 |
| --- | --- |
| `prod_V8lAPSEzKs8rpv` | PETLINE 狗狗果凍包已改為顯示「現貨｜25g×4｜狗狗小食」，HK$49.90、CDN 清理圖與加購控制項均正常。 |
| `prod_V8lAUga8Mwc3d0` | 銀之匙濃湯仕立鮪魚貓罐頭正確顯示「現貨｜70g｜貓咪食品」、HK$19.90、CDN 清理圖與加購控制項。 |

## 非本批次改動

FAQ 仍顯示未滿免運門檻的標準運費 HK$35；現時 Stripe Checkout 訂單邏輯為 HK$25。此為既存全站文案口徑問題，未在本批商品上架流程中修改。
