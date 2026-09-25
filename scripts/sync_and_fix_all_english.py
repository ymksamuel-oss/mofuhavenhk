#!/usr/bin/env python3
"""Audit and repair English product names without overwriting curated English copy.

The script is intentionally conservative: it patches only records whose name_en is
empty, contains CJK characters, or contains a known generic placeholder. Existing
valid English names are preserved.
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

CJK = re.compile(r"[\u3400-\u9fff\u3040-\u30ff]")
GENERIC = re.compile(
    r"pet\s+lifestyle\s+accessory|japanese\s+natural\s+pet\s+treat|japanese\s+pet\s+essential",
    re.I,
)

REPLACEMENTS = [
    ("雞里肌", "Pure Chicken Breast"), ("雞肉", "Pure Chicken"),
    ("雞砂肝", "Chicken Gizzard"), ("雞肝", "Chicken Liver"),
    ("牛蹄筋", "Beef Tendon"), ("牛大筋", "Beef Tendon"), ("牛筋", "Beef Tendon"),
    ("牛舌", "Beef Tongue"), ("牛肉", "Beef"),
    ("蝦夷鹿", "Hokkaido Wild Deer"), ("鹿肉", "Wild Deer"),
    ("馬肉", "Pure Horse Meat"), ("豬耳", "Pork Ears"), ("豬肉", "Pure Pork"),
    ("金槍魚", "Yellowfin Tuna"), ("鮪", "Tuna"), ("柴魚", "Bonito Flakes"),
    ("小魚乾", "Crispy Dried Sardines"), ("丁香魚", "Dried Sardines"),
    ("鱈魚", "Cod"), ("三文魚", "Salmon"), ("鯊魚", "Shark"),
    ("犛牛芝士", "Himalayan Yak Cheese"), ("芝士", "Natural Cheese"),
    ("地瓜", "Japanese Sweet Potato"), ("蕃薯", "Japanese Sweet Potato"),
    ("蔓越莓", "Cranberry"), ("納豆", "Natto"), ("豆腐", "Tofu"),
    ("薄片", "Thin-Cut Slices"), ("肉乾", "Jerky"), ("肉棒", "Meat Sticks"),
    ("肉碎", "Meat Crumble"), ("拌糧", "Meal Topper"), ("潔齒", "Dental Chew"),
    ("耐咬", "Long-Lasting Chew"), ("磨牙骨", "Dental Chew Bone"),
    ("凍乾", "Freeze-Dried"), ("能量棒", "Energy Sticks"), ("鬆餅", "Waffle"),
    ("拾便袋", "Waste Bags"), ("胸背帶", "No-Pull Harness"),
    ("牽引帶", "Durable Leash"), ("牽引繩", "Durable Leash"),
    ("頸圈", "Safety Collar"), ("托特包", "Canvas Walk Tote Bag"),
]


def is_safe(value: str | None) -> bool:
    value = str(value or "").strip()
    return bool(value) and not CJK.search(value) and not GENERIC.search(value)


def size_from(source: str) -> str:
    match = re.search(r"(\d+(?:\.\d+)?\s*(?:kg|g|ml|L|本|枚|個|隻|支|包|入|P))", source, re.I)
    if not match:
        return ""
    value = match.group(1)
    value = re.sub(r"(?:本|枚|個|支|包|P)入", " pcs", value)
    value = re.sub(r"隻入", " pc", value)
    value = re.sub(r"[本枚個支包]", " pcs", value)
    value = value.replace("P", " packs")
    return re.sub(r"\s+", " ", value).strip()


def generate(source: str) -> str:
    animal = "Cat" if re.search(r"貓|猫", source) else "Dog"
    words: list[str] = []
    for zh, en in REPLACEMENTS:
        if zh in source and en not in words:
            words.append(en)
    if not words:
        words = ["Natural Pet Food"]
    result = f"BestPartner {animal} {' '.join(words)}"
    size = size_from(source)
    if size:
        result += f" {size}"
    result = re.sub(r"\s+", " ", result).strip()
    result = CJK.sub("", result)
    return result


def patch_json_files() -> dict[str, int]:
    files = sorted(set(Path("src").rglob("*.json")) | set(Path("public").rglob("*.json")) | set(Path("data").rglob("*.json")))
    updated_files = 0
    patched_items = 0

    def walk(value: object) -> bool:
        nonlocal patched_items
        modified = False
        if isinstance(value, dict):
            name = value.get("name")
            current = value.get("name_en")
            is_product_record = any(
                key in value for key in ("mofu_sku", "sku", "product_spec", "price", "category", "name_zh")
            )
            if is_product_record and isinstance(name, str) and (not is_safe(current)):
                replacement = generate(name)
                if replacement != current:
                    value["name_en"] = replacement
                    patched_items += 1
                    modified = True
            for child in value.values():
                modified = walk(child) or modified
        elif isinstance(value, list):
            for child in value:
                modified = walk(child) or modified
        return modified

    for path in files:
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            if walk(data):
                path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                updated_files += 1
                print(f"updated JSON: {path}")
        except (OSError, json.JSONDecodeError):
            continue
    return {"json_files_scanned": len(files), "json_files_updated": updated_files, "json_items_patched": patched_items}


def audit_supabase() -> dict[str, object]:
    """Audit Supabase when credentials are available; never downgrade valid names."""
    base = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if not base or not key:
        return {"database": "skipped", "reason": "Supabase credentials unavailable in shell"}
    url = base.rstrip("/") + "/rest/v1/products?select=id,mofu_sku,name,name_zh,name_en&limit=500"
    request = Request(url, headers={"apikey": key, "Authorization": f"Bearer {key}"})
    with urlopen(request, timeout=30) as response:
        rows = json.loads(response.read().decode("utf-8"))
    invalid = [row for row in rows if not is_safe(row.get("name_en"))]
    return {"database": "audited", "rows": len(rows), "invalid_name_en": len(invalid), "updates": 0}


if __name__ == "__main__":
    report = {**patch_json_files(), **audit_supabase()}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if report.get("invalid_name_en", 0):
        raise SystemExit("Unsafe database name_en values remain; no destructive overwrite was performed.")
