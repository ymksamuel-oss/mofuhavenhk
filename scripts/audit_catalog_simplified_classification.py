#!/usr/bin/env python3
"""Read-only audit of Simplified Chinese text that can affect catalog routing."""
from __future__ import annotations

import json
import os
import re
from collections import Counter
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "simplified_catalog_classification_audit.json"
ALIASES = [
    ("狗狗冻干食品", "狗狗冷凍脫水食品"), ("狗狗凍乾食品", "狗狗冷凍脫水食品"),
    ("猫冻干", "冷凍脫水系列"), ("貓冻干", "冷凍脫水系列"),
    ("冷冻脱水", "冷凍脫水"), ("冻干", "凍乾"), ("猫咪", "貓咪"),
    ("猫猫", "貓貓"), ("猫用", "貓用"), ("猫砂", "貓砂"),
    ("猫罐头", "貓罐頭"), ("猫罐", "貓罐"), ("猫粮", "貓糧"),
    ("干粮", "乾糧"), ("湿粮", "濕糧"), ("湿食", "濕食"),
    ("罐头", "罐頭"), ("小动物", "小動物"), ("小宠物", "小寵物"),
    ("仓鼠", "倉鼠"), ("龙猫", "龍貓"), ("荷兰猪", "荷蘭豬"),
    ("刺猬", "刺蝟"), ("飞鼠", "飛鼠"), ("厕所", "廁所"),
    ("尿垫", "尿墊"), ("清洁", "清潔"), ("营养", "營養"),
    ("训练", "訓練"), ("护理", "護理"), ("牵引", "牽引"),
    ("颈圈", "頸圈"), ("笼舍", "籠舍"), ("睡窝", "睡窩"),
    ("热卖", "熱賣"), ("优惠", "優惠"), ("鸡", "雞"), ("饭", "飯"),
    ("猫", "貓"), ("粮", "糧"), ("湿", "濕"), ("冻", "凍"),
    ("脱", "脫"), ("头", "頭"), ("垫", "墊"), ("宠", "寵"),
]
SIMPLIFIED_SIGNAL = re.compile("[猫冻湿粮头宠仓龙兰猬飞厕垫洁营训练护牵颈笼窝卖优鸡饭]")


def normalize(value: str) -> str:
    for simplified, traditional in ALIASES:
        value = value.replace(simplified, traditional)
    return value


def list_active_products() -> list[dict]:
    key = os.environ["STRIPE_SECRET_KEY"]
    products: list[dict] = []
    cursor: str | None = None
    while True:
        params: dict[str, str | int] = {"active": "true", "limit": 100}
        if cursor:
            params["starting_after"] = cursor
        response = requests.get("https://api.stripe.com/v1/products", params=params, auth=(key, ""), timeout=30)
        response.raise_for_status()
        page = response.json()
        products.extend(page["data"])
        if not page.get("has_more"):
            return products
        cursor = page["data"][-1]["id"]


def expected_zone(product: dict) -> tuple[str, str] | None:
    metadata = product.get("metadata") or {}
    text = normalize(" ".join([product.get("name") or "", product.get("description") or "", *metadata.values()])).lower()
    pet = (metadata.get("pet_suitability") or "").lower()
    product_type = (metadata.get("product_type") or "").lower()
    has_cat = "貓" in text or "cat" in text or pet in {"cat", "cats"}
    has_dog = "狗" in text or "犬" in text or "dog" in text or pet in {"dog", "dogs"}
    has_freeze = any(term in text for term in ("冷凍脫水", "凍乾", "freeze-dried", "freeze dry"))
    if product_type == "dog_dry_food":
        return "dogs", "狗狗乾糧"
    if has_freeze and has_dog and not has_cat:
        return "dogs", "狗狗冷凍脫水食品"
    if has_freeze and (has_cat or not has_dog):
        return "cats", "冷凍脫水系列"
    if has_cat and not has_dog:
        if any(term in text for term in ("罐頭", "罐罐", "濕糧", "濕食", "wet food", "canned")):
            return "cats", "貓罐罐"
        if any(term in text for term in ("貓糧", "乾糧", "dry food", "kibble")):
            return "cats", "貓乾糧"
        if any(term in text for term in ("小食", "零食", "treat", "snack", "肉乾")):
            return "cats", "貓貓小食"
    if has_dog and not has_cat:
        if any(term in text for term in ("乾糧", "狗糧", "dry food", "kibble")):
            return "dogs", "狗狗乾糧"
        if any(term in text for term in ("罐頭", "罐罐", "濕糧", "濕食", "wet food", "canned")):
            return "dogs", "狗狗罐頭及濕糧"
        if any(term in text for term in ("小食", "零食", "treat", "snack", "肉乾")):
            return "dogs", "狗狗小食"
    return None


def main() -> None:
    display_hits = []
    classification_mismatches = []
    signal_counter: Counter[str] = Counter()
    for product in list_active_products():
        metadata = product.get("metadata") or {}
        fields = {
            "name": product.get("name") or "",
            "description": product.get("description") or "",
            "name_zh": metadata.get("name_zh", ""),
            "description_zh": metadata.get("description_zh", ""),
            "specs_zh": metadata.get("specs_zh", ""),
            "tags": metadata.get("tags", ""),
            "category": metadata.get("category", ""),
            "subcategory": metadata.get("subcategory", ""),
        }
        simplified_fields = {key: value for key, value in fields.items() if SIMPLIFIED_SIGNAL.search(value)}
        if simplified_fields:
            for value in simplified_fields.values():
                signal_counter.update(SIMPLIFIED_SIGNAL.findall(value))
            display_hits.append({
                "id": product["id"],
                "name": product.get("name"),
                "mofu_import_key": metadata.get("mofu_import_key"),
                "simplified_fields": simplified_fields,
            })
        expected = expected_zone(product)
        if expected:
            current_category = metadata.get("category") or metadata.get("category_slug") or ""
            current_subcategory = metadata.get("subcategory") or metadata.get("sub_category") or ""
            if (current_category, current_subcategory) != expected:
                classification_mismatches.append({
                    "id": product["id"],
                    "name": product.get("name"),
                    "mofu_import_key": metadata.get("mofu_import_key"),
                    "current": {"category": current_category, "subcategory": current_subcategory},
                    "expected": {"category": expected[0], "subcategory": expected[1]},
                    "has_simplified_text": bool(simplified_fields),
                })
    report = {
        "active_product_count": len(list_active_products()),
        "simplified_text_product_count": len(display_hits),
        "classification_mismatch_count": len(classification_mismatches),
        "simplified_character_counts": dict(signal_counter.most_common()),
        "display_text_candidates": display_hits,
        "classification_mismatches": classification_mismatches,
    }
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "active_product_count": report["active_product_count"],
        "simplified_text_product_count": report["simplified_text_product_count"],
        "classification_mismatch_count": report["classification_mismatch_count"],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
