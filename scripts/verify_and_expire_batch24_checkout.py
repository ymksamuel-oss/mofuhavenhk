from __future__ import annotations

import json
import os
from pathlib import Path

import requests

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
TEST = json.loads((ROOT / 'batch24_checkout_session.json').read_text(encoding='utf-8'))
OUT = ROOT / 'batch24_checkout_verification.json'
API_KEY = os.environ.get('STRIPE_SECRET_KEY')
if not API_KEY:
    raise SystemExit('STRIPE_SECRET_KEY is not set')

session_id = TEST['sessionId']
expected_price_id = 'price_1U8TeIRyM6dRKLtZfLkTpmot'
headers = {'Authorization': f'Bearer {API_KEY}'}

session_response = requests.get(f'https://api.stripe.com/v1/checkout/sessions/{session_id}', headers=headers, timeout=60)
session_response.raise_for_status()
session = session_response.json()
items_response = requests.get(f'https://api.stripe.com/v1/checkout/sessions/{session_id}/line_items', headers=headers, timeout=60)
items_response.raise_for_status()
line_items = items_response.json().get('data', [])
target_lines = [line for line in line_items if (line.get('price') or {}).get('id') == expected_price_id]

# Expire this no-payment verification session regardless of the pass/fail result.
expire_response = requests.post(f'https://api.stripe.com/v1/checkout/sessions/{session_id}/expire', headers=headers, timeout=60)
expire_response.raise_for_status()
expired = expire_response.json()

checks = {
    'open_before_expiry': session.get('status') == 'open',
    'unpaid_before_expiry': session.get('payment_status') == 'unpaid',
    'target_price_present_once': len(target_lines) == 1,
    'target_item_amount_hkd': len(target_lines) == 1 and target_lines[0].get('amount_total') == 1990,
    'currency_hkd': session.get('currency') == 'hkd',
    'expired_after_verification': expired.get('status') == 'expired',
}
result = {
    'session_id': session_id,
    'checks': checks,
    'product_id': 'prod_V8lAUga8Mwc3d0',
    'price_id': expected_price_id,
    'target_item_hkd': 19.90,
    'session_total_hkd': (session.get('amount_total') or 0) / 100,
    'line_items': [
        {
            'description': line.get('description'),
            'price_id': (line.get('price') or {}).get('id'),
            'quantity': line.get('quantity'),
            'amount_total_hkd': (line.get('amount_total') or 0) / 100,
        }
        for line in line_items
    ],
    'payment_status': session.get('payment_status'),
    'final_session_status': expired.get('status'),
}
OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result, ensure_ascii=False))
if not all(checks.values()):
    raise SystemExit('Checkout verification failed; see batch24_checkout_verification.json')
