import json
import os
import re
from pathlib import Path

import requests

HOST = "https://hkuxxgduymkztkmyhhot.supabase.co"
KEY = os.environ["SUPABASE_KEY"]
BASE = f"{HOST}/rest/v1"
HEADERS = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}
WRITE_HEADERS = {**HEADERS, "Content-Type": "application/json", "Prefer": "return=representation"}
DOGS_CATEGORY_ID = "b128eb98-30b8-4696-b131-c5473eef0097"
TARGET_SKUS = {
    "4976064026668",  # Kagoshima sweet potato cubes
    "4976064026651",  # Kagoshima sweet potato chewy stick
    "4976064025272",  # Kagoshima Annouimo meal topper
    "4976064022646",  # Kagoshima sweet potato bran buns
    "4976064024909",  # Kagoshima thick-cut pig ears
    "4976064022301",  # Kagoshima Kurobuta whole pig ears
    "4976064023766",  # Kagoshima Makurazaki bonito
}
DEER_TAG_RE = re.compile(r"^(?:supplier_category:(?:deer|venison)|低敏鹿肉|鹿肉|蝦夷鹿|鹿肋排|鹿骨|鹿角|venison|deer|ベニソン)$", re.I)


def get_products():
    response = requests.get(
        f"{BASE}/products",
        headers=HEADERS,
        params={
            "select": "id,mofu_sku,name_zh,category_id,pet_species,feature_tags",
            "mofu_sku": "in.(" + ",".join(TARGET_SKUS) + ")",
            "limit": "20",
        },
        timeout=45,
    )
    response.raise_for_status()
    return response.json()


def update(row, patch):
    response = requests.patch(
        f"{BASE}/products",
        headers=WRITE_HEADERS,
        params={"id": f"eq.{row['id']}"},
        json=patch,
        timeout=45,
    )
    response.raise_for_status()
    result = response.json()
    if len(result) != 1:
        raise RuntimeError(f"Expected exactly one updated row for {row['mofu_sku']}, got {len(result)}")
    return result[0]


def main():
    rows = get_products()
    found = {row["mofu_sku"] for row in rows}
    missing = TARGET_SKUS - found
    if missing:
        raise RuntimeError(f"Target SKUs not found: {sorted(missing)}")

    report = []
    for row in rows:
        existing_tags = row.get("feature_tags") or []
        if not isinstance(existing_tags, list):
            raise RuntimeError(f"feature_tags is not an array for {row['mofu_sku']}")
        cleaned_tags = [tag for tag in existing_tags if not DEER_TAG_RE.fullmatch(str(tag).strip())]
        patch = {
            "category_id": DOGS_CATEGORY_ID,
            "pet_species": "all_pets",
            "feature_tags": cleaned_tags,
        }
        updated = update(row, patch)
        report.append({
            "sku": row["mofu_sku"],
            "name_zh": row["name_zh"],
            "old_category_id": row.get("category_id"),
            "new_category_id": updated.get("category_id"),
            "removed_deer_tags": [tag for tag in existing_tags if tag not in cleaned_tags],
            "feature_tags": updated.get("feature_tags"),
        })

    Path("kagoshima-classification-report.json").write_text(
        json.dumps({"updated": len(report), "report": report}, ensure_ascii=False, indent=2) + "\n"
    )
    print(json.dumps({"updated": len(report), "removed_deer_tag_count": sum(len(item["removed_deer_tags"]) for item in report)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
