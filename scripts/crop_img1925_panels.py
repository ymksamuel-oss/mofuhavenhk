from pathlib import Path
from PIL import Image

source = Path('/home/ubuntu/upload/IMG_1925.JPG')
out_dir = Path('/home/ubuntu/webdev-static-assets/img1925-source-panels')
out_dir.mkdir(parents=True, exist_ok=True)

# IMG_1925.JPG is a six-column by three-row collage: 1408 x 768.
# Use proportional boundaries so the script remains correct if the source is replaced.
with Image.open(source) as image:
    width, height = image.size
    for row in range(3):
        for col in range(6):
            left = round(col * width / 6)
            top = round(row * height / 3)
            right = round((col + 1) * width / 6)
            bottom = round((row + 1) * height / 3)
            panel = image.crop((left, top, right, bottom))
            panel.save(out_dir / f'row-{row + 1}-col-{col + 1}.jpg', quality=95)
            print(row + 1, col + 1, panel.size)
