#!/usr/bin/env python3
"""Replace low-resolution Best Partner product cover images with verified official images.

The script is intentionally conservative:
- reads products through Supabase REST using the existing production environment;
- only considers published products whose current first image is below 800px on either side;
- searches the official Best Partner WordPress site using the Japanese product title;
- accepts only an official page image with both dimensions >= 800px;
- uploads with a SKU + SHA-1 filename to avoid CDN collisions;
- updates the products.images JSONB field while preserving the remaining gallery;
- never upscales or invents an image, and records unresolved SKUs in a report.

Run a safe preview first:
  vercel env run -e production -- python3 scripts/replace_hd_product_images.py

Apply verified replacements:
  vercel env run -e production -- python3 scripts/replace_hd_product_images.py --apply
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
REPORT_PATH = ROOT / "data" / "replace-hd-product-images-report.json"
SOURCE_ORIGIN = "https://best-partner.co.jp"
BUCKET = "public-images"
MIN_SIDE = 800
TIMEOUT = 25
USER_AGENT = "MofuHavenHK-HD-image-sync/1.0 (+https://mofuhavenhk.com)"


def args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--apply", action="store_true", help="upload and update database; default is dry-run")
    p.add_argument("--limit", type=int, default=0, help="process at most N products")
    p.add_argument("--sku", action="append", default=[], help="process only this mofu_sku; repeatable")
    p.add_argument("--report", default=str(REPORT_PATH))
    p.add_argument("--delay", type=float, default=0.25)
    p.add_argument("--inventory-only", action="store_true", help="measure current image dimensions only; never search or write")
    return p.parse_args()


def env_required(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value or value in {"[SENSITIVE]", "[REDACTED]"}:
        raise RuntimeError(f"Missing usable environment variable: {name}")
    return value


def request(url: str, *, method: str = "GET", body: bytes | None = None, headers: dict[str, str] | None = None) -> tuple[bytes, dict[str, str], int]:
    merged = {"User-Agent": USER_AGENT, "Accept": "*/*"}
    if headers:
        merged.update(headers)
    req = urllib.request.Request(url, data=body, headers=merged, method=method)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as response:
        return response.read(), dict(response.headers.items()), response.status


def json_request(url: str, *, method: str = "GET", payload: Any = None, headers: dict[str, str] | None = None) -> Any:
    body = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
    merged = {"Accept": "application/json"}
    if body is not None:
        merged["Content-Type"] = "application/json"
    if headers:
        merged.update(headers)
    data, _, _ = request(url, method=method, body=body, headers=merged)
    return json.loads(data.decode("utf-8"))


def supabase_config(apply: bool) -> tuple[str, str, bool]:
    url = (os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL") or "").strip().rstrip("/")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip().strip('"').strip("'")
    if not url:
        raise RuntimeError("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL")
    service_key_available = bool(key and key not in {"[SENSITIVE]", "[REDACTED]"})
    if not service_key_available:
        if apply:
            raise RuntimeError("Missing SUPABASE_SERVICE_ROLE_KEY; apply requires a server-side service key")
        key = (os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or "").strip()
        if not key:
            raise RuntimeError("Missing SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY")
    return url, key, service_key_available


def fetch_products(base: str, key: str) -> list[dict[str, Any]]:
    url = f"{base}/rest/v1/products?select=id,mofu_sku,name,name_ja,name_zh,images,is_published,status&is_published=eq.true&order=mofu_sku.asc&limit=1000"
    return json_request(url, headers={"apikey": key, "Authorization": f"Bearer {key}"})


def image_dimensions(url: str) -> tuple[int, int] | None:
    if not isinstance(url, str) or not url.startswith(("http://", "https://")):
        return None
    try:
        data, _, _ = request(url, headers={"Accept": "image/avif,image/webp,image/jpeg,image/png,image/*"})
        with Image.open(io.BytesIO(data)) as image:
            return tuple(int(v) for v in image.size)
    except Exception:
        return None


def is_hd(url: Any) -> bool:
    dims = image_dimensions(url)
    return bool(dims and min(dims) >= MIN_SIDE)


def normalize_title(value: str) -> str:
    value = (value or "").replace("　", " ")
    value = re.sub(r"\s+", " ", value).strip().lower()
    return value


def official_search_urls(title: str) -> list[str]:
    title = re.sub(r"\([^)]*\)|（[^）]*）", " ", title or "")
    title = re.sub(r"【[^】]*】", " ", title)
    title = re.sub(r"\s+", " ", title).strip()
    if not title:
        return []
    return [
        f"{SOURCE_ORIGIN}/?s={urllib.parse.quote(title)}",
        f"{SOURCE_ORIGIN}/archives/category/new-products/?s={urllib.parse.quote(title)}",
    ]


def extract_official_page_links(html: str) -> list[str]:
    links = re.findall(r'href=["\'](https://best-partner\.co\.jp/archives/\d+/?)["\']', html, flags=re.I)
    seen: set[str] = set()
    output: list[str] = []
    for link in links:
        link = link.rstrip("/") + "/"
        if link not in seen:
            seen.add(link)
            output.append(link)
    return output[:12]


def image_candidates_from_page(html: str) -> list[str]:
    values: list[str] = []
    patterns = [
        r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)',
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image',
        r'<img[^>]+(?:src|data-src)=["\']([^"\']+)',
        r'(https://best-partner\.co\.jp/wp/wp/wp-content/uploads/[^"\'\\ <>]+)',
    ]
    for pattern in patterns:
        values.extend(re.findall(pattern, html, flags=re.I))
    output: list[str] = []
    seen: set[str] = set()
    for value in values:
        value = value.replace("&amp;", "&").replace("\\/", "/")
        value = urllib.parse.urljoin(SOURCE_ORIGIN, value)
        if not re.search(r"\.(?:jpe?g|png|webp)(?:[?#]|$)", value, flags=re.I):
            continue
        if value not in seen:
            seen.add(value)
            output.append(value)
    return output


def find_official_hd(title: str) -> dict[str, Any] | None:
    # The official catalog is Japanese-only. Avoid spending network time on
    # locally authored Chinese titles that cannot produce an exact official hit.
    if not re.search(r"[ぁ-ゖァ-ヺ]", title or ""):
        return None
    seen_pages: set[str] = set()
    for search_url in official_search_urls(title):
        try:
            search_bytes, _, _ = request(search_url, headers={"Accept": "text/html"})
            search_html = search_bytes.decode("utf-8", errors="ignore")
        except Exception:
            continue
        for page_url in extract_official_page_links(search_html):
            if page_url in seen_pages:
                continue
            seen_pages.add(page_url)
            try:
                page_bytes, _, _ = request(page_url, headers={"Accept": "text/html"})
                page_html = page_bytes.decode("utf-8", errors="ignore")
            except Exception:
                continue
            # Reject clearly unrelated search pages; Japanese title tokens must occur on the page.
            title_tokens = [t for t in re.split(r"[^ぁ-んァ-ン一-龥A-Za-z0-9]+", title) if len(t) >= 2]
            page_text = re.sub(r"<[^>]+>", " ", page_html)
            if title_tokens and not any(token in page_text for token in title_tokens[:3]):
                continue
            for image_url in image_candidates_from_page(page_html):
                dims = image_dimensions(image_url)
                if dims and min(dims) >= MIN_SIDE:
                    return {"page_url": page_url, "image_url": image_url, "dimensions": list(dims)}
    return None


def extension_for(content_type: str, source_url: str) -> str:
    mime = content_type.split(";", 1)[0].lower()
    mapping = {"image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp"}
    if mime in mapping:
        return mapping[mime]
    suffix = Path(urllib.parse.urlparse(source_url).path).suffix.lower().lstrip(".")
    return suffix if suffix in {"jpg", "jpeg", "png", "webp"} else "jpg"


def upload_image(base: str, key: str, sku: str, source_url: str) -> tuple[str, list[int]]:
    data, headers, _ = request(source_url, headers={"Accept": "image/avif,image/webp,image/jpeg,image/png,image/*"})
    with Image.open(io.BytesIO(data)) as image:
        dims = tuple(int(v) for v in image.size)
    if min(dims) < MIN_SIDE:
        raise RuntimeError(f"official source is below {MIN_SIDE}px: {dims}")
    digest = hashlib.sha1(data).hexdigest()[:12]
    extension = extension_for(headers.get("Content-Type", "image/jpeg"), source_url)
    object_path = f"best-partner/{sku}-hd-{digest}.{extension}"
    upload_url = f"{base}/storage/v1/object/{BUCKET}/{object_path}"
    upload_headers = {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": headers.get("Content-Type", "image/jpeg"), "x-upsert": "true"}
    request(upload_url, method="POST", body=data, headers=upload_headers)
    return f"{base}/storage/v1/object/public/{BUCKET}/{object_path}", list(dims)


def update_images(base: str, key: str, product_id: str, new_url: str, existing: Any) -> None:
    gallery = existing if isinstance(existing, list) else []
    merged = [new_url] + [item for item in gallery if isinstance(item, str) and item != new_url]
    url = f"{base}/rest/v1/products?id=eq.{urllib.parse.quote(product_id)}"
    json_request(url, method="PATCH", payload={"images": merged}, headers={"apikey": key, "Authorization": f"Bearer {key}", "Prefer": "return=minimal"})


def sync_homepage_json(report: dict[str, Any]) -> None:
    path = ROOT / "src/data/mofu-homepage-featured.json"
    if not path.exists():
        report["homepage_json"] = {"status": "missing", "path": str(path)}
        return
    data = json.loads(path.read_text(encoding="utf-8"))
    # This file is an SKU -> English-name dictionary, not an image manifest.
    report["homepage_json"] = {"status": "verified_no_image_fields", "path": str(path), "entries": len(data)}


def main() -> int:
    cli = args()
    base, key, service_key_available = supabase_config(cli.apply)
    products = fetch_products(base, key)
    selected = [p for p in products if str(p.get("mofu_sku") or "").isdigit() and (not cli.sku or p.get("mofu_sku") in cli.sku)]
    if cli.limit:
        selected = selected[: cli.limit]
    report: dict[str, Any] = {"mode": "inventory-only" if cli.inventory_only else ("apply" if cli.apply else "dry-run"), "source": SOURCE_ORIGIN, "min_side": MIN_SIDE, "total_published": len(products), "selected": len(selected), "service_key_available": service_key_available, "items": []}
    if cli.inventory_only:
        def measure(product: dict[str, Any]) -> tuple[dict[str, Any], tuple[int, int] | None]:
            images = product.get("images") if isinstance(product.get("images"), list) else []
            return product, image_dimensions(images[0] if images else None)
        with ThreadPoolExecutor(max_workers=16) as pool:
            futures = [pool.submit(measure, product) for product in selected]
            for index, future in enumerate(as_completed(futures), 1):
                product, dims = future.result()
                images = product.get("images") if isinstance(product.get("images"), list) else []
                item = {"sku": str(product.get("mofu_sku")), "product_id": product.get("id"), "title": str(product.get("name") or product.get("name_ja") or product.get("name_zh") or ""), "current_first": images[0] if images else None, "current_dimensions": list(dims) if dims else None, "status": "already_hd" if dims and min(dims) >= MIN_SIDE else "low_resolution_or_unreadable"}
                report["items"].append(item)
                print(f"[{index}/{len(selected)}] {item['status']} {item['sku']} {item['current_dimensions']}")
        counts = {"already_hd": sum(item["status"] == "already_hd" for item in report["items"]), "low_resolution_or_unreadable": sum(item["status"] != "already_hd" for item in report["items"])}
        report["counts"] = counts
        sync_homepage_json(report)
        report_path = Path(cli.report)
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("SUMMARY", json.dumps(counts, ensure_ascii=False))
        print("REPORT", report_path)
        return 0
    counts = {"already_hd": 0, "updated": 0, "would_update": 0, "unresolved": 0, "failed": 0}
    for index, product in enumerate(selected, 1):
        sku = str(product.get("mofu_sku"))
        title = str(product.get("name") or product.get("name_ja") or product.get("name_zh") or "")
        current = product.get("images") if isinstance(product.get("images"), list) else []
        item: dict[str, Any] = {"sku": sku, "product_id": product.get("id"), "title": title, "current_first": current[0] if current else None}
        try:
            current_dims = image_dimensions(current[0]) if current else None
            item["current_dimensions"] = list(current_dims) if current_dims else None
            if current_dims and min(current_dims) >= MIN_SIDE:
                counts["already_hd"] += 1
                item["status"] = "already_hd"
                report["items"].append(item)
                print(f"[{index}/{len(selected)}] KEEP {sku} {current_dims}")
                continue
            match = find_official_hd(title)
            if not match:
                counts["unresolved"] += 1
                item["status"] = "unresolved_no_official_hd_match"
                report["items"].append(item)
                print(f"[{index}/{len(selected)}] SKIP {sku} no verified official >= {MIN_SIDE}px image")
                continue
            item["official_match"] = match
            if not cli.apply:
                counts["would_update"] += 1
                item["status"] = "would_update"
                report["items"].append(item)
                print(f"[{index}/{len(selected)}] WOULD UPDATE {sku} {match['dimensions']}")
                continue
            public_url, dims = upload_image(base, key, sku, match["image_url"])
            update_images(base, key, str(product["id"]), public_url, current)
            counts["updated"] += 1
            item.update({"status": "updated", "new_url": public_url, "new_dimensions": dims})
            report["items"].append(item)
            print(f"[{index}/{len(selected)}] UPDATED {sku} {dims} -> {public_url}")
            if cli.delay:
                time.sleep(cli.delay)
        except Exception as exc:
            counts["failed"] += 1
            item["status"] = "failed"
            item["error"] = str(exc)
            report["items"].append(item)
            print(f"[{index}/{len(selected)}] FAILED {sku}: {exc}", file=sys.stderr)
    report["counts"] = counts
    sync_homepage_json(report)
    report_path = Path(cli.report)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("SUMMARY", json.dumps(counts, ensure_ascii=False))
    print("REPORT", report_path)
    return 1 if counts["failed"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
