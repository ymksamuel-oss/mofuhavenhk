from __future__ import annotations

import json
import re
from pathlib import Path

root = Path('/home/ubuntu/mofuhavenhk-github')
mapping_path = root / 'aim30_and_ginnospoon_mapping.json'
log_path = root / 'aim30_ginnospoon_cdn_urls.txt'

lines = log_path.read_text(encoding='utf-8').splitlines()
urls: dict[str, str] = {}
current = None
for line in lines:
    match = re.search(r'Uploading file: assets/aim30-ginnospoon/([^ ]+)', line)
    if match:
        current = match.group(1)
    elif current and line.startswith('CDN URL: '):
        urls[current] = line.removeprefix('CDN URL: ').strip()
        current = None

mapping = json.loads(mapping_path.read_text(encoding='utf-8'))
missing = []
for item in mapping['products']:
    url = urls.get(item['image_output'])
    if url:
        item['image_cdn_url'] = url
    else:
        missing.append(item['image_output'])
if missing:
    raise SystemExit('Missing CDN URLs: ' + ', '.join(missing))
mapping_path.write_text(json.dumps(mapping, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Mapped {len(mapping["products"])} CDN image URLs.')
