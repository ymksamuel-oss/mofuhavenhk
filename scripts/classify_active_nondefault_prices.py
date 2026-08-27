#!/usr/bin/env python3
from __future__ import annotations
import json,os
from collections import Counter
from pathlib import Path
import requests
OUT=Path('/home/ubuntu/mofu-haven-hk/reports/active_nondefault_price_classification.json')
def all_items(s,path,params):
 out=[]; p=dict(params,limit='100')
 while True:
  r=s.get('https://api.stripe.com/v1/'+path,params=p,timeout=60); r.raise_for_status(); d=r.json(); out+=d.get('data',[])
  if not d.get('has_more') or not d.get('data'): return out
  p['starting_after']=d['data'][-1]['id']
def main():
 key=os.environ.get('STRIPE_SECRET_KEY')
 if not key: raise SystemExit('STRIPE_SECRET_KEY is required')
 s=requests.Session(); s.auth=(key,'')
 products=all_items(s,'products',{'active':'true'}); pmap={p['id']:p for p in products}
 prices=[x for x in all_items(s,'prices',{'active':'true','currency':'hkd','type':'one_time'}) if x.get('product') in pmap]
 extra=[x for x in prices if x.get('id') != pmap[x['product']].get('default_price')]
 rows=[]
 for x in extra:
  m=x.get('metadata') or {}; p=pmap[x['product']]
  rows.append({'price_id':x['id'],'product_id':x['product'],'product_name':p.get('name'),'amount_hkd':x.get('unit_amount',0)/100,'created':x.get('created'),'nickname':x.get('nickname'),'mofu_sku':m.get('mofu_sku'),'variant_label_zh':m.get('variant_label_zh'),'cost_cny':m.get('cost_cny'),'metadata_keys':sorted(m.keys())})
 out={'active_products':len(products),'active_prices':len(prices),'active_default_prices':len(products),'active_nondefault_prices':len(extra),'note':'Non-default active Price is not automatically an old price; it may be a valid variant or a stale legacy Price. Classification requires metadata/variant context.','rows':rows}
 OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'active_products':len(products),'active_prices':len(prices),'active_nondefault_prices':len(extra),'nondefault_by_product':dict(Counter(x['product_id'] for x in rows))},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
