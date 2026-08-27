#!/usr/bin/env python3
from __future__ import annotations
import csv,json,os
from collections import Counter
from datetime import datetime,timezone
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
import requests
ROOT=Path('/home/ubuntu/mofu-haven-hk')
OUT_JSON=ROOT/'reports/live_pricing_profit_distribution.json'
OUT_CSV=ROOT/'reports/live_pricing_profit_detail.csv'
RATE=Decimal('1.16642388')
def t(v): return str(v).strip() if v is not None else ''
def all_items(s,path,params):
 out=[]; p=dict(params,limit='100')
 while True:
  r=s.get('https://api.stripe.com/v1/'+path,params=p,timeout=60); r.raise_for_status(); d=r.json(); out+=d.get('data',[])
  if not d.get('has_more') or not d.get('data'): return out
  p['starting_after']=d['data'][-1]['id']
def dec(v):
 try: return Decimal(t(v))
 except: return None
def is_variant(p):
 m=p.get('metadata') or {}; return t(m.get('variant_mode')) in {'pack_size','option','choice'}
def cost_from(price,product,price_count):
 pm=price.get('metadata') or {}; prodm=product.get('metadata') or {}
 for k in ('cost_cny','cny_cost','source_cost_cny','cost_cny_per_product','supplier_cost_cny','unit_cost_cny'):
  x=dec(pm.get(k));
  if x is not None and x>0:return x,'price_metadata'
 if price_count==1:
  for k in ('cost_cny','cny_cost','source_cost_cny','cost_cny_per_product','supplier_cost_cny','unit_cost_cny'):
   x=dec(prodm.get(k));
   if x is not None and x>0:return x,'product_metadata'
 return None,''
def main():
 key=os.environ.get('STRIPE_SECRET_KEY')
 if not key: raise SystemExit('STRIPE_SECRET_KEY is required')
 s=requests.Session(); s.auth=(key,'')
 products=all_items(s,'products',{'active':'true'}); pmap={p['id']:p for p in products}
 prices=[x for x in all_items(s,'prices',{'active':'true','currency':'hkd','type':'one_time'}) if x.get('product') in pmap]
 byprod={}
 for x in prices: byprod.setdefault(x['product'],[]).append(x)
 rows=[]
 for p in products:
  ps=byprod.get(p['id'],[]); declared=[x for x in ps if (is_variant(p) and ((x.get('metadata') or {}).get('variant_key') or (x.get('metadata') or {}).get('variant_label_zh') or (t((x.get('metadata') or {}).get('pack_count')) and int(t((x.get('metadata') or {}).get('pack_count')) or 0)>0)))] if is_variant(p) else [x for x in ps if x.get('id')==p.get('default_price')]
  for x in declared:
   cost,source=cost_from(x,p,len(ps)); retail=Decimal(x.get('unit_amount',0))/100
   landed=(cost*RATE if cost is not None else None); profit=(retail-landed if landed is not None else None); margin=(profit/retail*100 if profit is not None and retail else None)
   rows.append({'product_id':p['id'],'product_name':p.get('name'),'mofu_sku':t((p.get('metadata') or {}).get('mofu_sku')),'price_id':x['id'],'is_default':x.get('id')==p.get('default_price'),'variant_label_zh':t((x.get('metadata') or {}).get('variant_label_zh')),'retail_hkd':str(retail),'cost_cny':str(cost) if cost is not None else '','cost_source':source,'cost_hkd_at_rate':f'{landed:.2f}' if landed is not None else '','gross_profit_hkd':f'{profit:.2f}' if profit is not None else '','gross_margin_pct':f'{margin:.2f}' if margin is not None else ''})
 rows.sort(key=lambda r: Decimal(r['gross_margin_pct']) if r['gross_margin_pct'] else Decimal('-999'))
 vals=[Decimal(r['gross_margin_pct']) for r in rows if r['gross_margin_pct']]
 bins={'negative':0,'0-20%':0,'20-30%':0,'30-40%':0,'40-50%':0,'50-60%':0,'60%+':0,'missing_cost':0}
 for r in rows:
  if not r['gross_margin_pct']: bins['missing_cost']+=1; continue
  m=Decimal(r['gross_margin_pct'])
  if m<0:bins['negative']+=1
  elif m<20:bins['0-20%']+=1
  elif m<30:bins['20-30%']+=1
  elif m<40:bins['30-40%']+=1
  elif m<50:bins['40-50%']+=1
  elif m<60:bins['50-60%']+=1
  else:bins['60%+']+=1
 summary={'generated_at_utc':datetime.now(timezone.utc).isoformat(),'scope':'active storefront Prices only','active_products':len(products),'active_prices_total':len(prices),'storefront_price_count':len(rows),'rate_hkd_per_cny_used':str(RATE),'rate_source':'ECB cross-rate from latest dry-run 2026-08-27','profit_definition':'gross profit = retail HKD - (cost CNY × rate); gross margin = gross profit / retail HKD; excludes Stripe fees, packaging, shipping, discounts and tax','cost_complete_count':sum(1 for r in rows if r['cost_cny']),'cost_missing_count':sum(1 for r in rows if not r['cost_cny']),'margin_min_pct':f'{min(vals):.2f}' if vals else None,'margin_median_pct':f'{sorted(vals)[len(vals)//2]:.2f}' if vals else None,'margin_max_pct':f'{max(vals):.2f}' if vals else None,'distribution':bins,'lowest_margin_rows':rows[:20],'highest_margin_rows':rows[-20:]}
 OUT_JSON.write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 with OUT_CSV.open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0].keys()) if rows else ['product_id']); w.writeheader(); w.writerows(rows)
 print(json.dumps({'active_products':len(products),'active_prices_total':len(prices),'storefront_price_count':len(rows),'cost_complete_count':summary['cost_complete_count'],'cost_missing_count':summary['cost_missing_count'],'margin_min_pct':summary['margin_min_pct'],'margin_median_pct':summary['margin_median_pct'],'margin_max_pct':summary['margin_max_pct'],'distribution':bins,'json':str(OUT_JSON),'csv':str(OUT_CSV)},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
