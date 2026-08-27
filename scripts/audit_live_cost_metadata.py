#!/usr/bin/env python3
from __future__ import annotations
import json,os
from collections import Counter
from pathlib import Path
import requests
ROOT=Path('/home/ubuntu/mofu-haven-hk'); OUT=ROOT/'reports/live_cost_metadata_audit.json'
TRUE_KEYS=('cost_cny','cny_cost','source_cost_cny','cost_cny_per_product','supplier_cost_cny','unit_cost_cny')
def t(v):return str(v).strip() if v is not None else ''
def all_items(s,path,params):
 out=[]; p=dict(params,limit='100')
 while True:
  r=s.get('https://api.stripe.com/v1/'+path,params=p,timeout=60);r.raise_for_status();d=r.json();out+=d.get('data',[])
  if not d.get('has_more') or not d.get('data'):return out
  p['starting_after']=d['data'][-1]['id']
def main():
 key=os.environ.get('STRIPE_SECRET_KEY')
 if not key:raise SystemExit('STRIPE_SECRET_KEY is required')
 s=requests.Session();s.auth=(key,''); ps=all_items(s,'products',{'active':'true'}); pmap={p['id']:p for p in ps}; prices=[x for x in all_items(s,'prices',{'active':'true','currency':'hkd','type':'one_time'}) if x.get('product') in pmap]
 rows=[]
 for x in prices:
  pm=x.get('metadata') or {}; prod=pmap[x['product']]; prm=[]
  for k in TRUE_KEYS:
   if t(pm.get(k)):prm.append('price:'+k)
   if t((prod.get('metadata') or {}).get(k)):prm.append('product:'+k)
  has_true=bool(prm); has_implied=bool(t(pm.get('pricing_cost_cny_baseline')))
  cat='true_cost' if has_true else ('implied_baseline_only' if has_implied else 'no_cost_metadata')
  rows.append({'price_id':x['id'],'product_id':x['product'],'product_name':prod.get('name'),'variant_label_zh':t(pm.get('variant_label_zh')),'category':cat,'true_cost_fields':prm,'implied_baseline':t(pm.get('pricing_cost_cny_baseline'))})
 out={'active_products':len(ps),'active_hkd_one_time_prices':len(prices),'category_counts':dict(Counter(r['category'] for r in rows)),'true_cost_field_counts':dict(Counter(k for r in rows for k in r['true_cost_fields'])),'rows':rows,'interpretation':'true_cost means an explicit supplier-cost field was found; implied_baseline_only means only a retail-derived historical baseline was found and is not verified supplier cost.'}
 OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({'active_products':len(ps),'active_hkd_one_time_prices':len(prices),'category_counts':out['category_counts'],'true_cost_field_counts':out['true_cost_field_counts'],'report':str(OUT)},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
