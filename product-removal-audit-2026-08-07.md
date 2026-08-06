# 商品移除審計（2026-08-07）

## 審計目的與邊界

本文件是在修改商品資料前建立的完整審計基準。唯一工作副本為 `workspace_scan/mofuhavenhk-main`；原始上載備份 `uploaded_files/mofuhavenhk-main.zip` 不在修改範圍。審計涵蓋整個合併後 catalog，而不是只判斷上載圖片中出現的商品。

保留邊界：所有貓狗可食用食品、小食、主糧、乾糧、濕糧、罐頭、肉泥、糊仔、肉乾、凍乾、潔牙骨、奶粉、山羊奶，以及可口服或透過飲水攝取的營養補充劑與保健品。刪除邊界：所有非食用日用品、設備、服飾、清潔用品、貓砂、尿墊、餐具、飲水器、外出用品、床窩、抓板、貓爬架與玩具。混合套裝只要包含非食用品，整項刪除。

## 修改前基準

- 修改前合併 catalog：**166 項**
- 修改前唯一 ID：**166 個**
- 初步判定保留：**102 項**
- 初步判定刪除：**64 項**
- 特別保留：`wt-cat-kitten-11`（CIAO 幼貓金槍魚糊仔）

修改前分類分佈：`cats=78`、`dogs=17`、`snacks=5`、`toys=28`、`health=8`、`cleaning=8`、`deals=8`、`bestsellers=6`、`outdoor=8`。

## 權威來源矩陣

| 權威來源 | 修改前記錄數 | 刪除數 | 預期保留數 | 角色／判定 |
|---|---:|---:|---:|---|
| `src/lib/products.ts`（`PRODUCTS_RAW`） | 88 | 63 | 25 | 手寫核心商品來源；從來源陣列實際刪除非食用品 |
| `src/data/productsData.ts` | 39 | 0 | 39 | WT Japan 貓罐、乾糧、凍乾；全部可食用 |
| `src/data/catSnacksData.ts` | 34 | 1 | 33 | WT Japan 貓小食／幼貓系列；只刪除餵奶樽 `wt-cat-kitten-10` |
| `public/wt_japan_products.json` | 5 | 0 | 5 | WT Japan 狗小食；全部可食用 |
| **合計** | **166** | **64** | **102** | 最終 `PRODUCTS` 應只包含可食用／可服用商品 |

下游邊界：`src/lib/products.ts` 統一 schema 並合併上述來源；`src/lib/searchProducts.ts` 直接索引完整 `PRODUCTS`，修改後搜尋 ID 集合必須與核心集合完全相等；購物車／訂單價格重建仍須使用核心目錄。

## 逐項判定（修改前 166 項）

