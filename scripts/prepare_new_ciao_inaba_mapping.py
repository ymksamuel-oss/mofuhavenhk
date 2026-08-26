"""Build the audited mapping for the new CIAO and Inaba cat-can intake.

This is intentionally data-only: items without readable cost are excluded, and no
Stripe operation occurs here. Retail pricing follows the agreed rule exactly:
CNY × 1.1654 ÷ (1 − 45%), then round upward to the next HKD x.90.
"""
from __future__ import annotations

import json
from decimal import Decimal, ROUND_FLOOR
from pathlib import Path

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
OUTPUT_PATH = ROOT / "new_ciao_inaba_cans_mapping.json"
FX = Decimal("1.1654")
TARGET_MARGIN = Decimal("0.45")
PREFIX = "ciao-inaba-cans-2026::"


def retail_price(cny_cost: str) -> tuple[Decimal, Decimal]:
    raw_hkd = Decimal(cny_cost) * FX / (Decimal("1") - TARGET_MARGIN)
    base = raw_hkd.to_integral_value(rounding=ROUND_FLOOR)
    rounded = base + Decimal("0.90")
    if rounded < raw_hkd:
        rounded += Decimal("1.00")
    return raw_hkd, rounded


# Each tuple: sku, source image, brand, Chinese name, English name, specification, CNY cost, in-stock flag.
CANDIDATES = [
    ("CIC-01", "IMG_1783.PNG", "CIAO とろみ", "鮪魚魷魚濃湯貓罐頭", "Tuna & Squid Thick Gravy Cat Can", "單罐", "11.80", True),
    ("CIC-02", "IMG_1784.PNG", "CIAO とろみ", "鰹魚高湯雞肉鮪魚蟹柳濃湯貓罐頭", "Bonito Broth Chicken, Tuna & Crab Stick Thick Gravy Cat Can", "單罐", "13.80", True),
    ("CIC-03", "IMG_1785.PNG", "CIAO とろみ", "鰹魚高湯雞肉鰹魚扇貝濃湯貓罐頭", "Bonito Broth Chicken, Bonito & Scallop Thick Gravy Cat Can", "單罐", "10.80", True),
    ("CIC-04", "IMG_1787.PNG", "CIAO とろみ", "烤鰹魚雞肉柴魚片濃湯貓罐頭", "Grilled Bonito, Chicken & Bonito Flakes Thick Gravy Cat Can", "單罐", "11.80", True),
    ("CIC-05", "IMG_1788.PNG", "CIAO とろみ", "鰹魚高湯雞肉鮪魚魷魚濃湯貓罐頭", "Bonito Broth Chicken, Tuna & Squid Thick Gravy Cat Can", "單罐", "10.80", True),
    ("CIC-06", "IMG_1789.PNG", "CIAO とろみ", "下泌尿道配慮雞肉鮪魚扇貝濃湯貓罐頭", "Lower Urinary-Tract Care Chicken, Tuna & Scallop Thick Gravy Cat Can", "單罐", "11.80", True),
    ("CIC-07", "IMG_1791.PNG", "CIAO とろみ", "奶油濃湯雞肉鮪魚蟹柳貓罐頭", "Creamy Chicken, Tuna & Crab Stick Cat Can", "單罐", "11.80", True),
    ("CIC-08", "IMG_1792.PNG", "CIAO とろみ", "奶油濃湯雞肉鰹魚柴魚片貓罐頭", "Creamy Chicken, Bonito & Bonito Flakes Cat Can", "單罐", "13.80", True),
    ("CIC-09", "IMG_1793.PNG", "CIAO とろみ", "11歲以上鮪魚扇貝奶油濃湯貓罐頭", "Senior 11+ Tuna & Scallop Creamy Cat Can", "單罐", "11.80", True),
    ("CIC-10", "IMG_1794.PNG", "CIAO とろみ", "14歲以上鮪魚扇貝奶油濃湯貓罐頭", "Senior 14+ Tuna & Scallop Creamy Cat Can", "單罐", "13.80", False),
    ("CIC-11", "IMG_1795.PNG", "CIAO", "雞肉烤鰹魚柴魚片貓罐頭", "Chicken, Grilled Bonito & Bonito Flakes Cat Can", "單罐", "12.80", True),
    ("CIC-12", "IMG_1796.PNG", "CIAO", "雞肉甜蝦小銀魚貓罐頭", "Chicken, Sweet Shrimp & Shirasu Cat Can", "單罐", "13.80", True),
    ("CIC-13", "IMG_1797.PNG", "CIAO", "鰹魚柴魚片貓罐頭", "Bonito & Bonito Flakes Cat Can", "單罐", "13.80", True),
    ("CIC-14", "IMG_1798.PNG", "CIAO", "烤鰹魚鮪魚雞肉貓罐頭", "Grilled Bonito, Tuna & Chicken Cat Can", "單罐", "15.80", True),
    ("CIC-15", "IMG_1799.PNG", "CIAO", "雞肉扇貝柱貓罐頭", "Chicken & Scallop Cat Can", "單罐", "13.80", True),
    ("CIC-16", "IMG_1800.PNG", "CIAO", "雞肉蟹柳柴魚片貓罐頭", "Chicken, Crab Stick & Bonito Flakes Cat Can", "單罐", "13.80", True),
    ("CIC-17", "IMG_1801.PNG", "CIAO", "雞肉蟹柳貓罐頭", "Chicken & Crab Stick Cat Can", "單罐", "13.80", True),
    ("CIC-18", "IMG_1804.PNG", "CIAO", "鮪魚白肉扇貝柱貓罐頭", "Tuna White Meat & Scallop Cat Can", "單罐", "12.80", True),
    ("CIC-19", "IMG_1806.PNG", "CIAO", "11歲以上鰹魚白肉貓罐頭", "Senior 11+ Bonito White Meat Cat Can", "單罐", "15.80", False),
    ("CIC-20", "IMG_1807.PNG", "CIAO", "11歲以上鮪魚白肉貓罐頭", "Senior 11+ Tuna White Meat Cat Can", "單罐", "15.80", True),
    ("CIC-21", "IMG_1809.PNG", "CIAO", "14歲以上鮪魚白肉小銀魚貓罐頭", "Senior 14+ Tuna White Meat & Shirasu Cat Can", "單罐", "15.80", True),
    ("CIC-22", "IMG_1810.PNG", "CIAO", "14歲以上鰹魚柴魚片貓罐頭", "Senior 14+ Bonito & Bonito Flakes Cat Can", "單罐", "15.80", True),
    ("CIC-23", "IMG_1811.PNG", "Inaba かつまぐろ", "鮪魚雞肉貓罐頭", "Tuna & Chicken Cat Can", "85g／單罐", "6.81", True),
    ("CIC-24", "IMG_1812.PNG", "Inaba かつまぐろ", "鮪魚貓罐頭", "Tuna Cat Can", "85g／單罐", "6.81", True),
    ("CIC-25", "IMG_1813.PNG", "Inaba かつまぐろ", "鮪魚三文魚貓罐頭", "Tuna & Salmon Cat Can", "85g／單罐", "6.81", True),
    ("CIC-26", "IMG_1814.PNG", "Inaba かつまぐろ", "鮪魚小銀魚貓罐頭", "Tuna & Shirasu Cat Can", "85g／單罐", "6.81", True),
    ("CIC-27", "IMG_1816.PNG", "Inaba かつまぐろ", "多口味隨機混拼貓罐頭", "Assorted Random-Flavour Cat Can Pack", "85g × 6罐", "29.42", True),
    ("CIC-28", "IMG_1817.PNG", "Inaba かつまぐろ", "高齡貓鮪魚貓罐頭", "Senior Cat Tuna Can", "85g／單罐", "6.81", True),
]

