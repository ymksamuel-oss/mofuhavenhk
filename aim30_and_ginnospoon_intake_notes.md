# AIM30 與銀之匙新批產品辨識紀錄

## 可安全處理的產品範圍

本批圖片可保守分為以下真實產品及配方集合：

| 集合／產品 | 可確認規格 | 可確認成本（CNY） | 分類 | 上架處理 |
|---|---:|---:|---|---|
| AIM30 Karitto Treats 小包裝 | 25g（5g × 5 小包） | ¥14.40、¥19.80（按實際配方） | cats/treats | 各真實配方建立獨立 Stripe Product，再以前台「選擇配方」集合顯示。 |
| AIM30 Karitto Treats 大包裝 | 80g（16 小包） | ¥56.00 | cats/treats | 各真實配方建立獨立 Stripe Product，再以前台「選擇配方」集合顯示。 |
| AIM30 鰹魚削節 | 12g | ¥19.80 | cats/treats | 獨立產品。 |
| AIM30 雞肉絲 | 25g | ¥14.40 | cats/treats | 獨立產品。 |
| AIM30 吞拿魚片 | 30g | ¥19.80 | cats/treats | 獨立產品。 |
| 銀之匙三ツ星グルメ魚肉奶油夾心 | 180g | ¥55.00 | cats/dry-food | 獨立 Stripe Product；其後接入相容的 180g 奶油配方選擇。 |

## 成本未能可靠辨識的圖片

下列五款已讀到配方與規格，但截圖內成本數字無法可靠辨識，故不納入本輪定價與上架：

| 圖片 | 產品資料 | 可辨識規格 |
|---|---|---|
| IMG_1734.PNG | AIM30 Karitto Treats 雞肉及蟹肉味 | 25g（5g × 5） |
| IMG_1735.PNG | AIM30 Karitto Treats 雞肉及牛肉味 | 25g（5 小包） |
| IMG_1739.PNG | AIM30 Karitto Treats 牧場美味四種綜合包 | 80g／16 小包 |
| IMG_1740.PNG | AIM30 Karitto Treats 吞拿魚及雞肉雙拼綜合包 | 80g／16 小包 |
| IMG_1719.PNG | AIM30 Karitto Treats 吞拿魚及三文魚味 | 25g／5 小包 |

> 成本未經可靠讀取的產品不會使用同系列價格猜測，待用戶提供清楚成本後才可安全上架。

## 分組原則

同為 AIM30 Karitto Treats 的不同口味或包裝，會保留各自包裝圖片、說明及 Stripe Product／Price，前台才以真正的配方選擇連結呈現。具毛球、腸道或綜合營養標示的配方會保留包裝所示描述，不會宣稱治療或處方效果。

## 已核對的重複圖片

IMG_1721.PNG 與 IMG_1732.PNG 均為同一款 AIM30 Karitto Treats 雞肉味 25g（5g × 5 小包），成本均為 ¥14.40；上架時只建立一件產品，並採用較清晰、完整的 IMG_1732.PNG 作清理主圖來源。

IMG_1726.PNG 為 AIM30 Karitto Treats 吞拿魚味 25g，成本 ¥19.80；IMG_1727.PNG 為 AIM30 Karitto Treats 金槍魚味 25g，成本 ¥14.40。包裝配方名稱與成本均不相同，故保留為兩個獨立 Stripe Product；如前台放入同一口味系列，只會顯示為兩個真實可選配方。

## 目前已完成的純白主圖

已完成並存放於 `/home/ubuntu/mofuhavenhk-github/assets/aim30-ginnospoon/`：

- `aim30-karitto-fish-25g.png`
- `aim30-karitto-chicken-25g.png`
- `aim30-karitto-salmon-25g.png`
- `aim30-karitto-seafood-25g.png`
- `aim30-karitto-cheese-25g.png`
- `aim30-karitto-beef-25g.png`
- `aim30-karitto-tuna-green-25g.png`
- `aim30-karitto-maguro-25g.png`
- `aim30-karitto-bonito-25g.png`

用戶已補充五款此前未確認產品的成本：IMG_1734 ¥23.80、IMG_1735 ¥23.80、IMG_1739 ¥56.00、IMG_1740 ¥56.00、IMG_1719 ¥56.00。待將其加入最終映射後，需依既定 CNY/HKD 1.1654、45% 目標毛利、向上取 `.90` 計價。

後續已完成主圖：`aim30-karitto-tuna-green-25g.png`、`aim30-karitto-maguro-25g.png`、`aim30-karitto-bonito-25g.png`、`aim30-karitto-hairball-tuna-25g.png`、`aim30-karitto-lactic-tuna-25g.png`、`aim30-karitto-balanced-tuna-25g.png`、`aim30-karitto-fish-80g.png`、`aim30-karitto-chicken-80g.png`、`aim30-karitto-fish-four-80g.png`、`aim30-bonito-flakes-12g.png`、`aim30-chicken-shreds-25g.png`。
