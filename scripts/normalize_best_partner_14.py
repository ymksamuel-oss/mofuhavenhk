import json
import os
from pathlib import Path

import requests
from PIL import Image

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
ROOT = Path('/home/ubuntu/mofuhavenhk')
IMAGE_DIR = ROOT / 'public/images/products'
IMAGE_DIR.mkdir(parents=True, exist_ok=True)

ITEMS = [
    ('4976064024725', '猫の塩無添加にぼし (70g)', '【日本製造・補鈣無鹽】貓用無添加天然小魚乾 70g', '[Made in Japan] Salt-Free Natural Dried Fish for Cats 70g', 'cat', '無鹽純天然、高鈣'),
    ('4976064013897', '猫のまぐろぶしスライス (30g)', '【日本製造・極致薄削】貓用黃鰭金槍魚柴魚薄片 30g', '[Made in Japan] Shaved Yellowfin Tuna Flakes for Cats 30g', 'cat', '天然牛磺酸、挑食誘食'),
    ('4976064024336', '猫の鶏ささみフレーク (50g)', '【日本製造・低脂純肉】貓用國產純雞里肌肉碎拌糧 50g', '[Made in Japan] Domestic Chicken Tender Flakes for Cats 50g', 'cat', '低脂高蛋白、拌糧神器'),
    ('4976064024718', '猫のささみ細切り ミニ (50g)', '【日本製造・細嫩好嚼】貓用國產雞里肌細切條 Mini 50g', '[Made in Japan] Mini Shredded Chicken Tender Strips for Cats 50g', 'cat', '幼貓成貓皆適用、適口性極佳'),
    ('4976064022530', '塩無添加きびなご (50g)', '【日本製造・整條純脆】無添加天然丁香魚乾 50g（貓狗通用）', '[Made in Japan] Salt-Free Silver-Stripe Round Herring for Dogs & Cats 50g', 'both', '低溫烘乾、整尾補鈣與 Omega-3'),
    ('4976064025197', 'まぐろ ミニキューブ (35g)', '【日本製造・一口濃縮】天然金槍魚/吞拿魚迷你肉方塊 35g', '[Made in Japan] Natural Tuna Mini Cubes 35g', 'both', '一口一粒訓練獎勵、深海魚香'),
    ('4976064026583', '北海ひめたら (35g)', '【日本製造・極上鮮美】北海道天然姬鱈魚乾 35g', '[Made in Japan] Hokkaido Natural Dried Hime Cod 35g', 'both', '北海道產、酥脆魚骨肉、低脂低負擔'),
    ('4976064024893', 'まぐろフレーク (45g)', '【日本製造・香脆鮮味】天然金槍魚/吞拿魚肉碎拌糧 45g', '[Made in Japan] Natural Tuna Flakes Food Topper 45g', 'both', '激發食慾、挑食伴糧專用'),
    ('4976064026750', '京丹波産 鹿の干し肉 薄切り (35g)', '【日本製造・京都名產】京丹波產野生鹿肉乾薄切片 35g', '[Made in Japan] Kyoto Tamba Wild Venison Thin Jerky 35g', 'dog', '野生鹿肉、極致低敏高鐵'),
    ('4976064023599', '馬の干し肉 薄切り (20g)', '【日本製造・低敏紅肉】國產低敏馬肉乾薄切片 20g', '[Made in Japan] Domestic Hypoallergenic Horse Meat Thin Jerky 20g', 'dog', '過敏體質首選、富含肝醣'),
    ('4976064025081', '鹿肉キューブ (30g)', '【日本製造・天然純肉】北海道野生鹿肉一口方塊 30g', '[Made in Japan] Hokkaido Wild Venison Cubes 30g', 'dog', '單一純鹿肉、耐咬好消化'),
    ('4976064025470', 'さめステーキ 中骨ミックス (20g)', '【日本製造・關節守護】日本近海天然鯊魚軟骨排 20g', '[Made in Japan] Shark Cartilage & Steak Mix 20g', 'dog', '天然軟骨素、富含骨膠原'),
    ('4976064023209', 'フカヒレの姿干し 細切り (40g)', '【日本製造・極上奢華】日本天然魚翅姿乾細切 40g', '[Made in Japan] Natural Shark Fin Thin Strips 40g', 'both', '珍貴天然魚翅、高純度膠原蛋白'),
    ('4976064026545', 'エゾ鹿の干し肉 (25g)', '【日本製造・北海珍味】北海道野生蝦夷鹿原肉乾 25g', '[Made in Japan] Hokkaido Wild Ezo Deer Jerky 25g', 'dog', '100% 北海道蝦夷鹿肉、肉香濃郁'),
]


