#!/usr/bin/env python3
from __future__ import annotations
import json, os
from collections import Counter
from pathlib import Path
import requests
OUT=Path('/home/ubuntu/mofu-haven-hk/reports/live_stripe_catalog_count.json')
def list_all(s,path,params):
 out=[]; p=dict(params,limit='100')
 while True:
  r=s.get('https://api.stripe.com/v1/'+path,params=p,timeout=60); r.raise_for_status(); d=r.json(); out.extend(d.get('data',[]))
  if not d.get('has_more') or not d.get('data'): return out
  p['starting_after']=d['data'][-1]['id']
def main():
 key=os.environ.get('STRIPE_SECRET_KEY')
 if not key: raise SystemExit('STRIPE_SECRET_KEY is required')
 s=requests.Session(); s.auth=(key,'')
 products=list_all(s,'products',{'active':'true'})
 prices=list_all(s,'prices',{'active':'true','currency':'hkd','type':'one_time'})
 product_ids={p['id'] for p in products}
 prices=[x for x in prices if x.get('product') in product_ids]
 defaults={p.get('default_price') for p in products if p.get('default_price')}
 out={'active_products':len(products),'active_hkd_one_time_prices':len(prices),'active_products_with_default_price':sum(1 for p in products if p.get('default_price')),'active_default_prices':len(defaults),'active_prices_by_product':Counter(x.get('product') for x in prices)}
 out['interpretation']='active_products is the number of products currently for sale; active_hkd_one_time_prices includes variants and any legacy active prices.'
 OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2,default=dict)+'\n',encoding='utf-8')
 print(json.dumps({k:v for k,v in out.items() if k!='active_prices_by_product'},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
