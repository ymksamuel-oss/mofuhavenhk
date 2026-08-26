from __future__ import annotations

import json
import os
import time
from pathlib import Path

import requests

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
api_key = os.environ.get('STRIPE_SECRET_KEY')
if not api_key:
    raise SystemExit('STRIPE_SECRET_KEY is not set')

now = int(time.time())
since = now - 48 * 60 * 60
params: dict[str, str | int] = {'limit': 100, 'created[gte]': since}
products: list[dict] = []
while True:
    response = requests.get('https://api.stripe.com/v1/products', params=params, auth=(api_key, ''), timeout=60)
    response.raise_for_status()
    payload = response.json()
    products.extend(payload['data'])
    if not payload.get('has_more'):
        break
    params['starting_after'] = payload['data'][-1]['id']

summary = {
    'reference_utc': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(now)),
    'since_utc': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(since)),
    'count': len(products),
    'products': products,
}
(ROOT / 'recent_48h_stripe_products_all.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'reference_utc': summary['reference_utc'], 'since_utc': summary['since_utc'], 'count': summary['count']}, ensure_ascii=False))
