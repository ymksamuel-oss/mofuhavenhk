from __future__ import annotations

import json
from decimal import Decimal, ROUND_CEILING, ROUND_HALF_UP
from pathlib import Path

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
OUT = ROOT / 'batch24_product_mapping.json'

FX = Decimal('1.1654')
TARGET_MARGIN = Decimal('0.45')


def retail_price(cost: Decimal) -> Decimal:
    target = cost / (Decimal('1') - TARGET_MARGIN)
    rounded = (target / Decimal('10')).to_integral_value(rounding=ROUND_CEILING) * Decimal('10') - Decimal('0.10')
    if rounded < target:
        rounded += Decimal('10')
    return rounded.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


# Chinese names use conservative, packaging-based wording. Functional series names are
# label descriptions, not medical promises. No supplier/platform references are public.
ITEMS = [
    ('IMG_1602.PNG', 'PETLINE', 'ごちそうタイム ポケットパック 鶏むね肉と野菜のゼリー寄せ ビーフ仕立て', 'PETLINE 盛宴時光 雞胸肉蔬菜牛肉風味果凍包 25g×4', 'PETLINE Gochisou Time Chicken Breast, Vegetable & Beef-Style Jelly Pouches 25g×4', '25g×4', 'dogs', '狗狗小食', 'dog_wet_treat', '19.70'),
    ('IMG_1603.PNG', 'PETLINE', 'ごちそうタイム ポケットパック 鶏むね肉のチーズゼリー', 'PETLINE 盛宴時光 雞胸肉芝士果凍包 25g×4', 'PETLINE Gochisou Time Chicken Breast & Cheese Jelly Pouches 25g×4', '25g×4', 'dogs', '狗狗小食', 'dog_wet_treat', '19.70'),
    ('IMG_1604.PNG', 'PETLINE', 'ごちそうタイム ポケットパック 鶏むね肉のミルク煮 チーズ入り', 'PETLINE 盛宴時光 雞胸肉牛奶燉芝士包 25g×4', 'PETLINE Gochisou Time Chicken Breast Milk-Stew with Cheese Pouches 25g×4', '25g×4', 'dogs', '狗狗小食', 'dog_wet_treat', '19.70'),
    ('IMG_1605.PNG', 'PETLINE', 'ごちそうタイム ポケットパック 鶏ペーストのミルクジュレ チーズ添え', 'PETLINE 盛宴時光 雞肉泥牛奶果凍芝士包 25g×4', 'PETLINE Gochisou Time Chicken Paste Milk Jelly with Cheese Pouches 25g×4', '25g×4', 'dogs', '狗狗小食', 'dog_wet_treat', '19.70'),
    ('IMG_1606.PNG', 'COMBO Pure', 'コンボ ピュア モグモグッド！ 国産鶏むね肉のしっとりレシピ 角切り', 'COMBO Pure 香嫩雞胸肉切塊狗狗小食 50g', 'COMBO Pure Tender Chicken Breast Cubes Dog Treat 50g', '50g', 'dogs', '狗狗小食', 'dog_treat', '31.70'),
    ('IMG_1607.PNG', 'COMBO Pure', 'コンボ ピュア 国産鶏むね肉のしっとりレシピ 細切り', 'COMBO Pure 香嫩雞胸肉絲狗狗小食 50g', 'COMBO Pure Tender Chicken Breast Strips Dog Treat 50g', '50g', 'dogs', '狗狗小食', 'dog_treat', '31.70'),
    ('IMG_1608.PNG', 'COMBO Pure', 'コンボ ピュア モグモグッド！ バジルが香る 国産鶏肉のレシピ 角切り', 'COMBO Pure 羅勒香雞肉切塊狗狗小食 50g', 'COMBO Pure Basil-Scented Chicken Cubes Dog Treat 50g', '50g', 'dogs', '狗狗小食', 'dog_treat', '31.70'),
    ('IMG_1609.PNG', 'COMBO Pure', 'コンボ ピュア モグモグッド！ やわらか製法 コリコリ軟骨と国産鶏肉のレシピ 角切り', 'COMBO Pure 雞肉軟骨切塊狗狗小食 50g', 'COMBO Pure Chicken & Cartilage Cubes Dog Treat 50g', '50g', 'dogs', '狗狗小食', 'dog_treat', '31.70'),
    ('IMG_1610.PNG', 'COMBO Pure', 'コンボ ピュア モグモグッド！ 国産鶏むね肉と3種の野菜のレシピ 角切り', 'COMBO Pure 雞胸肉三種蔬菜切塊狗狗小食 50g', 'COMBO Pure Chicken Breast & Three Vegetable Cubes Dog Treat 50g', '50g', 'dogs', '狗狗小食', 'dog_treat', '31.70'),
    ('IMG_1611.PNG', 'COMBO', 'コンボ 贅沢グルメ 4種のおいしさ 熟成かつお添え', 'COMBO 貓咪奢華美食四重滋味熟成鰹魚乾糧 600g', 'COMBO Luxury Gourmet Four Flavours with Aged Bonito Dry Cat Food 600g', '600g（120g×5）', 'cats', '貓咪食品', 'cat_dry_food', '89.60'),
    ('IMG_1612.PNG', 'COMBO', 'コンボ 贅沢グルメブレンド 鮭チップ＆かつお節添え', 'COMBO 貓咪奢華美食拼配鮭魚脆片鰹魚節乾糧 700g', 'COMBO Luxury Gourmet Blend with Salmon Chips & Bonito Flakes Dry Cat Food 700g', '700g（140g×5）', 'cats', '貓咪食品', 'cat_dry_food', '89.60'),
    ('IMG_1613.PNG', 'COMBO', 'コンボ 肥満が気になる猫用 まぐろ味 かつお節＆かつおチップ添え', 'COMBO 體重關注貓用鮪魚鰹魚節乾糧 600g', 'COMBO Weight-Concern Cat Tuna Dry Food with Bonito Flakes 600g', '600g（120g×5）', 'cats', '貓咪食品', 'cat_dry_food', '89.60'),
    ('IMG_1614.PNG', 'COMBO Pure', 'コンボ ピュア 国産鶏肉・野菜入り', 'COMBO Pure 日本產雞肉蔬菜狗狗乾糧 600g', 'COMBO Pure Japanese Chicken & Vegetable Dry Dog Food 600g', '600g', 'dogs', '狗狗食品', 'dog_dry_food', '87.00'),
    ('IMG_1615.PNG', 'COMBO Pure', 'コンボ ピュア 野菜・厳選チーズ入り', 'COMBO Pure 蔬菜嚴選芝士狗狗乾糧 600g', 'COMBO Pure Vegetable & Selected Cheese Dry Dog Food 600g', '600g（300g×2）', 'dogs', '狗狗食品', 'dog_dry_food', '87.00'),
    ('IMG_1616.PNG', 'COMBO Pure', 'コンボ ピュア 厳選チーズ・国産鶏肉入り', 'COMBO Pure 嚴選芝士日本產雞肉狗狗乾糧 600g', 'COMBO Pure Selected Cheese & Japanese Chicken Dry Dog Food 600g', '600g', 'dogs', '狗狗食品', 'dog_dry_food', '87.00'),
    ('IMG_1617.PNG', 'COMBO Pure', 'コンボ ピュア 超小粒 国産鶏肉・野菜入り', 'COMBO Pure 超小粒日本產雞肉蔬菜狗狗乾糧 600g', 'COMBO Pure Extra-Small Kibble Japanese Chicken & Vegetable Dry Dog Food 600g', '600g（300g×2）', 'dogs', '狗狗食品', 'dog_dry_food', '87.00'),
    ('IMG_1618.PNG', 'COMBO Pure', 'コンボ ピュア 低脂肪 国産鶏肉・野菜', 'COMBO Pure 低脂日本產雞肉蔬菜狗狗乾糧 600g', 'COMBO Pure Low-Fat Japanese Chicken & Vegetable Dry Dog Food 600g', '600g', 'dogs', '狗狗食品', 'dog_dry_food', '87.00'),
    ('IMG_1619.PNG', 'COMBO Pure', 'コンボ ピュア フリーズドライトッピング 国産鶏肉・野菜', 'COMBO Pure 凍乾配料日本產雞肉蔬菜狗狗乾糧 540g', 'COMBO Pure Freeze-Dried Topping Japanese Chicken & Vegetable Dry Dog Food 540g', '540g', 'dogs', '狗狗食品', 'dog_dry_food', '87.00'),
    ('IMG_1620.PNG', 'COMBO Pure', 'コンボ ピュア フィッシュ＆ライス', 'COMBO Pure 魚肉米狗狗乾糧 540g', 'COMBO Pure Fish & Rice Dry Dog Food 540g', '540g', 'dogs', '狗狗食品', 'dog_dry_food', '87.00'),
    ('IMG_1621.PNG', '銀之匙', '銀のスプーン とろみ仕立て まぐろ', '銀之匙 濃湯仕立鮪魚貓罐頭 70g', 'Gin no Spoon Thick Gravy Tuna Cat Can 70g', '70g', 'cats', '貓咪食品', 'cat_wet_food', '9.30'),
    ('IMG_1622.PNG', '銀之匙', '銀のスプーン まぐろ・かつおにささみ入り', '銀之匙 鮪魚鰹魚雞胸肉貓罐頭 70g', 'Gin no Spoon Tuna, Bonito & Chicken Breast Cat Can 70g', '70g', 'cats', '貓咪食品', 'cat_wet_food', '9.30'),
    ('IMG_1623.PNG', '銀之匙', '銀のスプーン とろみ仕立て まぐろ・かつおにささみ入り', '銀之匙 濃湯仕立鮪魚鰹魚雞胸肉貓罐頭 70g', 'Gin no Spoon Thick Gravy Tuna, Bonito & Chicken Breast Cat Can 70g', '70g', 'cats', '貓咪食品', 'cat_wet_food', '9.30'),
    ('IMG_1624.PNG', '銀之匙', '銀のスプーン お魚とささみミックス しらす入り', '銀之匙 魚肉雞胸肉吻仔魚貓罐頭 70g', 'Gin no Spoon Fish, Chicken Breast & Shirasu Cat Can 70g', '70g', 'cats', '貓咪食品', 'cat_wet_food', '9.30'),
    ('IMG_1625.PNG', '銀之匙', '銀のスプーン お魚とささみミックス かつお節入り', '銀之匙 魚肉雞胸肉鰹魚節貓罐頭 70g', 'Gin no Spoon Fish, Chicken Breast & Bonito Flakes Cat Can 70g', '70g', 'cats', '貓咪食品', 'cat_wet_food', '9.30'),
]

