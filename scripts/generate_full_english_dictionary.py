#!/usr/bin/env python3
"""Generate the storefront's complete SKU -> pure-English product-name dictionary.

The generator is intentionally offline-first: it reads the checked-in product source
snapshot and never requires a database connection. Existing valid English names are
preserved; missing, CJK, Japanese, or generic placeholder names are generated from
Traditional Chinese product names using deterministic BestPartner vocabulary.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

CJK_RE = re.compile(r"[\u3400-\u9fff]")
JAPANESE_RE = re.compile(r"[\u3040-\u30ff]")
GENERIC_RE = re.compile(r"pet\s+lifestyle\s+accessory|japanese\s+natural\s+pet\s+treat|japanese\s+pet\s+essential", re.I)
SPEC_RE = re.compile(r"(\d+(?:\.\d+)?\s*(?:kg|g|ml|L|本|枚|個|隻|支|包|入|P))", re.I)

CURATED = {
    "4976064013897": "BestPartner Cat Thin-Cut Yellowfin Tuna Flakes 30g",
    "4976064024725": "BestPartner Cat Natural Salt-Free Crispy Dried Sardines 70g",
    "4976064015716": "BestPartner Dog Pure Chicken Breast Flakes Meal Topper 20g",
    "4976064026545": "BestPartner Hokkaido Wild Deer Venison Jerky 25g",
    "4976064025623": "BestPartner Dog Pure Horse Meat Energy Sticks 35g",
    "4976064025333": "BestPartner Dog Natural Whole Beef Hoof Dental Chew 1pc",
    "4976064024046": "BestPartner Dog Hokkaido Wild Deer Rib Bones 40g",
}

REPLACEMENTS = (
    ("黃鰭金槍魚", "Yellowfin Tuna"), ("金槍魚", "Tuna"), ("鮪", "Tuna"),
    ("鰹魚", "Bonito"), ("柴魚", "Bonito Flakes"), ("小魚乾", "Crispy Dried Sardines"),
    ("丁香魚", "Dried Sardines"), ("鱈魚", "Cod Fish"), ("三文魚", "Salmon"),
    ("鯊魚", "Shark"), ("鰻魚", "Eel"), ("鯛", "Sea Bream"),
    ("雞里肌", "Chicken Breast"), ("雞胸肉", "Chicken Breast"), ("純雞肉", "Pure Chicken"),
    ("雞肉", "Chicken"), ("雞砂肝", "Chicken Gizzard"), ("雞肝", "Chicken Liver"),
    ("雞翅", "Chicken Wings"), ("雞軟骨", "Chicken Cartilage"),
    ("牛蹄", "Whole Beef Hoof"), ("牛大筋", "Beef Tendon"), ("牛蹄筋", "Beef Tendon"),
    ("牛筋", "Beef Tendon"), ("牛舌", "Beef Tongue"), ("牛肋排", "Beef Rib Bones"),
    ("牛皮", "Natural Rawhide"), ("牛肉", "Pure Beef"), ("鹿肋骨", "Wild Deer Rib Bones"),
    ("鹿肉", "Wild Deer Venison"), ("鹿肝", "Wild Deer Liver"), ("鹿角", "Deer Antler"),
    ("馬肉", "Pure Horse Meat"), ("馬蹄筋", "Horse Hoof Tendon"), ("馬腱", "Horse Tendon"),
    ("豬耳", "Pork Ears"), ("黑豚", "Black Pork"), ("豬肉", "Pure Pork"),
    ("犛牛芝士", "Himalayan Yak Cheese"), ("芝士", "Natural Cheese"), ("起司", "Natural Cheese"),
    ("地瓜", "Japanese Sweet Potato"), ("蕃薯", "Japanese Sweet Potato"), ("甘藷", "Japanese Sweet Potato"),
    ("羊奶", "Goat Milk"), ("山羊", "Goat Milk"), ("大豆", "Soy"), ("納豆", "Natto"),
    ("豆腐", "Tofu"), ("蔓越莓", "Cranberry"), ("香蕉", "Banana"), ("蘋果", "Apple"),
    ("薄削", "Thin-Cut"), ("薄片", "Thin Slices"), ("薄切", "Thin-Cut Slices"),
    ("脆片", "Crispy Slices"), ("肉乾", "Jerky"), ("肉棒", "Meat Sticks"),
    ("肉碎", "Meat Crumble"), ("拌糧", "Meal Topper"), ("撒粉", "Meal Topper"),
    ("潔齒", "Dental Chew"), ("耐咬", "Long-Lasting Chew"), ("磨牙骨", "Dental Chew Bone"),
    ("凍乾", "Freeze-Dried"), ("能量棒", "Energy Sticks"), ("方塊", "Cubes"),
    ("小方塊", "Mini Cubes"), ("鬆餅", "Waffle"), ("小饅頭", "Mini Buns"),
    ("餅", "Baked Treats"), ("胸背帶", "No-Pull Harness"), ("牽引帶", "Durable Leash"),
    ("牽引繩", "Durable Leash"), ("頸圈", "Safety Collar"), ("拾便袋", "Waste Bags"),
    ("托特包", "Canvas Walk Tote Bag"),
)


def safe(value: object) -> str:
    text = str(value or "").strip()
    return text if text and not CJK_RE.search(text) and not JAPANESE_RE.search(text) and not GENERIC_RE.search(text) else ""


def spec_from(source: str) -> str:
    match = SPEC_RE.search(source)
    if not match:
        return ""
    value = re.sub(r"\s+", "", match.group(1))
    value = re.sub(r"(?:本|枚|個|支|包)入", "pcs", value)
    value = value.replace("隻入", "pc").replace("P入", "packs")
    value = re.sub(r"[本枚個支包]", "pcs", value).replace("P", "packs")
    return value


def generate(source: str, species: str = "") -> str:
    source = str(source or "").strip()
    animal = "Cat" if re.search(r"貓|猫", source) or species == "cat" else "Dog"
    if species == "cat-dog":
        animal = "Dog/Cat"
    words: list[str] = []
    for zh, en in REPLACEMENTS:
        if zh in source and en not in words:
            words.append(en)
    if not words:
        words = ["Natural Pet Food"]
    result = f"BestPartner {animal} {' '.join(words)}" \
        f" {spec_from(source)}"
    return re.sub(r"\s+", " ", CJK_RE.sub("", result)).strip()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=Path("src/data/product-english-source.json"))
    parser.add_argument("--output", type=Path, default=Path("src/data/product-english-dictionary.json"))
    args = parser.parse_args()
    rows = json.loads(args.source.read_text(encoding="utf-8"))
    mapping: dict[str, str] = {}
    generated = 0
    for row in rows:
        sku = str(row.get("mofu_sku") or row.get("sku") or "").strip()
        if not sku:
            continue
        source = str(row.get("name_zh") or row.get("name") or "").strip()
        candidate = CURATED.get(sku) or safe(row.get("name_en")) or generate(source, str(row.get("pet_species") or ""))
        if not safe(candidate):
            raise ValueError(f"Could not produce safe English name for SKU {sku}")
        mapping[sku] = candidate
        if candidate != row.get("name_en"):
            generated += 1
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(mapping, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"source_rows": len(rows), "dictionary_entries": len(mapping), "generated_or_curated": generated, "output": str(args.output)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
