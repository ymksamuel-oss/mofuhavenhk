from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
SOURCE = ROOT / 'batch24_product_mapping.json'
UPLOAD = ROOT / 'batch24_clean_cdn_upload.json'
OUT = ROOT / 'batch24_import_mapping.json'

CLEAN_FILE_BY_SOURCE = {
    'IMG_1602.PNG': 'petline-chicken-vegetable-beef-jelly-25gx4.png',
    'IMG_1603.PNG': 'petline-chicken-cheese-jelly-25gx4.png',
    'IMG_1604.PNG': 'petline-chicken-milk-cheese-25gx4.png',
    'IMG_1605.PNG': 'petline-chicken-paste-milk-cheese-25gx4.png',
    'IMG_1606.PNG': 'combo-pure-chicken-cubes-50g.png',
    'IMG_1607.PNG': 'combo-pure-chicken-strips-50g.png',
    'IMG_1608.PNG': 'combo-pure-basil-chicken-cubes-50g.png',
    'IMG_1609.PNG': 'combo-pure-chicken-cartilage-cubes-50g.png',
    'IMG_1610.PNG': 'combo-pure-chicken-three-vegetables-cubes-50g.png',
    'IMG_1611.PNG': 'combo-luxury-gourmet-aged-bonito-600g.png',
    'IMG_1612.PNG': 'combo-luxury-gourmet-salmon-bonito-700g.png',
    'IMG_1613.PNG': 'combo-weight-concern-tuna-bonito-600g.png',
    'IMG_1614.PNG': 'combo-pure-chicken-vegetables-600g.png',
    'IMG_1615.PNG': 'combo-pure-vegetables-cheese-600g.png',
    'IMG_1616.PNG': 'combo-pure-cheese-chicken-600g.png',
    'IMG_1617.PNG': 'combo-pure-extra-small-chicken-vegetables-600g.png',
    'IMG_1618.PNG': 'combo-pure-low-fat-chicken-vegetables-600g.png',
    'IMG_1619.PNG': 'combo-pure-freeze-dried-chicken-vegetables-540g.png',
    'IMG_1620.PNG': 'combo-pure-fish-rice-540g.png',
    'IMG_1621.PNG': 'gin-no-spoon-thick-gravy-tuna-70g.png',
    'IMG_1622.PNG': 'gin-no-spoon-tuna-bonito-chicken-70g.png',
    'IMG_1623.PNG': 'gin-no-spoon-thick-gravy-tuna-bonito-chicken-70g.png',
    'IMG_1624.PNG': 'gin-no-spoon-fish-chicken-shirasu-70g.png',
    'IMG_1625.PNG': 'gin-no-spoon-fish-chicken-bonito-70g.png',
}

text = UPLOAD.read_text(encoding='utf-8')
urls = {
    Path(path).name: url
    for path, url in re.findall(r'\[SUCCESS\]\s+(assets/batch24-clean/[^\s]+)\s+->\s+(https://files\.manuscdn\.com/[^\s]+)', text)
}
source = json.loads(SOURCE.read_text(encoding='utf-8'))
products = source['products']
if len(products) != 24 or len(CLEAN_FILE_BY_SOURCE) != 24 or len(urls) != 24:
    raise SystemExit(f'Expected 24 products, clean filename mappings and CDN URLs; got {len(products)}, {len(CLEAN_FILE_BY_SOURCE)}, {len(urls)}')

seen = set()
for product in products:
    source_image = product['image_file']
    clean = CLEAN_FILE_BY_SOURCE.get(source_image)
    if not clean:
        raise SystemExit(f'Missing clean image mapping for {source_image}')
    url = urls.get(clean)
    if not url:
        raise SystemExit(f'Missing CDN URL for {clean}')
    if product['sku'] in seen:
        raise SystemExit(f'Duplicate SKU {product["sku"]}')
    seen.add(product['sku'])
    product['clean_image_file'] = clean
    product['cdn_url'] = url

output = {
    'schema': 'batch24-import-v1',
    'source_documents': ['batch24_product_mapping.json', 'IMG_1602.PNG to IMG_1625.PNG'],
    'pricing_policy': source['pricing_policy'],
    'products': products,
}
OUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'product_count': len(products), 'output': str(OUT)}, ensure_ascii=False))
