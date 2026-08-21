# Mofu Haven 開發與部署守則

## 穩定基準

`v1.0-clean` 是已驗證的 Production 穩定基準。任何調整前，請從此基準或最新的 `main` 建立新分支；不得直接在 `main` 編輯、Commit 或 Push。

## 分支策略

每一項工作必須使用獨立分支，並以用途命名：

| 類型 | 命名格式 | 例子 |
|---|---|---|
| 新功能 | `feature/<範圍>` | `feature/home-search` |
| 修正 | `fix/<範圍>` | `fix/mobile-hero-crop` |
| 維護／文件 | `chore/<範圍>` | `chore/development-guardrails` |

禁止將未經審核的變更直接推送至 `main`，也禁止對 `main` 使用強制推送。每次合併應保留可追溯的 Pull Request 與完整 Commit 歷史。

## Push 前必要檢查

任何 Push（包括 feature branch、修正 branch 或標籤）前，必須在乾淨的工作樹以 Production 環境執行：

```bash
NODE_ENV=production npm run build
```

若 Build 出現編譯 Error、TypeScript Error、路由產出失敗或未處理的 Serverless 例外，禁止 Push，也不得宣稱版本可部署。外部服務暫時不可用時，必須確認錯誤已有受控 fallback，且 Build 最終成功。

## Vercel 部署規則

只有已通過 Build 的 Pull Request 才可合併至 `main`，並觸發 Production 部署。完成部署後，必須在 Vercel Deployment Details 確認 **Status = Ready**；若 Status 為 Error、Canceled 或 Building，該版本不得交付。

任何提交結果必須包含以下四項資訊：

1. Source branch 與完整 Commit Hash；
2. 本地 Production Build 結果；
3. Vercel Build Status（必須為 Green / Ready）；
4. 實際 Deployment Preview URL 或正式 Production URL。

## 支付與資料安全

Stripe 金鑰、付款方式、金額計算、webhook 與訂單完成邏輯均屬受保護範圍。除非修復已證實的錯誤，否則前端視覺、內容或商品展示工作不得修改這些部分。所有商品資料與分類變更都必須同時驗證貓咪、狗狗及小寵物分類頁。

## GitHub 管理員設定

Repository 管理員應在 GitHub Branch Protection Rules 對 `main` 啟用下列限制：要求 Pull Request、要求 Build Check 通過、禁止 force push，以及限制直接 Push。此文件規範開發流程；Branch Protection 會在平台層強制執行。
