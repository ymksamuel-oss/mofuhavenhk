#!/usr/bin/env python3
from __future__ import annotations
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DEFAULT=ROOT/'reports/recalculated_pricing_output_product_default_strict_mapping_2026-08-27.json'
VARIANT=ROOT/'reports/recalculated_pricing_output_variant_label_mapping_2026-08-27.json'
OUT=ROOT/'reports/recalculated_pricing_output_complete_strict_mapping_2026-08-27.json'
def main()->None:
 d=json.loads(DEFAULT.read_text(encoding='utf-8')); v=json.loads(VARIANT.read_text(encoding='utf-8'))
 records=[r for r in d['records'] if r.get('mapping_status')=='eligible_product_default']+[dict(r, mapping_status=r.get('status')) for r in v['records']]
 records.sort(key=lambda x:int(x['csv_row']))
 if len(records)!=121 or any(not str(r.get('mapping_status','')).startswith('eligible_') for r in records): raise SystemExit('Combined mapping is not fully eligible')
 ids=[r.get('current_active_price_id','') for r in records]
 if len(set(ids))!=len(ids) or any(not x for x in ids): raise SystemExit('Combined mapping has duplicate or blank active Price IDs')
 out={'generated_at_utc':datetime.now(timezone.utc).isoformat(),'mode':'complete_strict_csv_product_default_and_variant_mapping_no_writes','no_stripe_writes_performed':True,'no_formula_recalculation_performed':True,'csv_record_count':len(records),'eligible_count':len(records),'blocked_count':0,'status_counts':dict(Counter(r['mapping_status'] for r in records)),'records':records}
 OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'no_stripe_writes_performed':True,'csv_record_count':len(records),'eligible_count':len(records),'blocked_count':0,'status_counts':out['status_counts'],'report':str(OUT)},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