def get_products(jan):
    response = requests.get(
        f'{BASE}/rest/v1/products',
        params={'mofu_sku': f'eq.{jan}', 'select': 'id,mofu_sku,images,price,stock,stock_quantity', 'limit': '1'},
        headers=HEADERS,
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def download_first_image(jan, url):
    target = IMAGE_DIR / f'bp-{jan}.jpg'
    if not target.exists() or target.stat().st_size < 1000:
        response = requests.get(url, timeout=45)
        response.raise_for_status()
        target.write_bytes(response.content)
    with Image.open(target) as image:
        normalized = target.with_suffix('.normalized.jpg')
        image.convert('RGB').save(normalized, format='JPEG', quality=92, optimize=True)
    normalized.replace(target)
    return f'/images/products/bp-{jan}.jpg'

for jan, japanese, chinese, english, audience, feature in ITEMS:
    found = get_products(jan)
    if not found:
        raise RuntimeError(f'Missing existing product for JAN {jan}; no automatic insert without a verified price/stock')
    product = found[0]
    existing_images = product.get('images') or []
    first_url = next((str(item) for item in existing_images if str(item).startswith(('http://', 'https://'))), None)
    if not first_url:
        raise RuntimeError(f'No official image URL available for JAN {jan}')
    local_first = download_first_image(jan, first_url)
    images = [local_first] + [str(item) for item in existing_images if str(item) != local_first and str(item) != first_url]
    tags = ['100% Pure Natural', 'Additive-Free', 'Best Partner', 'Made in Japan', f'JAN:{jan}', f'official_name_ja:{japanese}', f'feature:{feature}']
    if audience in ('cat', 'both'):
        tags += ['cat-treats', '貓咪專區']
    if audience in ('dog', 'both'):
        tags += ['dog-treats', '狗狗專區']
    if audience == 'cat':
        tags += ['cat-only', '貓專用']
    elif audience == 'both':
        tags += ['貓狗兼用']
    description = f'{japanese}\n{feature}。日本 Best Partner 原裝商品，適合{("貓咪" if audience == "cat" else "狗狗" if audience == "dog" else "貓狗") }日常享用。'
    payload = {
        'name': japanese,
        'name_zh': chinese,
        'name_en': english,
        'description': description,
        'description_zh': description,
        'description_en': f'{english}. Official Japanese Best Partner product. Feature: {feature}.',
        'images': images,
        'mofu_sku': jan,
        'status': 'published',
        'is_published': True,
        'feature_tags': tags,
        'supplier_brand': 'Best Partner',
        'brand': 'Best Partner',
        'source_product_id': f'best-partner-{jan}',
        'pet_species': 'cat' if audience == 'cat' else 'dog' if audience == 'dog' else 'cat-dog',
    }
    response = requests.patch(f'{BASE}/rest/v1/products?id=eq.{product["id"]}', headers=HEADERS, json=payload, timeout=45)
    response.raise_for_status()
    print(json.dumps({'jan': jan, 'id': product['id'], 'updated': len(response.json()), 'first_image': local_first}, ensure_ascii=False))
