#!/usr/bin/env python3
"""
Scrape cat canned-food products from WT Japan (Shopify storefront).

Primary source: Shopify native JSON endpoint
  https://www.wt-japan.com/collections/貓罐罐/products.json

Falls back to BeautifulSoup HTML parsing of the collection page when JSON
is unavailable. Downloads product hero images and writes TypeScript data.
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
TS_OUT = ROOT / "src" / "data" / "productsData.ts"

COLLECTION_HANDLE = "貓罐罐"
TAG_FILTER = "罐罐"
JSON_LIMIT = 10
HTML_PRODUCT_LIMIT = 3

BASE = "https://www.wt-japan.com"
UA = {
    "User-Agent": (
        "MofuHavenHK/1.0 (+https://github.com/ymksamuel-oss/mofuhavenhk; "
        "catalog research scraper for pet-product storefront)"
    ),
    "Accept": "application/json, text/html;q=0.9, */*;q=0.8",
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
    text = re.sub(r"\s+", " ", text).strip()
    return text


def hd_image_url(src: str | None) -> str:
    """Prefer the largest Shopify CDN variant when size params are present."""
    if not src:
        return ""
    # Drop width/height query params so Shopify serves the master asset.
    parsed = urllib.parse.urlsplit(src)
    query = urllib.parse.parse_qs(parsed.query)
    for key in ("width", "height", "crop"):
        query.pop(key, None)
    # Common pattern: foo_300x300.jpg → foo.jpg
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


def collection_products_json_url(limit: int = JSON_LIMIT) -> str:
    handle = urllib.parse.quote(COLLECTION_HANDLE)
    return f"{BASE}/collections/{handle}/products.json?limit={limit}"


def collection_page_url() -> str:
    handle = urllib.parse.quote(COLLECTION_HANDLE)
    tag = urllib.parse.quote(TAG_FILTER)
    return f"{BASE}/collections/{handle}/{tag}"


def normalize_product(raw: dict[str, Any], index: int) -> dict[str, Any]:
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
    if not src:
        src = image.get("src") if isinstance(image, dict) else None

    tags = raw.get("tags") or []
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]

    filename = f"wt-product-{index}.jpg"
    local_path = f"/images/products/{filename}"

    return {
        "id": f"wt-product-{index}",
        "title": (raw.get("title") or "").strip(),
        "price": price,
        "imageUrl": local_path,
        "sourceImageUrl": hd_image_url(src),
        "description": strip_html(raw.get("body_html")),
        "vendor": (raw.get("vendor") or "").strip(),
        "tags": tags,
        "handle": raw.get("handle") or "",
        "productType": raw.get("product_type") or "",
        "sourceUrl": f"{BASE}/products/{raw.get('handle')}" if raw.get("handle") else "",
    }


def fetch_via_json(limit: int = JSON_LIMIT) -> list[dict[str, Any]]:
    url = collection_products_json_url(limit)
    print(f"Fetching JSON: {url}")
    data = http_json(url)
    products = data.get("products") or []
    # Prefer items tagged 罐罐 when present (matches /collections/貓罐罐/罐罐).
    tagged = [p for p in products if TAG_FILTER in (p.get("tags") or [])]
    chosen = tagged[:limit] if tagged else products[:limit]
    print(f"  JSON returned {len(products)} product(s); using {len(chosen)}")
    return [normalize_product(p, i) for i, p in enumerate(chosen, start=1)]


def _try_import_bs4():
    try:
        from bs4 import BeautifulSoup  # type: ignore

        return BeautifulSoup
    except ImportError:
        return None


def fetch_via_html(limit: int = HTML_PRODUCT_LIMIT) -> list[dict[str, Any]]:
    """Fallback: parse collection HTML and hydrate each product via /products/<handle>.js."""
    BeautifulSoup = _try_import_bs4()
    page_url = collection_page_url()
    print(f"Fetching HTML fallback: {page_url}")
    body, _ = http_get(page_url)
    html_text = body.decode("utf-8", errors="replace")

    handles: list[str] = []
    if BeautifulSoup is not None:
        soup = BeautifulSoup(html_text, "html.parser")
        for a in soup.select('a[href*="/products/"]'):
            href = a.get("href") or ""
            m = re.search(r"/products/([^/?#]+)", href)
            if m and m.group(1) not in handles:
                handles.append(m.group(1))
            if len(handles) >= limit:
                break
    else:
        for m in re.finditer(r"/products/([a-zA-Z0-9\-_%]+)", html_text):
            handle = urllib.parse.unquote(m.group(1))
            if handle not in handles:
                handles.append(handle)
            if len(handles) >= limit:
                break

    if not handles:
        raise RuntimeError("HTML fallback found no product handles")

    print(f"  Found {len(handles)} handle(s) in HTML")
    products: list[dict[str, Any]] = []
    for i, handle in enumerate(handles[:limit], start=1):
        js_url = f"{BASE}/products/{urllib.parse.quote(handle)}.js"
        print(f"  Hydrating {js_url}")
        raw = http_json(js_url)
        products.append(normalize_product(raw, i))
        time.sleep(0.2)
    return products


def download_image(url: str, dest: Path) -> None:
    if not url:
        raise RuntimeError(f"No image URL for {dest.name}")
    raw, ctype = http_get(url)
    if len(raw) < 500:
        raise RuntimeError(f"Image too small ({len(raw)} bytes) from {url}")
    # Keep original bytes when already JPEG; otherwise write as-is with .jpg name.
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(raw)
    print(f"  Saved {dest.relative_to(ROOT)} ({len(raw)} bytes, {ctype.split(';')[0]})")


def write_typescript(products: list[dict[str, Any]]) -> None:
    TS_OUT.parent.mkdir(parents=True, exist_ok=True)
    lines: list[str] = [
        "/**",
        " * Auto-generated by scrape_wt_japan.py — do not edit by hand.",
        " * Source: https://www.wt-japan.com/collections/貓罐罐/罐罐",
        " */",
        "",
        "export type WtJapanProduct = {",
        "  id: string;",
        "  title: string;",
        "  /** Storefront price in HKD (as listed on WT Japan). */",
        "  price: number;",
        "  /** Local path under /public for the downloaded hero image. */",
        "  imageUrl: string;",
        "  /** Original remote CDN URL used for the download. */",
        "  sourceImageUrl: string;",
        "  /** Plain-text description / ingredients (HTML stripped). */",
        "  description: string;",
        "  vendor: string;",
        "  tags: string[];",
        "  handle: string;",
        "  productType: string;",
        "  sourceUrl: string;",
        "};",
        "",
        "export const WT_JAPAN_PRODUCTS: WtJapanProduct[] = [",
    ]

    for p in products:
        tags_literal = ", ".join(json.dumps(t, ensure_ascii=False) for t in p["tags"])
        lines.extend(
            [
                "  {",
                f'    id: {json.dumps(p["id"], ensure_ascii=False)},',
                f'    title: {json.dumps(p["title"], ensure_ascii=False)},',
                f'    price: {p["price"]},',
                f'    imageUrl: {json.dumps(p["imageUrl"], ensure_ascii=False)},',
                f'    sourceImageUrl: {json.dumps(p["sourceImageUrl"], ensure_ascii=False)},',
                f'    description: {json.dumps(p["description"], ensure_ascii=False)},',
                f'    vendor: {json.dumps(p["vendor"], ensure_ascii=False)},',
                f"    tags: [{tags_literal}],",
                f'    handle: {json.dumps(p["handle"], ensure_ascii=False)},',
                f'    productType: {json.dumps(p["productType"], ensure_ascii=False)},',
                f'    sourceUrl: {json.dumps(p["sourceUrl"], ensure_ascii=False)},',
                "  },",
            ]
        )

    lines.extend(
        [
            "];",
            "",
            "export function getWtJapanProductById(",
            "  id: string | null | undefined,",
            "): WtJapanProduct | null {",
            "  if (!id) return null;",
            "  return WT_JAPAN_PRODUCTS.find((p) => p.id === id) ?? null;",
            "}",
            "",
        ]
    )
    TS_OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {TS_OUT.relative_to(ROOT)} ({len(products)} products)")


def main() -> int:
    products: list[dict[str, Any]] = []
    try:
        products = fetch_via_json(JSON_LIMIT)
    except Exception as exc:
        print(f"JSON endpoint failed ({exc}); trying HTML fallback…")
        try:
            products = fetch_via_html(HTML_PRODUCT_LIMIT)
        except Exception as exc2:
            print(f"HTML fallback failed: {exc2}", file=sys.stderr)
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
            # Keep the record even if image fails — source URL still recorded.
        time.sleep(0.15)

    write_typescript(products)
    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
