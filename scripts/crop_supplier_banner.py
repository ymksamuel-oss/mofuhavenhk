from pathlib import Path
from PIL import Image

source = Path('/home/ubuntu/upload/IMG_0202.jpg')
target = Path('/home/ubuntu/mofuhavenhk/public/images/banners/best-partner-plain-pack-series.jpg')
target.parent.mkdir(parents=True, exist_ok=True)

with Image.open(source) as image:
    # Crop the supplied screenshot to the visible supplier banner only.
    crop = image.crop((255, 482, 1768, 890))
    crop.save(target, quality=94, optimize=True, progressive=True)
    print(f'{target} {crop.width}x{crop.height}')
