import json
import os
import re
from pathlib import Path

import requests

SUPABASE_HOST = "https://hkuxxgduymkztkmyhhot.supabase.co"
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
BASE = f"{SUPABASE_HOST}/rest/v1"
HEADERS = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
WRITE_HEADERS = {**HEADERS, "Content-Type": "application/json", "Prefer": "return=representation"}
CJK_RE = re.compile(r"[\u3400-\u9fff]")
INVALID_BRANDS = {"", "未指定品牌", "未標示品牌", "未有品牌", "unknown", "n/a", "未分類"}
SEO_SUFFIX = " | 日本直送 100%天然原肉零食・滿$399免運 | 毛毛港 Mofu Haven"
SEO_DESCRIPTION_SUFFIX = "100%日本在地製造，無防腐劑，全店滿 HK$399 順豐本地免運到府。"


def get(path, params=None):
    response = requests.get(f"{BASE}/{path}", headers=HEADERS, params=params or {}, timeout=45)
    response.raise_for_status()
    return response.json()


def patch_product(product_id, patch):
    response = requests.patch(
        f"{BASE}/products",
        headers=WRITE_HEADERS,
        params={"id": f"eq.{product_id}"},
        json=patch,
        timeout=45,
    )
    response.raise_for_status()
    rows = response.json()
    if len(rows) != 1:
        raise RuntimeError(f"Expected one updated product for {product_id}, got {len(rows)}")
    return rows[0]


def clean_source_name(product):
    return (product.get("name_zh") or product.get("name") or product.get("name_en") or "日本天然寵物零食").strip()


def chinese_excerpt(product):
    source = (product.get("description_zh") or product.get("description") or clean_source_name(product)).strip()
    source = re.sub(r"\s+", " ", source)
    # Keep the requested first 120 characters, avoiding a broken trailing newline.
    return source[:120].rstrip("，。；、,; ")


def english_name(product):
    value = (product.get("name_en") or "").strip()
    if not value or CJK_RE.search(value) or value.lower() == "product name unavailable":
        value = (product.get("name_en") or product.get("name_zh") or product.get("name") or "Product details")
    return value


def english_highlights(product):
    name = english_name(product)
    spec = (product.get("product_spec") or "").strip()
    lines = [
        f"• Product focus: {name}.",
        "• Made for everyday pet feeding, rewards, or chewing as indicated by the product name.",
        "• Japanese Best Partner selection with a simple, ingredient-led product focus.",
        "• Follow the packaging directions and adjust portions to your pet's size and needs.",
    ]
    if spec and not CJK_RE.search(spec) and spec.lower() not in name.lower():
        lines.insert(1, f"• Pack specification: {spec}.")
    return "Key Highlights:\n" + "\n".join(lines)


def classify(product, categories):
    existing = product.get("category_id")
    if existing:
        return existing, "existing"
    text = " ".join(str(product.get(k) or "") for k in ("name", "name_zh", "description_zh", "pet_species", "mofu_sku")).lower()
    # Cat indicators take priority so fish-based cat treats do not fall into Dogs.
    cat_terms = ("貓", "猫", "cat", "ねこ", "neko", "貓咪", "猫用")
    supply_terms = ("胸背", "牽引", "牵引", "項圈", "项圈", "拾便", "外出", "漫步", "harness", "leash", "collar", "walk", "poop bag")
    dog_terms = ("狗", "犬", "dog", "愛犬", "柴犬", "柯基", "法鬥", "牛蹄", "牛筋", "芝士棒", "潔齒", "耐咬")
    if any(term in text for term in cat_terms) or str(product.get("pet_species") or "").lower() == "cat":
        return categories["cats"], "cat keyword/species"
    if any(term in text for term in supply_terms):
        return categories["supplies"], "supplies keyword"
    if any(term in text for term in dog_terms) or str(product.get("pet_species") or "").lower() in {"dog", "all_pets"}:
        return categories["dogs"], "dog keyword/species"
    # The remaining live catalogue consists of pet food/treat records; use Dogs as the safe food root.
    return categories["dogs"], "catalog default"


def main():
    products = get("products", {"select": "id,name,name_zh,name_en,description,description_zh,description_en,seo_title,seo_description,category_id,brand,supplier_brand,product_spec,pet_species,mofu_sku", "order": "created_at.desc", "limit": "500"})
    category_rows = get("categories", {"select": "id,slug,name", "limit": "100"})
    by_slug = {str(row.get("slug") or "").lower(): row["id"] for row in category_rows}
    by_name = {str(row.get("name") or ""): row["id"] for row in category_rows}
    categories = {
        "dogs": by_slug.get("dogs") or by_name.get("狗狗專區"),
        "cats": by_slug.get("cats") or by_name.get("貓咪專區"),
        "supplies": by_slug.get("pet-supplies") or by_name.get("寵物用品"),
    }
    if not all(categories.values()):
        raise RuntimeError(f"Required categories not found: {categories}")

    updated = []
    counts = {"seo": 0, "description_en": 0, "brand": 0, "category": 0}
    for product in products:
        patch = {}
        name_zh = clean_source_name(product)
        if not (product.get("seo_title") or "").strip():
            patch["seo_title"] = name_zh + SEO_SUFFIX
            counts["seo"] += 1
        if not (product.get("seo_description") or "").strip():
            patch["seo_description"] = chinese_excerpt(product) + " " + SEO_DESCRIPTION_SUFFIX
            counts["seo"] += 1
        current_en = (product.get("description_en") or "").strip()
        if not current_en or CJK_RE.search(current_en):
            patch["description_en"] = english_highlights(product)
            counts["description_en"] += 1
        current_brand = (product.get("brand") or "").strip()
        if current_brand.lower() in INVALID_BRANDS or not current_brand:
            patch["brand"] = "Best Partner"
            counts["brand"] += 1
        if not product.get("category_id"):
            category_id, reason = classify(product, categories)
            patch["category_id"] = category_id
            counts["category"] += 1
        if patch:
            row = patch_product(product["id"], patch)
            # Assert protected commercial fields were not included in the update payload.
            assert set(patch).isdisjoint({"price", "original_price", "current_hkd", "cost_price_rmb", "stock", "stock_quantity", "images"})
            updated.append({"id": product["id"], "sku": product.get("mofu_sku"), "fields": sorted(patch)})

    report = Path("catalog-metadata-repair-report.json")
    report.write_text(json.dumps({"products_scanned": len(products), "products_updated": len(updated), "field_counts": counts, "updates": updated}, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"products_scanned": len(products), "products_updated": len(updated), "field_counts": counts, "report": str(report)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
