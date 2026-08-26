from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

import requests

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
MANIFEST = ROOT / 'market_reference_price_manifest.json'
OUTPUT = ROOT / 'market_reference_price_apply_result.json'
API = 'https://api.stripe.com/v1'


def stripe_request(method: str, path: str, *, params: dict[str, str] | None = None, idempotency_key: str | None = None) -> dict:
    secret = os.environ.get('STRIPE_SECRET_KEY')
    if not secret:
        raise RuntimeError('STRIPE_SECRET_KEY is required')
    headers = {'Authorization': f'Bearer {secret}'}
    if idempotency_key:
        headers['Idempotency-Key'] = idempotency_key
    response = requests.request(method, f'{API}{path}', headers=headers, data=params, timeout=30)
    response.raise_for_status()
    return response.json()


def price_amount_hkd(price_id: str) -> float:
    price = stripe_request('GET', f'/prices/{price_id}')
    if price.get('currency') != 'hkd' or not price.get('active'):
        raise ValueError(f'Expected active HKD Price; received {price.get("currency")} active={price.get("active")}')
    return int(price['unit_amount']) / 100


def verify_entry(entry: dict) -> dict:
    product = stripe_request('GET', f"/products/{entry['product_id']}")
    metadata = product.get('metadata', {})
    sku = metadata.get('sku')
    import_key = metadata.get('mofu_import_key')
    expected_sku = entry.get('expected_sku')
    expected_import_key = entry.get('expected_import_key')
    if expected_sku and sku != expected_sku:
        raise ValueError(f"SKU mismatch for {entry['product_id']}: expected {expected_sku}, received {sku}")
    if expected_import_key and import_key != expected_import_key:
        raise ValueError(
            f"Import-key mismatch for {entry['product_id']}: expected {expected_import_key}, received {import_key}"
        )
    if not expected_sku and not expected_import_key:
        raise ValueError(f"No exact SKU or import key supplied for {entry['product_id']}")
    if entry['expected_name_fragment'] not in product.get('name', ''):
        raise ValueError(f"Name mismatch for {entry['product_id']}: expected fragment {entry['expected_name_fragment']}")
    default_price = product.get('default_price')
    if not default_price:
        raise ValueError(f"Missing default price for {entry['product_id']}")
    current_price = price_amount_hkd(default_price)
    if abs(current_price - float(entry['expected_current_price_hkd'])) > 0.001:
        raise ValueError(f"Current price mismatch for {entry['product_id']}: expected {entry['expected_current_price_hkd']}, received {current_price}")
    if float(entry['market_reference_price_hkd']) <= current_price:
        raise ValueError(f"Market reference must be higher than current price for {entry['product_id']}")
    return {
        'product_id': product['id'],
        'sku': sku,
        'mofu_import_key': import_key,
        'name': product.get('name'),
        'current_price_hkd': current_price,
        'existing_original_price_hkd': metadata.get('compare_at_price_hkd', '0'),
        'proposed_market_reference_price_hkd': float(entry['market_reference_price_hkd']),
        'reference_id': entry['reference_id'],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true', help='Write approved market-reference metadata after all checks pass.')
    args = parser.parse_args()

    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    checks = [verify_entry(entry) for entry in manifest['products']]
    result = {
        'schema': 'market-reference-price-apply-result-v1',
        'mode': 'apply' if args.apply else 'check',
        'checked': checks,
        'updated': [],
        'excluded_pending_sku_reconciliation': manifest.get('excluded_pending_sku_reconciliation', []),
    }

    if args.apply:
        for entry, checked in zip(manifest['products'], checks, strict=True):
            payload = {
                'metadata[market_reference_price_hkd]': f"{float(entry['market_reference_price_hkd']):.2f}",
                'metadata[market_reference_as_of]': entry['market_reference_as_of'],
                'metadata[market_reference_schema]': 'v1',
                'metadata[market_reference_evidence_id]': entry['reference_id'],
            }
            updated = stripe_request(
                'POST',
                f"/products/{entry['product_id']}",
                params=payload,
                idempotency_key=f"market-reference-v1-{entry['product_id']}",
            )
            metadata = updated.get('metadata', {})
            result['updated'].append({
                **checked,
                'stored_market_reference_price_hkd': metadata.get('market_reference_price_hkd'),
                'stored_market_reference_as_of': metadata.get('market_reference_as_of'),
            })

    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'mode': result['mode'], 'checked': len(checks), 'updated': len(result['updated'])}, ensure_ascii=False))


if __name__ == '__main__':
    main()
