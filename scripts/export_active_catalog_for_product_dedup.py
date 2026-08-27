#!/usr/bin/env python3
from __future__ import annotations
import json,os
from pathlib import Path
import requests
OUT=Path('/home/ubuntu/mofu-haven-hk/reports/active_catalog_for_new_product_dedup.json')
def t(v):return str(v).strip() if v is not None else ''
def all_items(s,path,params):
 out=[];p=dict(params,limit='100')
 while True:
  r=s.get('https://api.stripe.com/v1/'+path,params=p,timeout=60);r.raise_for_status();d=r.json();out+=d.get('data',[])
  if not d.get('has_more') or not d.get('data'):return out
  p['starting_after']=d['data'][-1]['id']
def main():
 key=os.environ.get('STRIPE_SECRET_KEY')
 if not key:raise SystemExit('STRIPE_SECRET_KEY is required')
 s=requests.Session();s.auth=(key,''); products=all_items(s,'products',{'active':'true'}); rows=[]
 for p in products:
  prices=all_items(s,'prices',{'product':p['id'],'active':'true','currency':'hkd','type':'one_time'});pm=p.get('metadata') or {}
  rows.append({'product_id':p['id'],'product_name':p.get('name'),'description':p.get('description'),'mofu_sku':t(pm.get('mofu_sku')),'category':t(pm.get('category')),'variant_mode':t(pm.get('variant_mode')),'default_price':p.get('default_price'),'price_variants':[{'price_id':x['id'],'hkd':x.get('unit_amount',0)/100,'variant_label_zh':t((x.get('metadata') or {}).get('variant_label_zh')),'cost_cny':t((x.get('metadata') or {}).get('cost_cny')),'metadata':x.get('metadata') or {}} for x in prices]})
 OUT.write_text(json.dumps({'active_product_count':len(rows),'products':rows},ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({'active_product_count':len(rows),'report':str(OUT)},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