products = []
for index, row in enumerate(ITEMS, start=1):
    image, brand, japanese_name, name_zh, name_en, spec, category, subcategory, product_type, cost_cny = row
    cost = Decimal(cost_cny)
    landed = (cost * FX).quantize(Decimal('0.0001'), rounding=ROUND_HALF_UP)
    retail = retail_price(landed)
    products.append({
        'sku': f'B24-{index:02d}',
        'import_key': f'batch24-{Path(image).stem.lower()}',
        'image_file': image,
        'brand': brand,
        'japanese_name': japanese_name,
        'name_zh': name_zh,
        'name_en': name_en,
        'spec': spec,
        'category': category,
        'subcategory': subcategory,
        'product_type': product_type,
        'source_cost_cny': float(cost),
        'exchange_rate_cny_hkd': float(FX),
        'product_cost_hkd': float(landed),
        'freight_hkd': 0,
        'landed_cost_hkd': float(landed),
        'retail_hkd': float(retail),
        'compare_at_hkd': 0,
        'in_stock': True,
        'cost_status': '暫估：近期 CNY/HKD 市場匯率；按既定內地包郵直運到港處理。',
        'pricing_basis': '45% target product gross margin; upward rounding to the next .90 price point.',
    })

payload = {
    'schema': 'batch24-product-import-v1',
    'pricing_policy': {
        'exchange_rate_cny_hkd': float(FX),
        'inbound_freight_hkd': 0,
        'inbound_freight_note': 'User-approved mainland free direct shipping to Hong Kong assumption.',
        'target_product_gross_margin': float(TARGET_MARGIN),
        'retail_rounding_rule': 'Round up to the next price point ending in .90.',
        'compare_at_policy': 'No compare-at price without a user-provided real original price.',
    },
    'products': products,
}
OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'product_count': len(products), 'output': str(OUT)}, ensure_ascii=False))