| # | 商品 ID | 來源 | 修改前分類 | 判定 | 原因 | 圖片路徑 |
|---:|---|---|---|---|---|---|
| 1 | `cat-bonito-flakes`<br>日本北海道鰹魚薄片 | `src/lib/products.ts（PRODUCTS_RAW）` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/products/cat-bonito-flakes.webp` |
| 2 | `cat-auto-water-fountain`<br>貓咪靜音循環飲水機 | `src/lib/products.ts（PRODUCTS_RAW）` | `cats` | **刪除** | 刪除：日用品、服飾、設備、貓砂或玩具，不可食用或服用 | `/products/cat-auto-water-fountain.webp` |
| 3 | `cat-tofu-litter-6l`<br>日本製豆腐貓砂 6L | `src/lib/products.ts（PRODUCTS_RAW）` | `cats` | **刪除** | 刪除：日用品、服飾、設備、貓砂或玩具，不可食用或服用 | `/products/cat-tofu-litter-6l.webp` |
| 4 | `cat-catnip-toy`<br>貓草玩具球 | `src/lib/products.ts（PRODUCTS_RAW）` | `cats` | **刪除** | 刪除：日用品、服飾、設備、貓砂或玩具，不可食用或服用 | `/products/cat-catnip-toy.webp` |
| 5 | `cat-window-perch`<br>貓咪吸盤窗台跳台 | `src/lib/products.ts（PRODUCTS_RAW）` | `cats` | **刪除** | 刪除：日用品、服飾、設備、貓砂或玩具，不可食用或服用 | `/products/cat-window-perch.webp` |
| 6 | `dog-food-1-5kg`<br>日本天然狗糧 1.5kg | `src/lib/products.ts（PRODUCTS_RAW）` | `dogs` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/products/dog-food-1-5kg.webp` |
| 7 | `dog-dental-chews`<br>狗狗潔牙骨 12支裝 | `src/lib/products.ts（PRODUCTS_RAW）` | `dogs` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/products/dog-dental-chews.webp` |
| 8 | `dog-dried-meat-treats`<br>狗狗肉乾小食 | `src/lib/products.ts（PRODUCTS_RAW）` | `dogs` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/products/dog-dried-meat-treats.webp` |
| 9 | `snack-chicken-jerky`<br>日本雞胸肉乾（狗用） | `src/lib/products.ts（PRODUCTS_RAW）` | `dogs` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/products/snack-chicken-jerky.webp` |
| 10 | `dog-warm-coat`<br>狗狗保暖大衣 | `src/lib/products.ts（PRODUCTS_RAW）` | `dogs` | **刪除** | 刪除：日用品、服飾、設備、貓砂或玩具，不可食用或服用 | `/products/dog-warm-coat.webp` |
| 11 | `dog-training-pads`<br>狗狗尿墊 (30片裝) | `src/lib/products.ts（PRODUCTS_RAW）` | `dogs` | **刪除** | 刪除：日用品、服飾、設備、貓砂或玩具，不可食用或服用 | `/products/dog-training-pads.webp` |
| 12 | `dog-raincoat`<br>狗狗反光防水雨衣 | `src/lib/products.ts（PRODUCTS_RAW）` | `dogs` | **刪除** | 刪除：日用品、服飾、設備、貓砂或玩具，不可食用或服用 | `/products/dog-raincoat.webp` |
| 13 | `dog-wafuu-collar`<br>日式和風頸帶連鈴鐺 | `src/lib/products.ts（PRODUCTS_RAW）` | `dogs` | **刪除** | 刪除：日用品、服飾、設備、貓砂或玩具，不可食用或服用 | `/products/dog-wafuu-collar.webp` |
| 14 | `dog-chew-toy`<br>耐咬橡膠潔齒玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `dogs` | **刪除** | 刪除：日用品、服飾、設備、貓砂或玩具，不可食用或服用 | `/products/dog-chew-toy.webp` |
| 15 | `dog-travel-bowl`<br>摺疊旅行飯碗連袋 | `src/lib/products.ts（PRODUCTS_RAW）` | `dogs` | **刪除** | 刪除：日用品、服飾、設備、貓砂或玩具，不可食用或服用 | `/products/dog-travel-bowl.webp` |
| 16 | `assorted-treats-giftbox`<br>綜合寵物餅乾禮盒 | `src/lib/products.ts（PRODUCTS_RAW）` | `snacks` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/products/assorted-treats-giftbox.webp` |
| 17 | `snack-cheese-stick`<br>貓狗共用芝士條 | `src/lib/products.ts（PRODUCTS_RAW）` | `snacks` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/products/snack-cheese-stick.webp` |
| 18 | `snack-fish-cracker`<br>貓咪魚肉夾心餅 | `src/lib/products.ts（PRODUCTS_RAW）` | `snacks` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/products/snack-fish-cracker.webp` |
| 19 | `snack-sweet-potato-chips`<br>日本蕃薯脆片 | `src/lib/products.ts（PRODUCTS_RAW）` | `snacks` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/products/snack-sweet-potato-chips.webp` |
| 20 | `snack-scallop-jerky`<br>北海道帆立貝乾 | `src/lib/products.ts（PRODUCTS_RAW）` | `snacks` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/products/snack-scallop-jerky.webp` |
| 21 | `toy-neko-ichi-wobble-wand`<br>【貓壱 (Neko Ichi)】貓用不倒翁羽毛逗貓棒玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-neko-ichi-wobble-wand.webp` |
| 22 | `toy-petio-silvervine-chew`<br>【Petio (培ティオ)】貓用天然木天蓼潔齒咀嚼玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-petio-silvervine-chew.webp` |
| 23 | `toy-richell-treat-ball`<br>【Richell (利其爾)】貓咪趣味滾動零食發聲球 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-richell-treat-ball.webp` |
| 24 | `toy-doggyman-cotton-rope-bone`<br>【DoggyMan】狗狗耐咬潔齒棉繩骨頭玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-doggyman-cotton-rope-bone.webp` |
| 25 | `toy-supercat-disc-launcher`<br>【Super Cat】貓用跳躍捕捉飛碟彈射玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-supercat-disc-launcher.webp` |
| 26 | `toy-adies-tunnel-scratcher`<br>【Adies】貓咪立體紙箱隧道抓板兩用玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-adies-tunnel-scratcher.webp` |
| 27 | `toy-petio-plush-squeaky-animal`<br>【Petio (培ティオ)】狗狗互動毛絨發聲小動物玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-petio-plush-squeaky-animal.webp` |
| 28 | `toy-mindup-feather-wand`<br>【Mind Up】貓用安全逗貓羽毛伸縮棒 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-mindup-feather-wand.webp` |
| 29 | `toy-planetdog-bounce-ball`<br>【Planet Dog】狗狗高彈力耐咬尋回球 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-planetdog-bounce-ball.webp` |
| 30 | `toy-cattyman-spinning-butterfly`<br>【CattyMan】貓用智能電動旋轉蝴蝶逗趣玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-cattyman-spinning-butterfly.webp` |
| 31 | `toy-richell-snuffle-mat`<br>【Richell (利其爾)】幼犬益智慢食藏食嗅聞墊玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-richell-snuffle-mat.webp` |
| 32 | `toy-petio-catnip-fish-pillow`<br>【Petio (培ティオ)】貓草夾心毛絨耐咬魚形抱枕 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-petio-catnip-fish-pillow.webp` |
| 33 | `toy-doggyman-dumbbell-chew`<br>【DoggyMan】狗狗潔齒橡膠漏食啞鈴玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-doggyman-dumbbell-chew.webp` |
| 34 | `toy-nekoichi-bowl-scratcher`<br>【貓壱 (Neko Ichi)】貓咪專用趣味紙箱抓盤玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-nekoichi-bowl-scratcher.webp` |
| 35 | `toy-koneko-bell-ball-set`<br>【Koneko】幼貓專用鈴鐺彩球毛絨玩具套裝 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-koneko-bell-ball-set.webp` |
| 36 | `toy-petio-laser-chaser`<br>【Petio (培ティオ)】貓用互動雷射光自動追逐玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-petio-laser-chaser.webp` |
| 37 | `toy-doggyman-ring-frisbee`<br>【DoggyMan】飛盤耐咬環形訓練玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-doggyman-ring-frisbee.webp` |
| 38 | `toy-richell-cardboard-house`<br>【Richell (利其爾)】貓咪躲藏立體紙箱屋玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-richell-cardboard-house.webp` |
| 39 | `toy-supercat-catnip-mouse`<br>【Super Cat】貓草噴霧絨毛仿真老鼠玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-supercat-catnip-mouse.webp` |
| 40 | `toy-petio-slider-puzzle`<br>【Petio (培ティオ)】狗狗益智尋寶翻蓋滑塊玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-petio-slider-puzzle.webp` |
| 41 | `toy-cattyman-ball-tower`<br>【CattyMan】貓用三層旋轉彩球軌道塔 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-cattyman-ball-tower.webp` |
| 42 | `toy-doggyman-dental-tennis-balls`<br>【DoggyMan】狗狗潔齒潔牙網球玩具組 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-doggyman-dental-tennis-balls.webp` |
| 43 | `toy-nekoichi-feather-spring`<br>【貓壱 (Neko Ichi)】貓咪專用羽毛不倒翁彈簧玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-nekoichi-feather-spring.webp` |
| 44 | `toy-richell-sisal-mouse`<br>【Richell (利其爾)】貓咪舒壓劍麻編織老鼠玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-richell-sisal-mouse.webp` |
| 45 | `toy-petio-cooling-chew-bone`<br>【Petio (培ティオ)】狗狗耐咬冰涼舒緩磨牙骨玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-petio-cooling-chew-bone.webp` |
| 46 | `toy-cattyman-crinkle-tunnel`<br>【CattyMan】貓用羽毛紙鈴聲響隧道玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-cattyman-crinkle-tunnel.webp` |
| 47 | `toy-doggyman-tugofwar-rope-ball`<br>【DoggyMan】狗狗拔河專用結實麻繩球玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-doggyman-tugofwar-rope-ball.webp` |
| 48 | `toy-supercat-chirping-bird`<br>【Super Cat】貓薄荷充絨發聲小鳥玩具 | `src/lib/products.ts（PRODUCTS_RAW）` | `toys` | **刪除** | 刪除：玩具／抓板／遊戲設備，不可食用或服用 | `/products/toy-supercat-chirping-bird.webp` |
| 49 | `pet-joint-supplement`<br>寵物關節保健品 | `src/lib/products.ts（PRODUCTS_RAW）` | `health` | **保留** | 保留：可口服／可經飲水攝取的營養或保健商品 | `/products/pet-joint-supplement.webp` |
| 50 | `cat-probiotics`<br>貓咪腸胃益生菌 | `src/lib/products.ts（PRODUCTS_RAW）` | `health` | **保留** | 保留：可口服／可經飲水攝取的營養或保健商品 | `/products/cat-probiotics.webp` |
| 51 | `dog-coat-oil`<br>狗狗美毛營養油 | `src/lib/products.ts（PRODUCTS_RAW）` | `health` | **保留** | 保留：可口服／可經飲水攝取的營養或保健商品 | `/products/dog-coat-oil.webp` |
| 52 | `health-omega3`<br>寵物深海魚油 Omega-3 | `src/lib/products.ts（PRODUCTS_RAW）` | `health` | **保留** | 保留：可口服／可經飲水攝取的營養或保健商品 | `/products/health-omega3.webp` |
| 53 | `health-dental-water`<br>寵物潔牙漱口水添加劑 | `src/lib/products.ts（PRODUCTS_RAW）` | `health` | **保留** | 保留：可口服／可經飲水攝取的營養或保健商品 | `/products/health-dental-water.webp` |
| 54 | `health-senior-multivitamin`<br>高齡寵物綜合維他命 | `src/lib/products.ts（PRODUCTS_RAW）` | `health` | **保留** | 保留：可口服／可經飲水攝取的營養或保健商品 | `/products/health-senior-multivitamin.webp` |
| 55 | `health-urinary-support`<br>貓咪泌尿道保健品 | `src/lib/products.ts（PRODUCTS_RAW）` | `health` | **保留** | 保留：可口服／可經飲水攝取的營養或保健商品 | `/products/health-urinary-support.webp` |
| 56 | `health-calming-chews`<br>寵物舒緩鎮定咀嚼錠 | `src/lib/products.ts（PRODUCTS_RAW）` | `health` | **保留** | 保留：可口服／可經飲水攝取的營養或保健商品 | `/products/health-calming-chews.webp` |
| 57 | `pet-odor-spray`<br>寵物除臭噴霧 | `src/lib/products.ts（PRODUCTS_RAW）` | `cleaning` | **刪除** | 刪除：清潔、除臭、洗護或口腔工具，不可食用或服用 | `/products/pet-odor-spray.webp` |
| 58 | `litter-cleaning-kit`<br>貓砂盆清潔套裝 | `src/lib/products.ts（PRODUCTS_RAW）` | `cleaning` | **刪除** | 刪除：清潔、除臭、洗護或口腔工具，不可食用或服用 | `/products/litter-cleaning-kit.webp` |
| 59 | `pet-shampoo`<br>寵物專用洗毛精 | `src/lib/products.ts（PRODUCTS_RAW）` | `cleaning` | **刪除** | 刪除：清潔、除臭、洗護或口腔工具，不可食用或服用 | `/products/pet-shampoo.webp` |
| 60 | `cleaning-lint-roller`<br>寵物毛髮黏塵滾筒 | `src/lib/products.ts（PRODUCTS_RAW）` | `cleaning` | **刪除** | 刪除：清潔、除臭、洗護或口腔工具，不可食用或服用 | `/products/cleaning-lint-roller.webp` |
| 61 | `cleaning-air-freshener`<br>寵物專用室內除臭噴霧 | `src/lib/products.ts（PRODUCTS_RAW）` | `cleaning` | **刪除** | 刪除：清潔、除臭、洗護或口腔工具，不可食用或服用 | `/products/cleaning-air-freshener.webp` |
| 62 | `cleaning-paw-wipes`<br>寵物潔爪濕紙巾 (80片) | `src/lib/products.ts（PRODUCTS_RAW）` | `cleaning` | **刪除** | 刪除：清潔、除臭、洗護或口腔工具，不可食用或服用 | `/products/cleaning-paw-wipes.webp` |
| 63 | `cleaning-deodorizing-mat`<br>貓砂盆除臭墊 | `src/lib/products.ts（PRODUCTS_RAW）` | `cleaning` | **刪除** | 刪除：清潔、除臭、洗護或口腔工具，不可食用或服用 | `/products/cleaning-deodorizing-mat.webp` |
| 64 | `cleaning-pet-toothbrush-kit`<br>寵物潔牙套裝 (牙刷連牙膏) | `src/lib/products.ts（PRODUCTS_RAW）` | `cleaning` | **刪除** | 刪除：清潔、除臭、洗護或口腔工具，不可食用或服用 | `/products/cleaning-pet-toothbrush-kit.webp` |
| 65 | `deal-food-bundle`<br>貓狗糧限時特惠裝 | `src/lib/products.ts（PRODUCTS_RAW）` | `deals` | **保留** | 保留：套裝內容全部屬食物、小食或可服用保健品 | `/products/deal-food-bundle.webp` |
| 66 | `deal-treats-3pack`<br>寵物小食限時3件裝 | `src/lib/products.ts（PRODUCTS_RAW）` | `deals` | **保留** | 保留：套裝內容全部屬食物、小食或可服用保健品 | `/products/deal-treats-3pack.webp` |
| 67 | `deal-supplement-bogo`<br>寵物保健品限時買一送一 | `src/lib/products.ts（PRODUCTS_RAW）` | `deals` | **保留** | 保留：套裝內容全部屬食物、小食或可服用保健品 | `/products/deal-supplement-bogo.webp` |
| 68 | `deal-cleaning-bundle`<br>居家清潔用品限時套裝 | `src/lib/products.ts（PRODUCTS_RAW）` | `deals` | **刪除** | 刪除：優惠套裝內容屬清潔、玩具或外出用品 | `/products/deal-cleaning-bundle.webp` |
| 69 | `deal-health-trio`<br>保健品三重組合限時優惠 | `src/lib/products.ts（PRODUCTS_RAW）` | `deals` | **保留** | 保留：套裝內容全部屬食物、小食或可服用保健品 | `/products/deal-health-trio.webp` |
| 70 | `deal-newyear-hamper`<br>寵物迎新福袋 | `src/lib/products.ts（PRODUCTS_RAW）` | `deals` | **刪除** | 刪除：混合福袋同時包含小食與非食用用品，不符合純食用／服用邊界 | `/products/deal-newyear-hamper.webp` |
| 71 | `deal-toy-clearance`<br>玩具清倉限時優惠 | `src/lib/products.ts（PRODUCTS_RAW）` | `deals` | **刪除** | 刪除：優惠套裝內容屬清潔、玩具或外出用品 | `/products/deal-toy-clearance.webp` |
| 72 | `deal-outdoor-combo`<br>外出用品限時套裝優惠 | `src/lib/products.ts（PRODUCTS_RAW）` | `deals` | **刪除** | 刪除：優惠套裝內容屬清潔、玩具或外出用品 | `/products/deal-outdoor-combo.webp` |
| 73 | `bestseller-dog-giftbox`<br>人氣日本狗零食禮盒 | `src/lib/products.ts（PRODUCTS_RAW）` | `dogs` | **保留** | 保留：商品本體屬貓狗食品或小食 | `/products/bestseller-dog-giftbox.webp` |
| 74 | `bestseller-cat-scratcher`<br>人氣貓抓板組合 | `src/lib/products.ts（PRODUCTS_RAW）` | `bestsellers` | **刪除** | 刪除：熱賣標籤下的非食用床窩、抓板、跳台、胸背帶或貓砂設備 | `/products/bestseller-cat-scratcher.webp` |
| 75 | `bestseller-pet-bed`<br>人氣寵物保暖窩 | `src/lib/products.ts（PRODUCTS_RAW）` | `bestsellers` | **刪除** | 刪除：熱賣標籤下的非食用床窩、抓板、跳台、胸背帶或貓砂設備 | `/products/bestseller-pet-bed.webp` |
| 76 | `bestseller-cat-tower`<br>人氣貓咪跳台 | `src/lib/products.ts（PRODUCTS_RAW）` | `bestsellers` | **刪除** | 刪除：熱賣標籤下的非食用床窩、抓板、跳台、胸背帶或貓砂設備 | `/products/bestseller-cat-tower.webp` |
| 77 | `bestseller-dog-harness`<br>人氣狗狗胸背帶 | `src/lib/products.ts（PRODUCTS_RAW）` | `bestsellers` | **刪除** | 刪除：熱賣標籤下的非食用床窩、抓板、跳台、胸背帶或貓砂設備 | `/products/bestseller-dog-harness.webp` |
| 78 | `bestseller-litter-box`<br>人氣全封閉貓砂盆 | `src/lib/products.ts（PRODUCTS_RAW）` | `bestsellers` | **刪除** | 刪除：熱賣標籤下的非食用床窩、抓板、跳台、胸背帶或貓砂設備 | `/products/bestseller-litter-box.webp` |
| 79 | `bestseller-cat-food`<br>人氣日本貓糧 | `src/lib/products.ts（PRODUCTS_RAW）` | `bestsellers` | **保留** | 保留：商品本體屬貓狗食品或小食 | `/products/bestseller-cat-food.webp` |
| 80 | `bestseller-dog-treats`<br>人氣狗狗肉乾禮盒 | `src/lib/products.ts（PRODUCTS_RAW）` | `dogs` | **保留** | 保留：商品本體屬貓狗食品或小食 | `/products/bestseller-dog-treats.webp` |
| 81 | `pet-travel-backpack`<br>寵物外出背包 | `src/lib/products.ts（PRODUCTS_RAW）` | `outdoor` | **刪除** | 刪除：外出、攜帶、飲食容器或車用設備，不可食用或服用 | `/products/pet-travel-backpack.webp` |
| 82 | `pet-foldable-bottle`<br>摺疊寵物飲水器 | `src/lib/products.ts（PRODUCTS_RAW）` | `outdoor` | **刪除** | 刪除：外出、攜帶、飲食容器或車用設備，不可食用或服用 | `/products/pet-foldable-bottle.webp` |
| 83 | `pet-leash-set`<br>寵物牽引帶套裝 | `src/lib/products.ts（PRODUCTS_RAW）` | `outdoor` | **刪除** | 刪除：外出、攜帶、飲食容器或車用設備，不可食用或服用 | `/products/pet-leash-set.webp` |
| 84 | `outdoor-pet-stroller`<br>寵物四輪推車 | `src/lib/products.ts（PRODUCTS_RAW）` | `outdoor` | **刪除** | 刪除：外出、攜帶、飲食容器或車用設備，不可食用或服用 | `/products/outdoor-pet-stroller.webp` |
| 85 | `outdoor-collapsible-bowl-set`<br>摺疊寵物飯盒套裝 | `src/lib/products.ts（PRODUCTS_RAW）` | `outdoor` | **刪除** | 刪除：外出、攜帶、飲食容器或車用設備，不可食用或服用 | `/products/outdoor-collapsible-bowl-set.webp` |
| 86 | `outdoor-pet-carrier`<br>寵物外出手提包 | `src/lib/products.ts（PRODUCTS_RAW）` | `outdoor` | **刪除** | 刪除：外出、攜帶、飲食容器或車用設備，不可食用或服用 | `/products/outdoor-pet-carrier.webp` |
| 87 | `outdoor-led-collar`<br>寵物LED發光頸圈 | `src/lib/products.ts（PRODUCTS_RAW）` | `outdoor` | **刪除** | 刪除：外出、攜帶、飲食容器或車用設備，不可食用或服用 | `/products/outdoor-led-collar.webp` |
| 88 | `outdoor-car-seat-cover`<br>寵物汽車防護座墊 | `src/lib/products.ts（PRODUCTS_RAW）` | `outdoor` | **刪除** | 刪除：外出、攜帶、飲食容器或車用設備，不可食用或服用 | `/products/outdoor-car-seat-cover.webp` |
| 89 | `wt-product-1`<br>CIAO 貓罐罐 - 鰹魚 帆立貝 85g x 6個 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-product-1.jpg` |
| 90 | `wt-product-2`<br>CIAO 貓罐罐 - 白肉金槍魚、金槍魚乾、金槍魚汁 85g　x6個 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-product-2.jpg` |
| 91 | `wt-product-3`<br>CIAO 貓罐罐 - 雞肉, 和牛 85g　x 6個 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-product-3.jpg` |
| 92 | `wt-product-4`<br>CIAO　鮮肉杯　-　鰹魚, 金槍魚, 雞肉 （11歳起食用）70g x 6 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-product-4.jpg` |
| 93 | `wt-product-5`<br>CIAO　鮮肉杯　- 金槍魚 (11歳起食用)70g x 6 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-product-5.jpg` |
| 94 | `wt-product-6`<br>CIAO 貓罐罐 - 雞胸肉 鯛魚 鯛魚汁 85g x6個 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-product-6.jpg` |
| 95 | `wt-product-7`<br>CIAO 貓罐罐 - 白肉金槍魚, 白飯魚85g x6個 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-product-7.jpg` |
| 96 | `wt-product-8`<br>CIAO 貓罐罐 - 雞肉, 黃金槍魚, 木魚乾 85g x6個 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-product-8.jpg` |
| 97 | `wt-product-9`<br>CIAO 貓罐罐 - 白肉金槍魚、越光米 85g  x 6個 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-product-9.jpg` |
| 98 | `wt-product-10`<br>CIAO 貓罐罐 - 白肉金槍魚、鰹魚乾 85g  x 6個 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-product-10.jpg` |
| 99 | `wt-dry-food-1`<br>CIAO 1兆個乳酸菌乾糧 · 鰹魚乾味（10袋 × 6盒） | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-dry-food-1.jpg` |
| 100 | `wt-dry-food-2`<br>CIAO 乳酸糧脆條 · 雞肉味（5條裝 × 6盒） | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-dry-food-2.jpg` |
| 101 | `wt-dry-food-3`<br>CIAO 1兆個乳酸菌乾糧 · 金槍魚乾味（10袋 × 6盒） | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-dry-food-3.jpg` |
| 102 | `wt-dry-food-4`<br>CIAO 1兆個乳酸菌乾糧 · 三款金槍魚味（10袋 × 6盒） | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-dry-food-4.jpg` |
| 103 | `wt-dry-food-5`<br>CIAO 1兆個乳酸菌乾糧 · 三款木魚乾味（10袋 × 6盒） | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-dry-food-5.jpg` |
| 104 | `wt-dry-food-6`<br>CIAO 1兆個乳酸菌乾糧 · 三款雞肉味（10袋 × 6盒） | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-dry-food-6.jpg` |
| 105 | `wt-dry-food-7`<br>CIAO 乳酸糧脆條 · 鰹魚味（5條裝 × 6盒） | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-dry-food-7.jpg` |
| 106 | `wt-dry-food-8`<br>CIAO 1兆個乳酸菌乾糧 · 金槍魚味（幼貓用｜10袋 × 6盒） | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-dry-food-8.jpg` |
| 107 | `wt-dry-food-9`<br>CIAO 乳酸糧脆條 · 金槍魚乾味（5條裝 × 6盒） | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-dry-food-9.jpg` |
| 108 | `wt-dry-food-10`<br>CIAO 1兆個乳酸菌乾糧 · 三款金槍魚鰹魚味（10袋 × 6盒） | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-dry-food-10.jpg` |
| 109 | `wt-dry-food-11`<br>CIAO 1兆個乳酸菌乾糧 · 三款海鮮味（10袋 × 6盒） | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-dry-food-11.jpg` |
| 110 | `wt-freeze-dried-1`<br>MAMACOOK 但馬高原冷凍脫水雞條（貓貓用）30g × 10袋 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-1.jpg` |
| 111 | `wt-freeze-dried-2`<br>MAMACOOK 但馬高原冷凍脫水雞胸肉・雞肝（貓貓用）18g × 10袋 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-2.jpg` |
| 112 | `wt-freeze-dried-3`<br>MAMACOOK 但馬高原冷凍日本國產帆立貝（貓貓用）11g × 10袋 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-3.jpg` |
| 113 | `wt-freeze-dried-4`<br>MAMACOOK 但馬高原冷凍脫水銀魚（貓貓用）10g × 10袋 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-4.jpg` |
| 114 | `wt-freeze-dried-5`<br>MAMACOOK 但馬高原冷凍日本國產虹鮭魚（貓貓用）15g × 10袋 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-5.jpg` |
| 115 | `wt-freeze-dried-6`<br>MAMACOOK 但馬高原冷凍脫水雞胸肉・雞腎（貓貓用）18g × 10袋 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-6.jpg` |
| 116 | `wt-freeze-dried-7`<br>MAMACOOK 但馬高原冷凍日本國產金槍魚（貓貓用）14g × 10袋 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-7.jpg` |
| 117 | `wt-freeze-dried-8`<br>MAMACOOK 但馬高原冷凍脫水雞柳（貓貓用）30g × 10袋 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-8.jpg` |
| 118 | `wt-freeze-dried-9`<br>MAMACOOK 但馬高原冷凍脫水雞粒（貓貓用）18g × 10袋 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-9.jpg` |
| 119 | `wt-freeze-dried-10`<br>MAMACOOK 但馬高原冷凍脫水豬心（貓貓用）25g × 10袋 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-10.jpg` |
| 120 | `wt-freeze-dried-11`<br>MAMACOOK 但馬高原冷凍脫水無添加豬大腿肉（貓貓用）20g × 10袋 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-11.jpg` |
| 121 | `wt-freeze-dried-12`<br>MAMACOOK 但馬高原冷凍日本國產信州三文魚（貓貓用）17g × 10袋 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-12.jpg` |
| 122 | `wt-freeze-dried-13`<br>Petio 冷凍脫水系列・三文魚（貓貓用）10g × 6 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-13.jpg` |
| 123 | `wt-freeze-dried-14`<br>Petio 冷凍脫水系列・雞肉・雞肝・雞腎 15g × 6 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-14.jpg` |
| 124 | `wt-freeze-dried-15`<br>Petio 冷凍脫水系列・金槍魚・鰹魚・三文魚 9g × 6 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-15.jpg` |
| 125 | `wt-freeze-dried-16`<br>MAMACOOK 但馬高原冷凍脫水西太公魚（貓貓用）10g × 10袋 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-16.jpg` |
| 126 | `wt-freeze-dried-17`<br>日本國產無添加冷凍脫水雞肝（貓貓用）40g × 8 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-17.jpg` |
| 127 | `wt-freeze-dried-18`<br>日本國產無添加冷凍脫水雞肉（貓貓用）40g × 8 | `src/data/productsData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-freeze-dried-18.jpg` |
| 128 | `wt-cat-natural-1`<br>MonPetit Nature Kiss 無添加雞胸肉醬・雞胸肉粒 40g × 12袋 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-natural-1.jpg` |
| 129 | `wt-cat-natural-2`<br>MonPetit Nature Kiss 無添加雞胸肉醬・金槍魚粒 40g × 12袋 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-natural-2.jpg` |
| 130 | `wt-cat-natural-3`<br>MonPetit Nature Kiss 無添加三文魚醬・木魚乾 40g × 12袋 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-natural-3.jpg` |
| 131 | `wt-cat-natural-4`<br>MonPetit Nature Kiss 無添加吞拿魚醬・雞胸肉粒 40g × 12袋 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-natural-4.jpg` |
| 132 | `wt-cat-natural-5`<br>MonPetit Nature Kiss 無添加雞胸肉醬・三文魚粒 40g × 12袋 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-natural-5.jpg` |
| 133 | `wt-cat-natural-6`<br>CIAO PURE 無添加糊仔 4條裝 — 金槍魚＆帆立貝 × 12 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-natural-6.jpg` |
| 134 | `wt-cat-natural-7`<br>CIAO PURE 無添加糊仔 4條裝 — 金槍魚味 × 12 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-natural-7.jpg` |
| 135 | `wt-cat-natural-8`<br>CIAO PURE 無添加糊仔 4條裝 — 雞肉 × 12 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-natural-8.jpg` |
| 136 | `wt-cat-natural-9`<br>Petzroute 無添加山羊奶（小貓小狗用）50g × 10袋 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-natural-9.jpg` |
| 137 | `wt-cat-senior-1`<br>CIAO 燒鰹魚 — 骨膠原添加（高齡貓用）× 24袋 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-senior-1.jpg` |
| 138 | `wt-cat-senior-2`<br>CIAO 燒鰹魚 — 帆立貝味（高齡貓用）× 24袋 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-senior-2.jpg` |
| 139 | `wt-cat-senior-3`<br>CIAO 糊仔小食 4條裝 — 金槍魚＆鰹魚味（11歳起）× 12 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-senior-3.jpg` |
| 140 | `wt-cat-senior-4`<br>CIAO 糊仔小食 4條裝 — 雞肉味（11歳起）× 12 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-senior-4.jpg` |
| 141 | `wt-cat-senior-5`<br>CIAO 燒鰹魚 — 高齡貓用 5條裝 × 6袋 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-senior-5.jpg` |
| 142 | `wt-cat-senior-6`<br>CIAO 貓罐罐 — 鰹魚＋木魚（鰹魚乾）14歳起老貓用 75g × 6 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-senior-6.jpg` |
| 143 | `wt-cat-hairball-1`<br>Sheba Duo 夾心餡餅 — 去毛球配方 200g × 6 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-hairball-1.jpg` |
| 144 | `wt-cat-hairball-2`<br>CIAO 膏狀小食 — 金槍魚味（吐毛球配方）× 6 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-hairball-2.jpg` |
| 145 | `wt-cat-hairball-3`<br>Combo 貓貓脆餅 — 海鮮味（去毛球配方）14小袋 × 6 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-hairball-3.jpg` |
| 146 | `wt-cat-hairball-4`<br>CIAO 糊仔小食 4條裝 — 金槍魚（吐毛球配方）× 12 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-hairball-4.jpg` |
| 147 | `wt-cat-hairball-5`<br>CIAO 糊仔小食 4條裝 — 雞肉味（去毛球配方）× 12 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-hairball-5.jpg` |
| 148 | `wt-cat-hairball-6`<br>unicharm 銀匙 貓貓脆餅 — 毛玉配慮 40g×4袋 × 8 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-hairball-6.jpg` |
| 149 | `wt-cat-hairball-7`<br>CIAO 糊仔小食 4條裝 — 金槍魚味（去毛球配方）× 12 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-hairball-7.jpg` |
| 150 | `wt-cat-hairball-8`<br>三星銀匙 海鮮味脆餅（去毛球配方）60g × 6 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-hairball-8.jpg` |
| 151 | `wt-cat-kitten-1`<br>Sheba Duo 夾心餡餅 — 金槍魚綜合味（幼貓用）200g × 6盒 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-kitten-1.jpg` |
| 152 | `wt-cat-kitten-2`<br>日本森乳貓奶粉 150g × 3 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-kitten-2.jpg` |
| 153 | `wt-cat-kitten-3`<br>Sheba Duo 夾心餡餅 — 牛奶味（幼貓用）200g × 6盒 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-kitten-3.jpg` |
| 154 | `wt-cat-kitten-4`<br>Royal Goat Milk 貴族山羊奶（小貓小狗用）25g × 12袋 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-kitten-4.jpg` |
| 155 | `wt-cat-kitten-5`<br>Mio 幼貓奶粉 250g × 3 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-kitten-5.jpg` |
| 156 | `wt-cat-kitten-6`<br>CIAO 燒鰹魚 — 1歳前食用 × 24袋 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-kitten-6.jpg` |
| 157 | `wt-cat-kitten-7`<br>CIAO 糊仔小食 4條裝 — 雞胸肉（1歳前）× 12 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-kitten-7.jpg` |
| 158 | `wt-cat-kitten-8`<br>Hell's Kitchen 貓貓袋裝肉泥 — 雞肉芝士味（幼貓用）90g × 8 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-kitten-8.jpg` |
| 159 | `wt-cat-kitten-9`<br>Hell's Kitchen 貓貓袋裝肉泥 — 雞肉牛奶味（幼貓用）90g × 8 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-cat-kitten-9.jpg` |
| 160 | `wt-cat-kitten-10`<br>Mio 幼貓餵奶樽 × 3個 | `src/data/catSnacksData.ts` | `cats` | **刪除** | 刪除：幼貓餵奶樽是餵食設備，不可食用或服用 | `/images/products/wt-cat-kitten-10.jpg` |
| 161 | `wt-cat-kitten-11`<br>CIAO 糊仔小食 4條裝 — 金槍魚味（1歳前）× 12 | `src/data/catSnacksData.ts` | `cats` | **保留** | 保留：CIAO 幼貓金槍魚糊仔，屬可食用商品（指定必須保留） | `/images/products/wt-cat-kitten-11.jpg` |
| 162 | `wt-japan-001`<br>但馬高原 - 冷凍脫水雞胸肉雞冠 (狗狗用) 18g x 10袋 | `public/wt_japan_products.json` | `dogs` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-japan-001.webp` |
| 163 | `wt-japan-002`<br>日本國產無添加狗狗小食 - 雞肝乾 100g x 10 | `public/wt_japan_products.json` | `dogs` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-japan-002.webp` |
| 164 | `wt-japan-003`<br>日本國產無添加狗狗小食 - 薄切牛舌乾 50g x 10 | `public/wt_japan_products.json` | `dogs` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-japan-003.webp` |
| 165 | `wt-japan-004`<br>HappyDays 日本國產狗狗小食 - 鹿肉薄片 30g x 10 | `public/wt_japan_products.json` | `dogs` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-japan-004.webp` |
| 166 | `wt-japan-005`<br>日本國產無添加狗狗小食 - 牛筋長條 (牛アキレスロング) 70g x 10 | `public/wt_japan_products.json` | `dogs` | **保留** | 保留：貓狗可食用食品、小食、奶類、凍乾或零食 | `/images/products/wt-japan-005.webp` |

