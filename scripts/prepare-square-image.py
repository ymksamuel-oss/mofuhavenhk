#!/usr/bin/env python3
"""Prepare a real product image for Stripe's square product-image requirement."""
from __future__ import annotations

import sys
from pathlib import Path
from PIL import Image, ImageOps


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: prepare-square-image.py INPUT OUTPUT", file=sys.stderr)
        return 2

    source = Path(sys.argv[1])
    destination = Path(sys.argv[2])
    destination.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        side = min(max(image.width, image.height), 1000)
        canvas = Image.new("RGB", (side, side), (255, 255, 255))
        contained = ImageOps.contain(image, (side, side), method=Image.Resampling.LANCZOS)
        offset = ((side - contained.width) // 2, (side - contained.height) // 2)
        canvas.paste(contained, offset)

        # Stripe product images must be square and smaller than 512 kB.
        for quality in (88, 82, 76, 70, 64, 58):
            canvas.save(destination, format="JPEG", quality=quality, optimize=True, progressive=True)
            if destination.stat().st_size < 480 * 1024:
                break
        else:
            raise RuntimeError(f"could not compress image below 480 KB: {destination}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
