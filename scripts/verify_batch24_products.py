from __future__ import annotations

import json
import os
from pathlib import Path

import requests

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
MANIFEST = json.loads((ROOT / 'batch24_stripe_manifest.json').read_text(encoding='utf-8'))
MAPPING = json.loads((ROOT / 'batch24_import_mapping.json').read_text(encoding='utf-8'))
OUT = ROOT / 'batch24_stripe_verification.json'
API_KEY = os.environ.get('STRIPE_SECRET_KEY')
if not API_KEY:
    raise SystemExit('STRIPE_SECRET_KEY is not set')

mapping_by_sku = {p['sku']: p for p in MAPPING['products']}
checks = []
for record in MANIFEST['products']:
    sku = record['sku']
    item = mapping_by_sku[sku]
    product = requests.get(f"https://api.stripe.com/v1/products/{record['stripe_product_id']}", auth=(API_KEY, ''), timeout=60)
    product.raise_for_status()
    product_data = product.json()
    price = requests.get(f"https://api.stripe.com/v1/prices/{record['stripe_price_id']}", auth=(API_KEY, ''), timeout=60)
    price.raise_for_status()
    price_data = price.json()
    md = product_data.get('metadata') or {}
    price_md = price_data.get('metadata') or {}
    item_checks = {
        'product_active': product_data.get('active') is True,
        'exact_display_name': product_data.get('name') == f"{item['name_zh']}｜{item['name_en']}",
        'exact_category': md.get('category') == item['category'],
        'exact_subcategory': md.get('subcategory') == item['subcategory'],
        'exact_bilingual_names': md.get('name_zh') == item['name_zh'] and md.get('name_en') == item['name_en'],
        'exact_image': product_data.get('images', [None])[0] == item['cdn_url'],
        'in_stock': md.get('in_stock') == 'true',
        'no_unverified_compare_at': md.get('compare_at_price_hkd') == '0',
        'default_price_matches': product_data.get('default_price') == record['stripe_price_id'],
        'price_active_hkd': price_data.get('active') is True and price_data.get('currency') == 'hkd',
        'price_product_match': price_data.get('product') == record['stripe_product_id'],
        'exact_amount': price_data.get('unit_amount') == int(round(item['retail_hkd'] * 100)),
        'price_import_key_match': price_md.get('mofu_import_key') == f"batch24-2026::{sku.lower()}",
        'price_compare_at_zero': price_md.get('compare_at_price_hkd') == '0',
    }
    checks.append({
        'sku': sku,
        'product_id': record['stripe_product_id'],
        'price_id': record['stripe_price_id'],
        'retail_hkd': item['retail_hkd'],
        'category': item['category'],
        'subcategory': item['subcategory'],
        'checks': item_checks,
        'passed': all(item_checks.values()),
    })
result = {
    'product_count': len(checks),
    'price_count': len(checks),
    'passed_count': sum(x['passed'] for x in checks),
    'failed_count': sum(not x['passed'] for x in checks),
    'dogs_count': sum(x['category'] == 'dogs' for x in checks),
    'cats_count': sum(x['category'] == 'cats' for x in checks),
    'products': checks,
}
OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({k: result[k] for k in ('product_count', 'price_count', 'passed_count', 'failed_count', 'dogs_count', 'cats_count')}, ensure_ascii=False))
if result['failed_count']:
    raise SystemExit('Stripe validation failed')
