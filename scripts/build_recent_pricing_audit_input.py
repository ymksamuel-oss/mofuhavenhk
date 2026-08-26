from __future__ import annotations

import csv
import json
import os
from pathlib import Path

import requests

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
api_key = os.environ.get('STRIPE_SECRET_KEY')
if not api_key:
    raise SystemExit('STRIPE_SECRET_KEY is not set')
source = json.loads((ROOT / 'recent_48h_stripe_products_all.json').read_text(encoding='utf-8'))


def family(key: str) -> str:
    if key.startswith('batch24-2026::'):
        return 'batch24'
    if key.startswith('combo-dogfood-5-2026::'):
        return 'combo-dogfood-5'
    if key.startswith('ciao-vetslabo-2026::'):
        return 'ciao-vetslabo'
    if key.startswith('dbf-dog-cans-2026::'):
        return 'dbf'
    if key.startswith('snack-order-2026::'):
        return 'japanese-snacks'
    if key.startswith('onecared-can::'):
        return 'onecare'
    if key.startswith('mamacook'):
        return 'mamacook'
    return 'legacy-other'

rows: list[dict] = []
for product in source['products']:
    key = product.get('metadata', {}).get('mofu_import_key', '')
    default_price = product.get('default_price')
    if not default_price:
        continue
    response = requests.get(f'https://api.stripe.com/v1/prices/{default_price}', auth=(api_key, ''), timeout=60)
    response.raise_for_status()
    price = response.json()
    product_compare = product.get('metadata', {}).get('compare_at_price_hkd', '')
    price_compare = price.get('metadata', {}).get('compare_at_price_hkd', '')
    comparison = price_compare or product_compare
    rows.append({
        'product_id': product['id'],
        'price_id': price['id'],
        'family': family(key),
        'import_key': key,
        'name': product['name'],
        'category': product.get('metadata', {}).get('category', ''),
        'subcategory': product.get('metadata', {}).get('subcategory', ''),
        'retail_hkd': round((price.get('unit_amount') or 0) / 100, 2),
        'existing_compare_at_hkd': comparison,
        'existing_compare_source': 'price_metadata' if price_compare else ('product_metadata' if product_compare else ''),
        'created': product['created'],
    })

summary = {
    'reference_utc': source['reference_utc'],
    'since_utc': source['since_utc'],
    'product_count': len(rows),
    'with_existing_compare_at': sum(1 for row in rows if row['existing_compare_at_hkd'] not in ('', '0', '0.0', '0.00')),
    'needs_research': sum(1 for row in rows if row['existing_compare_at_hkd'] in ('', '0', '0.0', '0.00')),
    'products': rows,
}
(ROOT / 'recent_48h_pricing_audit_input.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
with (ROOT / 'recent_48h_pricing_audit_input.csv').open('w', newline='', encoding='utf-8-sig') as handle:
    writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)
print(json.dumps({key: summary[key] for key in ('product_count','with_existing_compare_at','needs_research')}, ensure_ascii=False))