SKIPPED_SOURCES = [
    {"source_image": "IMG_1786.PNG", "reason": "成本未能確認；按用戶指示暫不處理"},
    {"source_image": "IMG_1790.PNG", "reason": "成本未能確認；按用戶指示暫不處理"},
    {"source_image": "IMG_1802.PNG", "reason": "成本未能確認；按用戶指示暫不處理"},
    {"source_image": "IMG_1803.PNG", "reason": "成本未能確認；按用戶指示暫不處理"},
    {"source_image": "IMG_1805.PNG", "reason": "成本未能確認；按用戶指示暫不處理"},
    {"source_image": "IMG_1808.PNG", "reason": "成本未能確認；按用戶指示暫不處理"},
    {"source_image": "IMG_1815.PNG", "reason": "與 IMG_1812 為同一 Inaba かつまぐろ 85g 鮪魚單罐；合併為 CIC-24"},
]


def main() -> None:
    products = []
    for sku, source_image, brand, name_zh, name_en, spec, cny_cost, in_stock in CANDIDATES:
        raw_hkd, retail_hkd = retail_price(cny_cost)
        products.append({
            "sku": sku,
            "mofu_import_key": f"{PREFIX}{sku.lower()}",
            "brand": brand,
            "name_zh": name_zh,
            "name_en": name_en,
            "spec": spec,
            "category": "cats",
            "subcategory": "貓罐罐",
            "product_type": "cat_wet_food",
            "source_image": source_image,
            "cny_cost": cny_cost,
            "fx_cny_to_hkd": str(FX),
            "target_product_margin": str(TARGET_MARGIN),
            "direct_to_hk_cost_hkd": "0.00",
            "unrounded_retail_hkd": f"{raw_hkd:.6f}",
            "retail_hkd": f"{retail_hkd:.2f}",
            "retail_rounding_rule": "ceil_to_next_x.90_v1",
            "compare_at_price_hkd": None,
            "in_stock": in_stock,
            "stock_note": "來源圖顯示缺貨" if not in_stock else "來源圖未見缺貨標記",
            "cleaned_image_file": None,
            "cdn_url": None,
            "image_state": "pending_preserving_cleanup",
        })
    output = {
        "schema": "new-ciao-inaba-cans-v1",
        "pricing_rule": "CNY × 1.1654 ÷ (1 − 45%), direct-to-HK cost HK$0, rounded upward to next HKD x.90",
        "source_image_count": 35,
        "mapped_product_count": len(products),
        "skipped_source_count": len(SKIPPED_SOURCES),
        "products": products,
        "skipped_sources": SKIPPED_SOURCES,
    }
    OUTPUT_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT_PATH), "mapped_product_count": len(products), "skipped_source_count": len(SKIPPED_SOURCES)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
