#!/usr/bin/env python3
from __future__ import annotations
import csv,json
from collections import Counter
from decimal import Decimal
from pathlib import Path
INPUT=Path('/home/ubuntu/upload/recalculated_pricing_output(1).csv')
ROOT=Path('/home/ubuntu/mofu-haven-hk'); OUT=ROOT/'reports/uploaded_csv_profit_distribution_2026-08-28.json'; DETAIL=ROOT/'reports/uploaded_csv_profit_detail_2026-08-28.csv'
def d(v):return Decimal(str(v).strip())
def main():
 with INPUT.open(encoding='utf-8-sig',newline='') as f: rows=list(csv.DictReader(f))
 detail=[]
 for r in rows:
  cost=d(r['cost_cny']); retail=d(r['proposed_hkd']); rate=d(r['latest_cny_to_hkd']); cost_hkd=cost*rate; gp=retail-cost_hkd; margin=gp/retail*100
  x=dict(r); x.update({'cost_hkd_at_latest_fx':f'{cost_hkd:.2f}','gross_profit_hkd':f'{gp:.2f}','gross_margin_pct':f'{margin:.2f}'})
  detail.append(x)
 bins={'negative':0,'0-20%':0,'20-30%':0,'30-40%':0,'40-50%':0,'50-60%':0,'60%+':0}
 for x in detail:
  m=d(x['gross_margin_pct'])
  if m<0:bins['negative']+=1
  elif m<20:bins['0-20%']+=1
  elif m<30:bins['20-30%']+=1
  elif m<40:bins['30-40%']+=1
  elif m<50:bins['40-50%']+=1
  elif m<60:bins['50-60%']+=1
  else:bins['60%+']+=1
 vals=[d(x['gross_margin_pct']) for x in detail]; total_retail=sum(d(x['proposed_hkd']) for x in detail); total_cost=sum(d(x['cost_hkd_at_latest_fx']) for x in detail); total_gp=total_retail-total_cost
 bycat={}
 for x in detail:
  bycat.setdefault(x.get('category',''),[]).append(d(x['gross_margin_pct']))
 category_summary={k:{'count':len(v),'avg_margin_pct':f'{sum(v)/len(v):.2f}'} for k,v in sorted(bycat.items())}
 detail.sort(key=lambda x:d(x['gross_margin_pct']))
 out={'source_file':str(INPUT),'record_count':len(detail),'unique_product_ids':len({x['product_id'] for x in detail}),'unique_price_ids':len({x['price_id'] for x in detail}),'all_costs_treated_as_owner_verified':True,'fx_rate_basis':'latest_cny_to_hkd column from CSV','fx_rate_values':sorted({x['latest_cny_to_hkd'] for x in detail}),'definition':'gross profit = proposed_hkd - cost_cny × latest_cny_to_hkd; gross margin = gross profit / proposed_hkd; excludes Stripe fees, packaging, shipping, discounts, tax and refunds','total_retail_hkd':f'{total_retail:.2f}','total_cost_hkd':f'{total_cost:.2f}','total_gross_profit_hkd':f'{total_gp:.2f}','weighted_gross_margin_pct':f'{total_gp/total_retail*100:.2f}','margin_min_pct':f'{min(vals):.2f}','margin_median_pct':f'{sorted(vals)[len(vals)//2]:.2f}','margin_max_pct':f'{max(vals):.2f}','distribution':bins,'category_summary':category_summary,'lowest_margin_rows':detail[:15],'highest_margin_rows':detail[-15:]}
 OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 with DETAIL.open('w',encoding='utf-8-sig',newline='') as f:
  fields=list(detail[0].keys()); w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(detail)
 print(json.dumps({k:out[k] for k in ('record_count','unique_product_ids','unique_price_ids','fx_rate_values','total_retail_hkd','total_cost_hkd','total_gross_profit_hkd','weighted_gross_margin_pct','margin_min_pct','margin_median_pct','margin_max_pct','distribution','category_summary')},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
