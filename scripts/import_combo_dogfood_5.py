"""Import five COMBO 720g dog-food products safely.

Run without --apply for a read-only preflight. Existing Stripe products are reused
only when they carry the exact mofu_import_key and matching bilingual identity.
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
MAPPING_PATH = ROOT / 'combo_dogfood_5_import_mapping.json'
MANIFEST_PATH = ROOT / 'combo_dogfood_5_stripe_manifest.json'
API_KEY = os.environ.get('STRIPE_SECRET_KEY')
SCHEMA = 'combo-dogfood-5-v1'
PREFIX = 'combo-dogfood-720g-2026::'

if not API_KEY:
    raise SystemExit('STRIPE_SECRET_KEY is not set')


def hkd_cents(value: float | str) -> int:
    return int((Decimal(str(value)) * 100).quantize(Decimal('1'), rounding=ROUND_HALF_UP))


def import_key(item: dict[str, Any]) -> str:
    return f"{PREFIX}{item['import_key']}"


def get(path: str, params: dict[str, str]) -> dict[str, Any]:
    response = requests.get(f'https://api.stripe.com/v1/{path}', auth=(API_KEY, ''), params=params, timeout=60)
    response.raise_for_status()
    return response.json()


def post(path: str, data: dict[str, str], key: str) -> dict[str, Any]:
    response = requests.post(
        f'https://api.stripe.com/v1/{path}', auth=(API_KEY, ''), data=data,
        headers={'Idempotency-Key': key}, timeout=60,
    )
    response.raise_for_status()
    return response.json()


def form_metadata(metadata: dict[str, str]) -> dict[str, str]:
    return {f'metadata[{key}]': value for key, value in metadata.items()}


def name(item: dict[str, Any]) -> str:
    return f"{item['name_zh']}｜{item['name_en']}"


def descriptions(item: dict[str, Any]) -> tuple[str, str, str, str, str, str]:
    qualifiers_zh: list[str] = []
    qualifiers_en: list[str] = []
    if '低脂' in item['name_zh']:
        qualifiers_zh.append('原包裝標示為低脂系列')
        qualifiers_en.append('The original packaging identifies this as a low-fat series')
    if '7歲以上' in item['name_zh']:
        qualifiers_zh.append('原包裝標示適合 7 歲或以上犬隻')
        qualifiers_en.append('The original packaging identifies it for dogs aged 7 years and over')
    qualifier_zh = '；'.join(qualifiers_zh) if qualifiers_zh else '日常狗狗乾糧'
    qualifier_en = '. '.join(qualifiers_en) if qualifiers_en else 'Everyday dry dog food'
    description_zh = (
        f"{item['name_zh']}為 COMBO 袋裝狗狗乾糧，{item['spec']}。{qualifier_zh}。"
        '請按原包裝的餵食建議及犬隻需要安排食用，並提供充足清水。'
    )
    description_en = (
        f"{item['name_en']} is COMBO packaged dry dog food in a {item['spec']} size. {qualifier_en}. "
        'Follow the feeding guidance on the original packaging and provide fresh water.'
    )
    specs_zh = f"規格：{item['spec']}｜類型：狗狗乾糧｜原裝袋裝"
    specs_en = f"Size: {item['spec']} | Type: Dry dog food | Original retail pack"
    texture_zh = '乾糧顆粒及配料粒；實際配方與餵食方式請以原包裝為準。'
    texture_en = 'Dry kibbles with ingredient pieces; refer to the original packaging for formula and feeding guidance.'
    return description_zh, description_en, specs_zh, specs_en, texture_zh, texture_en


def metadata(item: dict[str, Any]) -> dict[str, str]:
    description_zh, description_en, specs_zh, specs_en, texture_zh, texture_en = descriptions(item)
    return {
        'mofu_import_source': 'user-confirmed-combo-dogfood-5',
        'mofu_import_key': import_key(item),
        'mofu_import_schema': SCHEMA,
        'sku': item['sku'],
        'brand': 'COMBO',
        'category': 'dogs',
        'category_zh': '狗狗',
        'subcategory': '狗狗食品',
        'product_type': 'dog_dry_food',
        'name_zh': item['name_zh'],
        'name_en': item['name_en'],
        'description_zh': description_zh,
        'description_en': description_en,
        'specs_zh': specs_zh,
        'specs_en': specs_en,
        'texture_zh': texture_zh,
        'texture_en': texture_en,
        'availability': '現貨',
        'availability_display_zh': f"現貨｜{item['spec']}｜狗狗乾糧",
        'availability_display_en': f"In stock | {item['spec']} | Dry dog food",
        'in_stock': 'true',
        'show_when_out_of_stock': 'false',
        'image_pending': 'false',
        'tags': f"COMBO,狗狗食品,狗狗乾糧,720g,{item['name_zh']}",
        'compare_at_price_hkd': '0',
        'compare_at_price_schema': 'v1',
        'compare_at_price_currency': 'hkd',
    }


def active_products() -> dict[str, dict[str, Any]]:
    found: dict[str, dict[str, Any]] = {}
    starting_after: str | None = None
    while True:
        params = {'active': 'true', 'limit': '100'}
        if starting_after:
            params['starting_after'] = starting_after
        page = get('products', params)
        products = page.get('data', [])
        for product in products:
            key = (product.get('metadata') or {}).get('mofu_import_key', '')
            if key.startswith(PREFIX):
                if key in found:
                    raise RuntimeError(f'Duplicate active product import key: {key}')
                found[key] = product
        if not page.get('has_more') or not products:
            return found
        starting_after = products[-1]['id']


def hkd_prices(product_id: str) -> list[dict[str, Any]]:
    page = get('prices', {'product': product_id, 'active': 'true', 'currency': 'hkd', 'limit': '100'})
    if page.get('has_more'):
        raise RuntimeError(f'Unexpectedly more than 100 active HKD prices for {product_id}')
    return page.get('data', [])


def validate_existing(product: dict[str, Any], item: dict[str, Any]) -> dict[str, Any] | None:
    key = import_key(item)
    metadata_values = product.get('metadata') or {}
    if metadata_values.get('mofu_import_key') != key or product.get('name') != name(item):
        raise RuntimeError(f'Collision: {key} is not the expected product identity')
    if metadata_values.get('sku') != item['sku']:
        raise RuntimeError(f'Collision: {key} has unexpected SKU metadata')
    prices = hkd_prices(product['id'])
    matching = [
        price for price in prices
        if (price.get('metadata') or {}).get('mofu_import_key') == key
        and price.get('unit_amount') == hkd_cents(item['retail_hkd'])
    ]
    if len(matching) > 1 or any(price not in matching for price in prices):
        raise RuntimeError(f'Collision: {key} has an unexpected active HKD price')
    return matching[0] if matching else None


def preflight(items: list[dict[str, Any]], existing: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    if len(items) != 5:
        raise RuntimeError(f'Expected 5 products, received {len(items)}')
    seen: set[str] = set()
    plan: list[dict[str, Any]] = []
    for item in items:
        key = import_key(item)
        if key in seen:
            raise RuntimeError(f'Duplicate exact import key: {key}')
        seen.add(key)
        if item['category'] != 'dogs' or item['subcategory'] != '狗狗食品':
            raise RuntimeError(f'Unexpected category for {item["sku"]}')
        if not item['in_stock'] or item['retail_hkd'] <= 0:
            raise RuntimeError(f'Invalid inventory or retail price for {item["sku"]}')
        if item['freight_hkd'] != 0:
            raise RuntimeError(f'Freight must be user-confirmed zero for {item["sku"]}')
        if not item['cdn_url'].startswith('https://files.manuscdn.com/'):
            raise RuntimeError(f'Missing cleaned CDN image for {item["sku"]}')
        current = existing.get(key)
        price = validate_existing(current, item) if current else None
        plan.append({
            'sku': item['sku'], 'name_zh': item['name_zh'], 'retail_hkd': item['retail_hkd'],
            'cost_hkd_estimate': item['landed_cost_hkd'], 'image_url': item['cdn_url'],
            'existing_product_id': current['id'] if current else None,
            'existing_price_id': price['id'] if price else None,
            'planned_product_action': 'update' if current else 'create',
            'planned_price_action': 'reuse' if price else 'create',
        })
    return plan


def apply_item(item: dict[str, Any], current: dict[str, Any] | None, current_price: dict[str, Any] | None, index: int) -> dict[str, Any]:
    key = import_key(item)
    payload = {'name': name(item), 'description': metadata(item)['description_zh'], 'images[0]': item['cdn_url'], 'active': 'true'}
    payload.update(form_metadata(metadata(item)))
    if current:
        product = post(f"products/{current['id']}", payload, f'combo-dogfood-product-update-v1-{index}')
        product_action = 'updated'
    else:
        product = post('products', payload, f'combo-dogfood-product-create-v1-{index}')
        product_action = 'created'
    if current_price:
        price = current_price
        price_action = 'reused'
    else:
        price = post('prices', {
            'product': product['id'], 'currency': 'hkd', 'unit_amount': str(hkd_cents(item['retail_hkd'])),
            'metadata[mofu_import_source]': 'user-confirmed-combo-dogfood-5',
            'metadata[mofu_import_key]': key, 'metadata[mofu_import_schema]': SCHEMA,
            'metadata[sku]': item['sku'], 'metadata[compare_at_price_hkd]': '0',
            'metadata[variant_label_zh]': item['spec'], 'metadata[variant_label_en]': item['spec'],
        }, f'combo-dogfood-price-create-v1-{index}')
        price_action = 'created'
    if product.get('default_price') != price['id']:
        product = post(f"products/{product['id']}", {'default_price': price['id']}, f'combo-dogfood-default-price-v1-{index}')
    return {
        'sku': item['sku'], 'name_zh': item['name_zh'], 'name_en': item['name_en'], 'spec': item['spec'],
        'retail_hkd': item['retail_hkd'], 'cost_hkd_estimate': item['landed_cost_hkd'],
        'freight_hkd': item['freight_hkd'], 'cost_status': item['cost_status'],
        'clean_image_url': item['cdn_url'], 'stripe_product_id': product['id'], 'stripe_price_id': price['id'],
        'stripe_unit_amount': price['unit_amount'], 'product_action': product_action, 'price_action': price_action,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    mapping = json.loads(MAPPING_PATH.read_text(encoding='utf-8'))
    items = mapping['products']
    existing = active_products()
    plan = preflight(items, existing)
    summary = {
        'mode': 'apply' if args.apply else 'preflight', 'product_count': len(items), 'price_count': len(items),
        'products_to_create': sum(row['planned_product_action'] == 'create' for row in plan),
        'products_to_update': sum(row['planned_product_action'] == 'update' for row in plan),
        'prices_to_create': sum(row['planned_price_action'] == 'create' for row in plan),
        'prices_to_reuse': sum(row['planned_price_action'] == 'reuse' for row in plan), 'plan': plan,
    }
    if not args.apply:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return
    results = []
    for index, item in enumerate(items, start=1):
        current = existing.get(import_key(item))
        price = validate_existing(current, item) if current else None
        results.append(apply_item(item, current, price, index))
    manifest = {
        'source': 'user-supplied 5 COMBO dog-food screenshots', 'product_count': len(results), 'price_count': len(results),
        'pricing': mapping['source_cost_policy'], 'products': results,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'product_count': len(results), 'price_count': len(results), 'manifest': str(MANIFEST_PATH)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
