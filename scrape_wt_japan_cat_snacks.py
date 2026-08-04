#!/usr/bin/env python3
"""
Scrape cat snack series from WT Japan into public/images/products/.

Collections (existing Shopify folders — reuse; do not invent new ones):
  - 無添加天然系列
  - 老貓零食
  - 去毛球配方  (storefront path may nest /去毛球配方/去毛球配方)
  - bb貓零食

Cat-only SKUs belong under the storefront cat-treats zone (貓貓小食專區).
Images reuse the existing folder public/images/products/ (no new image dirs).

Freeze-dried SKUs that already live under 冷凍脫水系列 are skipped here
(old series folder wins). Dog-only / small-animal SKUs are skipped.
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
SUMMARY_OUT = ROOT / "scripts" / "wt_cat_snacks_raw.json"

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
    "無添加天然系列": {
        "id_prefix": "wt-cat-natural",
        "series": "無添加天然系列",
        "seriesTag": "無添加天然系列",
        "label_zh": "無添加天然系列",
        "label_en": "No-additive natural series",
    },
    "老貓零食": {
        "id_prefix": "wt-cat-senior",
        "series": "老貓零食",
        "seriesTag": "老貓零食",
        "label_zh": "老貓零食",
        "label_en": "Senior cat treats",
    },
    "去毛球配方": {
        "id_prefix": "wt-cat-hairball",
        "series": "去毛球配方",
        "seriesTag": "去毛球配方",
        "label_zh": "去毛球配方",
        "label_en": "Hairball-care formula",
    },
    "bb貓零食": {
        "id_prefix": "wt-cat-kitten",
        "series": "bb貓零食",
        "seriesTag": "bb貓零食",
        "label_zh": "BB貓零食",
        "label_en": "Kitten treats",
    },
}

# Curated retail-friendly cat handles.
# Skips: dog-only, small-animal, already-catalogued freeze-dried / wet-can / dry-food primaries.
CURATED: dict[str, list[str]] = {
    "無添加天然系列": [
        # MonPetit Nature Kiss paste (no-additive)
        "monpetit-nature-kiss-無添加雞胸肉醬雞胸肉粒40g-x12袋",
        "monpetit-nature-kiss-無添加雞胸肉醬伴金槍魚粒40g-x12袋",
        "monpetit-nature-kiss-無添加三文魚醬伴木魚乾-40gx12袋",
        "onpetit-nature-kiss-無添加吞拿魚醬伴雞胸肉粒40g-x12袋",
        "monpetit-nature-kiss-無添加雞胸肉醬伴三文魚粒40g-x12袋",
        # CIAO PURE no-additive paste
        "ciao-pure-無添加糊仔-金槍魚-帆立貝-1箱192條-平均5",
        "ciao-pure-無添加糊仔-金槍魚-1箱192條-平均5",
        "ciao-pure-無添加糊仔-雞肉-1箱192條-平均5",
        # Shared goat milk — tagged for cats too
        "petzroute-無添加山羊奶-小貓小狗用-50g-x10袋",
    ],
    "老貓零食": [
        # Skip ciao-鮮肉杯-金槍魚 — already wt-product-5 under 貓罐罐
        "ciao-燒鏗魚-骨膠原添加-高齡貓用-x-48袋",
        "ciao-燒鰹魚-帆立貝味-高齡貓用-x-24袋",
        "ciao-糊仔小食-4-條裝-11歳起食用-金槍魚-鏗魚味",
        "ciao-糊仔小食-4-條裝-11歳起食用-雞肉味",
        "ciao-燒鏗魚-高齡貓用-5條裝x-6袋",
        "ciao-貓罐罐-鰹魚-木魚-鰹魚乾-14歳起老貓用-75g-x６個",
    ],
    "去毛球配方": [
        "sheba-duo-夾心餡餅-去毛球配方-200g-x6",
        "400億乳酸菌小食-金槍魚味吐毛球配方-6支-平均-31",
        "combo-貓貓脆餅-海鮮味-去毛球配方-14小袋-x6",
        "ciao-糊仔小食-4-條裝-金槍魚-吐毛球配方-1箱192條-平均-4-5",
        "ciao-糊仔小食-4-條裝-去毛球配方-雞肉味",
        "日本unicharm-三星銀匙-貓貓脆餅-毛玉配慮-40g-4袋x8",
        "ciao-糊仔小食-4-條裝-1歳前食用-雞肉味",  # WT handle for tuna hairball paste
        "貓貓小食-三星銀匙-海鮮味脆餅-去毛球配方-60g-x-6",
    ],
    "bb貓零食": [
        "sheba-duo-夾心餡餅-金槍魚綜合味-幼貓用-60-袋-200g-x-6盒",
        "日本森乳貓奶粉-150g-x3",
        "sheba-duo-夾心餡餅-牛奶味-幼貓用-200g-x-6盒",
        # Skip ciao-1兆…幼貓用 dry food — already under 貓乾糧
        "royal-goat-milk-貴族山羊奶-小貓小狗用-25g-x12袋",
        "mio-幼猫奶粉-250g-x-3",
        "ciao-燒鰹魚-燒鰹魚-1歳前食用-x-24袋",
        "ciao-糊仔小食-4-條裝-雞胸肉-1歳起-1箱192條-平均-4-5",
        "hell-s-kitchen-貓貓袋裝肉泥-雞肉芝士味90g-幼貓用-x8",
        "hell-s-kitchen-貓貓袋裝肉泥-雞肉牛奶味90g-幼貓用-x8",
        # Skip dog paste
        "mio-幼貓餵奶樽",
        "ciao-糊仔小食-4-條裝-金槍魚味",
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
    if "MONPETIT" in t or "MON PETIT" in t:
        return "MonPetit"
    if "CIAO" in t or "INABA" in t:
        return "CIAO"
    if "SHEBA" in t:
        return "Sheba"
    if "COMBO" in t:
        return "Combo"
    if "UNICARM" in t or "銀匙" in title or "UNICHARM" in t:
        return "unicharm"
    if "PETZROUTE" in t:
        return "Petzroute"
    if "HELL" in t and "KITCHEN" in t:
        return "Hell's Kitchen"
    if "MIO" in t or "森乳" in title:
        return "Mio" if "MIO" in t else "Morinyu"
    if "ROYAL" in t and "GOAT" in t:
        return "Royal"
    cleaned = (vendor or "WT").strip()
    if cleaned.upper() in {"WT", "WTJAPAN", "W T"}:
        return "WT"
    return cleaned or "WT"


def fetch_collection_products(handle: str) -> list[dict[str, Any]]:
    encoded = urllib.parse.quote(handle)
    url = f"{BASE}/collections/{encoded}/products.json?limit=250"
    data = http_json(url)
    return list(data.get("products") or [])


def download_image(src: str, dest: Path) -> bool:
    if not src:
        return False
    if dest.exists() and dest.stat().st_size > 1024:
        return True
    try:
        body, _ = http_get(hd_image_url(src))
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(body)
        return True
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        print(f"  ! image failed {dest.name}: {exc}", file=sys.stderr)
        return False


def main() -> int:
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    SUMMARY_OUT.parent.mkdir(parents=True, exist_ok=True)

    all_rows: list[dict[str, Any]] = []

    for collection, meta in SERIES.items():
        print(f"=== {collection} ===")
        products = fetch_collection_products(collection)
        by_handle = {p.get("handle"): p for p in products if p.get("handle")}
        curated = CURATED[collection]
        idx = 0
        for handle in curated:
            raw = by_handle.get(handle)
            if not raw:
                print(f"  MISSING handle: {handle}", file=sys.stderr)
                continue
            idx += 1
            variants = raw.get("variants") or []
            price_raw = (variants[0].get("price") if variants else None) or "0"
            try:
                price = float(price_raw)
            except (TypeError, ValueError):
                price = 0.0

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
            filename = f"{meta['id_prefix']}-{idx}.jpg"
            dest = IMAGE_DIR / filename
            ok = download_image(src or "", dest)
            time.sleep(0.15)

            body_html = raw.get("body_html") or ""
            blurb = strip_html(body_html)[:280]

            row = {
                "id": f"{meta['id_prefix']}-{idx}",
                "title": title,
                "price": price,
                "imageUrl": f"/images/products/{filename}",
                "sourceImageUrl": src or "",
                "imageDownloaded": ok,
                "description": blurb,
                "vendor": brand_from_title(title, raw.get("vendor") or ""),
                "series": meta["series"],
                "tags": tags,
                "handle": handle,
                "productType": (raw.get("product_type") or "").strip() or "貓貓小食",
                "sourceUrl": f"{BASE}/products/{urllib.parse.quote(handle)}",
            }
            all_rows.append(row)
            print(f"  {row['id']}: {title[:60]}… ${price}" if len(title) > 60 else f"  {row['id']}: {title} ${price}")

    SUMMARY_OUT.write_text(
        json.dumps(all_rows, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"\nWrote {len(all_rows)} products → {SUMMARY_OUT}")
    print(f"Images → {IMAGE_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
