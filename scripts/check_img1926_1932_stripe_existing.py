from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = Path('/home/ubuntu/.mcp/tool-results/2026-08-28_01-39-08.106122582_stripe_stripe_api_read_863c4c2d.json')
BATCH = ROOT / 'data' / 'img1926_1932_approved_product_batch_2026-08-28.json'
OUT = ROOT / 'reports' / 'img1926_1932_stripe_duplicate_check_2026-08-28.json'

raw_wrapper = json.loads(RAW.read_text(encoding='utf-8'))
text = raw_wrapper['content'][0]['text']
stripe_payload = json.loads(text)
existing = {}
for product in stripe_payload.get('data', []):
    key = (product.get('metadata') or {}).get('import_key')
    if key:
        existing[key] = {
            'product_id': product.get('id'),
            'name': product.get('name'),
            'active': product.get('active'),
            'default_price': product.get('default_price'),
        }

batch = json.loads(BATCH.read_text(encoding='utf-8'))
requested = [product['import_key'] for product in batch['products']]
result = {
    'requested_product_count': len(requested),
    'existing_product_count': sum(1 for key in requested if key in existing),
    'missing_product_count': sum(1 for key in requested if key not in existing),
    'existing': {key: existing[key] for key in requested if key in existing},
    'missing': [key for key in requested if key not in existing],
}
OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result, ensure_ascii=False, indent=2))
