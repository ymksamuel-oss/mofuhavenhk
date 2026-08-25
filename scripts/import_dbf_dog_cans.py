"""Import the 23 d.b.f dog cans into Stripe with exact-key collision safety.

Run without --apply for a read-only preflight. The script never fuzzy-matches a
Stripe product: it creates or updates only records carrying the exact SKU-based
metadata[mofu_import_key] value defined below.
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
MAPPING_PATH = ROOT / 'dbf_dog_cans_mapping.json'
OUTPUT_MANIFEST_PATH = ROOT / 'dbf_dog_cans_stripe_manifest.json'
SOURCE_DOCUMENT = 'dbf_dog_cans_23_items(1).xlsx'
API_KEY = os.environ.get('STRIPE_SECRET_KEY')
if not API_KEY:
    raise SystemExit('STRIPE_SECRET_KEY is not set')


COMPLETE_MEAL_SKUS = {
    'DBF-04', 'DBF-05', 'DBF-08', 'DBF-11', 'DBF-12', 'DBF-13',
    'DBF-14', 'DBF-16', 'DBF-17', 'DBF-18', 'DBF-20',
}


def hkd_cents(value: int | float | str) -> int:
    return int((Decimal(str(value)) * 100).quantize(Decimal('1'), rounding=ROUND_HALF_UP))


def import_key(item: dict[str, Any]) -> str:
    return f"dbf-dog-cans-2026::{item['sku'].lower()}"


def get(path: str, params: dict[str, str]) -> dict[str, Any]:
    response = requests.get(
        f'https://api.stripe.com/v1/{path}', auth=(API_KEY, ''), params=params, timeout=60
    )
    response.raise_for_status()
    return response.json()


def post(path: str, data: dict[str, str], idempotency_key: str) -> dict[str, Any]:
    response = requests.post(
        f'https://api.stripe.com/v1/{path}',
        auth=(API_KEY, ''),
        data=data,
        headers={'Idempotency-Key': idempotency_key},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def list_active_products_by_key() -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    starting_after: str | None = None
    while True:
        params = {'active': 'true', 'limit': '100'}
        if starting_after:
            params['starting_after'] = starting_after
        page = get('products', params)
        products = page.get('data', [])
        for product in products:
            key = (product.get('metadata') or {}).get('mofu_import_key')
            if key and key.startswith('dbf-dog-cans-2026::'):
                if key in result:
                    raise RuntimeError(f'Duplicate active Stripe products carry mofu_import_key={key}')
                result[key] = product
        if not page.get('has_more') or not products:
            return result
        starting_after = products[-1]['id']


def active_hkd_prices(product_id: str) -> list[dict[str, Any]]:
    page = get('prices', {'product': product_id, 'active': 'true', 'currency': 'hkd', 'limit': '100'})
    if page.get('has_more'):
        raise RuntimeError(f'More than 100 active HKD prices for {product_id}; aborting')
    return page.get('data', [])


def display_name(item: dict[str, Any]) -> str:
    return f"{item['name_zh']}｜{item['name_en']}"


def feeding_type(item: dict[str, Any]) -> tuple[str, str]:
    if item['sku'] in COMPLETE_MEAL_SKUS:
        return '主食罐', 'Complete meal can'
    return '營養副食', 'Complementary food can'


def age_label(item: dict[str, Any]) -> tuple[str, str]:
    if item['sku'] in {'DBF-14', 'DBF-16', 'DBF-17', 'DBF-20'}:
        return '適合 7 歲或以上犬隻', 'For dogs aged 7 years and over'
    return '狗狗日常食品', 'Everyday dog food'


def descriptions(item: dict[str, Any]) -> tuple[str, str, str, str]:
    feed_zh, feed_en = feeding_type(item)
    age_zh, age_en = age_label(item)
    description_zh = (
        f"{item['name_zh']}為 d.b.f 狗狗罐頭，規格 {item['spec']}。"
        f"本款按原包裝標示歸類為{feed_zh}；{age_zh}。"
        '請按原包裝的餵食建議及犬隻需要安排食用，並提供充足清水。'
    )
    description_en = (
        f"{item['name_en']} is a d.b.f dog food can in a {item['spec']} size. "
        f"Based on the original package label, it is presented as a {feed_en.lower()}. {age_en}. "
        'Follow the feeding guidance on the original packaging and provide fresh water.'
    )
    specs_zh = f"規格：{item['spec']}｜類型：{feed_zh}｜{age_zh}｜原裝零售罐"
    specs_en = f"Size: {item['spec']} | Type: {feed_en} | {age_en} | Original retail can"
    return description_zh, description_en, specs_zh, specs_en


def metadata(item: dict[str, Any]) -> dict[str, str]:
    description_zh, description_en, specs_zh, specs_en = descriptions(item)
    feed_zh, feed_en = feeding_type(item)
    availability_zh = '現貨' if item['in_stock'] else '缺貨'
    availability_en = 'In stock' if item['in_stock'] else 'Out of stock'
    return {
        'mofu_import_source': SOURCE_DOCUMENT,
        'mofu_import_key': import_key(item),
        'mofu_import_schema': 'dbf-dog-cans-v1',
        'sku': item['sku'],
        'brand': 'd.b.f',
        'category': 'dogs',
        'category_zh': '狗狗',
        'subcategory': '狗狗食品',
        'product_type': 'dog_canned_food',
        'feeding_type_zh': feed_zh,
        'feeding_type_en': feed_en,
        'name_zh': item['name_zh'],
        'name_en': item['name_en'],
        'japanese_name': item['japanese_name'],
        'description_zh': description_zh,
        'description_en': description_en,
        'specs_zh': specs_zh,
        'specs_en': specs_en,
        'texture_zh': '罐裝肉泥／肉粒質地；實際質地與餵食方式請以原包裝為準。',
        'texture_en': 'Canned mince or chunk texture; refer to the original package for the actual texture and feeding method.',
        'availability': availability_zh,
        'availability_display_zh': f"{availability_zh}｜{item['spec']}｜狗狗罐頭",
        'availability_display_en': f"{availability_en} | {item['spec']} | Dog food can",
        'in_stock': 'true' if item['in_stock'] else 'false',
        'show_when_out_of_stock': 'false' if item['in_stock'] else 'true',
        'image_pending': 'false',
        'tags': f"d.b.f,狗狗食品,狗狗罐頭,{feed_zh},{item['spec']},日本寵物食品",
        # The supplied worksheet contains no original/compare-at price. Keep zero to disable strikethrough pricing.
        'compare_at_price_hkd': '0',
        'compare_at_price_schema': 'v1',
        'compare_at_price_currency': 'hkd',
    }


def form_metadata(values: dict[str, str]) -> dict[str, str]:
    return {f'metadata[{key}]': value for key, value in values.items()}


def expected_price(item: dict[str, Any]) -> int:
    return hkd_cents(item['retail_hkd'])


def validate_existing_product(product: dict[str, Any], item: dict[str, Any]) -> dict[str, Any] | None:
    key = import_key(item)
    product_metadata = product.get('metadata') or {}
    if product_metadata.get('mofu_import_key') != key:
        raise RuntimeError(f"Product {product['id']} does not carry the expected exact import key")
    if product.get('name') != display_name(item):
        raise RuntimeError(f"Collision: {key} is attached to {product['id']} with unexpected name")
    if product_metadata.get('sku') != item['sku']:
        raise RuntimeError(f"Collision: {key} has unexpected sku metadata")
    if product_metadata.get('name_zh') != item['name_zh'] or product_metadata.get('name_en') != item['name_en']:
        raise RuntimeError(f"Collision: {key} has unexpected bilingual name metadata")

    prices = active_hkd_prices(product['id'])
    matching = [
        price for price in prices
        if (price.get('metadata') or {}).get('mofu_import_key') == key
        and price.get('unit_amount') == expected_price(item)
    ]
    if len(matching) > 1:
        raise RuntimeError(f'Collision: {key} has more than one matching active HKD price')
    if any(price not in matching for price in prices):
        raise RuntimeError(f'Collision: {key} has an unexpected active HKD price; manual review required')
    return matching[0] if matching else None


def preflight(items: list[dict[str, Any]], existing: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    if len(items) != 23:
        raise RuntimeError(f'Expected exactly 23 products, got {len(items)}')
    seen: set[str] = set()
    plan: list[dict[str, Any]] = []
    for item in items:
        key = import_key(item)
        if key in seen:
            raise RuntimeError(f'Duplicate import key: {key}')
        seen.add(key)
        if not item.get('cdn_url', '').startswith('https://files.manuscdn.com/'):
            raise RuntimeError(f'Missing or invalid cleaned CDN URL for {item["sku"]}')
        if item['retail_hkd'] <= 0:
            raise RuntimeError(f'Invalid retail price for {item["sku"]}')
        if item['category'] != 'dogs' or item['subcategory'] != '狗狗食品':
            raise RuntimeError(f'Unexpected category for {item["sku"]}')
        current = existing.get(key)
        price = validate_existing_product(current, item) if current else None
        plan.append({
            'sku': item['sku'],
            'source_key': key,
            'name_zh': item['name_zh'],
            'retail_hkd': item['retail_hkd'],
            'in_stock': item['in_stock'],
            'image_url': item['cdn_url'],
            'existing_product_id': current['id'] if current else None,
            'existing_price_id': price['id'] if price else None,
            'planned_product_action': 'update' if current else 'create',
            'planned_price_action': 'reuse' if price else 'create',
        })
    return plan


def apply_item(item: dict[str, Any], current: dict[str, Any] | None, current_price: dict[str, Any] | None, index: int) -> dict[str, Any]:
    key = import_key(item)
    product_payload = {
        'name': display_name(item),
        'description': metadata(item)['description_zh'],
        'images[0]': item['cdn_url'],
        'active': 'true',
    }
    product_payload.update(form_metadata(metadata(item)))
    if current:
        product = post(f"products/{current['id']}", product_payload, f'dbf-dog-can-product-update-v1-{index}')
        product_action = 'updated'
    else:
        product = post('products', product_payload, f'dbf-dog-can-product-create-v1-{index}')
        product_action = 'created'

    if current_price:
        price = current_price
        price_action = 'reused'
    else:
        price_payload = {
            'product': product['id'],
            'currency': 'hkd',
            'unit_amount': str(expected_price(item)),
            'metadata[mofu_import_source]': SOURCE_DOCUMENT,
            'metadata[mofu_import_key]': key,
            'metadata[mofu_import_schema]': 'dbf-dog-cans-v1',
            'metadata[sku]': item['sku'],
            'metadata[compare_at_price_hkd]': '0',
            'metadata[variant_label_zh]': item['spec'],
            'metadata[variant_label_en]': item['spec'],
        }
        price = post('prices', price_payload, f'dbf-dog-can-price-create-v1-{index}')
        price_action = 'created'
    if product.get('default_price') != price['id']:
        product = post(
            f"products/{product['id']}",
            {'default_price': price['id']},
            f'dbf-dog-can-default-price-v1-{index}',
        )

    return {
        'sku': item['sku'],
        'name_zh': item['name_zh'],
        'name_en': item['name_en'],
        'spec': item['spec'],
        'retail_hkd': item['retail_hkd'],
        'in_stock': item['in_stock'],
        'source_image': item['image_file'],
        'clean_image_url': item['cdn_url'],
        'stripe_product_id': product['id'],
        'stripe_price_id': price['id'],
        'stripe_unit_amount': price['unit_amount'],
        'product_action': product_action,
        'price_action': price_action,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true', help='Create/update Stripe records only after a clean preflight')
    args = parser.parse_args()
    mapping = json.loads(MAPPING_PATH.read_text(encoding='utf-8'))
    items = mapping.get('products', [])
    existing = list_active_products_by_key()
    plan = preflight(items, existing)
    summary = {
        'mode': 'apply' if args.apply else 'preflight',
        'expected_product_count': 23,
        'expected_price_count': 23,
        'in_stock_count': sum(item['in_stock'] for item in items),
        'out_of_stock_skus': [item['sku'] for item in items if not item['in_stock']],
        'products_to_create': sum(entry['planned_product_action'] == 'create' for entry in plan),
        'products_to_update': sum(entry['planned_product_action'] == 'update' for entry in plan),
        'prices_to_create': sum(entry['planned_price_action'] == 'create' for entry in plan),
        'prices_to_reuse': sum(entry['planned_price_action'] == 'reuse' for entry in plan),
        'plan': plan,
    }
    if not args.apply:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return

    results = []
    for index, item in enumerate(items, start=1):
        source_key = import_key(item)
        product = existing.get(source_key)
        price = validate_existing_product(product, item) if product else None
        results.append(apply_item(item, product, price, index))
    output = {
        'source_document': SOURCE_DOCUMENT,
        'product_count': len(results),
        'price_count': len(results),
        'out_of_stock_skus': summary['out_of_stock_skus'],
        'products': results,
    }
    OUTPUT_MANIFEST_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({
        'product_count': len(results),
        'price_count': len(results),
        'manifest': str(OUTPUT_MANIFEST_PATH),
        'out_of_stock_skus': summary['out_of_stock_skus'],
    }, ensure_ascii=False))


if __name__ == '__main__':
    main()
