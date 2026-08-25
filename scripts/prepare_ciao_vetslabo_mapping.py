from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
SOURCE_CSV = Path('/home/ubuntu/upload/products_20_list.csv')
OUTPUT = ROOT / 'ciao_vetslabo_mapping.json'

IMAGES = {
    1: ('IMG_1585.PNG', 'ciao-senior-katsuobushi-scallop-50g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/lOiBSxeTAcrzMnqv.png'),
    2: ('IMG_1589.PNG', 'ciao-senior-scallop-50g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/LFGwEvwNFREaFGCl.png'),
    3: ('IMG_1588.PNG', 'ciao-scallop-hon-dashi-50g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/wItPAqWRexVELqUH.png'),
    4: ('IMG_1584.PNG', 'ciao-bonito-shirasu-scallop-50g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/yzsHzNjlUtTmKnjI.png'),
    5: ('IMG_1586.PNG', 'ciao-chicken-crabstick-scallop-50g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/eKBcyejCqaBnCBwF.png'),
    6: ('IMG_1582.PNG', 'ciao-probiotics-tuna-chicken-bonito-40g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/RkaNdnRFlexTLPDZ.png'),
    7: ('IMG_1590.PNG', 'ciao-hairball-bonito-flakes-scallop-50g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/LryAlyUbPpKZQrbh.png'),
    8: ('IMG_1587.PNG', 'ciao-chicken-scallop-50g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/AxFgperKrjwejqRQ.png'),
    9: ('IMG_1581.PNG', 'ciao-probiotics-bonito-chicken-katsuobushi-dashi-40g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/UPCyvzvDyvtaKxJZ.png'),
    10: ('IMG_1583.PNG', 'ciao-probiotics-chicken-katsuobushi-dashi-40g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/SHptWqxDGmwKuxUH.png'),
    11: ('IMG_1591.PNG', 'ciao-grilled-katsuobushi-scallop-30g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/MRXgMYdFXUeHaPDh.png'),
    12: ('IMG_1592.PNG', 'ciao-grilled-hokkaido-scallop-30g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/TRjVDRHMnUDYhDQl.png'),
    13: ('IMG_1593.PNG', 'ciao-grilled-shirasu-scallop-30g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/AQKZPVFhNgMFQlsM.png'),
    14: ('IMG_1594.PNG', 'ciao-grilled-hon-dashi-30g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/oYSVropbywIcwZTr.png'),
    15: ('IMG_1595.PNG', 'ciao-premium-functional-bonito-chicken-katsuobushi-30g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/NCFWLlpyHVvdMZjf.png'),
    16: ('IMG_1596.PNG', 'ciao-premium-functional-chicken-scallop-30g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/NVJjrgLOjrBGLIHL.png'),
    17: ('IMG_1597.PNG', 'vets-labo-medimousse-digestive-95g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/XpDPvRsvHTMibOiV.png'),
    18: ('IMG_1598.PNG', 'vets-labo-medimousse-health-95g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/qcEHYTgJLzDCGaYF.png'),
    19: ('IMG_1599.PNG', 'vets-labo-medimousse-skin-95g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/CfKCxGzgXFXiGiNU.png'),
    20: ('IMG_1600.PNG', 'vets-labo-medimousse-weight-95g.png', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/vCOgcqVYqZgNaxEV.png'),
}

ENGLISH_NAMES = {
    1: 'CIAO Grilled Bonito Dinner with Bonito Flakes & Scallop, Senior Cat',
    2: 'CIAO Grilled Bonito Dinner with Scallop, Senior Cat',
    3: 'CIAO Grilled Bonito Dinner with Scallop in Authentic Broth',
    4: 'CIAO Grilled Bonito Dinner with Shirasu & Scallop',
    5: 'CIAO Grilled Chicken Breast Dinner with Crab Stick & Scallop',
    6: 'CIAO Probiotic Tuna, Chicken & Bonito',
    7: 'CIAO Grilled Bonito Dinner with Bonito Flakes & Scallop, Hairball Care',
    8: 'CIAO Grilled Chicken Breast Dinner with Scallop',
    9: 'CIAO Probiotic Tuna, Chicken & Bonito Flakes in Broth',
    10: 'CIAO Probiotic Chicken & Bonito Flakes in Broth',
    11: 'CIAO Grilled Bonito Dinner with Bonito Flakes, Scallop Flavour',
    12: 'CIAO Grilled Bonito Dinner, Hokkaido Scallop Flavour',
    13: 'CIAO Grilled Bonito Dinner with Shirasu, Scallop Flavour',
    14: 'CIAO Grilled Bonito Dinner, Authentic Broth Flavour',
    15: 'CIAO Premium Six Functional Ingredients, Bonito, Chicken & Bonito Flakes',
    16: 'CIAO Premium Six Functional Ingredients, Chicken & Scallop',
    17: "Vet's Labo MediMousse Digestive Support Mousse",
    18: "Vet's Labo MediMousse Health Support Mousse",
    19: "Vet's Labo MediMousse Skin Support Mousse",
    20: "Vet's Labo MediMousse Weight Support Mousse",
}

with SOURCE_CSV.open(encoding='utf-8-sig', newline='') as handle:
    rows = list(csv.DictReader(handle))
if len(rows) != 20:
    raise SystemExit(f'Expected 20 CSV rows, got {len(rows)}')

products = []
for row in rows:
    number = int(row['產品編號'])
    source_image, clean_image, cdn_url = IMAGES[number]
    name_zh = row['產品名稱與款式']
    if number == 9:
        name_zh = '鮪魚雞肉柴魚片高湯'
    products.append({
        'sku': f'CIAOVL-{number:02d}',
        'sequence': number,
        'brand': row['品牌'],
        'name_zh': name_zh,
        'name_en': ENGLISH_NAMES[number],
        'spec': row['規格'],
        'retail_hkd': float(row['建議零售價_Price(HKD)']),
        'compare_at_hkd': float(row['劃線原價_CompareAtPrice(HKD)']),
        'category': 'cats',
        'subcategory': '貓貓小食' if number <= 16 else '貓罐罐',
        'product_type': 'cat_treat' if number <= 16 else 'cat_wet_food',
        'in_stock': True,
        'image_file': clean_image,
        'source_image': source_image,
        'cdn_url': cdn_url,
    })

payload = {
    'source_document': 'products_20_list.csv',
    'image_rule': 'All original screenshots were cleaned to pure-white product images before CDN and Stripe use.',
    'user_confirmed_correction': {
        'sku': 'CIAOVL-09',
        'csv_name': rows[8]['產品名稱與款式'],
        'final_name_zh': '鮪魚雞肉柴魚片高湯',
        'source_image': 'IMG_1581.PNG',
    },
    'product_count': len(products),
    'products': products,
}
OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(OUTPUT)
