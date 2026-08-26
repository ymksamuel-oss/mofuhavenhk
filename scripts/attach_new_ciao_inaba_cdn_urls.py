"""Attach verified CDN URLs to the audited new CIAO/Inaba mapping."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
MAPPING_PATH = ROOT / "new_ciao_inaba_cans_mapping.json"
UPLOAD_LOG_PATH = Path("/home/ubuntu/new_ciao_inaba_cdn_upload.txt")
PATTERN = re.compile(r"\[SUCCESS\] assets/new-ciao-inaba-cans/(cic-\d+\.png) -> (https://files\.manuscdn\.com/\S+)")


def main() -> None:
    uploads = dict(PATTERN.findall(UPLOAD_LOG_PATH.read_text(encoding="utf-8")))
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    products = mapping.get("products", [])
    if len(products) != 28 or len(uploads) != 28:
        raise RuntimeError(f"Expected 28 mapped products and 28 uploads; got {len(products)} and {len(uploads)}")
    used: set[str] = set()
    for product in products:
        filename = f"{product['sku'].lower()}.png"
        url = uploads.get(filename)
        if not url:
            raise RuntimeError(f"Missing CDN URL for {filename}")
        if url in used:
            raise RuntimeError(f"Duplicate CDN URL: {url}")
        used.add(url)
        product["cleaned_image_file"] = f"assets/new-ciao-inaba-cans/{filename}"
        product["cdn_url"] = url
        product["image_state"] = "cleaned_pure_white_cdn_uploaded"
    mapping["cdn_upload"] = {"file_count": len(uploads), "all_success": True}
    MAPPING_PATH.write_text(json.dumps(mapping, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"products_with_cdn": len(products), "unique_cdn_urls": len(used)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
