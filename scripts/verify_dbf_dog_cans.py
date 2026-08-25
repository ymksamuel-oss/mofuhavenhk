from __future__ import annotations

import json
import os
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from typing import Any

import requests

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
MAPPING = json.loads((ROOT / 'dbf_dog_cans_mapping.json').read_text(encoding='utf-8'))
MANIFEST = json.loads((ROOT / 'dbf_dog_cans_stripe_manifest.json').read_text(encoding='utf-8'))
REPORT = ROOT / 'dbf_dog_cans_stripe_verification.json'
API_KEY = os.environ.get('STRIPE_SECRET_KEY')
if not API_KEY:
    raise SystemExit('STRIPE_SECRET_KEY is not set')


def cents(value: float | int | str) -> int:
    return int((Decimal(str(value)) * 100).quantize(Decimal('1'), rounding=ROUND_HALF_UP))


def get(path: str) -> dict[str, Any]:
    response = requests.get(f'https://api.stripe.com/v1/{path}', auth=(API_KEY, ''), timeout=60)
    response.raise_for_status()
    return response.json()


if MAPPING['product_count'] != 23 or MANIFEST['product_count'] != 23 or MANIFEST['price_count'] != 23:
    raise SystemExit('Unexpected mapping or manifest product count')

by_sku = {product['sku']: product for product in MAPPING['products']}
result_by_sku = {product['sku']: product for product in MANIFEST['products']}
if set(by_sku) != set(result_by_sku):
    raise SystemExit('Mapping and Stripe manifest SKU set mismatch')

rows = []
for sku, expected in by_sku.items():
    actual = result_by_sku[sku]
    product = get(f"products/{actual['stripe_product_id']}")
    price = get(f"prices/{actual['stripe_price_id']}")
    metadata = product.get('metadata') or {}
    price_metadata = price.get('metadata') or {}
    checks = {
        'active_product': product.get('active') is True,
        'display_name': product.get('name') == f"{expected['name_zh']}｜{expected['name_en']}",
        'sku': metadata.get('sku') == sku,
        'category': metadata.get('category') == 'dogs' and metadata.get('subcategory') == '狗狗食品',
        'product_type': metadata.get('product_type') == 'dog_canned_food',
        'clean_cdn_image': product.get('images') == [expected['cdn_url']] and metadata.get('image_pending') == 'false',
        'price_active_hkd': price.get('active') is True and price.get('currency') == 'hkd',
        'price_amount': price.get('unit_amount') == cents(expected['retail_hkd']),
        'price_product': price.get('product') == product.get('id'),
        'default_price': product.get('default_price') == price.get('id'),
        'exact_import_key': metadata.get('mofu_import_key') == f"dbf-dog-cans-2026::{sku.lower()}" and price_metadata.get('mofu_import_key') == f"dbf-dog-cans-2026::{sku.lower()}",
        'stock_status': metadata.get('in_stock') == ('true' if expected['in_stock'] else 'false'),
        'soldout_visibility': metadata.get('show_when_out_of_stock') == ('false' if expected['in_stock'] else 'true'),
        'no_fabricated_compare_at': metadata.get('compare_at_price_hkd') == '0' and price_metadata.get('compare_at_price_hkd') == '0',
    }
    rows.append({
        'sku': sku,
        'product_id': product['id'],
        'price_id': price['id'],
        'retail_hkd': expected['retail_hkd'],
        'in_stock': expected['in_stock'],
        'checks': checks,
        'ok': all(checks.values()),
    })

failed = [row for row in rows if not row['ok']]
report = {
    'ok': not failed,
    'expected_products': 23,
    'verified_products': len(rows),
    'verified_prices': len(rows),
    'in_stock_count': sum(row['in_stock'] for row in rows),
    'out_of_stock_skus': [row['sku'] for row in rows if not row['in_stock']],
    'failed_skus': [row['sku'] for row in failed],
    'products': rows,
}
REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({
    'ok': report['ok'],
    'verified_products': report['verified_products'],
    'verified_prices': report['verified_prices'],
    'in_stock_count': report['in_stock_count'],
    'out_of_stock_skus': report['out_of_stock_skus'],
    'failed_skus': report['failed_skus'],
    'report': str(REPORT),
}, ensure_ascii=False))
if failed:
    raise SystemExit(f"Stripe validation failed for: {', '.join(row['sku'] for row in failed)}")
