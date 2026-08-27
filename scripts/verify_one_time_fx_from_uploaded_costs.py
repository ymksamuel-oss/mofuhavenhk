#!/usr/bin/env python3
from __future__ import annotations
import csv,json,os
from decimal import Decimal
from pathlib import Path
import requests
ROOT=Path('/home/ubuntu/mofu-haven-hk');INPUT=Path('/home/ubuntu/upload/recalculated_pricing_output(1).csv');RESULT=ROOT/'reports/one_time_fx_from_uploaded_costs_apply_result_2026-08-28.json';OUT=ROOT/'reports/one_time_fx_from_uploaded_costs_verification_2026-08-28.json';RATE=Decimal('1.1678');MULT=Decimal('1.76');TAIL=Decimal('0.90')
def t(v):return str(v).strip() if v is not None else ''
def get(s,path):
 r=s.get('https://api.stripe.com/v1/'+path,timeout=60);r.raise_for_status();return r.json()
def calc(cost):
 raw=Decimal(cost)*RATE*MULT;d=(raw-TAIL).to_integral_value(rounding='ROUND_CEILING');return int((d+TAIL)*100)
def main():
 key=os.environ.get('STRIPE_SECRET_KEY');
 if not key:raise SystemExit('STRIPE_SECRET_KEY is required')
 result=json.loads(RESULT.read_text(encoding='utf-8'));s=requests.Session();s.auth=(key,''); rows=[]
 with INPUT.open(encoding='utf-8-sig',newline='') as f: csvrows=list(csv.DictReader(f))
 for item,csvrow in zip(result['records'],csvrows):
  p=get(s,'products/'+item['product_id']);price=get(s,'prices/'+item['result_price_id']); expected=calc(t(csvrow['cost_cny'])); meta=price.get('metadata') or {}; default_ok=(p.get('default_price')==price['id']) if item.get('default_price_switched') else True
  ok=price.get('active') is True and price.get('product')==item['product_id'] and price.get('currency')=='hkd' and price.get('unit_amount')==expected and t(meta.get('cost_cny'))==t(csvrow['cost_cny']) and default_ok
  rows.append({'csv_row':item['csv_row'],'product_id':item['product_id'],'price_id':price['id'],'expected_hkd':f'{expected/100:.2f}','actual_hkd':f"{price.get('unit_amount',-1)/100:.2f}",'expected_cost_cny':t(csvrow['cost_cny']),'actual_cost_cny':t(meta.get('cost_cny')),'active':price.get('active'),'default_ok':default_ok,'ok':ok})
 bad=[r for r in rows if not r['ok']];out={'formula':'ceil((cost_cny × 1.1678 × 1.76) to next .90)','proposed_hkd_used':False,'record_count':len(rows),'verified_ok':len(rows)-len(bad),'failed':len(bad),'rows':rows};OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({'record_count':len(rows),'verified_ok':len(rows)-len(bad),'failed':len(bad),'report':str(OUT)},ensure_ascii=False,indent=2));
 if bad:raise SystemExit('verification failed')
if __name__=='__main__':main()
