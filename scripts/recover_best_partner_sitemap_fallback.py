#!/usr/bin/env python3
"""Recover remaining catalog JAN images by scanning Best Partner's official post sitemap.

This is a fallback for products whose JAN is not returned by the site's search index.
It writes the same JAN-{n}.webp assets and updates catalog-fallback.json.
"""
from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path

import requests
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import recover_official_best_partner_images as sync  # noqa: E402

JAN_RE = re.compile(r"(?<!\d)(\d{13})(?!\d)")
SITEMAP = "https://best-partner.co.jp/post-sitemap.xml"

def main() -> int:
    catalog_path = ROOT / "src/data/catalog-fallback.json"
    output_dir = ROOT / "public/images/products"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    products = catalog["products"]
    jans = sorted({JAN_RE.search(str(p.get("mofu_sku", ""))).group(1) for p in products if not p.get("images") and JAN_RE.search(str(p.get("mofu_sku", "")))})
    root = ET.fromstring(requests.get(SITEMAP, timeout=30).content)
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    page_urls = [node.text for node in root.findall(".//s:loc", ns) if node.text]

    def scan(url: str) -> tuple[str, list[str]]:
        try:
            text = requests.get(url, timeout=20).text
            return url, [jan for jan in jans if jan in text]
        except requests.RequestException:
            return url, []

    pages: dict[str, str] = {}
    with ThreadPoolExecutor(max_workers=10) as pool:
        for url, hits in pool.map(scan, page_urls):
            for jan in hits:
                pages[jan] = url

    recovered: dict[str, list[str]] = {}
    output_dir.mkdir(parents=True, exist_ok=True)
    for jan, page_url in pages.items():
        page = sync.request_get(page_url)
        payloads: list[bytes] = []
        for image_url in sync.official_image_candidates(page_url, jan, page.content):
            response = sync.request_get(image_url, referer=page_url)
            if response.status_code != 200 or not response.headers.get("Content-Type", "").lower().startswith("image/"):
                continue
            with Image.open(BytesIO(response.content)) as source:
                if min(source.size) >= 250:
                    payloads.append(sync.encode_webp(source)[0])
        if not payloads:
            continue
        paths = []
        for index, payload in enumerate(payloads, start=1):
            (output_dir / f"{jan}-{index}.webp").write_bytes(payload)
            paths.append(f"/images/products/{jan}-{index}.webp")
        recovered[jan] = paths
        print(f"{jan}: {len(paths)} image(s) from {page_url}")

    for product in products:
        match = JAN_RE.search(str(product.get("mofu_sku", "")))
        if match and match.group(1) in recovered:
            paths = recovered[match.group(1)]
            product["image_url"] = paths[0]
            product["images"] = paths
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Recovered {len(recovered)} JANs; updated {sum(1 for p in products if p.get('images'))} catalog rows now containing images.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
