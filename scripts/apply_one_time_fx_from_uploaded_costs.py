#!/usr/bin/env python3
from __future__ import annotations
import csv,hashlib,json,os
from decimal import Decimal
from datetime import datetime,timezone
from pathlib import Path
import requests
ROOT=Path('/home/ubuntu/mofu-haven-hk'); INPUT=Path('/home/ubuntu/upload/recalculated_pricing_output(1).csv'); OUT=ROOT/'reports/one_time_fx_from_uploaded_costs_apply_result_2026-08-28.json'; RATE=Decimal('1.1678'); MULT=Decimal('1.76'); TAIL=Decimal('0.90')
def t(v):return str(v).strip() if v is not None else ''
def get(s,path,params=None):
 r=s.get('https://api.stripe.com/v1/'+path,params=params,timeout=60);r.raise_for_status();return r.json()
def post(s,path,data,key):
 r=s.post('https://api.stripe.com/v1/'+path,data=data,headers={'Idempotency-Key':key},timeout=60);r.raise_for_status();return r.json()
def calc(cost):
 raw=Decimal(cost)*RATE*MULT; dollars=(raw-TAIL).to_integral_value(rounding='ROUND_CEILING'); return int((dollars+TAIL)*100)
def all_prices(s,pid):
 out=[]; p={'product':pid,'active':'true','currency':'hkd','limit':'100'}
 while True:
  d=get(s,'prices',p);out+=d.get('data',[])
  if not d.get('has_more') or not d.get('data'):return out
  p['starting_after']=d['data'][-1]['id']
def main():
 key=os.environ.get('STRIPE_SECRET_KEY');
 if not key:raise SystemExit('STRIPE_SECRET_KEY is required')
 with INPUT.open(encoding='utf-8-sig',newline='') as f: rows=list(csv.DictReader(f))
 s=requests.Session();s.auth=(key,''); items=[]
 for n,r in enumerate(rows,start=2):
  pid=t(r['product_id']);p=get(s,'products/'+pid); ps=all_prices(s,pid); isdef=t(r['is_default_price']).lower()=='true'; label=t(r.get('variant_label_zh')); cand=[x for x in ps if (x.get('id')==p.get('default_price') if isdef else t((x.get('metadata') or {}).get('variant_label_zh'))==label)]
  if len(cand)!=1:raise SystemExit(f'row {n}: expected one current Price, got {len(cand)}')
  x=cand[0]; items.append({'csv_row':n,'product_id':pid,'price_id':x['id'],'cost_cny':t(r['cost_cny']),'old_cents':int(x['unit_amount']),'new_cents':calc(t(r['cost_cny'])),'source_metadata':x.get('metadata') or {},'nickname':x.get('nickname'),'tax_behavior':x.get('tax_behavior'),'source_was_default':x['id']==p.get('default_price')})
 if len({x['price_id'] for x in items})!=len(items):raise SystemExit('duplicate current Price mapping')
 result={'mode':'one_time_fx_apply_from_uploaded_costs','formula':'ceil((cost_cny × 1.1678 × 1.76) to next .90)','proposed_hkd_used':False,'started_at_utc':datetime.now(timezone.utc).isoformat(),'records':[]}
 try:
  for item in items:
   source=get(s,'prices/'+item['price_id']); suffix=hashlib.sha256(f"{item['price_id']}:{item['cost_cny']}:{item['new_cents']}:{RATE}".encode()).hexdigest()[:16]
   entry={k:item[k] for k in ('csv_row','product_id','price_id','cost_cny','old_cents','new_cents','source_was_default')};entry['old_hkd']=f"{item['old_cents']/100:.2f}";entry['new_hkd']=f"{item['new_cents']/100:.2f}"
   if source['unit_amount']==item['new_cents']:
    fields=[('metadata[cost_cny]',item['cost_cny']),('metadata[pricing_cost_cny_baseline]',''),('metadata[pricing_cost_baseline_method]','')]
    updated=post(s,'prices/'+source['id'],fields,'mofu-one-time-cost-meta-'+source['id']+'-'+suffix);entry['result_price_id']=updated['id'];entry['status']='updated_metadata_only'
   else:
    fields=[('unit_amount',str(item['new_cents'])),('currency','hkd'),('product',item['product_id']),('active','true')]
    for k,v in source.get('metadata',{}).items():
     if k in {'cost_cny','pricing_cost_cny_baseline','pricing_cost_baseline_method','cny_cost','source_cost_cny','cost_cny_per_product','supplier_cost_cny','unit_cost_cny'}:continue
     if t(v):fields.append((f'metadata[{k}]',t(v)))
    fields.append(('metadata[cost_cny]',item['cost_cny']))
    if t(source.get('nickname')):fields.append(('nickname',t(source['nickname'])))
    if t(source.get('tax_behavior')) in {'inclusive','exclusive'}:fields.append(('tax_behavior',t(source['tax_behavior'])))
    repl=post(s,'prices',fields,'mofu-one-time-create-'+source['id']+'-'+suffix)
    try:
     if item['source_was_default']:post(s,'products/'+item['product_id'],[('default_price',repl['id'])],'mofu-one-time-default-'+item['product_id']+'-'+suffix)
     post(s,'prices/'+source['id'],[('active','false')],'mofu-one-time-deactivate-'+source['id']+'-'+suffix)
    except Exception:
     current=get(s,'prices/'+source['id'])
     if current.get('active'):
      if item['source_was_default']:post(s,'products/'+item['product_id'],[('default_price',source['id'])],'mofu-one-time-restore-'+item['product_id']+'-'+suffix)
      post(s,'prices/'+repl['id'],[('active','false')],'mofu-one-time-compensate-'+repl['id']+'-'+suffix)
     raise
    entry['result_price_id']=repl['id'];entry['status']='replacement_price_created';entry['source_price_deactivated']=True;entry['default_price_switched']=item['source_was_default']
   result['records'].append(entry); OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
  result['completed_at_utc']=datetime.now(timezone.utc).isoformat(); result['status_counts']={k:sum(1 for x in result['records'] if x['status']==k) for k in sorted({x['status'] for x in result['records']})}; OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({'records':len(result['records']),'status_counts':result['status_counts'],'result':str(OUT)},ensure_ascii=False,indent=2))
 except Exception as e:
  result['error']=str(e);result['failed_at_utc']=datetime.now(timezone.utc).isoformat();OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');raise
if __name__=='__main__':main()
