from pathlib import Path
from PIL import Image

source = Path("/tmp/mofu-banner-reference.jpg")
target = Path("public/images/hero-mobile-pet-products.jpg")

with Image.open(source) as image:
    image = image.convert("RGB")
    width, height = image.size
    # The supplied concept sheet is three stacked panels. Keep the bottom
    # product-and-bone panel and crop away the white divider above it.
    top = int(height * 0.655)
    bottom = height
    panel = image.crop((0, top, width, bottom))
    panel.save(target, format="JPEG", quality=92, optimize=True, progressive=True)

print(f"saved {target} ({panel.width}x{panel.height})")
