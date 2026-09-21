import json
import re
from pathlib import Path

src = {x['mofu_sku']: x for x in json.loads(Path('top20-products-source.json').read_text())}
drafts = json.loads(Path('top20-copy-drafts.json').read_text())
forbidden = re.compile(r'治療|根治|改善疾病|抗焦慮|去牙石|去牙結石|消炎|護眼明目|保證健康|取代獸醫treats? disease|anti[- ]?anxiety|remove[s]? tartar|cure', re.I)
headers = ['1)', '2)', '3)', '4)']
errors = []
for d in drafts:
    p = src.get(d['mofu_sku'])
    for field in ('description_zh', 'description_en'):
        text = d.get(field, '')
        if not text:
            errors.append((d['mofu_sku'], field, 'empty'))
        if any(h not in text for h in headers):
            errors.append((d['mofu_sku'], field, 'missing-four-section-header'))
        hits = forbidden.findall(text)
        if hits:
            errors.append((d['mofu_sku'], field, 'forbidden:' + ','.join(sorted(set(hits)))))
    if not p:
        errors.append((d['mofu_sku'], 'record', 'not-in-source'))
    if d.get('id') != p.get('id'):
        errors.append((d['mofu_sku'], 'id', 'id-mismatch'))
print('drafts', len(drafts), 'errors', len(errors))
for e in errors:
    print('\t'.join(e))
Path('top20-copy-validation.json').write_text(json.dumps({'drafts': len(drafts), 'errors': errors}, ensure_ascii=False, indent=2))

raise SystemExit(1 if errors else 0)
