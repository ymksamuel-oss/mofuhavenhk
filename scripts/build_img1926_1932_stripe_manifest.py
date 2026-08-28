from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
pricing_path = ROOT / 'reports' / 'img1926_1932_pricing_preview_2026-08-28.json'
ids_path = ROOT / 'reports' / 'img1926_1932_stripe_created_ids_2026-08-28.jsonl'
out_path = ROOT / 'data' / 'img1926_1932_stripe_sync_manifest_2026-08-28.json'

pricing = json.loads(pricing_path.read_text(encoding='utf-8'))
records = []
for line in ids_path.read_text(encoding='utf-8').splitlines():
    line = line.strip()
    if line:
        records.append(json.loads(line))

by_import = defaultdict(list)
for record in records:
    by_import[record['import_key']].append(record)

products = []
missing = []
for product in pricing['products']:
    import_key = product['import_key']
    entries = by_import.get(import_key, [])
    by_variant = {entry['variant_key']: entry for entry in entries}
    variants = []
    for variant in product['variants']:
        entry = by_variant.get(variant['key'])
        item = {
            'variant_key': variant['key'],
            'label_zh': variant['label_zh'],
            'label_en': variant['label_en'],
            'cost_cny': variant['cost_cny'],
            'retail_hkd': variant['retail_hkd'],
            'retail_hkd_minor': variant['retail_hkd_minor'],
            'image_url': variant['image_url'],
            'image_status': variant['image_status'],
            'product_id': entry.get('product_id') if entry else None,
            'price_id': (entry.get('price_id') or entry.get('default_price_id')) if entry else None,
        }
        if not item['product_id'] or not item['price_id']:
            missing.append({'import_key': import_key, 'variant_key': variant['key']})
        variants.append(item)
    product_id = next((entry.get('product_id') for entry in entries if entry.get('product_id')), None)
    products.append({
        'import_key': import_key,
        'product_id': product_id,
        'name_zh': product['name_zh'],
        'name_en': product['name_en'],
        'product_type': product['product_type'],
        'category': product['category'],
        'subcategory': product['subcategory'],
        'variants': variants,
    })

manifest = {
    'generated_at': '2026-08-28',
    'pricing_policy': pricing['policy_version'],
    'source_image_set': ['IMG_1926.JPG', 'IMG_1927.JPG', 'IMG_1928.JPG', 'IMG_1929.JPG', 'IMG_1930.JPG', 'IMG_1931.JPG', 'IMG_1932.JPG'],
    'product_count': len(products),
    'variant_count': sum(len(product['variants']) for product in products),
    'created_record_count': len(records),
    'missing_ids': missing,
    'products': products,
}
out_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'product_count': manifest['product_count'], 'variant_count': manifest['variant_count'], 'created_record_count': manifest['created_record_count'], 'missing_id_count': len(missing)}, ensure_ascii=False))
