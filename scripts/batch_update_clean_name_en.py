#!/usr/bin/env python3
"""Rewrite every products.name_en into a clean, English-only storefront name.

Usage:
  python3 scripts/batch_update_clean_name_en.py --dry-run
  python3 scripts/batch_update_clean_name_en.py --apply

The script deliberately uses the Supabase REST API with the existing session
variables, keeps the source name/name_zh untouched, and refuses to write any
candidate containing CJK characters.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

CJK_RE = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff]")
TAG_RE = re.compile(r"【[^】]*】|\([^)]*\)|（[^）]*）")
WEIGHT_RE = re.compile(r"(?<![A-Za-z])(\d+(?:\.\d+)?)\s*(g|kg|ml|枚|本|個|隻|支|包|入|粒|件|號|号)", re.I)

# Ordered longest-first replacements. These cover the supplied naming standard
# and common variants in the catalogue while leaving unknown English source names
# available as a safe fallback.
TERM_MAP = [
    ("黃鰭金槍魚", "Yellowfin Tuna"), ("金槍魚", "Tuna"), ("吞拿魚", "Tuna"),
    ("黑鮪魚", "Bluefin Tuna"), ("鮪魚", "Tuna"), ("柴魚", "Bonito Flakes"), ("鰹魚", "Bonito Flakes"),
    ("小魚乾", "Crispy Dried Sardines"), ("丁香魚", "Crispy Dried Sardines"),
    ("雞里肌肉", "Chicken Breast"), ("雞里肌", "Chicken Breast"), ("純雞胸肉", "Pure Chicken Breast"),
    ("純雞肉", "Pure Chicken Breast"), ("雞砂肝", "Chicken Gizzard"), ("雞肝", "Chicken Liver"),
    ("雞翅", "Chicken Wing"), ("雞冠", "Chicken Comb"), ("豬耳", "Pork Ears"), ("大豬耳", "Pork Ears"),
    ("黑豚", "Kagoshima Black Pork"), ("牛蹄", "Whole Beef Hoof"), ("牛大筋", "Natural Beef Tendon"),
    ("牛筋", "Natural Beef Tendon"), ("牛舌", "Beef Tongue"), ("牛肋排", "Beef Rib Bones"),
    ("純牛肉", "Pure Beef"), ("牛肉", "Beef"), ("鹿肉", "Wild Deer"), ("蝦夷鹿", "Hokkaido Wild Deer"),
    ("日本鹿", "Japanese Wild Deer"), ("馬肉", "Pure Horse Meat"), ("馬蹄筋", "Horse Hoof Tendon"),
    ("馬腱", "Horse Tendon"), ("羊肺", "Lamb Lung"), ("山羊奶", "Goat Milk"),
    ("犛牛芝士", "Himalayan Yak Cheese"), ("芝士", "Cheese"), ("鯊魚軟骨", "Shark Cartilage"),
    ("魚翅", "Shark Fin"), ("安納芋", "Japanese Sweet Potato"), ("蕃薯", "Japanese Sweet Potato"),
    ("地瓜", "Japanese Sweet Potato"), ("香蕉", "Banana"), ("大豆", "Soy"), ("鯛魚", "Sea Bream"),
    ("鱈魚", "Cod"), ("鰻魚", "Eel"), ("三文魚", "Salmon"), ("鮭魚", "Salmon"),
    ("鯖魚", "Mackerel"), ("鯷魚", "Anchovy"), ("鯨魚", "Whale"), ("袋鼠", "Kangaroo"),
    ("烏魚", "Mullet"), ("牛心", "Beef Heart"), ("牛皮", "Beef Hide"),
    ("凍乾", "Freeze-Dried"), ("原肉乾", "Jerky"), ("肉乾", "Jerky"), ("肉棒", "Meat Sticks"),
    ("能量棒", "Energy Sticks"), ("薄削花", "Flakes"), ("撒粉", "Meal Topper"), ("拌糧", "Meal Topper"),
    ("薄切片", "Thin-Cut Slices"), ("薄片", "Thin Slices"), ("肉片", "Meat Slices"), ("肉絲", "Meat Shreds"),
    ("磨牙骨", "Dental Chew"), ("潔齒", "Dental Chew"), ("耐咬", "Chew"), ("潔齒棒", "Dental Chew Sticks"),
    ("胸背帶", "Harness"), ("牽引帶", "Leash"), ("牽引繩", "Leash"), ("頸圈", "Collar"),
    ("拾便袋", "Waste Bags"), ("托特包", "Tote Bag"), ("主食糧", "Complete Food"), ("乾糧", "Dry Food"),
    ("機能糧", "Functional Food"), ("軟質", "Soft"), ("方塊", "Cubes"), ("小方塊", "Mini Cubes"),
    ("肉塊", "Meat Chunks"), ("肉凍", "Meat Jelly"), ("肉鬆", "Meat Floss"), ("肉餅", "Meat Patty"),
    ("魚柳", "Fish Fillet"), ("魚乾", "Dried Fish"), ("魚頭", "Fish Head"), ("魚肚", "Fish Belly"),
    ("曲奇", "Cookies"), ("鬆餅", "Waffles"), ("麵包", "Buns"), ("小饅頭", "Mini Buns"),
    ("脆球", "Crisp Balls"), ("脆片", "Crisps"), ("酥脆", "Crispy"), ("薄切", "Thin-Cut"),
    ("低敏", "Hypoallergenic"), ("無添加", "Additive-Free"), ("天然", "Natural"), ("國產", "Domestic"),
    ("北海道", "Hokkaido"), ("鹿兒島", "Kagoshima"), ("日本製造", "Japanese"), ("日本原裝", "Japanese"),
]
TERM_MAP.sort(key=lambda pair: len(pair[0]), reverse=True)


def api_request(method: str, url: str, payload: Any | None = None) -> Any:
    key = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    base = os.environ.get("SUPABASE_URL")
    if not base or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY) are required")
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    body = json.dumps(payload, ensure_ascii=False).encode() if payload is not None else None
    request = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(request, timeout=60) as response:
        raw = response.read().decode("utf-8")
        return json.loads(raw) if raw else None


def species_label(row: dict[str, Any]) -> str:
    source = f"{row.get('name_zh') or ''} {row.get('name') or ''} {row.get('pet_species') or ''}"
    if "貓" in source or ("cat" in source.lower() and "dog" not in source.lower()):
        return "Cat"
    if "cat-dog" in source.lower() or "貓狗" in source:
        return "Dog/Cat"
    if "狗" in source or "dog" in source.lower() or row.get("pet_species") == "all_pets":
        return "Dog"
    return "Dog/Cat"


def normalize_existing(value: str) -> str:
    value = re.sub(r"\bBest\s*Partner\b", "BestPartner", value, flags=re.I)
    value = re.sub(r"\bJapanese\s+Dog\s+Gear\s*[–-]?\s*[A-Z]{2}\b", "Pet Gear", value, flags=re.I)
    value = re.sub(r"\bBestPartner\s+BestPartner\b", "BestPartner", value)
    value = re.sub(r"\b(Dog|Cat|Dog/Cat)\s+\1\b", r"\1", value, flags=re.I)
    value = re.sub(r"\s+", " ", value).strip(" -–—")
    return value


def translate_from_source(row: dict[str, Any]) -> str:
    source = str(row.get("name_zh") or row.get("name") or "").strip()
    existing = normalize_existing(str(row.get("name_en") or ""))
    species = species_label(row)
    existing = normalize_existing(str(row.get("name_en") or ""))
    generic_existing = bool(re.search(r"Japanese Dog Gear|\bPet Gear\b", existing, re.I))
    if existing and not CJK_RE.search(existing) and not generic_existing:
        candidate = existing
        candidate = re.sub(r"^Best\s+Partner\b", "BestPartner", candidate, flags=re.I)
        candidate = re.sub(r"^BestPartner\s+(?:Dog|Cat|Dog/Cat)\s+", f"BestPartner {species} ", candidate, flags=re.I)
        if not candidate.lower().startswith("bestpartner "):
            candidate = f"BestPartner {species} {candidate}"
        if not CJK_RE.search(candidate):
            return re.sub(r"\s+", " ", candidate).strip()
    # Product bundles get a clear English bundle suffix and never inherit a
    # misleading single-item title.
    is_bundle = str(row.get("mofu_sku") or "").upper().startswith("MOFU-BUNDLE-")
    work = TAG_RE.sub(" ", source)
    work = re.sub(r"BestPartner|Best Partner|日本製造|日本原裝|天然|國產|專用|特惠|標準裝|家庭裝|大容量裝", " ", work, flags=re.I)
    work = re.sub(r"[【】（）()・｜|：:、，,＋+／/「」『』]", " ", work)
    # Replace Chinese/Japanese tokens using the controlled glossary.
    translated = work
    for source_term, english_term in TERM_MAP:
        translated = translated.replace(source_term, f" {english_term} ")
    # Convert common product descriptors not worth retaining in a short title.
    translated = re.sub(r"\b(?:高鐵|高鈣|低脂|高蛋白|一口|入口即化|嚐鮮|試吃|試食|原條|原隻|整隻|厚切|細切|特長|純淨|機能|健康|美毛|護眼|補血|防暴衝|減壓|透氣|雙色|酒紅配白|海軍藍配白|軍事卡其|經典黑|勃艮第酒紅|尺寸|號|号)\b", " ", translated, flags=re.I)
    weights = WEIGHT_RE.findall(source)
    size = " ".join(f"{n}{u.lower().replace('枚','pcs').replace('本','pcs').replace('個','pcs').replace('隻','pc').replace('支','pcs').replace('包','pack').replace('入','pcs').replace('粒','pcs').replace('件','pcs').replace('號','size').replace('号','size')}" for n, u in weights)
    # Keep useful English residue only when it is already clean and specific.
    residue = re.sub(r"[^A-Za-z0-9&'./+ -]", " ", translated)
    residue = re.sub(r"\s+", " ", residue).strip()
    residue = re.sub(r"^(?:BestPartner|Dog|Cat|Dog/Cat)\s+", "", residue, flags=re.I)
    if not residue or residue.lower() in {"pet gear", "gear"}:
        residue = re.sub(r"^BestPartner\s+", "", existing, flags=re.I)
        residue = re.sub(r"^(?:Dog|Cat|Dog/Cat)\s+", "", residue, flags=re.I)
    if not residue:
        residue = "Natural Pet Essential"
    if is_bundle and "bundle" not in residue.lower() and "set" not in residue.lower():
        residue = f"{residue} Bundle"
    if size and not re.search(r"\b\d+(?:\.\d+)?(?:g|kg|ml|pcs|pc|pack)\b", residue, re.I):
        residue = f"{residue} {size}"
    candidate = f"BestPartner {species} {residue}"
    candidate = re.sub(r"\s+", " ", candidate).strip()
    candidate = re.sub(r"\b(?:Dog|Cat)\s+(?:Dog|Cat)\b", lambda m: m.group(0).split()[0], candidate)
    if CJK_RE.search(candidate):
        # Last-resort safe fallback: existing English is already validated, or a
        # generic English title. Never write a string containing CJK.
        fallback = normalize_existing(existing)
        fallback = re.sub(r"\b(?:BestPartner\s+)?(?:Dog|Cat|Dog/Cat)\s+", "", fallback, flags=re.I)
        candidate = f"BestPartner {species} {fallback or 'Natural Pet Essential'}"
    if CJK_RE.search(candidate):
        raise ValueError(f"Unable to produce CJK-free name for {row.get('id')}: {candidate!r}")
    return candidate


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write updates to Supabase")
    parser.add_argument("--dry-run", action="store_true", help="print preview only")
    args = parser.parse_args()
    if args.apply == args.dry_run:
        parser.error("choose exactly one of --dry-run or --apply")
    base = os.environ.get("SUPABASE_URL", "").rstrip("/")
    query = urllib.parse.urlencode({"select": "id,name,name_zh,name_en,mofu_sku,pet_species", "order": "created_at.asc", "limit": "1000"})
    rows = api_request("GET", f"{base}/rest/v1/products?{query}")
    if not isinstance(rows, list):
        raise RuntimeError("Supabase did not return a product list")
    updates = [(row["id"], translate_from_source(row)) for row in rows]
    if any(CJK_RE.search(name) for _, name in updates):
        raise RuntimeError("Generated update set still contains CJK")
    changed = sum(1 for row, (_, name) in zip(rows, updates) if row.get("name_en") != name)
    print(f"products={len(rows)} changed={changed} cjk_candidates=0")
    for row, (_, name) in list(zip(rows, updates))[:30]:
        print(f"{row.get('mofu_sku') or row['id']} | {row.get('name_en')} -> {name}")
    if not args.apply:
        return 0
    applied = 0
    for product_id, name in updates:
        response = api_request("PATCH", f"{base}/rest/v1/products?id=eq.{urllib.parse.quote(str(product_id))}", {"name_en": name})
        if not isinstance(response, list) or len(response) != 1:
            raise RuntimeError(
                f"PATCH did not update exactly one row for {product_id}; "
                "use a service-role key or the Supabase SQL connector"
            )
        applied += 1
    print(f"updated={applied}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, ValueError, urllib.error.HTTPError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1)
