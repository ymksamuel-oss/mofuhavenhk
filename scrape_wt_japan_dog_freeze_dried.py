#!/usr/bin/env python3
"""
Scrape dog freeze-dried treats from WT Japan (冷凍脫水系列 / 狗狗小食).

Primary source: Shopify native JSON endpoint
  https://www.wt-japan.com/collections/冷凍脫水系列/products.json

Downloads hero images into public/images/products/wt-dog-freeze-dried-N.jpg
and prints a JSON summary for curating src/data/dogFreezeDriedData.ts.
"""

from __future__ import annotations

import html as html_lib
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
IMAGE_DIR = ROOT / "public" / "images" / "products"
SUMMARY_OUT = ROOT / "scripts" / "wt_dog_freeze_dried_raw.json"

COLLECTION_HANDLE = "冷凍脫水系列"
BASE = "https://www.wt-japan.com"
UA = {
    "User-Agent": (
        "MofuHavenHK/1.0 (+https://github.com/ymksamuel-oss/mofuhavenhk; "
        "catalog research scraper for pet-product storefront)"
    ),
    "Accept": "application/json, text/html;q=0.9, */*;q=0.8",
}

# Curated dog SKUs matching official Petio + MAMACOOK 但馬高原 listings.
CURATED_HANDLES: list[str] = [
    "狗狗零食-petio-冷凍脫水系列-紅蘿蔔-南瓜-椰菜-20g",
    "狗狗零食-petio-冷凍脫水系列-蘋果-香蕉-蜜瓜20g",
    "但馬高原-冷凍脫水雞條狗狗用-30g-x-10袋",
    "但馬高原-冷凍脫水豬心狗狗用-25g-x-10袋",
    "但馬高原-冷凍脫水雞肝狗狗用-24g-x-10袋",
    "但馬高原-冷凍脫水雞胸肉-雞肝-狗狗用-20g-x-10袋",
    "但馬高原-冷凍脫水雞胸肉-雞軟骨-狗狗用-20g-x-10袋",
    "但馬高原-冷凍脫水豬肝狗狗用-30g-x-10袋",
    "但馬高原-冷凍脫水雞條狗狗用-150g-x-15袋",
    "mamacook-但馬高原-冷凍脫水雞胸肉軟骨-狗狗用-120g-x-15袋",
    "mamacook-但馬高原-冷凍脫水西太公魚狗狗用-10g-x-10袋",
    "mamacook-但馬高原-冷凍脫水鹿肉狗狗用-14g-x-10袋",
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
    text = html_lib.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def hd_image_url(src: str | None) -> str:
    if not src:
        return ""
    parsed = urllib.parse.urlsplit(src)
    query = urllib.parse.parse_qs(parsed.query)
    for key in ("width", "height", "crop"):
        query.pop(key, None)
    path = re.sub(r"_(\d+x\d+|\d+x|x\d+)(?=\.(?:jpg|jpeg|png|webp))", "", parsed.path)
    clean_query = urllib.parse.urlencode(
        {k: v[0] for k, v in query.items() if v}, doseq=False
    )
    return urllib.parse.urlunsplit(
        (parsed.scheme, parsed.netloc, path, clean_query, parsed.fragment)
    )


def http_get(url: str, timeout: int = 45) -> tuple[bytes, str]:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        ctype = resp.headers.get("Content-Type", "")
        return resp.read(), ctype


def http_json(url: str) -> dict[str, Any]:
    body, ctype = http_get(url)
    if "json" not in ctype and not body.lstrip().startswith(b"{"):
        raise RuntimeError(f"Expected JSON from {url}, got {ctype!r}")
    return json.loads(body)


def brand_from_title(title: str, vendor: str) -> str:
    t = title.upper()
    if "MAMACOOK" in t or "但馬高原" in title:
        return "MAMACOOK"
    if "PETIO" in t or "Petio" in title:
        return "Petio"
    return (vendor or "WT").strip() or "WT"


def parse_compare_at(raw: Any, price: float) -> float | None:
    if raw in (None, "", "0", "0.00", 0, 0.0):
        return None
    try:
        value = float(raw)
    except (TypeError, ValueError):
        return None
    if value <= price:
        return None
    return value


def normalize_product(raw: dict[str, Any], index: int) -> dict[str, Any]:
    variants = raw.get("variants") or []
    price_raw = (variants[0].get("price") if variants else None) or "0"
    try:
        price = float(price_raw)
    except (TypeError, ValueError):
        price = 0.0
    compare = parse_compare_at(
        variants[0].get("compare_at_price") if variants else None, price
    )

    images = raw.get("images") or []
    image = raw.get("image") or {}
    src = None
    if images:
        src = images[0].get("src")
    if not src and isinstance(image, dict):
        src = image.get("src")

    tags = raw.get("tags") or []
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]

    title = (raw.get("title") or "").strip()
    filename = f"wt-dog-freeze-dried-{index}.jpg"
    return {
        "id": f"wt-dog-freeze-dried-{index}",
        "title": title,
        "price": price,
        "originalPrice": compare,
        "imageUrl": f"/images/products/{filename}",
        "sourceImageUrl": hd_image_url(src),
        "rawDescription": strip_html(raw.get("body_html")),
        "vendor": brand_from_title(title, raw.get("vendor") or ""),
        "tags": tags,
        "handle": raw.get("handle") or "",
        "productType": raw.get("product_type") or "",
        "sourceUrl": (
            f"{BASE}/products/{raw.get('handle')}" if raw.get("handle") else ""
        ),
    }


def fetch_curated() -> list[dict[str, Any]]:
    handle = urllib.parse.quote(COLLECTION_HANDLE)
    url = f"{BASE}/collections/{handle}/products.json?limit=250"
    print(f"Fetching JSON: {url}")
    data = http_json(url)
    products = data.get("products") or []
    by_handle = {p.get("handle"): p for p in products}
    print(f"  Collection returned {len(products)} product(s)")

    chosen: list[dict[str, Any]] = []
    for i, h in enumerate(CURATED_HANDLES, start=1):
        raw = by_handle.get(h)
        if not raw:
            print(f"  !! missing handle: {h}", file=sys.stderr)
            continue
        chosen.append(normalize_product(raw, i))
    return chosen


def download_image(url: str, dest: Path) -> None:
    if not url:
        raise RuntimeError(f"No image URL for {dest.name}")
    raw, ctype = http_get(url)
    if len(raw) < 500:
        raise RuntimeError(f"Image too small ({len(raw)} bytes) from {url}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(raw)
    print(f"  Saved {dest.relative_to(ROOT)} ({len(raw)} bytes, {ctype.split(';')[0]})")


def main() -> int:
    try:
        products = fetch_curated()
    except Exception as exc:
        print(f"Fetch failed: {exc}", file=sys.stderr)
        return 1

    if not products:
        print("No products scraped.", file=sys.stderr)
        return 1

    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    for p in products:
        dest = IMAGE_DIR / Path(p["imageUrl"]).name
        print(f"Downloading image for {p['id']}: {p['title']}")
        try:
            download_image(p["sourceImageUrl"], dest)
        except Exception as exc:
            print(f"  !! image download failed: {exc}", file=sys.stderr)
        time.sleep(0.15)

    SUMMARY_OUT.parent.mkdir(parents=True, exist_ok=True)
    SUMMARY_OUT.write_text(
        json.dumps(products, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {SUMMARY_OUT.relative_to(ROOT)} ({len(products)} products)")
    print("Done. Curate polished entries into src/data/dogFreezeDriedData.ts.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
