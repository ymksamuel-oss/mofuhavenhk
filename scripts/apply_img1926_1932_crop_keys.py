from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / 'data' / 'img1926_1932_candidate_products_2026-08-28.json'

KEY_TO_ASSET = {
    'double-rack-black-white': 'crop-double-bowl-rack-black-white',
    'double-rack-yellow-pink': 'crop-double-bowl-rack-yellow-pink',
    'stand-bowl-black': 'crop-single-bowl-rack-black',
    'stand-bowl-white': 'crop-single-bowl-rack-white',
    'stand-bowl-pink': 'crop-single-bowl-rack-pink',
    'ceramic-black-paw': 'crop-ceramic-single-black-paw',
    'ceramic-white-paw': 'crop-ceramic-single-white-paw',
    'ceramic-black-fish': 'crop-ceramic-single-black-fish',
    'ceramic-white-fish': 'crop-ceramic-single-white-fish',
    'ceramic-pink-paw': 'crop-ceramic-single-pink-paw',
    'ceramic-pink-fish': 'crop-ceramic-single-pink-fish',
    'ceramic-yellow-paw': 'crop-ceramic-single-yellow-paw',
    'ceramic-yellow-fish': 'crop-ceramic-single-yellow-fish',
    'bowl-pair-black': 'crop-double-bowl-black-pair',
    'bowl-pair-pink': 'crop-pink-bowl-pair',
    'woven-blue-mat-cooling-35cm': 'crop-woven-cat-bed-blue-mat-chopsticks',
    'woven-blue-cushion-cooling-35cm': 'crop-woven-cat-bed-blue-cushion',
    'woven-empty-white-cushion-cooling-35cm': 'crop-woven-cat-bed-empty',
    'cat-house-white-cushion-cooling-small': 'crop-white-cat-house-bed',
    'dog-bed-pink-48x57': 'crop-pink-small-medium-dog-bed',
    'dog-bed-blue-48x57': 'crop-blue-small-medium-dog-bed',
    'blue-large-ear-round-s': 'crop-blue-large-ear-dog-round-bed',
    'pink-large-dog-bed-75x65': 'crop-pink-large-dog-bed',
}

payload = json.loads(PATH.read_text(encoding='utf-8'))
changed = []
for product in payload['products']:
    for variant in product['variants']:
        key = variant['key']
        asset = KEY_TO_ASSET.get(key)
        if asset and variant.get('image_asset_key') != asset:
            variant['image_asset_key'] = asset
            changed.append(key)
PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'changed': len(changed), 'keys': changed}, ensure_ascii=False))
