from __future__ import annotations

import json
import re
from pathlib import Path

root = Path('/home/ubuntu/mofuhavenhk-github')
source = json.loads((root / 'aim30_user_confirmed_costs.json').read_text(encoding='utf-8'))
lines = (root / 'aim30_confirmed_cost_cdn_urls.txt').read_text(encoding='utf-8').splitlines()
urls, current = {}, None
for line in lines:
    match = re.search(r'Uploading file: assets/aim30-ginnospoon/([^ ]+)', line)
    if match:
        current = match.group(1)
    elif current and line.startswith('CDN URL: '):
        urls[current] = line.removeprefix('CDN URL: ').strip(); current = None
for item in source['products']:
    item['image_cdn_url'] = urls[item['image_output']]
(root / 'aim30_user_confirmed_costs_with_urls.json').write_text(json.dumps(source, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print('Mapped confirmed-cost images:', len(source['products']))
