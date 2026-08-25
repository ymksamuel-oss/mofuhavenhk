from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path('/home/ubuntu/mofuhavenhk-github/assets/combo-dogfood-5-clean')
files = [
    'combo-chicken-beef-small-fish-720g.png',
    'combo-chicken-cheese-720g.png',
    'combo-cabbage-beef-720g.png',
    'combo-low-fat-chicken-vegetables-small-fish-720g.png',
    'combo-low-fat-senior-chicken-vegetables-720g.png',
]
labels = ['01 牛肉・小魚・芝士', '02 芝士角切', '03 捲心菜・牛肉', '04 低脂', '05 低脂 7歲以上']
font = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', 38)
canvas = Image.new('RGB', (1800, 2500), 'white')
draw = ImageDraw.Draw(canvas)
for index, (filename, label) in enumerate(zip(files, labels)):
    image = Image.open(root / filename).convert('RGB')
    image.thumbnail((520, 520))
    row, col = divmod(index, 3)
    x = 60 + col * 580
    y = 80 + row * 1120
    canvas.paste(image, (x + (520 - image.width) // 2, y))
    draw.text((x, y + 555), label, font=font, fill='#34261E')
canvas.save(root / 'contact-sheet.png')
