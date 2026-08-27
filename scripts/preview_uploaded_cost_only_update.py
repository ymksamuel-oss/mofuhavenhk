#!/usr/bin/env python3
from __future__ import annotations
import csv,json,os
from collections import Counter
from datetime import datetime,timezone
from pathlib import Path
import requests
ROOT=Path('/home/ubuntu/mofu-haven-hk'); INPUT=Path('/home/ubuntu/upload/recalculated_pricing_output(1).csv'); OUT=ROOT/'reports/uploaded_cost_only_update_preview_2026-08-28.json'
def t(v):return str(v).strip() if v is not None else ''
def get(s,path,params=None):
 r=s.get('https://api.stripe.com/v1/'+path,params=params,timeout=60);r.raise_for_status();return r.json()
def all_prices(s,pid):
 out=[]; params={'product':pid,'active':'true','currency':'hkd','limit':'100'}
 while True:
  d=get(s,'prices',params);out+=d.get('data',[])
  if not d.get('has_more') or not d.get('data'):return out
  params['starting_after']=d['data'][-1]['id']
def main():
 key=os.environ.get('STRIPE_SECRET_KEY');
 if not key:raise SystemExit('STRIPE_SECRET_KEY is required')
 with INPUT.open(encoding='utf-8-sig',newline='') as f: rows=list(csv.DictReader(f))
 s=requests.Session();s.auth=(key,''); outrows=[]
 for n,r in enumerate(rows,start=2):
  pid=t(r['product_id']); p=get(s,f'products/{pid}'); prices=all_prices(s,pid); sku=t(r['mofu_sku']); label=t(r['variant_label_zh']); is_default=t(r['is_default_price']).lower()=='true'
  candidates=[x for x in prices if (x.get('id')==p.get('default_price') if is_default else t((x.get('metadata') or {}).get('variant_label_zh'))==label)]
  if len(candidates)!=1: raise SystemExit(f'row {n}: expected one current price, found {len(candidates)}')
  x=candidates[0]; pm=x.get('metadata') or {}; old=t(pm.get('cost_cny')); new=t(r['cost_cny'])
  outrows.append({'csv_row':n,'product_id':pid,'price_id':x['id'],'mofu_sku':sku,'variant_label_zh':label,'is_default_price':is_default,'old_cost_cny':old,'new_cost_cny':new,'cost_changed':old!=new,'current_hkd':f"{x.get('unit_amount',0)/100:.2f}",'proposed_hkd_from_csv_ignored':t(r.get('proposed_hkd')),'source_csv_price_id':t(r.get('price_id'))})
 if len({x['price_id'] for x in outrows})!=len(outrows):raise SystemExit('Duplicate current Price mapping')
 out={'generated_at_utc':datetime.now(timezone.utc).isoformat(),'mode':'cost_only_preview_no_writes','no_stripe_writes_performed':True,'no_retail_price_written':True,'formula_price_column_ignored':'proposed_hkd','record_count':len(outrows),'unique_products':len({x['product_id'] for x in outrows}),'unique_current_prices':len({x['price_id'] for x in outrows}),'cost_changed_count':sum(x['cost_changed'] for x in outrows),'cost_unchanged_count':sum(not x['cost_changed'] for x in outrows),'rows':outrows}
 OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({k:out[k] for k in ('record_count','unique_products','unique_current_prices','cost_changed_count','cost_unchanged_count','no_stripe_writes_performed','no_retail_price_written','report') if k in out}|{'report':str(OUT)},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
