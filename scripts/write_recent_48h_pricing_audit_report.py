from __future__ import annotations

import json
from pathlib import Path

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
manifest = json.loads((ROOT / 'recent_48h_price_change_manifest.json').read_text(encoding='utf-8'))
pricing = json.loads((ROOT / 'recent_48h_retail_formula_audit.json').read_text(encoding='utf-8'))

by_family = {}
for row in pricing['rows']:
    bucket = by_family.setdefault(row['family'], {'total': 0, 'recalculable': 0, 'formula_match': 0, 'formula_diff': 0, 'missing_cost': 0})
    bucket['total'] += 1
    if row['pricing_status'] == 'recalculable':
        bucket['recalculable'] += 1
        if float(row['price_delta_hkd']) == 0:
            bucket['formula_match'] += 1
        else:
            bucket['formula_diff'] += 1
    else:
        bucket['missing_cost'] += 1

lines = [
    '# Mofu Haven 最近兩日新增產品：定價與劃線價稽核報告',
    '',
    '## 結論',
    '',
    f"本次以 Stripe 建立時間 **{manifest['scope']['total_products']} 款**最近 48 小時新增產品為範圍，採用既定 `CNY/HKD 1.1654`、已知入貨運費／集運資料、**45% 產品毛利目標**及「向上取下一個 `.90` 價格帶」的規則重算。共有 **{manifest['scope']['recalculable_products']} 款**具可追溯成本；其中 **{manifest['scope']['already_at_formula_price']} 款**已符合公式，另有 **{manifest['scope']['retail_price_updates']} 款**的純成本公式結果不同於現價。",
    '',
    '但在將市場比較納入後，本次**不直接建立任何新 Stripe 價格或新增任何前台劃線原價**。這是有意的安全結果，而非遺漏：',
    '',
    '1. CIAO／Vet’s Labo 20 款已有用戶提供的劃線原價；按成本公式提高現價會令現價高於既有原價，故不應自動改價。',
    '2. d.b.f 23 款的純成本公式建議價高於多個同規格香港市場現價。直接提高至公式價會削弱競爭力，需有商戶確認的策略（例如成本、組合包或促銷）才可改價。',
    '3. ONE CARE 的 7 款是 5／15／30 罐多規格架構；不能只重設預設 5 罐價格而不重算其餘兩個階梯。',
    '4. 41 款沒有完整成本資料，不能可靠重算零售價。',
    '5. 外部零售商的「原價」屬市場參考，並非已證實的 Mofu Haven 歷史售價，因此不寫入目前前台標示為「原價」的欄位。',
    '',
    '## 範圍與成本覆蓋',
    '',
    '| 批次 | 產品數 | 可按公式重算 | 已符合公式 | 公式有差異 | 成本待補 |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
]
for family, data in sorted(by_family.items()):
    lines.append(f"| {family} | {data['total']} | {data['recalculable']} | {data['formula_match']} | {data['formula_diff']} | {data['missing_cost']} |")

lines += [
    '',
    '## 劃線價稽核',
    '',
    f"現有劃線價 **{manifest['scope']['existing_compare_at_unchanged']} 款**已保留不變。對另外 73 款進行逐項公開來源研究後，只找到 {manifest['scope']['external_market_references_withheld']} 項同規格且明確標示促銷前價格的市場資料；所有資料均保留在稽核工作簿，但沒有被轉寫為本店原價。",
    '',
    '> 市場參考價可用於判斷本店售價是否有競爭力，但不應在沒有本店實際歷史售價、廠商建議零售價或其他可證明本店原價來源時，直接顯示為「原價」。',
    '',
    '## 直接覆核的市場例子',
    '',
    '| 產品 | 本店現價 | 外部頁面資料 | 稽核處理 |',
    '| --- | ---: | --- | --- |',
    '| d.b.f 雞肉紅薯 85g（D1104） | HK$27.20 | HKTVmall 顯示特價 HK$21、原價 HK$37。 | 作市場參考；同一 D1104 在兩個匯入產品名稱中出現，先不套用。 |',
    '| d.b.f 牛肉芝士 85g（D1100） | HK$27.20 | HKTVmall 顯示特價 HK$21、原價 HK$37。 | 作市場參考；不當作本店原價。 |',
    '| d.b.f 高齡犬雞肉紅薯 85g | HK$27.20 | HKTVmall 顯示特價 HK$13.80、原價 HK$36。 | 作市場參考；不當作本店原價。 |',
    '| Mama Cook 雞胸肉雞胗 18g | HK$62.40 | Meow Mart 顯示 HK$58、原價 HK$75。 | 作市場參考；不當作本店原價。 |',
    '',
    '## 後續資料使用規則',
    '',
    '將來若要新增劃線價，應優先使用：本店原來已採用的售價紀錄、品牌官方 HKD 建議零售價、或由你提供的真實原價清單。若採用市場比較，前台應另設「市場參考價」標籤，不能沿用「原價」。',
    '',
    '## References',
    '',
    '[1] https://www.hktvmall.com/hktv/en/main/%E8%B2%93%E7%8A%AC%E5%B7%A5%E6%88%BF/s/H5525001/Pets/Pets/For-Dog/Dog-Food/Canned-Dog-Food/All-Ages-Dog-Food/Chicken-Sweet-Potato-Dag-Can-85g-003790-D1104/p/H5525001_S_DBF_D1104 — HKTVmall：d.b.f D1104 Chicken & Sweet Potato 85g。',
    '[2] https://www.hktvmall.com/hktv/zh/main/Pet-Shop-Guys/s/H9760001/%E5%AF%B5%E7%89%A9%E7%94%A8%E5%93%81/%E5%AF%B5%E7%89%A9%E7%94%A8%E5%93%81/%E7%8B%97%E7%8B%97%E5%B0%88%E5%8D%80/%E7%8B%97%E9%A3%9F%E5%93%81/%E7%8B%97%E7%BD%90%E9%A0%AD/%E7%8B%97%E5%85%A8%E7%8A%AC%E4%B8%BB%E9%A3%9F%E7%BD%90/%E7%89%9B%E8%82%89%E5%8A%A0%E9%9B%9E%E8%82%89-%E8%8A%9D%E5%A3%AB-%E7%8B%97%E7%BD%90%E9%A0%AD-85g-DBF-033752-D1100/p/H9760001_S_DBF_D1100 — HKTVmall：d.b.f D1100 牛肉芝士 85g。',
    '[3] https://www.hktvmall.com/hktv/en/main/Buy-Station/s/B0630001/Pets/Pets/For-Dog/Dog-Food/Canned-Dog-Food/Senior-Dog-Food/Senior-dog-food-Joint-Brain-Health-Maintenance-Chicken-Sweet-Potato-Flavor-85g-Parallel-Imp/p/B0630001_S_033936 — HKTVmall：d.b.f 高齡犬雞肉紅薯 85g。',
    '[4] https://www.meow-mart.com/zh-hant/products/mmk-3811-1 — Meow Mart：Mama Cook 雞胸肉雞胗 18g。',
]
(ROOT / 'recent_48h_pricing_audit_report.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('Wrote recent_48h_pricing_audit_report.md')
