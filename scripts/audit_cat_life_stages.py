#!/usr/bin/env python3
"""Read-only audit for strict cat life-stage navigation."""
from __future__ import annotations

import json
import os
import re
from collections import defaultdict
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "cat_life_stage_audit.json"

KITTTEN = re.compile(r"幼貓|幼猫|kitten|子貓|子猫|0\s*[-~至]\s*12\s*(?:個月|个月)|12\s*(?:個月|个月|months?)\s*(?:以下|以內|以内|まで)|成長期", re.I)
SENIOR = re.compile(r"老貓|老猫|高齡|高龄|senior|老年|7\s*(?:歲|岁|才)\s*(?:以上|起|\+)|10\s*(?:歲|岁|才)\s*(?:以上|起|\+)|11\s*(?:歲|岁|才)\s*(?:以上|起|\+)|14\s*(?:歲|岁|才)\s*(?:以上|起|\+)|15\s*(?:歲|岁|才)\s*(?:以上|起|\+)", re.I)
ADULT = re.compile(r"成貓|成猫|adult|1\s*(?:歲|岁|才)\s*(?:以上|起|\+)|室內成貓|室内成猫", re.I)


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


def category(metadata: dict[str, str], product: dict) -> str:
    text = " ".join([product.get("name") or "", product.get("description") or "", *metadata.values()])
    if metadata.get("category") == "cats" or "貓" in text or "猫" in text or re.search(r"\bcat\b", text, re.I):
        return "cats"
    return "other"


def infer_stage(metadata: dict[str, str], text: str) -> str | None:
    explicit = (metadata.get("life_stage") or metadata.get("lifeStage") or "").lower().strip()
    if explicit in {"kitten", "幼貓", "幼猫"}:
        return "kitten"
    if explicit in {"adult", "成貓", "成猫"}:
        return "adult"
    if explicit in {"senior", "老貓", "老猫", "高齡", "高龄"}:
        return "senior"
    if KITTTEN.search(text):
        return "kitten"
    if SENIOR.search(text):
        return "senior"
    if ADULT.search(text):
        return "adult"
    return None


def main() -> None:
    groups: dict[str, list[dict]] = defaultdict(list)
    cat_total = 0
    for product in list_active_products():
        metadata = product.get("metadata") or {}
        if category(metadata, product) != "cats":
            continue
        cat_total += 1
        text = " ".join([product.get("name") or "", product.get("description") or "", *metadata.values()])
        stage = infer_stage(metadata, text)
        groups[stage or "unassigned"].append({
            "id": product["id"],
            "name": product.get("name"),
            "mofu_import_key": metadata.get("mofu_import_key"),
            "category": metadata.get("category"),
            "subcategory": metadata.get("subcategory"),
            "life_stage": metadata.get("life_stage"),
        })
    report = {
        "cat_product_count": cat_total,
        "counts": {key: len(value) for key, value in groups.items()},
        "products": groups,
    }
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"cat_product_count": cat_total, "counts": report["counts"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
