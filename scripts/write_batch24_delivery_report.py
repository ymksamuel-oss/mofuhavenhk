from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
mapping = json.loads((ROOT / 'batch24_import_mapping.json').read_text(encoding='utf-8'))
manifest = json.loads((ROOT / 'batch24_stripe_manifest.json').read_text(encoding='utf-8'))
verification = json.loads((ROOT / 'batch24_stripe_verification.json').read_text(encoding='utf-8'))
checkout = json.loads((ROOT / 'batch24_checkout_verification.json').read_text(encoding='utf-8'))
out = ROOT / 'batch24_delivery_report.md'

by_sku = {item['sku']: item for item in mapping['products']}
groups = defaultdict(list)
for record in manifest['products']:
    item = by_sku[record['sku']]
    groups[(item['category'], item['subcategory'], item['brand'])].append((item, record))

lines = [
    '# 批次 24：24 款產品上架交付報告',
    '',
    '## 上架結果',
    '',
    '| 項目 | 結果 |',
    '| --- | --- |',
    f"| Stripe 產品／HKD Price | {manifest['product_count']}／{manifest['price_count']} |",
    f"| 直接 Stripe 驗證 | {verification['passed_count']}/{verification['product_count']} 項產品通過 |",
    f"| 狗狗產品／貓咪產品 | {verification['dogs_count']}／{verification['cats_count']} |",
    '| 商品圖片 | 24 張原始截圖均先處理為 1920 × 1920 純白背景主圖，所有 Stripe 圖片均核對通過 |',
    '| 定價口徑 | 已確認採購價 × 1.1654 CNY/HKD 暫估匯率；內地直運入貨運費 HK$0；45% 目標產品毛利率後向上調整至 `.90` 零售尾數 |',
    '| 劃線原價 | 未提供真實原價；全部維持不顯示劃線價 |',
    '',
    '## 分類與定價摘要',
    '',
    '| 類別 | 品牌 | 款數 | 售價範圍 |',
    '| --- | --- | ---: | ---: |',
]
for (category, subcategory, brand), rows in sorted(groups.items()):
    prices = sorted({item['retail_hkd'] for item, _ in rows})
    price_text = '、'.join(f'HK${p:.2f}' for p in prices)
    lines.append(f"| {'狗狗' if category == 'dogs' else '貓咪'}／{subcategory} | {brand} | {len(rows)} | {price_text} |")

lines += [
    '',
    '## 商品與 Stripe 對照',
    '',
    '| SKU | 商品 | 規格 | 售價 | Stripe Product | Stripe Price |',
    '| --- | --- | --- | ---: | --- | --- |',
]
for record in manifest['products']:
    item = by_sku[record['sku']]
    lines.append(
        f"| {item['sku']} | {item['name_zh']} | {item['spec']} | HK${item['retail_hkd']:.2f} | `{record['stripe_product_id']}` | `{record['stripe_price_id']}` |"
    )

lines += [
    '',
    '## 前台及結帳驗證',
    '',
    'PETLINE 狗狗果凍包頁與銀之匙貓罐頭頁均已在正式站核對，顯示正確清理後 CDN 圖片、分類、規格狀態、售價及加入購物籃控制項。規格狀態的重複動物標籤已修正後再次覆核。',
    '',
    f"Hosted Checkout 使用銀之匙濃湯仕立鮪魚貓罐頭的指定 Price ID `{checkout['price_id']}`；商品 HK${checkout['target_item_hkd']:.2f}、Session 總額 HK${checkout['session_total_hkd']:.2f}，在未付款狀態下已立即使 Session 失效。",
    '',
    '## 備註',
    '',
    '入貨成本使用近期 CNY/HKD 匯率的暫估值，待取得實際付款匯率時應覆核。顧客香港本地運費是全單層級規則，並沒有攤入單件採購成本。',
]
out.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(out)
