from pathlib import Path
from PIL import Image

source = Path('/home/ubuntu/upload/IMG_1925.JPG')
with Image.open(source) as image:
    print('path:', source)
    print('format:', image.format)
    print('size:', image.size)
    print('mode:', image.mode)
    print('aspect_ratio:', round(image.width / image.height, 4))
    print('estimated_grid_5x3_cell:', (round(image.width / 5), round(image.height / 3)))