## 刪除候選完整清單（64 項）

- `cat-auto-water-fountain`
- `cat-tofu-litter-6l`
- `cat-catnip-toy`
- `cat-window-perch`
- `dog-warm-coat`
- `dog-training-pads`
- `dog-raincoat`
- `dog-wafuu-collar`
- `dog-chew-toy`
- `dog-travel-bowl`
- `toy-neko-ichi-wobble-wand`
- `toy-petio-silvervine-chew`
- `toy-richell-treat-ball`
- `toy-doggyman-cotton-rope-bone`
- `toy-supercat-disc-launcher`
- `toy-adies-tunnel-scratcher`
- `toy-petio-plush-squeaky-animal`
- `toy-mindup-feather-wand`
- `toy-planetdog-bounce-ball`
- `toy-cattyman-spinning-butterfly`
- `toy-richell-snuffle-mat`
- `toy-petio-catnip-fish-pillow`
- `toy-doggyman-dumbbell-chew`
- `toy-nekoichi-bowl-scratcher`
- `toy-koneko-bell-ball-set`
- `toy-petio-laser-chaser`
- `toy-doggyman-ring-frisbee`
- `toy-richell-cardboard-house`
- `toy-supercat-catnip-mouse`
- `toy-petio-slider-puzzle`
- `toy-cattyman-ball-tower`
- `toy-doggyman-dental-tennis-balls`
- `toy-nekoichi-feather-spring`
- `toy-richell-sisal-mouse`
- `toy-petio-cooling-chew-bone`
- `toy-cattyman-crinkle-tunnel`
- `toy-doggyman-tugofwar-rope-ball`
- `toy-supercat-chirping-bird`
- `pet-odor-spray`
- `litter-cleaning-kit`
- `pet-shampoo`
- `cleaning-lint-roller`
- `cleaning-air-freshener`
- `cleaning-paw-wipes`
- `cleaning-deodorizing-mat`
- `cleaning-pet-toothbrush-kit`
- `deal-cleaning-bundle`
- `deal-newyear-hamper`
- `deal-toy-clearance`
- `deal-outdoor-combo`
- `bestseller-cat-scratcher`
- `bestseller-pet-bed`
- `bestseller-cat-tower`
- `bestseller-dog-harness`
- `bestseller-litter-box`
- `pet-travel-backpack`
- `pet-foldable-bottle`
- `pet-leash-set`
- `outdoor-pet-stroller`
- `outdoor-collapsible-bowl-set`
- `outdoor-pet-carrier`
- `outdoor-led-collar`
- `outdoor-car-seat-cover`
- `wt-cat-kitten-10`

