#!/usr/bin/env python3
from __future__ import annotations
import csv,json,os
from pathlib import Path
import requests
ROOT=Path(__file__).resolve().parents[1]
INPUT=Path('/home/ubuntu/upload/recalculated_pricing_output.csv')
RESULT=ROOT/'reports/recalculated_pricing_output_apply_result_2026-08-27.json'
OUT=ROOT/'reports/recalculated_pricing_output_post_apply_verification_2026-08-27.json'
def t(v):return str(v).strip() if v is not None else ''
def get(s,path):
 r=s.get('https://api.stripe.com/v1/'+path,timeout=60);r.raise_for_status();return r.json()
def main():
 key=os.environ.get('STRIPE_SECRET_KEY')
 if not key:raise SystemExit('STRIPE_SECRET_KEY is required')
 result=json.loads(RESULT.read_text(encoding='utf-8'))
 with INPUT.open(encoding='utf-8-sig',newline='') as f: byrow={int(row['csv_row']) if 'csv_row' in row else i:row for i,row in enumerate(csv.DictReader(f),start=2)}
 s=requests.Session();s.auth=(key,''); rows=[]
 for item in result['records']:
  pid=t(item['product_id']); rid=t(item.get('result_price_id')); p=get(s,f'products/{pid}'); price=get(s,f'prices/{rid}')
  csvrow=byrow.get(int(item['csv_row']),{})
  expected=int(round(float(t(csvrow.get('proposed_hkd')))*100))
  meta=price.get('metadata') or {}
  default_ok=(p.get('default_price')==rid) if item.get('default_price_switched') is True else True
  ok=(price.get('active') is True and price.get('product')==pid and price.get('currency')=='hkd' and price.get('type')=='one_time' and price.get('unit_amount')==expected and t(meta.get('cost_cny'))==t(csvrow.get('cost_cny')) and default_ok)
  rows.append({'csv_row':item['csv_row'],'product_id':pid,'result_price_id':rid,'expected_hkd':t(csvrow.get('proposed_hkd')),'actual_hkd':f"{price.get('unit_amount',-1)/100:.2f}",'expected_cost_cny':t(csvrow.get('cost_cny')),'actual_cost_cny':t(meta.get('cost_cny')),'product_default_price':p.get('default_price'),'active':price.get('active'),'ok':ok})
 bad=[r for r in rows if not r['ok']]
 out={'records':len(rows),'verified_ok':len(rows)-len(bad),'failed':len(bad),'no_formula_or_fx_check':'All expected values read from CSV strings; no calculation used for pricing','rows':rows}
 OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'records':len(rows),'verified_ok':len(rows)-len(bad),'failed':len(bad),'report':str(OUT)},ensure_ascii=False,indent=2))
 if bad: raise SystemExit('Post-apply verification failed')
if __name__=='__main__':main()
