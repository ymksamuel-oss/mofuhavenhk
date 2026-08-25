from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
SRC = ROOT / 'assets' / 'batch24-clean'
OUT = SRC / 'contact-sheet.png'

files = sorted(p for p in SRC.glob('*.png') if p.name != 'contact-sheet.png')
if len(files) != 24:
    raise SystemExit(f'Expected 24 product PNGs, found {len(files)}')

font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 26)
thumb_size = 360
label_h = 54
cols = 4
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * thumb_size, rows * (thumb_size + label_h)), '#F7F4F1')
draw = ImageDraw.Draw(sheet)
for i, path in enumerate(files):
    image = Image.open(path).convert('RGB')
    image.thumbnail((thumb_size - 26, thumb_size - 26), Image.Resampling.LANCZOS)
    x = (i % cols) * thumb_size + (thumb_size - image.width) // 2
    y = (i // cols) * (thumb_size + label_h) + (thumb_size - image.height) // 2
    sheet.paste(image, (x, y))
    label = path.stem.replace('-', ' ')
    draw.rectangle((i % cols * thumb_size, (i // cols) * (thumb_size + label_h) + thumb_size, (i % cols + 1) * thumb_size, (i // cols + 1) * (thumb_size + label_h)), fill='#E8DDD2')
    draw.text((i % cols * thumb_size + 10, (i // cols) * (thumb_size + label_h) + thumb_size + 13), label[:32], font=font, fill='#3F3028')
sheet.save(OUT, optimize=True)
print(OUT)