## 執行與驗證門檻

- 刪除必須在各權威來源內完成，不能只在最終匯出陣列套用隱藏式過濾。
- `wt-cat-kitten-11` 必須存在；`wt-cat-kitten-10` 及上述其餘 63 個 ID 必須不存在。
- 最終商品數、唯一 ID 數與預期基準均為 102。
- 搜尋索引 ID 集合必須與核心 `PRODUCTS` 集合完全相等：`coverage=100%`、`missing=0`、`unexpected=0`。
- 保留商品引用的每一個本地圖片檔案必須存在。只可刪除已不再被任何保留商品或其他專案內容引用的孤立圖片。
- 驗證需覆蓋權威 JSON、唯一 ID、圖片存在、搜尋覆蓋，以及購物車／訂單價格重建。

## 分類不確定項與已採用裁決

- `health-dental-water`：名稱含「漱口水添加劑」，但用途是加入飲用水攝取；依「可服用／可經飲水攝取」規則保留。
- `dog-coat-oil`：屬營養油，可口服；保留。
- `deal-newyear-hamper`：內容混合小食與非食用品；依混合套裝邊界整項刪除。
- 玩具名稱內即使含「潔齒」、「零食」、「藏食」或「貓草」，若商品本體是球、繩、墊、抓板、隧道等不可食用物件，仍刪除。
- `cleaning-pet-toothbrush-kit`：包含牙膏但本體為牙刷連牙膏的清潔工具套裝，並非以服用為目的；刪除。

