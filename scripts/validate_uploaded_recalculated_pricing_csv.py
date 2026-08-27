#!/usr/bin/env python3
"""Validate the owner-supplied fixed pricing import CSV without transforming any value."""
from __future__ import annotations

import csv
import json
from collections import Counter
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path

INPUT = Path("/home/ubuntu/upload/recalculated_pricing_output.csv")
ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
JSON_OUT = REPORTS / "recalculated_pricing_output_input_validation_2026-08-27.json"
CSV_OUT = REPORTS / "recalculated_pricing_output_input_validation_2026-08-27.csv"
MD_OUT = REPORTS / "recalculated_pricing_output_input_validation_2026-08-27.md"
REQUIRED = ("product_id", "price_id", "cost_cny", "proposed_hkd")


def parse_positive_decimal(value: str, field: str, row_number: int, max_scale: int | None = None) -> Decimal:
    raw = value.strip()
    if not raw:
        raise ValueError(f"row {row_number}: {field} is blank")
    try:
        parsed = Decimal(raw)
    except InvalidOperation as error:
        raise ValueError(f"row {row_number}: {field} is not numeric") from error
    if not parsed.is_finite() or parsed <= 0:
        raise ValueError(f"row {row_number}: {field} must be positive")
    if max_scale is not None and -parsed.as_tuple().exponent > max_scale:
        raise ValueError(f"row {row_number}: {field} has more than {max_scale} decimal places")
    return parsed


def main() -> None:
    with INPUT.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        headers = reader.fieldnames or []
        missing_headers = [field for field in REQUIRED if field not in headers]
        if missing_headers:
            raise SystemExit(f"Missing required CSV columns: {', '.join(missing_headers)}")
        rows = list(reader)
    if not rows:
        raise SystemExit("CSV contains no data rows")

    errors: list[str] = []
    normalized_rows: list[dict[str, str]] = []
    for index, row in enumerate(rows, start=2):
        try:
            product_id = (row.get("product_id") or "").strip()
            price_id = (row.get("price_id") or "").strip()
            if not product_id.startswith("prod_"):
                raise ValueError(f"row {index}: product_id is invalid")
            if not price_id.startswith("price_"):
                raise ValueError(f"row {index}: price_id is invalid")
            cost = parse_positive_decimal(row.get("cost_cny") or "", "cost_cny", index, max_scale=4)
            price = parse_positive_decimal(row.get("proposed_hkd") or "", "proposed_hkd", index, max_scale=2)
            if price != price.quantize(Decimal("0.01")):
                raise ValueError(f"row {index}: proposed_hkd must use HKD cents")
            normalized_rows.append({
                "csv_row": str(index),
                "product_id": product_id,
                "price_id": price_id,
                "mofu_sku": (row.get("mofu_sku") or "").strip(),
                "product_name": (row.get("product_name") or "").strip(),
                "cost_cny": f"{cost:f}",
                "proposed_hkd": f"{price:.2f}",
                "is_default_price": (row.get("is_default_price") or "").strip(),
                "variant_label_zh": (row.get("variant_label_zh") or "").strip(),
            })
        except ValueError as error:
            errors.append(str(error))

    duplicate_price_ids = [key for key, count in Counter(row["price_id"] for row in normalized_rows).items() if count > 1]
    if duplicate_price_ids:
        errors.append(f"Duplicate price_id entries: {', '.join(sorted(duplicate_price_ids)[:10])}")

    summary = {
        "validated_at_utc": datetime.now(timezone.utc).isoformat(),
        "mode": "owner_supplied_fixed_price_input_validation_only",
        "no_stripe_writes_performed": True,
        "no_formula_recalculation_performed": True,
        "input_path": str(INPUT),
        "header_count": len(headers),
        "data_row_count": len(rows),
        "valid_row_count": len(normalized_rows),
        "invalid_row_count": len(errors),
        "distinct_product_count": len({row["product_id"] for row in normalized_rows}),
        "distinct_price_count": len({row["price_id"] for row in normalized_rows}),
        "errors": errors,
        "records": normalized_rows,
    }
    JSON_OUT.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with CSV_OUT.open("w", encoding="utf-8-sig", newline="") as handle:
        fields = list(normalized_rows[0]) if normalized_rows else ["csv_row", "error"]
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(normalized_rows)
    lines = [
        "# 店主上載固定定價 CSV 輸入驗證\n",
        f"**驗證時間（UTC）：** {summary['validated_at_utc']}\n",
        "**方式：** 只檢查上載檔案；不使用或重新計算任何匯率、倒推或取整規則，亦沒有寫入 Stripe。\n",
        "\n| 項目 | 結果 |\n| --- | ---: |\n",
        f"| 原始資料列 | {summary['data_row_count']} |\n",
        f"| 格式有效列 | {summary['valid_row_count']} |\n",
        f"| 不有效列／錯誤 | {summary['invalid_row_count']} |\n",
        f"| 不重複產品 | {summary['distinct_product_count']} |\n",
        f"| 不重複 Price ID | {summary['distinct_price_count']} |\n",
        "\nCSV 的 `proposed_hkd` 與 `cost_cny` 將保持原值，待下一步與現行 Stripe Price／產品關係逐項核對後才可匯入。\n",
    ]
    if errors:
        lines.extend(["\n## 錯誤\n", *[f"- {error}\n" for error in errors]])
    MD_OUT.write_text("".join(lines), encoding="utf-8")
    print(json.dumps({
        "no_stripe_writes_performed": True,
        "data_row_count": len(rows),
        "valid_row_count": len(normalized_rows),
        "invalid_row_count": len(errors),
        "report": str(MD_OUT),
    }, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
