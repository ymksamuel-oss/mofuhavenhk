import json
import os
from pathlib import Path
import requests

source = {x['id']: x for x in json.loads(Path('top20-products-source.json').read_text())}
drafts = json.loads(Path('top20-copy-drafts.json').read_text())
forbidden = ('治療', '根治', '改善疾病', '抗焦慮', '去牙石', '去牙結石', '消炎', '護眼明目', 'treat disease', 'cure disease', 'anti-anxiety', 'remove tartar')
for d in drafts:
    if not d.get('id') or d['id'] not in source:
        raise RuntimeError(f'unknown product {d.get("id")}')
    if any(term.lower() in (d.get('description_zh','') + d.get('description_en','')).lower() for term in forbidden):
        raise RuntimeError(f'unsafe term in {d["mofu_sku"]}')
    for field in ('description_zh', 'description_en'):
        if not d.get(field) or any(section not in d[field] for section in ('1)', '2)', '3)', '4)')):
            raise RuntimeError(f'incomplete {d["mofu_sku"]} {field}')

url = os.environ['SUPABASE_URL'].rstrip('/') + '/rest/v1/products'
headers = {'apikey': os.environ['SUPABASE_KEY'], 'Authorization': 'Bearer ' + os.environ['SUPABASE_KEY'], 'Content-Type': 'application/json', 'Prefer': 'return=minimal'}
updated = []
for d in drafts:
    r = requests.patch(url, params={'id': 'eq.' + d['id']}, headers=headers, json={'description_zh': d['description_zh'], 'description_en': d['description_en']}, timeout=30)
    if r.status_code >= 300:
        raise RuntimeError(f'{d["mofu_sku"]}: HTTP {r.status_code} {r.text[:300]}')
    updated.append(d['mofu_sku'])
Path('top20-copy-applied.json').write_text(json.dumps({'updated': updated}, ensure_ascii=False, indent=2))
