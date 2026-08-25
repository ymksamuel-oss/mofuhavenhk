from __future__ import annotations

import json
import os
from pathlib import Path

import requests

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
MAPPING = json.loads((ROOT / 'combo_dogfood_5_import_mapping.json').read_text(encoding='utf-8'))
MANIFEST = json.loads((ROOT / 'combo_dogfood_5_stripe_manifest.json').read_text(encoding='utf-8'))
OUT = ROOT / 'combo_dogfood_5_stripe_verification.json'
API_KEY = os.environ.get('STRIPE_SECRET_KEY')
if not API_KEY:
    raise SystemExit('STRIPE_SECRET_KEY is not set')

expected = {item['sku']: item for item in MAPPING['products']}
results = []
errors = []
for record in MANIFEST['products']:
    item = expected[record['sku']]
    product = requests.get(f"https://api.stripe.com/v1/products/{record['stripe_product_id']}", auth=(API_KEY, ''), timeout=60).json()
    price = requests.get(f"https://api.stripe.com/v1/prices/{record['stripe_price_id']}", auth=(API_KEY, ''), timeout=60).json()
    metadata = product.get('metadata') or {}
    checks = {
        'product_active': product.get('active') is True,
        'exact_bilingual_name': product.get('name') == f"{item['name_zh']}｜{item['name_en']}",
        'category': metadata.get('category') == 'dogs',
        'subcategory': metadata.get('subcategory') == '狗狗食品',
        'product_type': metadata.get('product_type') == 'dog_dry_food',
        'in_stock': metadata.get('in_stock') == 'true',
        'clean_image': product.get('images') == [item['cdn_url']],
        'image_pending': metadata.get('image_pending') == 'false',
        'default_price': product.get('default_price') == price.get('id'),
        'price_active': price.get('active') is True,
        'price_hkd_24990': price.get('currency') == 'hkd' and price.get('unit_amount') == 24990,
        'compare_at_disabled': metadata.get('compare_at_price_hkd') == '0' and (price.get('metadata') or {}).get('compare_at_price_hkd') == '0',
    }
    failed = [key for key, passed in checks.items() if not passed]
    if failed:
        errors.append({'sku': record['sku'], 'failed': failed})
    results.append({'sku': record['sku'], 'stripe_product_id': product['id'], 'stripe_price_id': price['id'], 'checks': checks, 'passed': not failed})

output = {'expected_product_count': 5, 'verified_product_count': len(results), 'all_passed': not errors, 'errors': errors, 'products': results}
OUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'verified_product_count': len(results), 'all_passed': not errors, 'errors': errors, 'output': str(OUT)}, ensure_ascii=False))
if errors:
    raise SystemExit(1)
