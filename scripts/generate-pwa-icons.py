from pathlib import Path
from PIL import Image

source = Image.open("public/images/mofu-haven-cat-dog-logo-transparent.png").convert("RGBA")
canvas_size = 512
background = Image.new("RGBA", (canvas_size, canvas_size), "#8B573F")
source.thumbnail((360, 360), Image.Resampling.LANCZOS)
x = (canvas_size - source.width) // 2
y = (canvas_size - source.height) // 2
background.alpha_composite(source, (x, y))
out = Path("public/icons")
out.mkdir(parents=True, exist_ok=True)
background.convert("RGB").save(out / "icon-512.png", optimize=True)
background.resize((192, 192), Image.Resampling.LANCZOS).convert("RGB").save(out / "icon-192.png", optimize=True)