## 變更前證據狀態

本文件按修改前實際編譯所得 `PRODUCTS` 清冊建立。此時尚未修改權威來源、驗證腳本或圖片檔案；102／64 是審計決策基準，最終結果須以修改後針對性驗證為準。

## 修改後實際結果（執行附錄）

- 最終 catalog：**102 項**；唯一 ID：**102 個**。
- 實際刪除：**64 項**（`src/lib/products.ts` 63 項、`src/data/catSnacksData.ts` 1 項）。
- `wt-cat-kitten-11`：存在並通過必要商品正面斷言。
- 搜尋索引：`102/102`，覆蓋率 `100%`，`missing=0`，`unexpected=0`。
- 圖片：102 項保留商品的本地圖片全部存在；64 張被刪商品圖片在全專案引用核對後確認為孤立資產並已刪除。
- metadata／原始匯入快照：從 `public/products/ATTRIBUTION.json` 移除 63 個已刪商品 attribution；從 `scripts/wt_cat_snacks_raw.json` 移除 `wt-cat-kitten-10`，餘 33 項。
- 產品驗證：`npm run validate:products` 通過，涵蓋商品數、唯一 ID、必填欄位、價格、圖片、完整負面／正面斷言、權威 JSON、動態旁路、搜尋覆蓋及訂單價格重建。
- 型別檢查：`tsc --noEmit --pretty false` 通過。
- `.validation-build`：驗證 runner 已清理，沒有殘留。
- 依本輪限制，沒有執行 production build、Git push 或 ZIP。
