from __future__ import annotations

import json
from decimal import Decimal, ROUND_CEILING
from pathlib import Path

CNY_TO_HKD = Decimal("1.1654")
RETAIL_MULTIPLIER = Decimal("1.76")
TAIL = Decimal("0.90")


def round_up_to_90(value: Decimal) -> Decimal:
    return (value - TAIL).to_integral_value(rounding=ROUND_CEILING) + TAIL


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    source = root / "data" / "approved_product_batch_2026-08-28.json"
    output = root / "reports" / "approved_product_batch_pricing_preview_2026-08-28.json"
    payload = json.loads(source.read_text(encoding="utf-8"))
    rows = []
    for product in payload["products"]:
        variants = []
        for variant in product["variants"]:
            cost = Decimal(variant["cost_cny"])
            unrounded = cost * CNY_TO_HKD * RETAIL_MULTIPLIER
            retail = round_up_to_90(unrounded)
            variants.append({
                **variant,
                "unrounded_retail_hkd": f"{unrounded:.2f}",
                "retail_hkd": f"{retail:.2f}",
                "retail_hkd_minor": int(retail * 100),
                "pricing_rule": "ceil_to_.90(cost_cny × 1.1654 × 1.76)",
                "image_status": "original_screenshot_pending_clean_ivory",
            })
        rows.append({**product, "variants": variants})
    result = {
        "generated_from": source.name,
        "policy_version": payload["policy_version"],
        "cny_to_hkd": str(CNY_TO_HKD),
        "retail_multiplier": str(RETAIL_MULTIPLIER),
        "rounding": "upward .90",
        "product_count": len(rows),
        "variant_count": sum(len(p["variants"]) for p in rows),
        "products": rows,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(output), "product_count": len(rows), "variant_count": result["variant_count"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
