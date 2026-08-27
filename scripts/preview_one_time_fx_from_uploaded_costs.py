#!/usr/bin/env python3
from __future__ import annotations
import csv,json,os,math
from decimal import Decimal
from datetime import datetime,timezone
from pathlib import Path
import requests
INPUT=Path('/home/ubuntu/upload/recalculated_pricing_output(1).csv'); ROOT=Path('/home/ubuntu/mofu-haven-hk'); OUT=ROOT/'reports/one_time_fx_from_uploaded_costs_preview_2026-08-28.json'
RATE=Decimal('1.1678'); MULT=Decimal('1.76'); TAIL=Decimal('0.90')
def t(v):return str(v).strip() if v is not None else ''
def get(s,path,params=None):
 r=s.get('https://api.stripe.com/v1/'+path,params=params,timeout=60);r.raise_for_status();return r.json()
def prices(s,pid):
 out=[]; p={'product':pid,'active':'true','currency':'hkd','limit':'100'}
 while True:
  d=get(s,'prices',p);out+=d.get('data',[])
  if not d.get('has_more') or not d.get('data'):return out
  p['starting_after']=d['data'][-1]['id']
def calc(cost):
 raw=Decimal(cost)*RATE*MULT
 dollars=(raw-TAIL).to_integral_value(rounding='ROUND_CEILING')
 return int((dollars+TAIL)*100)
def main():
 key=os.environ.get('STRIPE_SECRET_KEY');
 if not key:raise SystemExit('STRIPE_SECRET_KEY is required')
 with INPUT.open(encoding='utf-8-sig',newline='') as f: rows=list(csv.DictReader(f))
 s=requests.Session();s.auth=(key,'');out=[]
 for n,r in enumerate(rows,start=2):
  p=get(s,'products/'+t(r['product_id'])); ps=prices(s,p['id']); isdef=t(r['is_default_price']).lower()=='true'; label=t(r.get('variant_label_zh'))
  cand=[x for x in ps if (x.get('id')==p.get('default_price') if isdef else t((x.get('metadata') or {}).get('variant_label_zh'))==label)]
  if len(cand)!=1:raise SystemExit(f'CSV row {n}: expected one current Price, got {len(cand)}')
  x=cand[0]; new=calc(t(r['cost_cny'])); old=int(x['unit_amount']); out.append({'csv_row':n,'product_id':p['id'],'price_id':x['id'],'product_name':p.get('name'),'mofu_sku':t(r.get('mofu_sku')),'variant_label_zh':label,'cost_cny':t(r['cost_cny']),'rate_hkd_per_cny':str(RATE),'old_hkd':f'{old/100:.2f}','new_hkd':f'{new/100:.2f}','change_hkd':f'{(new-old)/100:.2f}','would_change':new!=old,'proposed_hkd_ignored':t(r.get('proposed_hkd'))})
 out.sort(key=lambda x:int(x['csv_row'])); summary={'generated_at_utc':datetime.now(timezone.utc).isoformat(),'mode':'one_time_fx_preview_from_uploaded_costs_no_writes','input_file':str(INPUT),'formula':'ceil((cost_cny × 1.1678 × 1.76) to next .90)','proposed_hkd_used':False,'record_count':len(out),'unique_products':len({x['product_id'] for x in out}),'unique_prices':len({x['price_id'] for x in out}),'would_change_count':sum(x['would_change'] for x in out),'unchanged_count':sum(not x['would_change'] for x in out),'total_old_hkd':f'{sum(Decimal(x["old_hkd"]) for x in out):.2f}','total_new_hkd':f'{sum(Decimal(x["new_hkd"]) for x in out):.2f}','total_change_hkd':f'{sum(Decimal(x["change_hkd"]) for x in out):.2f}','rows':out}
 OUT.write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({k:summary[k] for k in ('mode','formula','proposed_hkd_used','record_count','unique_products','unique_prices','would_change_count','unchanged_count','total_old_hkd','total_new_hkd','total_change_hkd')},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
