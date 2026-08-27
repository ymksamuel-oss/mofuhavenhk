#!/usr/bin/env python3
"""Zero-write strict mapper using Product identity for CSV default rows.

CSV values are preserved verbatim. A row marked as the Product default may use the
current active Product.default_price when the Product ID and Product mofu_sku match;
this is unambiguous even if historical Price metadata omitted mofu_sku. Non-default
rows still require exact metadata-identical replacement lineage.
"""
from __future__ import annotations
import csv,json,os
from collections import Counter
from datetime import datetime,timezone
from pathlib import Path
from typing import Any
import requests
ROOT=Path(__file__).resolve().parents[1]
INPUT=Path('/home/ubuntu/upload/recalculated_pricing_output.csv')
OUT=ROOT/'reports/recalculated_pricing_output_product_default_strict_mapping_2026-08-27.json'
def t(v:Any)->str: return str(v).strip() if v is not None else ''
def get(s:requests.Session,path:str,params:dict[str,str]|None=None)->dict[str,Any]:
 r=s.get('https://api.stripe.com/v1/'+path,params=params,timeout=60); r.raise_for_status(); return r.json()
def main()->None:
 key=os.environ.get('STRIPE_SECRET_KEY')
 if not key: raise SystemExit('STRIPE_SECRET_KEY is required')
 with INPUT.open(encoding='utf-8-sig',newline='') as f: rows=list(csv.DictReader(f))
 s=requests.Session(); s.auth=(key,''); recs=[]
 for n,row in enumerate(rows,start=2):
  pid=t(row.get('product_id')); source_id=t(row.get('price_id')); sku=t(row.get('mofu_sku')); is_default=t(row.get('is_default_price')).lower()=='true'
  rec={'csv_row':n,'product_id':pid,'source_csv_price_id':source_id,'mofu_sku':sku,'variant_mode':t(row.get('variant_mode')),'variant_label_zh':t(row.get('variant_label_zh')),'proposed_hkd':t(row.get('proposed_hkd')),'cost_cny':t(row.get('cost_cny')),'current_active_price_id':'','current_live_hkd':'','mapping_status':'blocked','mapping_basis':'','issue':''}
  try:
   p=get(s,f'products/{pid}'); src=get(s,f'prices/{source_id}')
   if not p.get('active'): raise ValueError('Stripe Product is inactive')
   if src.get('product')!=pid: raise ValueError('CSV Price does not belong to CSV Product')
   if t((p.get('metadata') or {}).get('mofu_sku'))!=sku: raise ValueError('CSV SKU differs from Product SKU')
   if is_default:
    did=t(p.get('default_price')); cur=get(s,f'prices/{did}') if did else {}
    if not cur.get('active') or cur.get('product')!=pid or cur.get('currency')!='hkd' or cur.get('type')!='one_time': raise ValueError('Current Product default Price is not active HKD one-time')
    rec['mapping_status']='eligible_product_default'; rec['mapping_basis']='same Product ID and matching Product mofu_sku; current active default Price';
   else:
    cand=get(s,'prices',{'product':pid,'active':'true','currency':'hkd','limit':'100'}).get('data') or []
    matches=[x for x in cand if x.get('type')=='one_time' and x.get('metadata')==src.get('metadata')]
    if len(matches)!=1: raise ValueError(f'Non-default row requires one metadata-identical replacement, found {len(matches)}')
    cur=matches[0]; rec['mapping_status']='eligible_replacement_lineage'; rec['mapping_basis']='same Product plus metadata-identical active replacement Price'
   rec['current_active_price_id']=t(cur.get('id')); rec['current_live_hkd']=f"{int(cur.get('unit_amount'))/100:.2f}"
  except requests.HTTPError as e: rec['issue']=f'Stripe HTTP {e.response.status_code}'
  except (ValueError,TypeError,ArithmeticError) as e: rec['issue']=str(e)
  recs.append(rec)
 eligible=[r for r in recs if r['mapping_status'].startswith('eligible_')]
 dup=[k for k,v in Counter(r['current_active_price_id'] for r in eligible).items() if k and v>1]
 for r in eligible:
  if r['current_active_price_id'] in dup: r['mapping_status']='blocked'; r['issue']='Multiple CSV rows map to same current active Price'
 eligible=[r for r in recs if r['mapping_status'].startswith('eligible_')]
 out={'generated_at_utc':datetime.now(timezone.utc).isoformat(),'mode':'strict_product_default_or_lineage_no_writes','no_stripe_writes_performed':True,'no_formula_recalculation_performed':True,'csv_record_count':len(recs),'eligible_count':len(eligible),'blocked_count':len(recs)-len(eligible),'status_counts':dict(Counter(r['mapping_status'] for r in recs)),'records':recs}
 OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'no_stripe_writes_performed':True,'eligible_count':len(eligible),'blocked_count':len(recs)-len(eligible),'status_counts':out['status_counts'],'report':str(OUT)},ensure_ascii=False,indent=2))
if __name__=='__main__': main()
