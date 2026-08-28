from __future__ import annotations

import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
batch = json.loads((root / 'data' / 'img1925_approved_product_batch_2026-08-28.json').read_text(encoding='utf-8'))
products = {row['import_key']: row for row in json.loads((root / 'data' / 'img1925_stripe_product_ids_2026-08-28.json').read_text(encoding='utf-8'))}
plush_prices = json.loads((root / 'data' / 'img1925_plush_variant_price_ids_2026-08-28.json').read_text(encoding='utf-8'))
extra_by_key = {row['variant_key']: row for row in plush_prices}

result_products = []
for product in batch['products']:
    product_id_record = products[product['import_key']]
    variants = []
    for variant in product['variants']:
        if product['import_key'] == 'blush-pink-round-pet-bed-2026':
            price_record = extra_by_key[variant['key']]
        else:
            price_record = {
                'price_id': product_id_record['default_price_id'],
                'product_id': product_id_record['product_id'],
                'active': product_id_record['active'],
                'unit_amount': variant['retail_hkd_minor'],
                'variant_key': variant['key'],
                'variant_image_url': variant['image_url'],
                'retail_hkd': variant['retail_hkd'],
                'cost_cny': variant['cost_cny'],
            }
        variants.append({
            'variant_key': variant['key'],
            'label_zh': variant['label_zh'],
            'label_en': variant['label_en'],
            'cost_cny': variant['cost_cny'],
            'retail_hkd': variant['retail_hkd'],
            'retail_hkd_minor': variant['retail_hkd_minor'],
            'product_id': product_id_record['product_id'],
            'price_id': price_record['price_id'],
            'active': price_record['active'],
            'image_url': variant['image_url'],
        })
    result_products.append({
        'import_key': product['import_key'],
        'name_zh': product['name_zh'],
        'name_en': product['name_en'],
        'product_id': product_id_record['product_id'],
        'default_price_id': product_id_record['default_price_id'],
        'active': product_id_record['active'],
        'images': product['images'],
        'variants': variants,
    })

output = root / 'data' / 'img1925_stripe_sync_manifest_2026-08-28.json'
output.write_text(json.dumps({
    'source': 'img1925_approved_product_batch_2026-08-28.json',
    'product_count': len(result_products),
    'variant_count': sum(len(product['variants']) for product in result_products),
    'products': result_products,
}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(output)
