from __future__ import annotations
import json
from pathlib import Path
root=Path('/home/ubuntu/mofuhavenhk-github')
base_path=root/'aim30_and_ginnospoon_mapping.json'
base=json.loads(base_path.read_text(encoding='utf-8'))
extra=json.loads((root/'aim30_user_confirmed_costs_with_urls.json').read_text(encoding='utf-8'))
for index,item in enumerate(extra['products'], start=1):
    item.update({
        'import_key': f"aim30-confirmed-{index}-v1",
        'brand': 'Sunrise AIM30', 'category': 'cats', 'subcategory': 'treats',
        'name_en': item['name_zh'], 'description_zh': '日本包裝所示的 AIM30 酥脆貓咪零食。',
        'description_en': 'Japanese AIM30 crispy cat treats.',
        'specs_zh': '日本包裝規格', 'specs_en': 'Japanese retail pack',
        'tags': 'AIM30,Karitto Treats,貓咪零食', 'unrounded_retail_hkd': item['retail_hkd']
    })
    base['products'].append(item)
base_path.write_text(json.dumps(base,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Merged products:', len(base['products']))
