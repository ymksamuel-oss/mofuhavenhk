from __future__ import annotations

import csv
import json
from collections import Counter
from pathlib import Path

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
source = json.loads((ROOT / 'recent_48h_stripe_products_all.json').read_text(encoding='utf-8'))
products = source['products']

def family(key: str | None) -> str:
    key = key or ''
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

for product in products:
    product['family'] = family(product.get('metadata', {}).get('mofu_import_key'))
    product['import_key'] = product.get('metadata', {}).get('mofu_import_key', '')
    product['category'] = product.get('metadata', {}).get('category', '')
    product['subcategory'] = product.get('metadata', {}).get('subcategory', '')

summary = {
    'reference_utc': source['reference_utc'],
    'since_utc': source['since_utc'],
    'total': len(products),
    'by_category': dict(sorted(Counter(p.get('category') or 'unclassified' for p in products).items())),
    'by_family': dict(sorted(Counter(p['family'] for p in products).items())),
    'products': [
        {
            'id': p['id'], 'name': p['name'], 'created': p['created'], 'active': p['active'],
            'family': p['family'], 'import_key': p['import_key'], 'category': p['category'],
            'subcategory': p['subcategory'], 'default_price': p.get('default_price'),
        }
        for p in products
    ],
}
(ROOT / 'recent_48h_pricing_scope.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
with (ROOT / 'recent_48h_pricing_scope.csv').open('w', newline='', encoding='utf-8-sig') as handle:
    writer = csv.DictWriter(handle, fieldnames=['id','name','created','active','family','import_key','category','subcategory','default_price'])
    writer.writeheader()
    writer.writerows(summary['products'])
print(json.dumps({'total': summary['total'], 'by_category': summary['by_category'], 'by_family': summary['by_family']}, ensure_ascii=False))
