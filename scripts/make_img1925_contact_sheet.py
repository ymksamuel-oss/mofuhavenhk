from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

asset_dir = Path('/home/ubuntu/webdev-static-assets')
files = [
    'img1925-cream-low-profile-40cm.png',
    'img1925-charcoal-low-profile-40cm.png',
    'img1925-blush-pink-low-profile-40cm.png',
    'img1925-forest-green-round-50cm.png',
    'img1925-sage-green-low-profile-bowl-40cm.png',
    'img1925-wooden-cat-tower-toy-ball.png',
    'img1925-blush-pink-round-large.png',
    'img1925-woven-oval-cat-bed-cream-cushion.png',
    'img1925-beige-low-profile-95x80cm.png',
]
thumb_size = (320, 320)
margin = 24
label_h = 44
cols = 3
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (thumb_size[0] + margin) + margin, rows * (thumb_size[1] + label_h + margin) + margin), '#E9E1D5')
draw = ImageDraw.Draw(sheet)
font = ImageFont.load_default()
for index, filename in enumerate(files):
    image = Image.open(asset_dir / filename).convert('RGB')
    image.thumbnail(thumb_size, Image.Resampling.LANCZOS)
    x = margin + (index % cols) * (thumb_size[0] + margin)
    y = margin + (index // cols) * (thumb_size[1] + label_h + margin)
    tile = Image.new('RGB', thumb_size, '#F7F1E6')
    tile.paste(image, ((thumb_size[0] - image.width) // 2, (thumb_size[1] - image.height) // 2))
    sheet.paste(tile, (x, y))
    draw.text((x, y + thumb_size[1] + 10), filename.replace('img1925-', '').replace('.png', ''), fill='#392D24', font=font)
output = asset_dir / 'img1925-cleaned-contact-sheet.jpg'
sheet.save(output, quality=92)
print(output)
