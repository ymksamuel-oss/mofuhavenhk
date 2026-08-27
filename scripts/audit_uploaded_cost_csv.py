#!/usr/bin/env python3
from __future__ import annotations
import csv,json
from collections import Counter
from pathlib import Path
INPUT=Path('/home/ubuntu/upload/recalculated_pricing_output(1).csv')
OUT=Path('/home/ubuntu/mofu-haven-hk/reports/uploaded_cost_csv_audit_2026-08-28.json')
def t(v):return str(v).strip() if v is not None else ''
def main():
 with INPUT.open(encoding='utf-8-sig',newline='') as f: rows=list(csv.DictReader(f))
 true_cost=[r for r in rows if t(r.get('cost_cny'))]
 price=[r for r in rows if t(r.get('proposed_hkd'))]
 out={'file':str(INPUT),'record_count':len(rows),'cost_cny_present':len(true_cost),'cost_cny_missing':len(rows)-len(true_cost),'proposed_hkd_present':len(price),'proposed_hkd_missing':len(rows)-len(price),'unique_product_ids':len({t(r.get('product_id')) for r in rows}),'unique_price_ids':len({t(r.get('price_id')) for r in rows}),'duplicate_product_ids':{k:v for k,v in Counter(t(r.get('product_id')) for r in rows).items() if k and v>1},'duplicate_price_ids':{k:v for k,v in Counter(t(r.get('price_id')) for r in rows).items() if k and v>1},'cost_cny_values':{'min':min(float(r['cost_cny']) for r in true_cost) if true_cost else None,'max':max(float(r['cost_cny']) for r in true_cost) if true_cost else None},'interpretation':'Per owner instruction, every nonblank cost_cny in this supplied CSV is treated as the verified TaoBao supplier cost for the shop analysis.'}
 OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); print(json.dumps(out,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
