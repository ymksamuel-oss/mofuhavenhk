# Preview／Staging 驗證紀錄

版本：`8a5aabe5`

Preview 服務：`https://3000-iwglvs12np74x9w4j2ngh-7feb189a.sg1.manus.computer`

已截取並檢查 `/products`、`/about` 及 `/faq` 桌面版畫面。商品頁顯示 91 件商品及 Header 三項導覽「首頁／產品／關於我們」。

重啟 Preview 後再次執行 Chromium smoke test：91 張商品卡片成功渲染；商品詳情 Modal 成功開啟並顯示標題、價格及介紹；Lightbox 成功開啟及以 Escape 關閉；失效圖片成功切換到品牌 placeholder；Footer 六個指定連結正確；五個資訊頁路由均回應 HTTP 200。
