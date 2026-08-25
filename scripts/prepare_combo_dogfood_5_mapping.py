from __future__ import annotations

import json
from pathlib import Path

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
BASE_MAPPING = ROOT / 'combo_dogfood_5_mapping.json'
OUT = ROOT / 'combo_dogfood_5_import_mapping.json'

CDN_URLS = {
    'combo-dogfood-720g-chicken-beef-small-fish': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/cuCtJQVzYbKxKWuo.png',
    'combo-dogfood-720g-chicken-cheese': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/jFtXnZUFvpHoVPcE.png',
    'combo-dogfood-720g-cabbage-beef': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/ICmdHoQRUxGxodwk.png',
    'combo-dogfood-720g-low-fat-chicken-vegetables-small-fish': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/BgMAazzZpkbLLZds.png',
    'combo-dogfood-720g-low-fat-senior-chicken-vegetables': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/IKQtQSrfavdyhPPC.png',
}

source = json.loads(BASE_MAPPING.read_text(encoding='utf-8'))
products = []
for index, item in enumerate(source['products'], start=1):
    if item['import_key'] not in CDN_URLS:
        raise RuntimeError(f"Missing CDN URL for {item['import_key']}")
    product = dict(item)
    product.update({
        'sku': f'COMBO-DOG-720-{index:02d}',
        'cdn_url': CDN_URLS[item['import_key']],
        'retail_hkd': 249.90,
        'compare_at_hkd': 0,
        'in_stock': True,
        'source_cost_cny': 114,
        'exchange_rate_cny_hkd': 1.1654,
        'product_cost_hkd': 132.8556,
        'freight_hkd': 0,
        'landed_cost_hkd': 132.8556,
        'cost_status': '暫估：近期七日 CNY/HKD 市場匯率；內地包郵直運到港',
        'pricing_basis': '45% target product gross margin; customer-facing price rounded to HK$249.90',
    })
    products.append(product)

payload = {
    'schema': 'combo-dogfood-5-v1',
    'source_cost_policy': {
        'cost_cny_per_product': 114,
        'exchange_rate_cny_hkd': 1.1654,
        'converted_product_cost_hkd': 132.8556,
        'freight_hkd': 0,
        'freight_note': 'User-confirmed free direct shipping from mainland to Hong Kong.',
        'retail_hkd': 249.90,
        'retail_pricing_note': '45% target product gross margin, rounded to a .90 consumer price point.',
    },
    'products': products,
}
OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'product_count': len(products), 'output': str(OUT)}, ensure_ascii=False))
