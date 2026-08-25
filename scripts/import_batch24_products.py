"""Import 24 user-supplied products safely into Stripe.

Run without --apply for a read-only preflight. The importer never fuzzy-matches
existing records: it may only reuse or update a product with its exact
metadata[mofu_import_key]. Every product must have an approved cleaned CDN image.
"""
from __future__ import annotations

import argparse
import json
import os
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from typing import Any

import requests

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
MAPPING = ROOT / 'batch24_import_mapping.json'
MANIFEST = ROOT / 'batch24_stripe_manifest.json'
API_KEY = os.environ.get('STRIPE_SECRET_KEY')
if not API_KEY:
    raise SystemExit('STRIPE_SECRET_KEY is not set')

SCHEMA = 'batch24-products-v1'
SOURCE = 'batch24_product_mapping.json'
PREFIX = 'batch24-2026::'


def cents(value: int | float | str) -> int:
    return int((Decimal(str(value)) * 100).quantize(Decimal('1'), rounding=ROUND_HALF_UP))


def key(item: dict[str, Any]) -> str:
    return f"{PREFIX}{item['sku'].lower()}"


def display_name(item: dict[str, Any]) -> str:
    return f"{item['name_zh']}｜{item['name_en']}"


def api_get(path: str, params: dict[str, str]) -> dict[str, Any]:
    response = requests.get(f'https://api.stripe.com/v1/{path}', auth=(API_KEY, ''), params=params, timeout=60)
    response.raise_for_status()
    return response.json()


