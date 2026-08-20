# Pet World 三個品種真實圖片來源稽核

> 本清單只收錄 Wikimedia Commons 中屬於相應**正式品種分類**或檔案描述明確標示相應品種的真實照片。所有候選均已查核原始尺寸、作者及開放授權；不含 AI 圖像、圖庫水印、插圖或泛用短毛／長毛貓照片。

## 英國短毛貓

| # | Wikimedia Commons 檔案 | 原始尺寸 | 作者 | 授權 |
| --- | --- | --- | --- | --- |
| 1 | [A British Shorthair cat.jpg][b1] | 3747 × 5257 | George E. Koronaios | CC BY-SA 4.0 |
| 2 | [A two years old British Shorthair cat.jpg][b2] | 5549 × 4000 | George E. Koronaios | CC BY-SA 4.0 |
| 3 | [BRI Hoshi Black Diamond][b3] | 2800 × 3400 | Nickolas Titkov | CC BY-SA 2.0 |
| 4 | [BRI kittens 5648020191][b4] | 3410 × 2732 | Nickolas Titkov | CC BY-SA 2.0 |
| 5 | [BRI kittens 5648023711][b5] | 3718 × 2912 | Nickolas Titkov | CC BY-SA 2.0 |
| 6 | [Mediterranean Winner Show 2016 63][b6] | 4000 × 3000 | Nicholas Gemini | CC BY-SA 4.0 |

## 美國短毛貓

| # | Wikimedia Commons 檔案 | 原始尺寸 | 作者 | 授權 |
| --- | --- | --- | --- | --- |
| 1 | [American Shorthair.jpg][a1] | 1536 × 2048 | Dustin Warrington | CC BY-SA 2.0 |
| 2 | [American shorthair housecat.jpg][a2] | 3024 × 4032 | Pluckhorizon47 | CC BY-SA 4.0 |
| 3 | [In Awe][a3] | 2094 × 1674 | Darron Birgenheier | CC BY-SA 2.0 |
| 4 | [美國短毛貓.jpeg][a4] | 3456 × 5184 | Luke12345678901 | CC BY-SA 4.0 |
| 5 | [Baby American shorthair in loaf pose.jpg][a5] | 1072 × 1280 | Crispybeatle | CC0 |
| 6 | [ASH Russeller’s Cleopatra of Solid Fold][a6] | 4268 × 2900 | Nickolas Titkov | CC BY-SA 2.0 |

## 布偶貓

| # | Wikimedia Commons 檔案 | 原始尺寸 | 作者 | 授權 |
| --- | --- | --- | --- | --- |
| 1 | [Ragdoll from Gatil Ragbelas.jpg][r1] | 921 × 872 | Simone Johnsson | CC BY-SA 2.0 |
| 2 | [Flame point Ragdoll.jpg][r2] | 1602 × 2397 | Cássia Afini | CC BY 2.0 |
| 3 | [Ragdoll Cat 2023.jpg][r3] | 1965 × 2342 | Kadı | CC BY-SA 4.0 |
| 4 | [Ragdoll bicolor blue gatil mozziland portugal.jpg][r4] | 6000 × 4000 | MOZZILAND | CC BY-SA 4.0 |
| 5 | [Kocour Ragdoll ležící na posteli.jpg][r5] | 4096 × 3072 | Kryštof Jelínek | CC0 |
| 6 | [Cat brotherhood.jpg][r6] | 5630 × 4894 | Arjunmz | CC BY 4.0 |

## 使用方式

網站會保留所有原始來源頁連結、作者及授權，並在每個品種圖片區下方提供歸屬標註。由於部分圖像採 **CC BY-SA**，本網站只會以原樣轉送及展示；若日後另行裁剪、重混或發佈衍生版本，需依相同或相容授權處理。

## 匯入前視覺抽查

已於 2026-08-20 抽查英國短毛貓與美國短毛貓的首張 1920px 級別匯入照片。英短相片可清楚辨識其藍灰短毛、圓臉與銅色眼睛；美短相片可清楚辨識虎斑花紋與短毛特徵。兩者均為清晰實拍、無水印、無文字覆蓋，並適合在 4:3 主圖框與 56px 縮圖中展示。

布偶貓的首張匯入照片亦已抽查，藍眼、重點色、白色半長毛及圓潤體態均清晰可辨。其後本地 `/pet-world` 預覽呈現空白頁，但瀏覽器主控台沒有前端例外；此現象與新照片檔案無關，會以獨立的前端載入／預覽環境檢查處理，並在正式部署前完成視覺驗證。

進一步檢查顯示本地頁面的 `#root` 尚未掛載內容，但 Vite 已成功回傳 `main.tsx`、`App.tsx`、`PetWorld.tsx` 及其相依模組。此為預覽環境的應用程式啟動問題，與圖片檔案下載、受控資產映射或照片授權資料無關。

公開預覽代理對帶查詢參數的 `main.tsx` 仍回應 `200 text/javascript`，但瀏覽器動態匯入回報載入失敗，且重新載入後 `#root` 仍為空。正式 production build 已可完成；因此下一步會以正式部署的靜態產物及受控 `/assets/pet/` 路由進行最終畫面驗證。

[b1]: https://commons.wikimedia.org/wiki/File:A_British_Shorthair_cat.jpg
[b2]: https://commons.wikimedia.org/wiki/File:A_two_years_old_British_Shorthair_cat.jpg
[b3]: https://commons.wikimedia.org/wiki/File:BRI_Hoshi_Black_Diamond_(5648566590).jpg
[b4]: https://commons.wikimedia.org/wiki/File:BRI_kittens_(5648020191).jpg
[b5]: https://commons.wikimedia.org/wiki/File:BRI_kittens_(5648023711).jpg
[b6]: https://commons.wikimedia.org/wiki/File:Mediterranean_Winner_Show_2016_63.JPG
[a1]: https://commons.wikimedia.org/wiki/File:American_Shorthair.jpg
[a2]: https://commons.wikimedia.org/wiki/File:American_shorthair_housecat.jpg
[a3]: https://commons.wikimedia.org/wiki/File:In_Awe_(8305613603).jpg
[a4]: https://commons.wikimedia.org/wiki/File:%E7%BE%8E%E5%9C%8B%E7%9F%AD%E6%AF%9B%E8%B2%93.jpeg
[a5]: https://commons.wikimedia.org/wiki/File:Baby_American_shorthair_in_loaf_pose.jpg
[a6]: https://commons.wikimedia.org/wiki/File:ASH_Russeller%E2%80%99s_Cleopatra_of_Solid_Fold_(4496229769).jpg
[r1]: https://commons.wikimedia.org/wiki/File:Ragdoll_from_Gatil_Ragbelas.jpg
[r2]: https://commons.wikimedia.org/wiki/File:Flame_point_Ragdoll.jpg
[r3]: https://commons.wikimedia.org/wiki/File:Ragdoll_Cat_2023.jpg
[r4]: https://commons.wikimedia.org/wiki/File:Ragdoll_bicolor_blue_gatil_mozziland_portugal.jpg
[r5]: https://commons.wikimedia.org/wiki/File:Kocour_Ragdoll_le%C5%BE%C3%ADc%C3%AD_na_posteli.jpg
[r6]: https://commons.wikimedia.org/wiki/File:Cat_brotherhood.jpg
