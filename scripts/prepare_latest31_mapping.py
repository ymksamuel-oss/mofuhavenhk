"""Generate the deterministic mapping for the final 31-image catalog batch.

The mapping is source-controlled, never uses generated asset counts as SKU counts,
and records exactly which existing Stripe products may receive a main-image refresh.
"""
from __future__ import annotations

import json
from decimal import Decimal, ROUND_CEILING
from pathlib import Path

ROOT = Path("/home/ubuntu/mofuhavenhk-github")
OUTPUT = ROOT / "latest_31_product_mapping.json"
CNY_TO_HKD = Decimal("1.1654")
TARGET_MARGIN = Decimal("0.45")


def retail_price(cost_cny: str) -> tuple[str, str]:
    """Return exact pre-rounding price and an upward-only X.90 retail price."""
    unrounded = Decimal(cost_cny) * CNY_TO_HKD / (Decimal("1") - TARGET_MARGIN)
    retail = (unrounded - Decimal("0.90")).to_integral_value(rounding=ROUND_CEILING) + Decimal("0.90")
    return f"{unrounded:.2f}", f"{retail:.2f}"


def image_url(token: str) -> str:
    return f"https://files.manuscdn.com/user_upload_by_module/session_file/310519663854897952/{token}.png"


def new_item(
    *, sku: str, source_images: list[str], image_file: str, image_token: str,
    brand: str, name_zh: str, name_en: str, description_zh: str, description_en: str,
    spec: str, product_type: str, subcategory: str, family: str, option_zh: str,
    option_en: str, life_stage_zh: str, life_stage_en: str, cost_cny: str, tags: list[str],
) -> dict:
    unrounded, retail = retail_price(cost_cny)
    return {
        "action": "create",
        "sku": sku,
        "import_key": f"latest31-2026::{sku}",
        "source_images": source_images,
        "image_file": image_file,
        "image_cdn_url": image_url(image_token),
        "brand": brand,
        "category": "cats",
        "subcategory": subcategory,
        "product_type": product_type,
        "family": family,
        "option_label_zh": option_zh,
        "option_label_en": option_en,
        "name_zh": name_zh,
        "name_en": name_en,
        "description_zh": description_zh,
        "description_en": description_en,
        "specs_zh": f"規格：{spec}｜日本原裝零售包裝",
        "specs_en": f"Size: {spec} | Japanese retail packaging",
        "life_stage_zh": life_stage_zh,
        "life_stage_en": life_stage_en,
        "source_cost_cny": cost_cny,
        "landed_cost_hkd": "0.00",
        "unrounded_retail_hkd": unrounded,
        "retail_hkd": retail,
        "tags": tags,
        "in_stock": True,
    }


def update_item(
    *, source_image: str, image_file: str, image_token: str, existing_import_key: str,
    expected_name_zh: str, expected_name_en: str, expected_retail_hkd: str,
) -> dict:
    return {
        "action": "update_existing_image",
        "source_images": [source_image],
        "image_file": image_file,
        "image_cdn_url": image_url(image_token),
        "existing_import_key": existing_import_key,
        "expected_name_zh": expected_name_zh,
        "expected_name_en": expected_name_en,
        "expected_retail_hkd": expected_retail_hkd,
        "reason": "Same verified SKU; refresh only the faithful cleaned white-background main image. Do not create or replace an existing Price.",
    }


DRY = "貓乾糧"
TREATS = "貓貓小食"
AIM30 = "Sunrise AIM30"
MONPETIT = "Purina Mon Petit"


