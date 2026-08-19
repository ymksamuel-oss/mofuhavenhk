# Custom Domain Browser Findings

- Manus 已成功登入帳戶 `11Gor`。
- 開啟的專案頁面 URL：`https://manus.im/app/project/chdM6GG9PKRdHtCDEsDjCD`，專案名稱顯示為 `Mofu Haven`。
- 專案頁面的 Website 卡片未直接顯示 Domains 或 Custom Domain 設定。
- 點擊 Website 的 Add 後，出現 Add website to project 清單。
- 清單中的網站包括：`Mofu Haven HK - WT Japan 狗狗小食展示專區`、`Mofu Haven 毛毛港`、`Mofu Haven - Premium Pet Essentials`、`Mofu Haven`（`mofuhaven.manus.space`）。
- 清單沒有目前 WebDev 專案的明確域名 `mofuhaven-5gysmfvo.manus.space`。
- 因此目前不能安全選擇任何一項來代替 WebDev Domains 綁定，避免把 `www.mofuhavenhk.com` 綁到舊網站。
- GoDaddy 的 `www` CNAME 已解析到 `mofuhaven-5gysmfvo.manus.space`，但自訂域名仍未在 WebDev 專案域名清單出現，先前 TLS handshake failure／Cloudflare 1001 仍屬未完成狀態。
