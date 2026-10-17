#!/usr/bin/env python3
"""Apply visually verified Best Partner media-library packshots by exact JAN.

The source URL must be present in the saved official WordPress media audit,
contain the exact JAN, and be one of the curated packshots checked against the
product label/specification. Run without --apply for a read-only validation.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import socket
import sys
import time
import urllib.parse
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path

import requests
from requests.adapters import HTTPAdapter
import urllib3.util.connection
from urllib3.util.retry import Retry
from PIL import Image, UnidentifiedImageError

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "src/data/catalog-fallback.json"
MISSING_CSV = ROOT / "audit/missing-product-images-2026-10-17.csv"
RECOVERY_CSV = ROOT / "audit/product-image-recovery-2026-10-17.csv"
MANIFEST = ROOT / "audit/product-image-recovery-2026-10-17.json"
MEDIA_AUDIT = ROOT / "audit/unresolved-official-media-2026-10-17.json"
REMAINING_CSV = ROOT / "audit/remaining-product-images-2026-10-17.csv"
OUTPUT_DIR = ROOT / "public/images/products"

OFFICIAL_HOST = "best-partner.co.jp"
API_BASE = "https://best-partner.co.jp/wp-json/wp/v2/media"

# The selected images were visually checked for both product identity and pack size.
# The three no-exact-media items and two wrong-variant items are deliberately omitted.
APPROVED = {
    "4976064024411": "https://best-partner.co.jp/wp/wp/wp-content/uploads/4976064024411.jpg",
    "4976064024428": "https://best-partner.co.jp/wp/wp/wp-content/uploads/4976064024428.jpg",
    "4976064024435": "https://best-partner.co.jp/wp/wp/wp-content/uploads/4976064024435.jpg",
    "4976064025340": "https://best-partner.co.jp/wp/wp/wp-content/uploads/4976064025340.jpg",
    "4976064025357": "https://best-partner.co.jp/wp/wp/wp-content/uploads/4976064025357.jpg",
    "4976064025364": "https://best-partner.co.jp/wp/wp/wp-content/uploads/4976064025364.jpg",
    "4976064025388": "https://best-partner.co.jp/wp/wp/wp-content/uploads/4976064025388.jpg",
    "4976064025395": "https://best-partner.co.jp/wp/wp/wp-content/uploads/4976064025395.jpg",
    "4976064025401": "https://best-partner.co.jp/wp/wp/wp-content/uploads/4976064025401.jpg",
    "4976064025425": "https://best-partner.co.jp/wp/wp/wp-content/uploads/4976064025425.jpg",
    "4976064025500": "https://best-partner.co.jp/wp/wp/wp-content/uploads/4976064025500.jpg",
    "4976064025531": "https://best-partner.co.jp/wp/wp/wp-content/uploads/4976064025531.jpg",
    "4976064025548": "https://best-partner.co.jp/wp/wp/wp-content/uploads/4976064025548.jpg",
}

UNRESOLVED_NOTES = {
    "4976064024473": "Best Partner 官方搜尋及媒體庫均沒有含此 JAN 的圖片；未採用未核對零售圖片。",
    "4976064024480": "Best Partner 官方搜尋及媒體庫均沒有含此 JAN 的圖片；未採用未核對零售圖片。",
    "4976064024497": "Best Partner 官方搜尋及媒體庫均沒有含此 JAN 的圖片；未採用未核對零售圖片。",
    "4976064024749": "官方商品頁列明 JAN 4976064024749／30g，但頁面圖片檔名及包裝條碼指向另一 JAN 4976064024244，故不套用。",
    "4976064025012": "官方商品頁列有 JAN 4976064025005（15本）及 4976064025012（40本），現存圖片只確認 15本／50本規格，沒有 40本精確包裝照。",
}


def get_exact_jan(value: str) -> str | None:
    match = re.search(r"(?<!\d)(\d{13})(?!\d)", value or "")
    return match.group(1) if match else None


def atomic_json(path: Path, data: object) -> None:
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temp.replace(path)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Download approved images and update the catalog/audits")
    parser.add_argument("--source-cache", type=Path, help="Use previously downloaded source images named JAN-basename")
    args = parser.parse_args()

    urllib3.util.connection.allowed_gai_family = lambda: socket.AF_INET
    media_audit = json.loads(MEDIA_AUDIT.read_text(encoding="utf-8"))
    media_by_jan = {row["jan"]: row for row in media_audit["results"]}
    for jan, url in APPROVED.items():
        parsed = urllib.parse.urlparse(url)
        row = media_by_jan.get(jan, {})
        sources = {item.get("source_url") for item in row.get("items", [])}
        if parsed.scheme != "https" or parsed.hostname != OFFICIAL_HOST or jan not in parsed.path or url not in sources:
            raise ValueError(f"Official media audit does not verify the exact JAN/source URL: {jan}")

    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    products = catalog.get("products", [])
    product_jans = {get_exact_jan(str(p.get("mofu_sku") or p.get("sku") or "")) for p in products}
    absent = sorted(set(APPROVED) - product_jans)
    if absent:
        raise ValueError(f"Approved JANs are absent from the catalog: {', '.join(absent)}")

    print(f"approved_images={len(APPROVED)} apply={args.apply}")
    if not args.apply:
        print("dry run: all selected files have exact-JAN official media audit entries; no files changed")
        return 0

    sys.path.insert(0, str(ROOT / "scripts"))
    from recover_official_best_partner_images import encode_webp

    retry = Retry(total=4, connect=4, read=4, status=4, backoff_factor=0.6,
                  status_forcelist=(429, 500, 502, 503, 504),
                  allowed_methods=frozenset({"GET"}), raise_on_status=False)
    adapter = HTTPAdapter(max_retries=retry, pool_connections=2, pool_maxsize=2)
    session = requests.Session()
    session.mount("https://", adapter)
    session.headers.update({"User-Agent": "Mozilla/5.0 (compatible; MofuHavenHK product-image recovery/1.0)", "Referer": "https://best-partner.co.jp/"})
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    result_by_jan = {row["jan"]: row for row in manifest["results"]}
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    written: dict[str, dict] = {}

    for jan, url in APPROVED.items():
        destination = OUTPUT_DIR / f"best-partner-{jan}.webp"
        cached = args.source_cache / f"{jan}-{Path(urllib.parse.urlparse(url).path).name}" if args.source_cache else None
        if cached and cached.is_file():
            payload = cached.read_bytes()
            response_url = url
            content_type = "image/jpeg" if cached.suffix.lower() in {".jpg", ".jpeg"} else "image/png"
        else:
            time.sleep(0.15)
            try:
                response = session.get(url, timeout=(10, 35), allow_redirects=True)
            except requests.RequestException as exc:
                raise RuntimeError(f"Official image request failed after retries for {jan}: {type(exc).__name__}") from exc
            final = urllib.parse.urlparse(response.url)
            if response.status_code != 200 or final.scheme != "https" or final.hostname != OFFICIAL_HOST or jan not in final.path:
                raise RuntimeError(f"Official exact-JAN image fetch failed for {jan}: HTTP {response.status_code}")
            payload = response.content
            response_url = response.url
            content_type = response.headers.get("Content-Type", "").lower()
        if not content_type.startswith("image/") or len(payload) > 15 * 1024 * 1024:
            raise RuntimeError(f"Unexpected image response for {jan}")
        try:
            with Image.open(BytesIO(payload)) as source:
                source.verify()
            with Image.open(BytesIO(payload)) as source:
                source_dimensions = source.size
                if min(source_dimensions) < 250:
                    raise RuntimeError(f"Official image too small for {jan}: {source_dimensions}")
                webp, quality, webp_dimensions = encode_webp(source)
        except (UnidentifiedImageError, OSError) as exc:
            raise RuntimeError(f"Invalid image for {jan}: {type(exc).__name__}") from exc
        if destination.exists():
            if destination.read_bytes() != webp:
                raise FileExistsError(f"Refusing to overwrite an unverified existing image: {destination}")
        else:
            temp = destination.with_suffix(destination.suffix + ".tmp")
            temp.write_bytes(webp)
            temp.replace(destination)
        result = result_by_jan[jan]
        result.update({
            "status": "recovered",
            "detail": "official_wordpress_media_exact_jan_and_visually_verified_packshot",
            "product_page_url": f"{API_BASE}?search={jan}&per_page=20",
            "source_image_url": response_url,
            "source_dimensions": f"{source_dimensions[0]}x{source_dimensions[1]}",
            "source_bytes": len(payload),
            "webp_path": f"/images/products/{destination.name}",
            "webp_bytes": len(webp),
            "webp_quality": quality,
            "webp_dimensions": f"{webp_dimensions[0]}x{webp_dimensions[1]}",
            "sha256": hashlib.sha256(webp).hexdigest(),
        })
        written[jan] = result
        print(f"{jan} -> {destination.name} ({len(webp)} bytes)", flush=True)

    updated_products = 0
    already_updated = 0
    for product in products:
        jan = get_exact_jan(str(product.get("mofu_sku") or product.get("sku") or ""))
        if jan not in written:
            continue
        current_image = str(product.get("image_url") or "")
        if current_image == written[jan]["webp_path"]:
            already_updated += 1
        elif current_image.startswith("/images/catalog-placeholder"):
            product["image_url"] = written[jan]["webp_path"]
            updated_products += 1
        else:
            raise RuntimeError(f"Refusing to replace a non-placeholder catalog image for {jan}: {current_image}")
    if updated_products + already_updated != len(APPROVED):
        raise RuntimeError(f"Expected exactly {len(APPROVED)} matched products; updated={updated_products}, already_updated={already_updated}")
    atomic_json(CATALOG, catalog)

    recovered_jans = {row["jan"] for row in manifest["results"] if row.get("status") == "recovered"}
    manifest["generated_at"] = datetime.now(timezone.utc).isoformat()
    manifest["summary"]["unique_jans_processed"] = len(manifest["results"])
    manifest["summary"]["unique_jans_recovered"] = len(recovered_jans)
    manifest["summary"]["images_written"] = sum(1 for jan in recovered_jans if (OUTPUT_DIR / f"best-partner-{jan}.webp").exists())
    manifest["summary"]["product_rows_updated"] = sum(
        1 for product in products
        if get_exact_jan(str(product.get("mofu_sku") or product.get("sku") or "")) in recovered_jans
        and str(product.get("image_url") or "").startswith("/images/products/")
    )
    atomic_json(MANIFEST, manifest)

    with MISSING_CSV.open(encoding="utf-8-sig", newline="") as file:
        missing_rows = list(csv.DictReader(file))
    fieldnames = ["product_id", "mofu_sku", "name_zh", "name_en", "pet_species", "jan", "status", "detail", "product_page_url", "source_image_url", "source_dimensions", "source_bytes", "webp_path", "webp_dimensions", "webp_bytes", "webp_quality", "sha256"]
    with RECOVERY_CSV.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames, extrasaction="ignore", lineterminator="\n")
        writer.writeheader()
        for row in missing_rows:
            jan = get_exact_jan(row.get("mofu_sku", "")) or get_exact_jan(row.get("original_image_url", ""))
            result = result_by_jan.get(jan or "", {})
            writer.writerow({**row, **result, "jan": jan or ""})

    remaining_fields = ["product_id", "mofu_sku", "jan", "name_zh", "name_en", "pet_species", "brand", "status", "reason", "official_product_page"]
    with REMAINING_CSV.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=remaining_fields, lineterminator="\n")
        writer.writeheader()
        for row in missing_rows:
            jan = get_exact_jan(row.get("mofu_sku", "")) or get_exact_jan(row.get("original_image_url", ""))
            if jan in recovered_jans:
                continue
            result = result_by_jan.get(jan or "", {})
            page_url = result.get("product_page_url", "")
            if jan == "4976064024749": page_url = "https://best-partner.co.jp/archives/3986/"
            if jan == "4976064025012": page_url = "https://best-partner.co.jp/archives/3153/"
            writer.writerow({
                "product_id": row.get("product_id", ""),
                "mofu_sku": row.get("mofu_sku", ""),
                "jan": jan or "",
                "name_zh": row.get("name_zh", ""),
                "name_en": row.get("name_en", ""),
                "pet_species": row.get("pet_species", ""),
                "brand": "Best Partner",
                "status": "unresolved_exact_packshot",
                "reason": UNRESOLVED_NOTES.get(jan or "", "未找到可按精確 JAN 核對的包裝圖。"),
                "official_product_page": page_url,
            })

    for row in media_audit["results"]:
        jan = row["jan"]
        if jan in APPROVED:
            row["decision"] = "used_visual_verified_exact_jan_packshot"
            row["selected_source_image_url"] = APPROVED[jan]
            row["visual_check"] = "Package label and product identity/specification were checked against the catalog entry."
        else:
            row["decision"] = "left_unresolved_no_safe_exact_packshot"
            row["visual_check"] = UNRESOLVED_NOTES.get(jan, "No exact-JAN official packshot was found.")
    atomic_json(MEDIA_AUDIT, media_audit)

    print(f"applied: images_written={len(written)} product_rows_updated={updated_products} recovered_unique_jans={len(recovered_jans)} remaining_rows={sum(1 for row in missing_rows if (get_exact_jan(row.get('mofu_sku','')) or get_exact_jan(row.get('original_image_url',''))) not in recovered_jans)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