def api_post(path: str, data: dict[str, str], idempotency_key: str) -> dict[str, Any]:
    response = requests.post(
        f'https://api.stripe.com/v1/{path}',
        auth=(API_KEY, ''),
        data=data,
        headers={'Idempotency-Key': idempotency_key},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def form_metadata(values: dict[str, str]) -> dict[str, str]:
    return {f'metadata[{k}]': v for k, v in values.items()}


def active_products() -> dict[str, dict[str, Any]]:
    records: dict[str, dict[str, Any]] = {}
    starting_after: str | None = None
    while True:
        params = {'active': 'true', 'limit': '100'}
        if starting_after:
            params['starting_after'] = starting_after
        page = api_get('products', params)
        data = page.get('data', [])
        for product in data:
            import_key = (product.get('metadata') or {}).get('mofu_import_key')
            if import_key and import_key.startswith(PREFIX):
                if import_key in records:
                    raise RuntimeError(f'Duplicate active product key: {import_key}')
                records[import_key] = product
        if not page.get('has_more') or not data:
            break
        starting_after = data[-1]['id']
    return records


def active_hkd_prices(product_id: str) -> list[dict[str, Any]]:
    page = api_get('prices', {'product': product_id, 'active': 'true', 'currency': 'hkd', 'limit': '100'})
    if page.get('has_more'):
        raise RuntimeError(f'More than 100 active HKD prices for product {product_id}')
    return page.get('data', [])


def descriptions(item: dict[str, Any]) -> tuple[str, str, str, str]:
    animal_zh = '狗狗' if item['category'] == 'dogs' else '貓咪'
    animal_en = 'dog' if item['category'] == 'dogs' else 'cat'
    description_zh = (
        f"{item['name_zh']}，規格 {item['spec']}。"
        f"本款屬於{animal_zh}產品，分類為「{item['subcategory']}」；口味、成分與建議餵食方式請以原包裝標示為準，並提供充足清水。"
    )
    description_en = (
        f"{item['name_en']} in a {item['spec']} size. "
        f"This is a {animal_en} product; refer to the original package for flavour, ingredients and feeding guidance, and provide fresh water."
    )
    specs_zh = f"規格：{item['spec']}｜分類：{item['subcategory']}｜原裝零售包裝"
    specs_en = f"Size: {item['spec']} | Category: {item['subcategory']} | Original retail packaging"
    return description_zh, description_en, specs_zh, specs_en


def metadata(item: dict[str, Any]) -> dict[str, str]:
    description_zh, description_en, specs_zh, specs_en = descriptions(item)
    animal_zh = '狗狗' if item['category'] == 'dogs' else '貓咪'
    animal_en = 'Dog' if item['category'] == 'dogs' else 'Cat'
    return {
        'mofu_import_source': SOURCE,
        'mofu_import_key': key(item),
        'mofu_import_schema': SCHEMA,
        'sku': item['sku'],
        'brand': item['brand'],
        'category': item['category'],
        'category_zh': animal_zh,
        'subcategory': item['subcategory'],
        'product_type': item['product_type'],
        'name_zh': item['name_zh'],
        'name_en': item['name_en'],
        'japanese_name': item['japanese_name'],
        'description_zh': description_zh,
        'description_en': description_en,
        'specs_zh': specs_zh,
        'specs_en': specs_en,
        'texture_zh': '包裝與內容質地請以原裝標示為準。',
        'texture_en': 'Refer to the original package for the product texture and contents.',
        'availability': '現貨',
        'availability_display_zh': f"現貨｜{item['spec']}｜{item['subcategory']}",
        'availability_display_en': f"In stock | {item['spec']} | {animal_en} product",
        'in_stock': 'true',
        'show_when_out_of_stock': 'false',
        'image_pending': 'false',
        'tags': f"{item['brand']},{animal_zh},{item['subcategory']},{item['spec']},日本寵物食品",
        'compare_at_price_hkd': '0',
        'compare_at_price_schema': 'v1',
        'compare_at_price_currency': 'hkd',
    }


def validate_existing(product: dict[str, Any], item: dict[str, Any]) -> dict[str, Any] | None:
    expected_key = key(item)
    md = product.get('metadata') or {}
    if md.get('mofu_import_key') != expected_key:
        raise RuntimeError(f'Product {product["id"]} lacks expected exact key {expected_key}')
    if product.get('name') != display_name(item):
        raise RuntimeError(f'Collision: {expected_key} has unexpected product name')
    if md.get('sku') != item['sku'] or md.get('name_zh') != item['name_zh'] or md.get('name_en') != item['name_en']:
        raise RuntimeError(f'Collision: {expected_key} has unexpected identity metadata')
    prices = active_hkd_prices(product['id'])
    expected_cents = cents(item['retail_hkd'])
    matching = [
        p for p in prices
        if (p.get('metadata') or {}).get('mofu_import_key') == expected_key and p.get('unit_amount') == expected_cents
    ]
    if len(matching) > 1:
        raise RuntimeError(f'Collision: {expected_key} has multiple matching active HKD prices')
    if any(p not in matching for p in prices):
        raise RuntimeError(f'Collision: {expected_key} has unexpected active HKD price records')
    return matching[0] if matching else None


def preflight(items: list[dict[str, Any]], existing: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    if len(items) != 24:
        raise RuntimeError(f'Expected exactly 24 products, received {len(items)}')
    seen: set[str] = set()
    plan = []
    for item in items:
        expected_key = key(item)
        if expected_key in seen:
            raise RuntimeError(f'Duplicate import key {expected_key}')
        seen.add(expected_key)
        if item['category'] not in {'cats', 'dogs'}:
            raise RuntimeError(f'Invalid category for {item["sku"]}')
        expected_sub = '狗狗' if item['category'] == 'dogs' else '貓咪'
        if not item['subcategory'].startswith(expected_sub):
            raise RuntimeError(f'Invalid category/subcategory match for {item["sku"]}')
        if not item.get('cdn_url', '').startswith('https://files.manuscdn.com/'):
            raise RuntimeError(f'Missing cleaned CDN URL for {item["sku"]}')
        if not item.get('in_stock') or item['retail_hkd'] <= 0:
            raise RuntimeError(f'Invalid stock or retail price for {item["sku"]}')
        current = existing.get(expected_key)
        current_price = validate_existing(current, item) if current else None
        plan.append({
            'sku': item['sku'], 'import_key': expected_key, 'name_zh': item['name_zh'],
            'category': item['category'], 'subcategory': item['subcategory'],
            'retail_hkd': item['retail_hkd'], 'image_url': item['cdn_url'],
            'product_action': 'update' if current else 'create',
            'price_action': 'reuse' if current_price else 'create',
            'existing_product_id': current['id'] if current else None,
            'existing_price_id': current_price['id'] if current_price else None,
        })
    return plan


def apply_item(item: dict[str, Any], current: dict[str, Any] | None, current_price: dict[str, Any] | None, index: int) -> dict[str, Any]:
    expected_key = key(item)
    payload = {'name': display_name(item), 'description': metadata(item)['description_zh'], 'images[0]': item['cdn_url'], 'active': 'true'}
    payload.update(form_metadata(metadata(item)))
    if current:
        product = api_post(f'products/{current["id"]}', payload, f'batch24-product-update-v2-{index}')
        product_action = 'updated'
    else:
        product = api_post('products', payload, f'batch24-product-create-{index}')
        product_action = 'created'
    if current_price:
        price = current_price
        price_action = 'reused'
    else:
        price_payload = {
            'product': product['id'], 'currency': 'hkd', 'unit_amount': str(cents(item['retail_hkd'])),
            'metadata[mofu_import_source]': SOURCE,
            'metadata[mofu_import_key]': expected_key,
            'metadata[mofu_import_schema]': SCHEMA,
            'metadata[sku]': item['sku'],
            'metadata[compare_at_price_hkd]': '0',
            'metadata[variant_label_zh]': item['spec'],
            'metadata[variant_label_en]': item['spec'],
        }
        price = api_post('prices', price_payload, f'batch24-price-create-{index}')
        price_action = 'created'
    if product.get('default_price') != price['id']:
        product = api_post(f'products/{product["id"]}', {'default_price': price['id']}, f'batch24-default-price-{index}')
    return {
        'sku': item['sku'], 'name_zh': item['name_zh'], 'name_en': item['name_en'], 'spec': item['spec'],
        'category': item['category'], 'subcategory': item['subcategory'], 'retail_hkd': item['retail_hkd'],
        'source_cost_cny': item['source_cost_cny'], 'landed_cost_hkd': item['landed_cost_hkd'],
        'source_image': item['image_file'], 'clean_image_url': item['cdn_url'],
        'stripe_product_id': product['id'], 'stripe_price_id': price['id'], 'stripe_unit_amount': price['unit_amount'],
        'product_action': product_action, 'price_action': price_action,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    mapping = json.loads(MAPPING.read_text(encoding='utf-8'))
    items = mapping.get('products', [])
    existing = active_products()
    plan = preflight(items, existing)
    summary = {
        'mode': 'apply' if args.apply else 'preflight',
        'expected_product_count': 24, 'expected_price_count': 24,
        'dogs_count': sum(i['category'] == 'dogs' for i in items),
        'cats_count': sum(i['category'] == 'cats' for i in items),
        'products_to_create': sum(x['product_action'] == 'create' for x in plan),
        'products_to_update': sum(x['product_action'] == 'update' for x in plan),
        'prices_to_create': sum(x['price_action'] == 'create' for x in plan),
        'prices_to_reuse': sum(x['price_action'] == 'reuse' for x in plan),
        'plan': plan,
    }
    if not args.apply:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return
    results = []
    for index, item in enumerate(items, start=1):
        current = existing.get(key(item))
        current_price = validate_existing(current, item) if current else None
        results.append(apply_item(item, current, current_price, index))
    output = {
        'schema': SCHEMA, 'source_document': SOURCE, 'product_count': len(results), 'price_count': len(results),
        'dogs_count': summary['dogs_count'], 'cats_count': summary['cats_count'], 'products': results,
    }
    MANIFEST.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'product_count': len(results), 'price_count': len(results), 'manifest': str(MANIFEST)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