def main() -> None:
    created = [
        new_item(
            sku="aim30-senior-11plus-chicken-600g", source_images=["IMG_1750.jpg"],
            image_file="aim30-senior-11plus-chicken-600g.png", image_token="FBRYUvJpoKUGxgTs",
            brand=AIM30, name_zh="AIM30 室內高齡貓 11 歲以上 雞肉味乾糧 600g",
            name_en="AIM30 Indoor Senior Cat Food 11+ Chicken Flavour 600g",
            description_zh="日本原裝 AIM30 室內高齡貓配方，適合 11 歲以上貓咪；雞肉味，600g。",
            description_en="Japanese AIM30 indoor senior cat formula for cats aged 11 years and over, chicken flavour, 600g.",
            spec="600g", product_type="cat dry food", subcategory=DRY, family="single",
            option_zh="11 歲以上｜雞肉味｜600g", option_en="11+ | Chicken | 600g",
            life_stage_zh="11 歲以上高齡貓", life_stage_en="Senior cats aged 11+", cost_cny="168.00",
            tags=["AIM30", "貓乾糧", "室內貓", "11歲以上", "雞肉味", "600g"],
        ),
        new_item(
            sku="aim30-indoor-adult-chicken-600g", source_images=["IMG_1749.jpg"],
            image_file="aim30-indoor-adult-chicken-600g.png", image_token="PaSyarkHqvovQkDI",
            brand=AIM30, name_zh="AIM30 室內成貓 雞肉味乾糧 600g",
            name_en="AIM30 Indoor Adult Cat Food Chicken Flavour 600g",
            description_zh="日本原裝 AIM30 室內成貓配方，雞肉味，600g。",
            description_en="Japanese AIM30 indoor adult cat formula, chicken flavour, 600g.",
            spec="600g", product_type="cat dry food", subcategory=DRY, family="aim30-indoor-adult-600g",
            option_zh="雞肉味｜600g", option_en="Chicken | 600g",
            life_stage_zh="11 歲以下成貓", life_stage_en="Adult cats under 11 years", cost_cny="168.00",
            tags=["AIM30", "貓乾糧", "室內貓", "成貓", "雞肉味", "600g"],
        ),
        new_item(
            sku="aim30-indoor-adult-fish-600g", source_images=["IMG_1751.jpg"],
            image_file="aim30-indoor-adult-fish-600g.png", image_token="GOEOzdgufqMEuMoV",
            brand=AIM30, name_zh="AIM30 室內成貓 鮮魚味乾糧 600g",
            name_en="AIM30 Indoor Adult Cat Food Fish Flavour 600g",
            description_zh="日本原裝 AIM30 室內成貓配方，鮮魚味，600g。",
            description_en="Japanese AIM30 indoor adult cat formula, fish flavour, 600g.",
            spec="600g", product_type="cat dry food", subcategory=DRY, family="aim30-indoor-adult-600g",
            option_zh="鮮魚味｜600g", option_en="Fish | 600g",
            life_stage_zh="11 歲以下成貓", life_stage_en="Adult cats under 11 years", cost_cny="168.00",
            tags=["AIM30", "貓乾糧", "室內貓", "成貓", "鮮魚味", "600g"],
        ),
        new_item(
            sku="aim30-indoor-kidney-chicken-600g", source_images=["IMG_1747.jpg"],
            image_file="aim30-indoor-kidney-chicken-600g.png", image_token="bdYIsDTFccmAwTem",
            brand=AIM30, name_zh="AIM30 室內成貓 腎臟健康照護 雞肉味乾糧 600g",
            name_en="AIM30 Indoor Adult Cat Food Kidney Health Care Chicken Flavour 600g",
            description_zh="日本原裝 AIM30 室內成貓腎臟健康照護配方，雞肉味，600g；非處方或治療食品。",
            description_en="Japanese AIM30 indoor adult cat formula labelled for kidney health care, chicken flavour, 600g; not a prescription or treatment food.",
            spec="600g", product_type="cat dry food", subcategory=DRY, family="single",
            option_zh="腎臟健康照護｜雞肉味｜600g", option_en="Kidney Health Care | Chicken | 600g",
            life_stage_zh="11 歲以下成貓", life_stage_en="Adult cats under 11 years", cost_cny="105.00",
            tags=["AIM30", "貓乾糧", "室內貓", "成貓", "腎臟健康照護", "雞肉味", "600g"],
        ),
        new_item(
            sku="aim30-senior-15plus-kidney-chicken-600g", source_images=["IMG_1745.jpg"],
            image_file="aim30-senior-15plus-kidney-chicken-600g.png", image_token="uSxNBrCThAMtCgDb",
            brand=AIM30, name_zh="AIM30 室內高齡貓 15 歲以上 腎臟健康照護 雞肉味乾糧 600g",
            name_en="AIM30 Indoor Senior Cat Food 15+ Kidney Health Care Chicken Flavour 600g",
            description_zh="日本原裝 AIM30 室內高齡貓腎臟健康照護配方，適合 15 歲以上貓咪；雞肉味，600g；非處方或治療食品。",
            description_en="Japanese AIM30 indoor senior cat formula labelled for kidney health care for cats aged 15 years and over, chicken flavour, 600g; not a prescription or treatment food.",
            spec="600g", product_type="cat dry food", subcategory=DRY, family="single",
            option_zh="15 歲以上｜腎臟健康照護｜雞肉味｜600g", option_en="15+ | Kidney Health Care | Chicken | 600g",
            life_stage_zh="15 歲以上高齡貓", life_stage_en="Senior cats aged 15+", cost_cny="168.00",
            tags=["AIM30", "貓乾糧", "室內貓", "15歲以上", "腎臟健康照護", "雞肉味", "600g"],
        ),
        new_item(
            sku="aim30-senior-15plus-fish-600g", source_images=["IMG_1754.jpg", "IMG_1746.jpg"],
            image_file="aim30-senior-15plus-fish-600g-v2.png", image_token="cCswWfPInwqyfjFt",
            brand=AIM30, name_zh="AIM30 室內高齡貓 15 歲以上 腎臟健康照護 鮮魚味乾糧 600g",
            name_en="AIM30 Indoor Senior Cat Food 15+ Kidney Health Care Fish Flavour 600g",
            description_zh="日本原裝 AIM30 室內高齡貓腎臟健康照護配方，適合 15 歲以上貓咪；鮮魚味，600g；非處方或治療食品。",
            description_en="Japanese AIM30 indoor senior cat formula labelled for kidney health care for cats aged 15 years and over, fish flavour, 600g; not a prescription or treatment food.",
            spec="600g", product_type="cat dry food", subcategory=DRY, family="single",
            option_zh="15 歲以上｜腎臟健康照護｜鮮魚味｜600g", option_en="15+ | Kidney Health Care | Fish | 600g",
            life_stage_zh="15 歲以上高齡貓", life_stage_en="Senior cats aged 15+", cost_cny="168.00",
            tags=["AIM30", "貓乾糧", "室內貓", "15歲以上", "腎臟健康照護", "鮮魚味", "600g"],
        ),
        new_item(
            sku="aim30-senior-15plus-chicken-600g", source_images=["IMG_1753.jpg"],
            image_file="aim30-senior-15plus-chicken-600g.png", image_token="QDewAYOshhldfwWK",
            brand=AIM30, name_zh="AIM30 室內高齡貓 15 歲以上 雞肉味乾糧 600g",
            name_en="AIM30 Indoor Senior Cat Food 15+ Chicken Flavour 600g",
            description_zh="日本原裝 AIM30 室內高齡貓配方，適合 15 歲以上貓咪；雞肉味，600g。",
            description_en="Japanese AIM30 indoor senior cat formula for cats aged 15 years and over, chicken flavour, 600g.",
            spec="600g", product_type="cat dry food", subcategory=DRY, family="single",
            option_zh="15 歲以上｜雞肉味｜600g", option_en="15+ | Chicken | 600g",
            life_stage_zh="15 歲以上高齡貓", life_stage_en="Senior cats aged 15+", cost_cny="168.00",
            tags=["AIM30", "貓乾糧", "室內貓", "15歲以上", "雞肉味", "600g"],
        ),
        new_item(
            sku="aim30-senior-11plus-fish-600g", source_images=["IMG_1752.jpg"],
            image_file="aim30-senior-11plus-fish-600g.png", image_token="cURmTDJVlKBuADYC",
            brand=AIM30, name_zh="AIM30 室內高齡貓 11 歲以上 鮮魚味乾糧 600g",
            name_en="AIM30 Indoor Senior Cat Food 11+ Fish Flavour 600g",
            description_zh="日本原裝 AIM30 室內高齡貓配方，適合 11 歲以上貓咪；鮮魚味，600g。",
            description_en="Japanese AIM30 indoor senior cat formula for cats aged 11 years and over, fish flavour, 600g.",
            spec="600g", product_type="cat dry food", subcategory=DRY, family="single",
            option_zh="11 歲以上｜鮮魚味｜600g", option_en="11+ | Fish | 600g",
            life_stage_zh="11 歲以上高齡貓", life_stage_en="Senior cats aged 11+", cost_cny="168.00",
            tags=["AIM30", "貓乾糧", "室內貓", "11歲以上", "鮮魚味", "600g"],
        ),
        new_item(
            sku="aim30-neutered-indoor-chicken-1-2kg", source_images=["IMG_1748.jpg"],
            image_file="aim30-neutered-indoor-chicken-1-2kg.png", image_token="AijttRZRvbFzUyPp",
            brand=AIM30, name_zh="AIM30 室內已絕育成貓 雞肉味乾糧 1.2kg",
            name_en="AIM30 Indoor Spayed and Neutered Adult Cat Food Chicken Flavour 1.2kg",
            description_zh="日本原裝 AIM30 室內已絕育成貓配方，雞肉味，1.2kg。",
            description_en="Japanese AIM30 indoor adult cat formula for spayed and neutered cats, chicken flavour, 1.2kg.",
            spec="1.2kg", product_type="cat dry food", subcategory=DRY, family="single",
            option_zh="已絕育成貓｜雞肉味｜1.2kg", option_en="Spayed and Neutered Adult | Chicken | 1.2kg",
            life_stage_zh="已絕育成貓", life_stage_en="Spayed and neutered adult cats", cost_cny="197.00",
            tags=["AIM30", "貓乾糧", "室內貓", "已絕育", "成貓", "雞肉味", "1.2kg"],
        ),
        new_item(
            sku="monpetit-crispy-kiss-fish-chicken-catnip-24g", source_images=["IMG_1761.jpg"],
            image_file="monpetit-crispy-kiss-fish-chicken-thin-24g.png", image_token="gaahbTiEtjzuSimc",
            brand=MONPETIT, name_zh="Mon Petit Crispy Kiss 鮮魚雞肉貓薄荷味貓咪小食 24g",
            name_en="Mon Petit Crispy Kiss Fish and Chicken with Catnip Cat Treats 24g",
            description_zh="日本原裝 Mon Petit Crispy Kiss 貓咪小食，鮮魚、雞肉及貓薄荷風味，24g。",
            description_en="Japanese Mon Petit Crispy Kiss cat treats in fish and chicken with catnip flavour, 24g.",
            spec="24g（8 小包）", product_type="cat treats", subcategory=TREATS, family="single",
            option_zh="鮮魚、雞肉及貓薄荷｜24g", option_en="Fish, Chicken and Catnip | 24g",
            life_stage_zh="全齡貓", life_stage_en="All life stages", cost_cny="13.90",
            tags=["Mon Petit", "Crispy Kiss", "貓咪小食", "鮮魚", "雞肉", "貓薄荷", "24g"],
        ),
        new_item(
            sku="monpetit-crispy-kiss-luxury-fish-24g", source_images=["IMG_1760.jpg"],
            image_file="monpetit-crispy-kiss-luxury-fish-24g.png", image_token="prMAsbfZUEspeMAO",
            brand=MONPETIT, name_zh="Mon Petit Crispy Kiss 奢華鮮魚味貓咪小食 24g",
            name_en="Mon Petit Crispy Kiss Luxury Fish Flavour Cat Treats 24g",
            description_zh="日本原裝 Mon Petit Crispy Kiss 奢華系列貓咪小食，鮮魚味，24g。",
            description_en="Japanese Mon Petit Crispy Kiss Luxury range cat treats, fish flavour, 24g.",
            spec="24g（8 小包）", product_type="cat treats", subcategory=TREATS, family="monpetit-crispy-kiss-luxury-24g",
            option_zh="奢華鮮魚味｜24g", option_en="Luxury Fish | 24g",
            life_stage_zh="全齡貓", life_stage_en="All life stages", cost_cny="13.90",
            tags=["Mon Petit", "Crispy Kiss", "貓咪小食", "奢華系列", "鮮魚味", "24g"],
        ),
        new_item(
            sku="monpetit-crispy-kiss-luxury-chicken-24g", source_images=["IMG_1759.jpg"],
            image_file="monpetit-crispy-kiss-luxury-chicken-24g.png", image_token="KjUxsLNTnLfUrceh",
            brand=MONPETIT, name_zh="Mon Petit Crispy Kiss 奢華雞肉味貓咪小食 24g",
            name_en="Mon Petit Crispy Kiss Luxury Chicken Flavour Cat Treats 24g",
            description_zh="日本原裝 Mon Petit Crispy Kiss 奢華系列貓咪小食，雞肉味，24g。",
            description_en="Japanese Mon Petit Crispy Kiss Luxury range cat treats, chicken flavour, 24g.",
            spec="24g（8 小包）", product_type="cat treats", subcategory=TREATS, family="monpetit-crispy-kiss-luxury-24g",
            option_zh="奢華雞肉味｜24g", option_en="Luxury Chicken | 24g",
            life_stage_zh="全齡貓", life_stage_en="All life stages", cost_cny="13.90",
            tags=["Mon Petit", "Crispy Kiss", "貓咪小食", "奢華系列", "雞肉味", "24g"],
        ),
        new_item(
            sku="monpetit-crispy-kiss-cheese-chicken-30g", source_images=["IMG_1755.jpg"],
            image_file="monpetit-crispy-kiss-cheese-chicken-30g.png", image_token="ADvlpyexWSELXaaZ",
            brand=MONPETIT, name_zh="Mon Petit Crispy Kiss 芝士及雞肉味貓咪小食 30g",
            name_en="Mon Petit Crispy Kiss Cheese and Chicken Flavour Cat Treats 30g",
            description_zh="日本原裝 Mon Petit Crispy Kiss 貓咪小食，芝士及雞肉味，30g。",
            description_en="Japanese Mon Petit Crispy Kiss cat treats, cheese and chicken flavour, 30g.",
            spec="30g（3g × 10 小包）", product_type="cat treats", subcategory=TREATS, family="monpetit-crispy-kiss-30g",
            option_zh="芝士及雞肉味｜30g", option_en="Cheese and Chicken | 30g",
            life_stage_zh="全齡貓", life_stage_en="All life stages", cost_cny="13.90",
            tags=["Mon Petit", "Crispy Kiss", "貓咪小食", "芝士", "雞肉", "30g"],
        ),
        new_item(
            sku="monpetit-crispy-kiss-meat-variety-144g", source_images=["IMG_1768.jpg"],
            image_file="monpetit-crispy-kiss-meat-variety-144g.png", image_token="TYACCVRaZBCIYQOU",
            brand=MONPETIT, name_zh="Mon Petit Crispy Kiss 肉類精選綜合包貓咪小食 144g",
            name_en="Mon Petit Crispy Kiss Meat Selection Variety Pack Cat Treats 144g",
            description_zh="日本原裝 Mon Petit Crispy Kiss 肉類精選綜合包，包含吞拿魚、火雞及芝士風味，144g。",
            description_en="Japanese Mon Petit Crispy Kiss meat selection variety pack with tuna, turkey and cheese flavours, 144g.",
            spec="144g（6g × 24 小包）", product_type="cat treats", subcategory=TREATS, family="monpetit-crispy-kiss-variety-144g",
            option_zh="肉類精選綜合包｜144g", option_en="Meat Selection Variety Pack | 144g",
            life_stage_zh="全齡貓", life_stage_en="All life stages", cost_cny="59.90",
            tags=["Mon Petit", "Crispy Kiss", "貓咪小食", "肉類精選", "綜合包", "144g"],
        ),
        new_item(
            sku="monpetit-crispy-kiss-seafood-chicken-variety-144g", source_images=["IMG_1767.jpg"],
            image_file="monpetit-crispy-kiss-seafood-chicken-variety-144g.png", image_token="ikhlllGwCexGBVuS",
            brand=MONPETIT, name_zh="Mon Petit Crispy Kiss 海鮮及雞肉綜合包貓咪小食 144g",
            name_en="Mon Petit Crispy Kiss Seafood and Chicken Variety Pack Cat Treats 144g",
            description_zh="日本原裝 Mon Petit Crispy Kiss 海鮮及雞肉綜合包，包裝所示為多款風味小包，144g。",
            description_en="Japanese Mon Petit Crispy Kiss seafood and chicken variety pack with multiple flavours shown on the package, 144g.",
            spec="144g（6g × 24 小包）", product_type="cat treats", subcategory=TREATS, family="monpetit-crispy-kiss-variety-144g",
            option_zh="海鮮及雞肉綜合包｜144g", option_en="Seafood and Chicken Variety Pack | 144g",
            life_stage_zh="全齡貓", life_stage_en="All life stages", cost_cny="59.90",
            tags=["Mon Petit", "Crispy Kiss", "貓咪小食", "海鮮", "雞肉", "綜合包", "144g"],
        ),
        new_item(
            sku="monpetit-crispy-kiss-fish-select-30g", source_images=["IMG_1757.jpg"],
            image_file="monpetit-crispy-kiss-fish-select-30g-v2.png", image_token="nIpFuIBHiGEguZwU",
            brand=MONPETIT, name_zh="Mon Petit Crispy Kiss 鮮魚精選貓咪小食 30g",
            name_en="Mon Petit Crispy Kiss Fish Select Cat Treats 30g",
            description_zh="日本原裝 Mon Petit Crispy Kiss 鮮魚精選貓咪小食，30g。",
            description_en="Japanese Mon Petit Crispy Kiss fish select cat treats, 30g.",
            spec="30g（3g × 10 小包）", product_type="cat treats", subcategory=TREATS, family="monpetit-crispy-kiss-30g",
            option_zh="鮮魚精選｜30g", option_en="Fish Select | 30g",
            life_stage_zh="全齡貓", life_stage_en="All life stages", cost_cny="13.90",
            tags=["Mon Petit", "Crispy Kiss", "貓咪小食", "鮮魚", "30g"],
        ),
        new_item(
            sku="monpetit-crispy-kiss-seafood-30g", source_images=["IMG_1756.jpg"],
            image_file="monpetit-crispy-kiss-seafood-30g-v2.png", image_token="pRpYaNLBWjHUrGLX",
            brand=MONPETIT, name_zh="Mon Petit Crispy Kiss 海鮮味貓咪小食 30g",
            name_en="Mon Petit Crispy Kiss Seafood Flavour Cat Treats 30g",
            description_zh="日本原裝 Mon Petit Crispy Kiss 貓咪小食，海鮮味，30g。",
            description_en="Japanese Mon Petit Crispy Kiss cat treats, seafood flavour, 30g.",
            spec="30g（3g × 10 小包）", product_type="cat treats", subcategory=TREATS, family="monpetit-crispy-kiss-30g",
            option_zh="海鮮味｜30g", option_en="Seafood | 30g",
            life_stage_zh="全齡貓", life_stage_en="All life stages", cost_cny="13.90",
            tags=["Mon Petit", "Crispy Kiss", "貓咪小食", "海鮮味", "30g"],
        ),
        new_item(
            sku="monpetit-crispy-kiss-seafood-cheese-chicken-144g", source_images=["IMG_1766.jpg"],
            image_file="monpetit-crispy-kiss-seafood-cheese-chicken-144g.png", image_token="pwsMaYIuvbRfEeSC",
            brand=MONPETIT, name_zh="Mon Petit Crispy Kiss 海鮮、芝士及雞肉燒烤味綜合包貓咪小食 144g",
            name_en="Mon Petit Crispy Kiss Seafood, Cheese and Chicken Grill Variety Pack Cat Treats 144g",
            description_zh="日本原裝 Mon Petit Crispy Kiss 海鮮、芝士及雞肉燒烤味綜合包，144g。",
            description_en="Japanese Mon Petit Crispy Kiss seafood, cheese and chicken grill variety pack, 144g.",
            spec="144g（6g × 24 小包）", product_type="cat treats", subcategory=TREATS, family="monpetit-crispy-kiss-variety-144g",
            option_zh="海鮮、芝士及雞肉燒烤味綜合包｜144g", option_en="Seafood, Cheese and Chicken Grill Variety Pack | 144g",
            life_stage_zh="全齡貓", life_stage_en="All life stages", cost_cny="59.90",
            tags=["Mon Petit", "Crispy Kiss", "貓咪小食", "海鮮", "芝士", "雞肉", "綜合包", "144g"],
        ),
        new_item(
            sku="monpetit-crispy-kiss-snapper-seafood-144g", source_images=["IMG_1765.jpg"],
            image_file="monpetit-crispy-kiss-snapper-seafood-144g.png", image_token="UzIpIyDTEkzGUwBi",
            brand=MONPETIT, name_zh="Mon Petit Crispy Kiss 真鯛及海鮮綜合包貓咪小食 144g",
            name_en="Mon Petit Crispy Kiss Snapper and Seafood Assortment Cat Treats 144g",
            description_zh="日本原裝 Mon Petit Crispy Kiss 真鯛及海鮮綜合包貓咪小食，144g。",
            description_en="Japanese Mon Petit Crispy Kiss snapper and seafood assortment cat treats, 144g.",
            spec="144g（6g × 24 小包）", product_type="cat treats", subcategory=TREATS, family="monpetit-crispy-kiss-variety-144g",
            option_zh="真鯛及海鮮綜合包｜144g", option_en="Snapper and Seafood Assortment | 144g",
            life_stage_zh="全齡貓", life_stage_en="All life stages", cost_cny="59.90",
            tags=["Mon Petit", "Crispy Kiss", "貓咪小食", "真鯛", "海鮮", "綜合包", "144g"],
        ),
        new_item(
            sku="monpetit-crispy-kiss-snapper-broth-30g", source_images=["IMG_1764.jpg"],
            image_file="monpetit-crispy-kiss-snapper-broth-30g.png", image_token="LhxAGundeiamPctF",
            brand=MONPETIT, name_zh="Mon Petit Crispy Kiss 真鯛、鰹魚及小魚高湯味貓咪小食 30g",
            name_en="Mon Petit Crispy Kiss Snapper, Skipjack Tuna and Small Fish Broth Cat Treats 30g",
            description_zh="日本原裝 Mon Petit Crispy Kiss 貓咪小食，真鯛、鰹魚及小魚高湯風味，30g。",
            description_en="Japanese Mon Petit Crispy Kiss cat treats in snapper, skipjack tuna and small fish broth flavour, 30g.",
            spec="30g（3g × 10 小包）", product_type="cat treats", subcategory=TREATS, family="monpetit-crispy-kiss-30g",
            option_zh="真鯛、鰹魚及小魚高湯味｜30g", option_en="Snapper, Skipjack Tuna and Small Fish Broth | 30g",
            life_stage_zh="全齡貓", life_stage_en="All life stages", cost_cny="13.90",
            tags=["Mon Petit", "Crispy Kiss", "貓咪小食", "真鯛", "鰹魚", "小魚", "30g"],
        ),
        new_item(
            sku="monpetit-crispy-kiss-bonito-smallfish-broth-30g", source_images=["IMG_1763.jpg"],
            image_file="monpetit-crispy-kiss-bonito-smallfish-broth-30g.png", image_token="uqWrsyComfyfiyvN",
            brand=MONPETIT, name_zh="Mon Petit Crispy Kiss 鰹魚及小魚高湯味貓咪小食 30g",
            name_en="Mon Petit Crispy Kiss Bonito and Small Fish Broth Cat Treats 30g",
            description_zh="日本原裝 Mon Petit Crispy Kiss 貓咪小食，鰹魚及小魚高湯風味，30g。",
            description_en="Japanese Mon Petit Crispy Kiss cat treats in bonito and small fish broth flavour, 30g.",
            spec="30g（3g × 10 小包）", product_type="cat treats", subcategory=TREATS, family="monpetit-crispy-kiss-30g",
            option_zh="鰹魚及小魚高湯味｜30g", option_en="Bonito and Small Fish Broth | 30g",
            life_stage_zh="全齡貓", life_stage_en="All life stages", cost_cny="13.90",
            tags=["Mon Petit", "Crispy Kiss", "貓咪小食", "鰹魚", "小魚", "30g"],
        ),
        new_item(
            sku="monpetit-crispy-kiss-salmon-bonito-smallfish-30g", source_images=["IMG_1762.jpg"],
            image_file="monpetit-crispy-kiss-salmon-bonito-smallfish-30g-v2.png", image_token="rQKFpQtcuPCspvXm",
            brand=MONPETIT, name_zh="Mon Petit Crispy Kiss 三文魚、鰹魚及小魚味貓咪小食 30g",
            name_en="Mon Petit Crispy Kiss Salmon, Bonito and Small Fish Cat Treats 30g",
            description_zh="日本原裝 Mon Petit Crispy Kiss 貓咪小食，三文魚、鰹魚及小魚風味，30g。",
            description_en="Japanese Mon Petit Crispy Kiss cat treats in salmon, bonito and small fish flavour, 30g.",
            spec="30g（3g × 10 小包）", product_type="cat treats", subcategory=TREATS, family="monpetit-crispy-kiss-30g",
            option_zh="三文魚、鰹魚及小魚味｜30g", option_en="Salmon, Bonito and Small Fish | 30g",
            life_stage_zh="全齡貓", life_stage_en="All life stages", cost_cny="13.90",
            tags=["Mon Petit", "Crispy Kiss", "貓咪小食", "三文魚", "鰹魚", "小魚", "30g"],
        ),
        new_item(
            sku="monpetit-crispy-kiss-luxury-salmon-24g", source_images=["IMG_1758.jpg"],
            image_file="monpetit-crispy-kiss-luxury-salmon-24g.png", image_token="PSgMgVSAiYtibPTC",
            brand=MONPETIT, name_zh="Mon Petit Crispy Kiss 奢華三文魚味貓咪小食 24g",
            name_en="Mon Petit Crispy Kiss Luxury Salmon Flavour Cat Treats 24g",
            description_zh="日本原裝 Mon Petit Crispy Kiss 奢華系列貓咪小食，三文魚味，24g。",
            description_en="Japanese Mon Petit Crispy Kiss Luxury range cat treats, salmon flavour, 24g.",
            spec="24g（8 小包）", product_type="cat treats", subcategory=TREATS, family="monpetit-crispy-kiss-luxury-24g",
            option_zh="奢華三文魚味｜24g", option_en="Luxury Salmon | 24g",
            life_stage_zh="全齡貓", life_stage_en="All life stages", cost_cny="13.90",
            tags=["Mon Petit", "Crispy Kiss", "貓咪小食", "奢華系列", "三文魚味", "24g"],
        ),
    ]

    updates = [
        update_item(source_image="IMG_1742.jpg", image_file="aim30-chicken-shreds-25g.png", image_token="HWrtmmTJAdJSAEIZ", existing_import_key="aim30-chicken-shreds-25g-v1", expected_name_zh="AIM30 貓咪雞肉絲 25g", expected_name_en="AIM30 Cat Shredded Chicken Fillet 25g", expected_retail_hkd="30.90"),
        update_item(source_image="IMG_1743.jpg", image_file="aim30-tuna-slices-30g.png", image_token="cqAqDRfEUKIwWyon", existing_import_key="aim30-tuna-slices-30g-v1", expected_name_zh="AIM30 貓咪吞拿魚片 30g", expected_name_en="AIM30 Cat Tuna Slices 30g", expected_retail_hkd="42.90"),
        update_item(source_image="IMG_1741.jpg", image_file="aim30-bonito-flakes-12g.png", image_token="ZkVAQcfvFTJDGiYE", existing_import_key="aim30-bonito-flakes-12g-v1", expected_name_zh="AIM30 貓咪鰹魚削節 12g", expected_name_en="AIM30 Cat Bonito Flakes 12g", expected_retail_hkd="42.90"),
        update_item(source_image="IMG_1738.jpg", image_file="aim30-karitto-fish-four-80g.png", image_token="dTVunltFocVFfBKq", existing_import_key="aim30-karitto-fish-four-80g-v1", expected_name_zh="AIM30 Karitto Treats 酥脆貓咪零食 魚味四種綜合包 80g", expected_name_en="AIM30 Karitto Treats Crispy Cat Treats Four Fish Flavours Assortment 80g", expected_retail_hkd="118.90"),
        update_item(source_image="IMG_1737.jpg", image_file="aim30-karitto-chicken-80g.png", image_token="FYTngRtZMoNyjStk", existing_import_key="aim30-karitto-chicken-80g-v1", expected_name_zh="AIM30 Karitto Treats 酥脆貓咪零食 雞肉味 80g", expected_name_en="AIM30 Karitto Treats Crispy Cat Treats Chicken Flavour 80g", expected_retail_hkd="118.90"),
        update_item(source_image="IMG_1736.jpg", image_file="aim30-karitto-fish-80g.png", image_token="lRyJhXBZIgiHgrkE", existing_import_key="aim30-karitto-fish-80g-v1", expected_name_zh="AIM30 Karitto Treats 酥脆貓咪零食 鮮魚味 80g", expected_name_en="AIM30 Karitto Treats Crispy Cat Treats Fish Flavour 80g", expected_retail_hkd="118.90"),
        update_item(source_image="IMG_1744.jpg", image_file="monpetit-fish-white-shrimp-180g.png", image_token="IBXqUMaivnqSPQFT", existing_import_key="ginnospoon-cream-tuna-white-shrimp-180g-v1", expected_name_zh="銀之匙 三ツ星グルメ 魚肉奶油夾心 鮪魚及白蝦味乾糧 180g", expected_name_en="Gin no Spoon Mitsuboshi Gourmet Cream-Filled Tuna & White Shrimp Dry Cat Food 180g", expected_retail_hkd="116.90"),
    ]

    if len(created) != 23 or len(updates) != 7:
        raise RuntimeError(f"Expected 23 created and 7 updates, received {len(created)} created and {len(updates)} updates")
    source_images = [source for item in created for source in item["source_images"]] + [source for item in updates for source in item["source_images"]]
    if len(source_images) != 31 or len(set(source_images)) != 31:
        raise RuntimeError("The mapping must account for every source image exactly once")

    document = {
        "schema": "latest31-product-mapping-v1",
        "pricing_rule": {
            "currency": "HKD",
            "cny_to_hkd": str(CNY_TO_HKD),
            "target_product_gross_margin": str(TARGET_MARGIN),
            "supplier_to_hong_kong_shipping_hkd": "0.00",
            "rounding": "upward to the next X.90; never lower than calculated retail",
            "formula": "CNY × 1.1654 ÷ (1 − 45%)",
        },
        "source_record_count": 31,
        "deduplicated_candidate_sku_count": 30,
        "source_duplicate_groups": [
            {
                "source_images": ["IMG_1754.jpg", "IMG_1746.jpg"],
                "resolved_sku": "aim30-senior-15plus-fish-600g",
                "canonical_image_file": "aim30-senior-15plus-fish-600g-v2.png",
                "reason": "Same AIM30 15+ indoor cat kidney health care fish 600g package; v2 retained as the only main image.",
            }
        ],
        "created_products": created,
        "existing_product_image_updates": updates,
        "summary": {
            "new_products": len(created),
            "existing_product_image_updates": len(updates),
            "existing_products_skipped": 0,
            "new_dry_food_products": sum(item["subcategory"] == DRY for item in created),
            "new_treat_products": sum(item["subcategory"] == TREATS for item in created),
        },
    }
    OUTPUT.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(document["summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
