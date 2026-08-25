from __future__ import annotations

import json
import os
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from typing import Any

import requests

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
MAPPING_PATH = ROOT / 'ciao_vetslabo_mapping.json'
MANIFEST_PATH = ROOT / 'ciao_vetslabo_stripe_manifest.json'
OUTPUT_PATH = ROOT / 'ciao_vetslabo_stripe_verification.json'
API_KEY = os.environ.get('STRIPE_SECRET_KEY')
if not API_KEY:
    raise SystemExit('STRIPE_SECRET_KEY is not set')


def cents(value: float | str) -> int:
    return int((Decimal(str(value)) * 100).quantize(Decimal('1'), rounding=ROUND_HALF_UP))


def get(path: str) -> dict[str, Any]:
    response = requests.get(f'https://api.stripe.com/v1/{path}', auth=(API_KEY, ''), timeout=60)
    response.raise_for_status()
    return response.json()


mapping = {item['sku']: item for item in json.loads(MAPPING_PATH.read_text(encoding='utf-8'))['products']}
manifest = json.loads(MANIFEST_PATH.read_text(encoding='utf-8'))
if manifest.get('product_count') != 20 or manifest.get('price_count') != 20:
    raise SystemExit('Manifest does not contain 20 products and 20 prices')

results = []
failures = []
for imported in manifest['products']:
    item = mapping.get(imported['sku'])
    if not item:
        failures.append(f"Unknown manifest SKU {imported['sku']}")
        continue
    product = get(f"products/{imported['stripe_product_id']}")
    price = get(f"prices/{imported['stripe_price_id']}")
    metadata = product.get('metadata') or {}
    price_metadata = price.get('metadata') or {}
    expected_key = f"ciao-vetslabo-2026::{item['sku'].lower()}"
    checks = {
        'active': product.get('active') is True,
        'exact_import_key': metadata.get('mofu_import_key') == expected_key,
        'name_zh': metadata.get('name_zh') == item['name_zh'],
        'name_en': metadata.get('name_en') == item['name_en'],
        'category': metadata.get('category') == 'cats',
        'subcategory': metadata.get('subcategory') == item['subcategory'],
        'image': product.get('images') == [item['cdn_url']],
        'image_pending_false': metadata.get('image_pending') == 'false',
        'in_stock': metadata.get('in_stock') == 'true',
        'product_compare_at': metadata.get('compare_at_price_hkd') == f"{item['compare_at_hkd']:.2f}",
        'default_price': product.get('default_price') == price['id'],
        'price_active': price.get('active') is True,
        'price_hkd': price.get('currency') == 'hkd',
        'price_amount': price.get('unit_amount') == cents(item['retail_hkd']),
        'price_product': price.get('product') == product['id'],
        'price_exact_import_key': price_metadata.get('mofu_import_key') == expected_key,
        'price_compare_at': price_metadata.get('compare_at_price_hkd') == f"{item['compare_at_hkd']:.2f}",
    }
    failed = [name for name, passed in checks.items() if not passed]
    if failed:
        failures.append(f"{item['sku']}: {', '.join(failed)}")
    results.append({
        'sku': item['sku'],
        'name_zh': item['name_zh'],
        'retail_hkd': item['retail_hkd'],
        'compare_at_hkd': item['compare_at_hkd'],
        'subcategory': item['subcategory'],
        'stripe_product_id': product['id'],
        'stripe_price_id': price['id'],
        'checks': checks,
        'ok': not failed,
    })

output = {
    'ok': not failures and len(results) == 20,
    'expected_products': 20,
    'verified_products': len(results),
    'verified_prices': len(results),
    'failures': failures,
    'products': results,
}
OUTPUT_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'ok': output['ok'], 'verified_products': len(results), 'failures': failures, 'output': str(OUTPUT_PATH)}, ensure_ascii=False))
if not output['ok']:
    raise SystemExit('Stripe verification failed')
