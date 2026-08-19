# 自訂域名檢查紀錄（2026-08-19）

檢查 `https://www.mofuhavenhk.com` 時，瀏覽器回報 `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`，表示目前 HTTPS 憑證／上游綁定仍未完成。

改以 `http://www.mofuhavenhk.com` 檢查，頁面顯示 Cloudflare **Error 1001 — DNS resolution error**。Cloudflare 無法解析 `www.mofuhavenhk.com` 的上游來源；目前 Manus 專案可用域名仍只有 `mofuhaven-5gysmfvo.manus.space`，因此自訂域名待辦仍受 Manus Custom Domain 綁定及 DNS 設定限制，尚未完成。
