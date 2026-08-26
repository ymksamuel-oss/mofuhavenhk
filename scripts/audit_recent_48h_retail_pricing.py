from __future__ import annotations

import csv
import json
import math
from pathlib import Path

import pandas as pd

ROOT = Path('/home/ubuntu/mofuhavenhk-github')
UPLOAD = Path('/home/ubuntu/upload')
TARGET_MARGIN = 0.45
EXCHANGE_RATE = 1.1654

stripe = json.loads((ROOT / 'recent_48h_stripe_products_all.json').read_text(encoding='utf-8'))['products']
pricing_input = json.loads((ROOT / 'recent_48h_pricing_audit_input.json').read_text(encoding='utf-8'))['products']
retail_by_product = {row['product_id']: float(row['retail_hkd']) for row in pricing_input}


def charm_price(value: float) -> float:
    """Round upward to the next HK$10 price point ending in .90."""
    return round(math.ceil((value + 0.10) / 10) * 10 - 0.10, 2)


def family(key: str) -> str:
    if key.startswith('batch24-2026::'):
        return 'batch24'
    if key.startswith('combo-dogfood-5-2026::'):
        return 'combo-dogfood-5'
    if key.startswith('ciao-vetslabo-2026::'):
        return 'ciao-vetslabo'
    if key.startswith('dbf-dog-cans-2026::'):
        return 'dbf'
    if key.startswith('snack-order-2026::'):
        return 'japanese-snacks'
    if key.startswith('onecared-can::'):
        return 'onecare'
    if key.startswith('mamacook'):
        return 'mamacook'
    return 'legacy-other'

# Batch24 cost index by SKU.
batch24 = json.loads((ROOT / 'batch24_import_mapping.json').read_text(encoding='utf-8'))['products']
batch24_cost = {row['sku']: (float(row['landed_cost_hkd']), 'batch24_import_mapping.json') for row in batch24}
# Combo 720g cost index by SKU.
combo5 = json.loads((ROOT / 'combo_dogfood_5_import_mapping.json').read_text(encoding='utf-8'))['products']
combo5_cost = {row['sku']: (float(row['landed_cost_hkd']), 'combo_dogfood_5_import_mapping.json') for row in combo5}
# d.b.f costs by SKU from source workbook.
dbf_df = pd.read_excel(UPLOAD / 'dbf_dog_cans_23_items(1).xlsx')
dbf_cost = {str(row['產品編號']): (float(row['人民幣成本 (¥)']) * EXCHANGE_RATE, 'dbf_dog_cans_23_items(1).xlsx; CNY/HKD 1.1654') for _, row in dbf_df.iterrows()}
# CIAO/Vet's Labo landed cost by sequence number (keeps source file's stated estimated freight).
ciao_df = pd.read_csv(UPLOAD / 'products_20_list.csv')
ciao_cost = {f"CIAOVL-{int(row['產品編號']):02d}": (float(row['總來貨成本(HKD)']), 'products_20_list.csv') for _, row in ciao_df.iterrows()}
# ONE CARE default Stripe price is 5-can tier; match by product English title held in Stripe name.
onecare_df = pd.read_csv(UPLOAD / 'MofuHaven_7_Flavors_Tiered_Pricing.csv')
onecare_5 = onecare_df[onecare_df['Tier'] == '5罐裝']
onecare_cost = {str(row['Product_Name']): (float(row['HKD_Cost']), 'MofuHaven_7_Flavors_Tiered_Pricing.csv; 5-can default tier') for _, row in onecare_5.iterrows()}

rows: list[dict] = []
for product in stripe:
    metadata = product.get('metadata', {})
    sku = metadata.get('sku', '')
    key = metadata.get('mofu_import_key', '')
    fam = family(key)
    landed_cost = None
    cost_source = ''
    if sku in batch24_cost:
        landed_cost, cost_source = batch24_cost[sku]
    elif sku in combo5_cost:
        landed_cost, cost_source = combo5_cost[sku]
    elif sku in dbf_cost:
        landed_cost, cost_source = dbf_cost[sku]
    elif sku in ciao_cost:
        landed_cost, cost_source = ciao_cost[sku]
    elif fam == 'onecare':
        # Match source and Stripe Chinese metadata while normalising full-width parentheses.
        normalized_candidates = [
            product['name'].replace('（', '(').replace('）', ')'),
            metadata.get('name_zh', '').replace('（', '(').replace('）', ')'),
        ]
        for item_name, payload in onecare_cost.items():
            normalized_item_name = item_name.replace('（', '(').replace('）', ')')
            if any(normalized_item_name in candidate for candidate in normalized_candidates):
                landed_cost, cost_source = payload
                break
    current = retail_by_product.get(product['id'])
    target_raw = round(landed_cost / (1 - TARGET_MARGIN), 2) if landed_cost is not None else None
    target_charm = charm_price(target_raw) if target_raw is not None else None
    rows.append({
        'product_id': product['id'],
        'sku': sku,
        'family': fam,
        'name': product['name'],
        'current_retail_hkd': current,
        'landed_cost_hkd': round(landed_cost, 2) if landed_cost is not None else '',
        'cost_source': cost_source,
        'target_price_45_raw_hkd': target_raw if target_raw is not None else '',
        'target_charm_price_hkd': target_charm if target_charm is not None else '',
        'current_gross_margin_pct': round((current - landed_cost) / current * 100, 2) if current and landed_cost is not None else '',
        'price_delta_hkd': round(target_charm - current, 2) if target_charm is not None and current is not None else '',
        'pricing_status': 'recalculable' if landed_cost is not None else 'missing_confirmed_cost',
    })

summary = {
    'policy': {
        'exchange_rate_cny_hkd': EXCHANGE_RATE,
        'target_gross_margin': TARGET_MARGIN,
        'rounding_rule': 'Round upward to next HK$10 price point ending in .90',
        'note': 'Source-specific known freight/landed costs are preserved; no cost is fabricated.'
    },
    'total_products': len(rows),
    'recalculable_products': sum(1 for row in rows if row['pricing_status'] == 'recalculable'),
    'missing_confirmed_cost': sum(1 for row in rows if row['pricing_status'] != 'recalculable'),
    'rows': rows,
}
(ROOT / 'recent_48h_retail_formula_audit.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
with (ROOT / 'recent_48h_retail_formula_audit.csv').open('w', newline='', encoding='utf-8-sig') as handle:
    writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)
print(json.dumps({key: summary[key] for key in ('total_products','recalculable_products','missing_confirmed_cost')}, ensure_ascii=False))
