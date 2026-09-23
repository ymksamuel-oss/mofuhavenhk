import json
import os
from pathlib import Path

import requests

HOST = "https://hkuxxgduymkztkmyhhot.supabase.co"
KEY = os.environ["SUPABASE_KEY"]
BASE = f"{HOST}/rest/v1"
HEADERS = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}
WRITE_HEADERS = {**HEADERS, "Content-Type": "application/json", "Prefer": "return=representation"}

REPAIRS = {
    "4976064026231": "BestPartner Dog/Cat Cotton Canvas Multi-Pocket Tote Bag",
    "4976064015013": "BestPartner Dog/Cat Flushable Water-Soluble Pet Waste Bags 100pcs",
}
POLLUTED = (
    "Pet Lifestyle Accessory",
    "Product name unavailable",
    "Japanese Natural Pet Treat",
    "Generic Pet",
)


def fetch_affected():
    response = requests.get(
        f"{BASE}/products",
        headers=HEADERS,
        params={
            "select": "id,mofu_sku,name_zh,name,name_en,product_spec",
            "or": "(" + ",".join(f"name_en.ilike.*{phrase}*" for phrase in POLLUTED) + ")",
            "order": "created_at.desc",
            "limit": "400",
        },
        timeout=45,
    )
    response.raise_for_status()
    return response.json()


def update(row, new_name):
    response = requests.patch(
        f"{BASE}/products",
        headers=WRITE_HEADERS,
        params={"id": f"eq.{row['id']}"},
        json={"name_en": new_name},
        timeout=45,
    )
    response.raise_for_status()
    result = response.json()
    if len(result) != 1:
        raise RuntimeError(f"Expected one updated row for {row['mofu_sku']}, got {len(result)}")
    return result[0]


def main():
    rows = fetch_affected()
    before_after = []
    for row in rows:
        sku = row.get("mofu_sku")
        if sku not in REPAIRS:
            raise RuntimeError(f"No approved English reconstruction exists for polluted SKU {sku}: {row.get('name_zh')}")
        new_name = REPAIRS[sku]
        if row.get("name_en") != new_name:
            update(row, new_name)
        before_after.append({
            "sku": sku,
            "name_zh": row.get("name_zh"),
            "before": row.get("name_en"),
            "after": new_name,
        })
    report = {"affected_count": len(rows), "updated_count": sum(item["before"] != item["after"] for item in before_after), "samples": before_after}
    Path("english-name-repair-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
