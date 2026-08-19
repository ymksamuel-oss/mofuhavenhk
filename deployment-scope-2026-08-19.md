# 最新部署範圍紀錄

本次交付沿用已驗證並保存的版本 `da5f4501`，Preview URL 為 `https://3000-iwglvs12np74x9w4j2ngh-7feb189a.sg1.manus.computer`。已確認首頁及 `/products?category=cats` 可載入，Stripe Live 金流、商品資料、商品詳情與前端導覽功能維持在已驗證狀態。

本次部署不重新處理兩項早期外部依賴：`mofuhavenhk.com` 的自訂域名／DNS 綁定，以及 Stripe 內 75 件缺少或失效圖片的重新上傳同步。這兩項不阻擋目前 Preview／Staging 版本測試，但仍需在相應外部平台完成後再作獨立驗證。
