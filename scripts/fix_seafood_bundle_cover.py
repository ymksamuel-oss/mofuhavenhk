import json
import os
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import requests

ROOT = Path('/home/ubuntu/mofuhavenhk')
SOURCE_DIR = ROOT / 'public/images/products'
OUTPUT = ROOT / 'public/images/products/best-partner-seafood-bundle-collage.jpg'
BASE = os.environ.get('SUPABASE_URL', '').rstrip('/')
if not BASE or not BASE.split('://')[-1].split('/')[0].endswith('.supabase.co'):
    BASE = 'https://hkuxxgduymkztkmyhhot.supabase.co'
KEY = os.environ['SUPABASE_KEY']
HEADERS = {
    'apikey': KEY,
    'Authorization': f'Bearer {KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
}

# Existing official Best Partner fish-product artwork cached from the verified JAN records.
source_files = [
    SOURCE_DIR / 'bp-4976064024893.jpg',  # tuna flakes / topper
    SOURCE_DIR / 'bp-4976064022530.jpg',  # salt-free anchovy / herring
    SOURCE_DIR / 'bp-4976064024725.jpg',  # salt-free dried fish
]
if not all(path.exists() for path in source_files):
    raise RuntimeError('Missing verified official fish artwork')

canvas = Image.new('RGB', (1500, 1000), '#fbf7f3')
draw = ImageDraw.Draw(canvas)
card_w, card_h = 440, 820
for index, source in enumerate(source_files):
    with Image.open(source) as image:
        fitted = ImageOps.contain(image.convert('RGB'), (card_w - 56, card_h - 56))
    x = 40 + index * 500
    y = 90
    draw.rounded_rectangle((x, y, x + card_w, y + card_h), radius=28, fill='#fffdfa', outline='#e7d9ca', width=4)
    canvas.paste(fitted, (x + (card_w - fitted.width) // 2, y + (card_h - fitted.height) // 2))
    draw.text((x + 24, 32), ['天然吞拿魚碎', '無添加丁香魚', '天然小魚乾'][index], fill='#704525')
canvas.save(OUTPUT, format='JPEG', quality=92, optimize=True)

lookup = requests.get(
    f'{BASE}/rest/v1/products',
    params={'mofu_sku': 'eq.MOFU-BUNDLE-SEAFOOD-03', 'select': 'id,images', 'limit': '1'},
    headers=HEADERS,
    timeout=30,
)
lookup.raise_for_status()
rows = lookup.json()
if len(rows) != 1:
    raise RuntimeError(f'Expected one seafood bundle row, got {len(rows)}')
row = rows[0]
existing = row.get('images') or []
images = [
    '/images/products/best-partner-seafood-bundle-collage.jpg',
    *[str(item) for item in existing if str(item) != '/products/health-omega3.webp' and str(item) != '/images/products/best-partner-seafood-bundle-collage.jpg'],
]
payload = {
    'images': images,
    'feature_tags': ['bundle', 'value-bundle', 'seafood-bundle', 'omega-3', '深海海鮮', '全魚', '貓狗兼用'],
}
update = requests.patch(f'{BASE}/rest/v1/products?id=eq.{row["id"]}', headers=HEADERS, json=payload, timeout=30)
update.raise_for_status()
print(json.dumps({'id': row['id'], 'images': images, 'updated': len(update.json()), 'collage': str(OUTPUT)}, ensure_ascii=False))
