from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
OUT = ROOT / 'tmp' / 'compare-price-research-items'
OUT.mkdir(parents=True, exist_ok=True)
for stale in OUT.glob('*.txt'):
    stale.unlink()

with (ROOT / 'recent_48h_pricing_audit_input.csv').open(encoding='utf-8-sig', newline='') as handle:
    reader = csv.DictReader(handle)
    rows = [row for row in reader if row['existing_compare_at_hkd'] in ('', '0', '0.0', '0.00')]

for row in rows:
    content = '\n'.join([
        f"Stripe Product ID: {row['product_id']}",
        f"Batch: {row['family']}",
        f"Product: {row['name']}",
        f"Current Mofu Haven price: HK${row['retail_hkd']}",
        f"Pet category: {row['category']} / {row['subcategory']}",
    ]) + '\n'
    (OUT / f"{row['product_id']}.txt").write_text(content, encoding='utf-8')
print(f'Prepared {len(rows)} research inputs in {OUT}')
