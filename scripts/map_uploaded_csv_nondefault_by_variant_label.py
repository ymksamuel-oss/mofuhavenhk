#!/usr/bin/env python3
from __future__ import annotations
import csv,json,os
from collections import Counter
from datetime import datetime,timezone
from pathlib import Path
from typing import Any
import requests
ROOT=Path(__file__).resolve().parents[1]
INPUT=Path('/home/ubuntu/upload/recalculated_pricing_output.csv')
OUT=ROOT/'reports/recalculated_pricing_output_variant_label_mapping_2026-08-27.json'
def t(v:Any)->str:return str(v).strip() if v is not None else ''
def get(s:requests.Session,path:str,params:dict[str,str]|None=None)->dict[str,Any]:
 r=s.get('https://api.stripe.com/v1/'+path,params=params,timeout=60);r.raise_for_status();return r.json()
def main()->None:
 key=os.environ.get('STRIPE_SECRET_KEY')
 if not key:raise SystemExit('STRIPE_SECRET_KEY is required')
 with INPUT.open(encoding='utf-8-sig',newline='') as f: rows=list(csv.DictReader(f))
 s=requests.Session();s.auth=(key,'');recs=[]
 for n,row in enumerate(rows,start=2):
  if t(row.get('is_default_price')).lower()=='true':continue
  pid=t(row.get('product_id'));source_id=t(row.get('price_id'));sku=t(row.get('mofu_sku'));label=t(row.get('variant_label_zh'))
  rec={'csv_row':n,'product_id':pid,'source_csv_price_id':source_id,'mofu_sku':sku,'variant_label_zh':label,'proposed_hkd':t(row.get('proposed_hkd')),'cost_cny':t(row.get('cost_cny')),'current_active_price_id':'','current_live_hkd':'','status':'blocked','basis':'','issue':''}
  try:
   p=get(s,f'products/{pid}');src=get(s,f'prices/{source_id}')
   if not p.get('active') or t((p.get('metadata') or {}).get('mofu_sku'))!=sku:raise ValueError('Product identity or SKU mismatch')
   if src.get('product')!=pid:raise ValueError('CSV Price product mismatch')
   data=get(s,'prices',{'product':pid,'active':'true','currency':'hkd','limit':'100'}).get('data') or []
   matches=[x for x in data if x.get('type')=='one_time' and t((x.get('metadata') or {}).get('variant_label_zh'))==label]
   if len(matches)!=1:raise ValueError(f'Expected one active Price with exact variant_label_zh, found {len(matches)}')
   cur=matches[0]
   cmeta=cur.get('metadata') or {}
   if t(cmeta.get('sku')) and t(cmeta.get('sku'))!=t((src.get('metadata') or {}).get('sku')):raise ValueError('Variant SKU changed')
   rec.update({'current_active_price_id':t(cur.get('id')),'current_live_hkd':f"{int(cur.get('unit_amount'))/100:.2f}",'status':'eligible_variant_label','basis':'same Product, matching Product SKU and unique exact variant_label_zh'})
  except requests.HTTPError as e:rec['issue']=f'Stripe HTTP {e.response.status_code}'
  except (ValueError,TypeError,ArithmeticError) as e:rec['issue']=str(e)
  recs.append(rec)
 eligible=[r for r in recs if r['status'].startswith('eligible_')]
 dup=[k for k,v in Counter(r['current_active_price_id'] for r in eligible).items() if k and v>1]
 for r in eligible:
  if r['current_active_price_id'] in dup:r['status']='blocked';r['issue']='Multiple CSV rows map to same current active Price'
 eligible=[r for r in recs if r['status'].startswith('eligible_')]
 out={'generated_at_utc':datetime.now(timezone.utc).isoformat(),'mode':'strict_nondefault_variant_label_no_writes','no_stripe_writes_performed':True,'no_formula_recalculation_performed':True,'csv_nondefault_count':len(recs),'eligible_count':len(eligible),'blocked_count':len(recs)-len(eligible),'status_counts':dict(Counter(r['status'] for r in recs)),'records':recs}
 OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'no_stripe_writes_performed':True,'csv_nondefault_count':len(recs),'eligible_count':len(eligible),'blocked_count':len(recs)-len(eligible),'status_counts':out['status_counts'],'report':str(OUT)},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
