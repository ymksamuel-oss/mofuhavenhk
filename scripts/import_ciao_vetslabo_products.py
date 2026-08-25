"""Safely import the verified 20-item CIAO and Vet's Labo cat-food catalog.

Run without --apply for a read-only preflight. The script never fuzzy-matches
Stripe records: it only creates or updates records that carry its exact
metadata[mofu_import_key]. All original screenshots are excluded from Stripe.
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
MAPPING_PATH = ROOT / 'ciao_vetslabo_mapping.json'
OUTPUT_MANIFEST_PATH = ROOT / 'ciao_vetslabo_stripe_manifest.json'
SOURCE_DOCUMENT = 'products_20_list.csv'
SCHEMA = 'ciao-vetslabo-cats-v1'
PREFIX = 'ciao-vetslabo-2026::'
API_KEY = os.environ.get('STRIPE_SECRET_KEY')
if not API_KEY:
    raise SystemExit('STRIPE_SECRET_KEY is not set')


def hkd_cents(value: int | float | str) -> int:
    return int((Decimal(str(value)) * 100).quantize(Decimal('1'), rounding=ROUND_HALF_UP))


def import_key(item: dict[str, Any]) -> str:
    return f"{PREFIX}{item['sku'].lower()}"


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
            if key and key.startswith(PREFIX):
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
    return f"{item['brand']}｜{item['name_zh']}｜{item['spec']}"


def description_fields(item: dict[str, Any]) -> tuple[str, str, str, str, str, str]:
    if item['sequence'] <= 16:
        description_zh = (
            f"{item['brand']} {item['name_zh']}為貓咪濕潤小食，規格 {item['spec']}。"
            '口味、配料與適用情況請以原包裝標示為準；請依包裝餵食指引安排食用並提供清水。'
        )
        description_en = (
            f"{item['brand']} {item['name_en']} is a moist cat treat in a {item['spec']} size. "
            'Refer to the original packaging for flavour, ingredients, suitability and feeding guidance, and provide fresh water.'
        )
        texture_zh = '濕潤肉絲與醬汁口感；實際質地以原包裝為準。'
        texture_en = 'Moist shredded texture in sauce; refer to the original package for the actual texture.'
        type_zh, type_en = '貓咪濕潤小食', 'Moist cat treat'
    else:
        description_zh = (
            f"{item['brand']} {item['name_zh']}為 MediMousse 系列貓咪濕食，規格 {item['spec']}。"
            '相關特性與適用情況均以原包裝標示為準；本店產品介紹不取代獸醫診斷或治療建議。'
        )
        description_en = (
            f"{item['brand']} {item['name_en']} is a MediMousse moist cat-food product in a {item['spec']} size. "
            'Refer to the original package for the stated characteristics and suitability; this listing does not replace veterinary diagnosis or treatment advice.'
        )
        texture_zh = '細滑慕斯濕食質地；實際質地以原包裝為準。'
        texture_en = 'Smooth moist mousse texture; refer to the original package for the actual texture.'
        type_zh, type_en = '貓咪濕食', 'Moist cat food'
    specs_zh = f"規格：{item['spec']}｜類型：{type_zh}｜適用對象：貓咪"
    specs_en = f"Size: {item['spec']} | Type: {type_en} | For: Cats"
    return description_zh, description_en, specs_zh, specs_en, texture_zh, texture_en


def metadata(item: dict[str, Any]) -> dict[str, str]:
    description_zh, description_en, specs_zh, specs_en, texture_zh, texture_en = description_fields(item)
    snack_series = ''
    if item['sequence'] in {1, 2}:
        snack_series = '老貓零食'
    elif item['sequence'] == 7:
        snack_series = '去毛球配方'
    product_group_zh = '貓咪小食' if item['subcategory'] == '貓貓小食' else '貓咪濕食'
    product_group_en = 'Cat treats' if item['subcategory'] == '貓貓小食' else 'Cat wet food'
    values = {
        'mofu_import_source': SOURCE_DOCUMENT,
        'mofu_import_key': import_key(item),
        'mofu_import_schema': SCHEMA,
        'sku': item['sku'],
        'brand': item['brand'],
        'category': 'cats',
        'category_zh': '貓咪商品',
        'subcategory': item['subcategory'],
        'product_type': item['product_type'],
        'name_zh': item['name_zh'],
        'name_en': item['name_en'],
        'description_zh': description_zh,
        'description_en': description_en,
        'specs_zh': specs_zh,
        'specs_en': specs_en,
        'texture_zh': texture_zh,
        'texture_en': texture_en,
        'availability': '現貨',
        'availability_display_zh': f"現貨｜{item['spec']}｜{product_group_zh}",
        'availability_display_en': f"In stock | {item['spec']} | {product_group_en}",
        'in_stock': 'true',
        'image_pending': 'false',
        'tags': f"{item['brand']},貓咪,{item['subcategory']},{item['spec']},日本寵物食品",
        'compare_at_price_hkd': f"{item['compare_at_hkd']:.2f}",
        'compare_at_price_schema': 'v1',
        'compare_at_price_currency': 'hkd',
    }
    if snack_series:
        values['snack_series'] = snack_series
    return values


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
        raise RuntimeError(f"Collision: {key} is attached to {product['id']} with an unexpected name")
    if product_metadata.get('sku') != item['sku']:
        raise RuntimeError(f"Collision: {key} has unexpected SKU metadata")
    if product_metadata.get('name_zh') != item['name_zh'] or product_metadata.get('name_en') != item['name_en']:
        raise RuntimeError(f"Collision: {key} has unexpected bilingual name metadata")
    prices = active_hkd_prices(product['id'])
    matching = [
        price for price in prices
        if (price.get('metadata') or {}).get('mofu_import_key') == key
        and price.get('unit_amount') == expected_price(item)
    ]
    if len(matching) > 1:
        raise RuntimeError(f'Collision: {key} has multiple matching active HKD prices')
    if any(price not in matching for price in prices):
        raise RuntimeError(f'Collision: {key} has an unexpected active HKD price; manual review required')
    return matching[0] if matching else None


def preflight(items: list[dict[str, Any]], existing: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    if len(items) != 20:
        raise RuntimeError(f'Expected exactly 20 products, got {len(items)}')
    seen: set[str] = set()
    plan: list[dict[str, Any]] = []
    for item in items:
        key = import_key(item)
        if key in seen:
            raise RuntimeError(f'Duplicate import key: {key}')
        seen.add(key)
        if not item.get('cdn_url', '').startswith('https://files.manuscdn.com/'):
            raise RuntimeError(f'Missing or invalid cleaned CDN URL for {item["sku"]}')
        if item['retail_hkd'] <= 0 or item['compare_at_hkd'] <= item['retail_hkd']:
            raise RuntimeError(f'Invalid retail/compare-at prices for {item["sku"]}')
        if item['category'] != 'cats' or item['subcategory'] not in {'貓貓小食', '貓罐罐'}:
            raise RuntimeError(f'Unexpected category for {item["sku"]}')
        current = existing.get(key)
        price = validate_existing_product(current, item) if current else None
        plan.append({
            'sku': item['sku'],
            'source_key': key,
            'name_zh': item['name_zh'],
            'retail_hkd': item['retail_hkd'],
            'compare_at_hkd': item['compare_at_hkd'],
            'subcategory': item['subcategory'],
            'image_url': item['cdn_url'],
            'existing_product_id': current['id'] if current else None,
            'existing_price_id': price['id'] if price else None,
            'planned_product_action': 'update' if current else 'create',
            'planned_price_action': 'reuse' if price else 'create',
        })
    return plan


def apply_item(item: dict[str, Any], current: dict[str, Any] | None, current_price: dict[str, Any] | None, index: int) -> dict[str, Any]:
    key = import_key(item)
    product_metadata = metadata(item)
    product_payload = {
        'name': display_name(item),
        'description': product_metadata['description_zh'],
        'images[0]': item['cdn_url'],
        'active': 'true',
    }
    product_payload.update(form_metadata(product_metadata))
    if current:
        product = post(f"products/{current['id']}", product_payload, f'ciao-vets-product-update-v1-{index}')
        product_action = 'updated'
    else:
        product = post('products', product_payload, f'ciao-vets-product-create-v1-{index}')
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
            'metadata[mofu_import_schema]': SCHEMA,
            'metadata[sku]': item['sku'],
            'metadata[compare_at_price_hkd]': f"{item['compare_at_hkd']:.2f}",
            'metadata[compare_at_price_schema]': 'v1',
            'metadata[compare_at_price_currency]': 'hkd',
            'metadata[variant_label_zh]': item['spec'],
            'metadata[variant_label_en]': item['spec'],
        }
        price = post('prices', price_payload, f'ciao-vets-price-create-v1-{index}')
        price_action = 'created'
    if product.get('default_price') != price['id']:
        product = post(
            f"products/{product['id']}", {'default_price': price['id']}, f'ciao-vets-default-price-v1-{index}'
        )
    return {
        'sku': item['sku'],
        'name_zh': item['name_zh'],
        'name_en': item['name_en'],
        'spec': item['spec'],
        'retail_hkd': item['retail_hkd'],
        'compare_at_hkd': item['compare_at_hkd'],
        'subcategory': item['subcategory'],
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
        'expected_product_count': 20,
        'expected_price_count': 20,
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
        'products': results,
    }
    OUTPUT_MANIFEST_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({
        'product_count': len(results),
        'price_count': len(results),
        'manifest': str(OUTPUT_MANIFEST_PATH),
    }, ensure_ascii=False))


if __name__ == '__main__':
    main()
