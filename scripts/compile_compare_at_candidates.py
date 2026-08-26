from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
audit = json.loads((ROOT / 'recent_48h_pricing_audit_input.json').read_text(encoding='utf-8'))
research = json.loads(Path('/home/ubuntu/research_recent_product_reference_prices.json').read_text(encoding='utf-8'))
retail = {row['product_id']: float(row['retail_hkd']) for row in audit['products']}
family = {row['product_id']: row['family'] for row in audit['products']}
records: list[dict] = []
for item in research['results']:
    output = item.get('output') or {}
    product_id = output.get('product_id', '')
    original = output.get('source_stated_original_price') or 0
    current = output.get('source_current_price') or 0
    candidate = (
        output.get('matching_status') == 'exact_match'
        and output.get('source_currency') == 'HKD'
        and isinstance(original, (int, float))
        and float(original) > retail.get(product_id, float('inf'))
        and bool(output.get('source_url'))
    )
    records.append({
        'product_id': product_id,
        'family': family.get(product_id, ''),
        'product_name': output.get('product_name', ''),
        'mofu_retail_hkd': retail.get(product_id, 0),
        'source_current_price_hkd': current,
        'source_original_price_hkd': original,
        'source_url': output.get('source_url', ''),
        'source_retailer': output.get('source_retailer', ''),
        'matching_status': output.get('matching_status', ''),
        'confidence': output.get('confidence', ''),
        'evidence': output.get('evidence', ''),
        'candidate': candidate,
    })
candidates = [record for record in records if record['candidate']]
output = {
    'research_count': len(records),
    'candidate_count': len(candidates),
    'candidates': candidates,
    'all_records': records,
}
(ROOT / 'recent_48h_compare_at_candidates.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
with (ROOT / 'recent_48h_compare_at_candidates.csv').open('w', newline='', encoding='utf-8-sig') as handle:
    writer = csv.DictWriter(handle, fieldnames=list(records[0].keys()))
    writer.writeheader()
    writer.writerows(records)
print(json.dumps({'research_count': len(records), 'candidate_count': len(candidates)}, ensure_ascii=False))
for candidate in candidates:
    print(f"{candidate['product_id']}\t{candidate['mofu_retail_hkd']}\t{candidate['source_original_price_hkd']}\t{candidate['source_url']}")
