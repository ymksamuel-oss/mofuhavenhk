#!/usr/bin/env python3
"""
Scrape cat fish-stick treats from WT Japan (魚條).

Primary source: Shopify native JSON endpoint
  https://www.wt-japan.com/collections/魚條/products.json

Downloads hero images into public/images/products/wt-fish-stick-N.jpg
and writes scripts/wt_fish_sticks_raw.json for catalog refresh.

Freeze-dried SKUs that also appear in this collection are curated under
「冷凍脫水系列」 only — do not duplicate them here.
"""

from __future__ import annotations

import html as html_lib
import json
import re
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
IMAGE_DIR = ROOT / "public" / "images" / "products"
SUMMARY_OUT = ROOT / "scripts" / "wt_fish_sticks_raw.json"

COLLECTION_HANDLE = "魚條"
BASE = "https://www.wt-japan.com"
UA = {
    "User-Agent": (
        "MofuHavenHK/1.0 (+https://github.com/ymksamuel-oss/mofuhavenhk; "
        "catalog research scraper for pet-product storefront)"
    ),
    "Accept": "application/json, text/html;q=0.9, */*;q=0.8",
}

# Classic grilled-bonito / fish-strip SKUs (skip freeze-dried + bulk cartons).
CURATED_HANDLES: list[str] = [
    "ciao-燒鏗魚-多汁鰹魚味5條裝x-6",
    "ciao-燒鏗魚-多魚汁-5條裝x-6",
    "ciao-燒鏗魚-木魚味5條裝x-6",
    "ciao-燒鏗魚-高齡貓用-5條裝x-6袋",
    "ciao-燒鏗魚-骨膠原添加-高齡貓用-x-48袋",
    "ciao-燒鰹魚-帆立貝味-x-48袋",
    "ciao-燒鰹魚-帆立貝味-高齡貓用-x-24袋",
    "ciao-燒鰹魚-鰹魚多汁-x-24袋",
    "ciao-燒鰹魚-木魚乾味-x-48-袋",
    "ciao-燒鰹魚-燒鰹魚-1歳前食用-x-24袋",
    "petio-蟹肉絲-45g-x-6",
    "sunrise-貓草魚肉條-40g-x-12",
]


class _HTMLStripper(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self._chunks: list[str] = []

    def handle_data(self, data: str) -> None:
        self._chunks.append(data)

    def get_text(self) -> str:
        return "".join(self._chunks)


def strip_html(raw: str | None) -> str:
    if not raw:
        return ""
    stripper = _HTMLStripper()
    try:
        stripper.feed(raw)
        text = stripper.get_text()
    except Exception:
        text = re.sub(r"<[^>]+>", " ", raw)
    return re.sub(r"\s+", " ", html_lib.unescape(text)).strip()


def hd_image_url(src: str | None) -> str:
    if not src:
        return ""
    parsed = urllib.parse.urlsplit(src)
    query = urllib.parse.parse_qs(parsed.query)
    for key in ("width", "height", "crop"):
        query.pop(key, None)
    path = re.sub(
        r"_(\d+x\d+|\d+x|x\d+)(?=\.(?:jpg|jpeg|png|webp))", "", parsed.path
    )
    clean_query = urllib.parse.urlencode(
        {k: v[0] for k, v in query.items() if v}, doseq=False
    )
    return urllib.parse.urlunsplit(
        (parsed.scheme, parsed.netloc, path, clean_query, parsed.fragment)
    )


def main() -> None:
    handle = urllib.parse.quote(COLLECTION_HANDLE)
    url = f"{BASE}/collections/{handle}/products.json?limit=250"
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=45) as resp:
        payload = json.load(resp)
    products = payload.get("products") or []
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    SUMMARY_OUT.parent.mkdir(parents=True, exist_ok=True)
    SUMMARY_OUT.write_text(
        json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    by_handle = {p.get("handle"): p for p in products}
    print(f"Collection「{COLLECTION_HANDLE}」returned {len(products)} product(s)")
    for i, handle_key in enumerate(CURATED_HANDLES, start=1):
        product = by_handle.get(handle_key)
        if not product:
            print(f"  ! missing {handle_key}")
            continue
        images = product.get("images") or []
        src = hd_image_url(images[0].get("src") if images else None)
        dest = IMAGE_DIR / f"wt-fish-stick-{i}.jpg"
        if src:
            img_req = urllib.request.Request(src, headers=UA)
            with urllib.request.urlopen(img_req, timeout=45) as img_resp:
                dest.write_bytes(img_resp.read())
            print(f"  ✓ wt-fish-stick-{i}.jpg ← {handle_key}")
        print(f"    title: {product.get('title')}")
        print(f"    blurb: {strip_html(product.get('body_html'))[:80]}")


if __name__ == "__main__":
    main()
