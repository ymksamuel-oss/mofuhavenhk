#!/usr/bin/env python3
"""
Scrape dog snack series from WT Japan into public/images/products/.

Collections (existing Shopify folders — reuse; do not invent new ones):
  - 餅乾類      (tag 狗餅)
  - 狗狗糊仔小食
  - 狗芝士

All SKUs belong under the storefront dog-treats zone (狗狗小食專區).
Images reuse the existing folder public/images/products/ (no new image dirs).
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
SUMMARY_OUT = ROOT / "scripts" / "wt_dog_snacks_raw.json"

BASE = "https://www.wt-japan.com"
UA = {
    "User-Agent": (
        "MofuHavenHK/1.0 (+https://github.com/ymksamuel-oss/mofuhavenhk; "
        "catalog research scraper for pet-product storefront)"
    ),
    "Accept": "application/json, text/html;q=0.9, */*;q=0.8",
}

# Existing WT Japan collection handles → storefront series keys.
SERIES: dict[str, dict[str, str]] = {
    "餅乾類": {
        "id_prefix": "wt-dog-biscuit",
        "series": "餅乾類",
        "seriesTag": "狗餅",
        "label_zh": "餅乾類（狗餅）",
        "label_en": "Dog biscuits",
    },
    "狗狗糊仔小食": {
        "id_prefix": "wt-dog-paste",
        "series": "狗狗糊仔小食",
        "seriesTag": "狗狗糊仔小食",
        "label_zh": "狗狗糊仔小食",
        "label_en": "Dog paste treats",
    },
    "狗芝士": {
        "id_prefix": "wt-dog-cheese",
        "series": "狗芝士",
        "seriesTag": "狗芝士",
        "label_zh": "狗芝士",
        "label_en": "Dog cheese treats",
    },
}

# Curated retail-friendly handles (skip hospital 50-stick packs / oversized bones).
CURATED: dict[str, list[str]] = {
    "餅乾類": [
        "smack-狗狗百力滋-雞肉味-30g-x-6",
        "smack-狗狗百力滋-低脂肪蔬菜味-30g-x-6",
        "smack-狗狗百力滋-芝士味-30g-x-6",
        "combo-狗狗脆餅-腸胃健康配方-36g-x6",
        "combo-狗狗脆餅-潔齒-口腔護理-36g-x6",
        "combo-狗狗脆餅-維持關節健康配方-36g-x6",
        "combo-狗狗脆餅-芝士雞味-幼犬用-36g-x6",
        "combo-狗狗脆餅-芝士雞味-高齡狗用-36g-x6",
        "petio-乳酸菌善玉菌棒-40g-x-6",
        "q-pet-6000億乳酸菌餅乾條-雞肉乳酪味-150g-x-3",
        "petio-乳酸菌奶酪小饅頭-120g-x6",
        "但馬高原-雞肉免治餅乾-65g-x-6袋",
        "但馬高原-蘋果味餅乾-65g-x-6袋",
        "但馬高原-芝士餅乾-65g-x-6袋",
        "mamacook-但馬高原-高知県羊奶餅乾-40g-x-10袋",
        "狗狗小食-蔬菜餅140g-x-6袋",
        "petio-狗狗零食-無添加小食贅沢野菜小餅乾-蕃薯味-120g-x6",
        "petio-狗狗零食-無添加小食贅沢野菜小餅乾-南瓜味-120g-x6",
        "petio-狗狗零食-無添加小食贅沢野菜小餅乾-紅蘿蔔味-120g-x6",
    ],
    "狗狗糊仔小食": [
        "狗狗小食-ciao-糊仔小食-總合營養-雞胸肉-4條裝-x-12袋",
        "狗狗小食-ciao-糊仔小食-雞胸肉-加入芝士-4條裝-x-12袋",
        "狗狗小食-ciao-糊仔小食-芝士雞胸肉-4條裝-x-12袋",
        "狗狗小食-ciao-糊仔小食-雞胸肉-蕃薯-4條裝-x-12袋",
        "狗狗小食-ciao-糊仔小食-雞胸肉-4條裝-x-12袋",
        "狗狗小食-ciao-糊仔小食-雞胸肉-1歳前食用-4條裝-x-12袋",
        "hell-s-kitchen-狗狗袋裝肉泥-雞肉軟骨味100g-x8",
        "hell-s-kitchen-狗狗袋裝肉泥-雞肉芝士味90g-小狗用-x8",
        "hell-s-kitchen-貓貓袋裝肉泥-鴨肉蕃薯芝士味100g-x8",
    ],
    "狗芝士": [
        "sunrise-贅沢肉條-黑和牛肉-北海道芝士-140g-x3",
        "sunrise-芝士雞卷10條-x6",
        "狗狗零食-sunrise-方塊芝士-110g-x-6袋",
        "petio-狗狗小食-乳酸菌雞味芝士條-170g-x6",
        "doggyman-狗狗零食-雞肉味芝士粒-50g-x6袋",
        "petzroute-狗狗芝士-胵肉味-x6",
        "sunrise-狗狗零食-日本高鈣雞胸芝士肉條-170g-x6",
        "forcans-咬咬乳酪條-香蕉味-14條-x6",
        "forcans-咬咬乳酪條-士多啤梨味-14條-x6",
        "forcans-咬咬乳酪條-青蘋果味-14條-x6",
        "petzroute-狗狗小食-蒙古芝士骨-s-x-6",
        "petzroute-狗狗零食-蒙古濃芝士骨-s-3條-x-3",
        "狗狗小食-doggyman-狗狗乳酸菌芝士牛肉條-70g-x-6",
    ],
}


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
    if "CIAO" in t or "INABA" in t:
        return "CIAO"
    if "SMACK" in t:
        return "Smack"
    if "COMBO" in t:
        return "Combo"
    if "SUNRISE" in t:
        return "Sunrise"
    if "DOGGYMAN" in t:
        return "Doggyman"
    if "PETZROUTE" in t:
        return "Petzroute"
    if "FORCANS" in t:
        return "FORCANS"
    if "Q-PET" in t or "QPET" in t.replace("-", ""):
        return "Q-pet"
    if "HELL" in t and "KITCHEN" in t:
        return "Hell's Kitchen"
    cleaned = (vendor or "WT").strip()
    if cleaned.upper() in {"WT", "WTJAPAN", "W T"}:
        return "WT"
    return cleaned or "WT"


def normalize_product(
    raw: dict[str, Any],
    *,
    index: int,
    meta: dict[str, str],
) -> dict[str, Any]:
    variants = raw.get("variants") or []
    price_raw = (variants[0].get("price") if variants else None) or "0"
    compare_raw = variants[0].get("compare_at_price") if variants else None
    try:
        price = float(price_raw)
    except (TypeError, ValueError):
        price = 0.0
    original_price: float | None = None
    if compare_raw:
        try:
            compare = float(compare_raw)
            if compare > price > 0:
                original_price = compare
        except (TypeError, ValueError):
            original_price = None

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
    filename = f"{meta['id_prefix']}-{index}.jpg"
    product_id = f"{meta['id_prefix']}-{index}"
    return {
        "id": product_id,
        "title": title,
        "price": price,
        "originalPrice": original_price,
        "imageUrl": f"/images/products/{filename}",
        "sourceImageUrl": hd_image_url(src),
        "rawDescription": strip_html(raw.get("body_html")),
        "vendor": brand_from_title(title, raw.get("vendor") or ""),
        "series": meta["series"],
        "seriesTag": meta["seriesTag"],
        "seriesLabelZh": meta["label_zh"],
        "seriesLabelEn": meta["label_en"],
        "tags": tags,
        "handle": raw.get("handle") or "",
        "productType": raw.get("product_type") or "狗狗小食",
        "sourceUrl": (
            f"{BASE}/products/{raw.get('handle')}" if raw.get("handle") else ""
        ),
    }


def fetch_collection(handle: str) -> dict[str, dict[str, Any]]:
    encoded = urllib.parse.quote(handle)
    url = f"{BASE}/collections/{encoded}/products.json?limit=250"
    print(f"Fetching JSON: {url}")
    data = http_json(url)
    products = data.get("products") or []
    print(f"  Collection「{handle}」returned {len(products)} product(s)")
    return {p.get("handle"): p for p in products if p.get("handle")}


def fetch_curated() -> list[dict[str, Any]]:
    chosen: list[dict[str, Any]] = []
    for handle, meta in SERIES.items():
        by_handle = fetch_collection(handle)
        for i, h in enumerate(CURATED[handle], start=1):
            raw = by_handle.get(h)
            if not raw:
                print(f"  !! missing handle in「{handle}」: {h}", file=sys.stderr)
                continue
            chosen.append(normalize_product(raw, index=i, meta=meta))
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
        time.sleep(0.12)

    SUMMARY_OUT.parent.mkdir(parents=True, exist_ok=True)
    SUMMARY_OUT.write_text(
        json.dumps(products, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {SUMMARY_OUT.relative_to(ROOT)} ({len(products)} products)")
    print("Done. Curate polished entries into src/data/productsData.ts.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
