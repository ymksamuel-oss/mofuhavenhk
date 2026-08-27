#!/usr/bin/env python3
"""Zero-write mapper for owner CSV rows to current active Stripe prices.

A CSV row marked is_default_price=True may map to the same Product's current
active default Price only when the Product and SKU agree and the current Price
metadata confirms the same SKU/variant. Non-default rows require the stronger
metadata-identical replacement lineage rule. CSV values are never recalculated.
"""
from __future__ import annotations
import csv, json, os
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
import requests

ROOT=Path(__file__).resolve().parents[1]
INPUT=Path('/home/ubuntu/upload/recalculated_pricing_output.csv')
OUT=ROOT/'reports/recalculated_pricing_output_default_mapping_2026-08-27.json'


def text(v: Any)->str:
    return str(v).strip() if v is not None else ''


def get(s: requests.Session, path: str, params: dict[str,str]|None=None)->dict[str,Any]:
    r=s.get('https://api.stripe.com/v1/'+path, params=params, timeout=60)
    r.raise_for_status(); return r.json()


def main()->None:
    key=os.environ.get('STRIPE_SECRET_KEY')
    if not key: raise SystemExit('STRIPE_SECRET_KEY is required')
    with INPUT.open(encoding='utf-8-sig', newline='') as f: rows=list(csv.DictReader(f))
    s=requests.Session(); s.auth=(key,'')
    records=[]
    for n,row in enumerate(rows,start=2):
        pid=text(row.get('product_id')); source_id=text(row.get('price_id'))
        rec={'csv_row':n,'product_id':pid,'source_csv_price_id':source_id,'mofu_sku':text(row.get('mofu_sku')),'variant_label_zh':text(row.get('variant_label_zh')),'proposed_hkd':text(row.get('proposed_hkd')),'cost_cny':text(row.get('cost_cny')),'current_active_price_id':'','mapping_status':'blocked','mapping_basis':'','issue':''}
        try:
            product=get(s,f'products/{pid}'); source=get(s,f'prices/{source_id}')
            if not product.get('active'): raise ValueError('Stripe Product is inactive')
            if source.get('product')!=pid: raise ValueError('CSV Price does not belong to CSV Product')
            pmeta=product.get('metadata') or {}; sku=text(pmeta.get('mofu_sku'))
            if rec['mofu_sku'] and sku and rec['mofu_sku']!=sku: raise ValueError('CSV SKU differs from Product SKU')
            current=None
            if text(row.get('is_default_price')).lower()=='true':
                default_id=text(product.get('default_price'))
                if not default_id: raise ValueError('Product has no default Price')
                current=get(s,f'prices/{default_id}')
                cmeta=current.get('metadata') or {}
                if not current.get('active') or current.get('currency')!='hkd' or current.get('type')!='one_time' or current.get('product')!=pid: raise ValueError('Product default Price is not active HKD one-time Price')
                if rec['mofu_sku'] and text(cmeta.get('mofu_sku'))!=rec['mofu_sku']: raise ValueError('Current default Price SKU differs from CSV')
                if rec['variant_label_zh'] and text(cmeta.get('variant_label_zh'))!=rec['variant_label_zh']: raise ValueError('Current default Price variant differs from CSV')
                rec['mapping_status']='eligible_product_default'; rec['mapping_basis']='same Product current default Price with matching SKU and variant'
            else:
                candidates=get(s,'prices',{'product':pid,'active':'true','currency':'hkd','limit':'100'}).get('data') or []
                matching=[p for p in candidates if p.get('type')=='one_time' and p.get('metadata')==source.get('metadata')]
                if len(matching)!=1: raise ValueError(f'Non-default row requires one metadata-identical replacement, found {len(matching)}')
                current=matching[0]; rec['mapping_status']='eligible_replacement_lineage'; rec['mapping_basis']='same Product plus metadata-identical active replacement Price'
            rec['current_active_price_id']=text(current.get('id')); rec['current_live_hkd']=f"{int(current.get('unit_amount'))/100:.2f}"
        except requests.HTTPError as e: rec['issue']=f'Stripe HTTP {e.response.status_code}'
        except (ValueError,TypeError,ArithmeticError) as e: rec['issue']=str(e)
        records.append(rec)
    eligible=[r for r in records if r['mapping_status'].startswith('eligible_')]
    duplicate=[k for k,v in Counter(r['current_active_price_id'] for r in eligible).items() if k and v>1]
    for r in eligible:
        if r['current_active_price_id'] in duplicate: r['mapping_status']='blocked'; r['issue']='Multiple CSV rows map to same current active Price'
    eligible=[r for r in records if r['mapping_status'].startswith('eligible_')]
    out={'generated_at_utc':datetime.now(timezone.utc).isoformat(),'mode':'strict_product_default_or_lineage_mapping_no_writes','no_stripe_writes_performed':True,'no_formula_recalculation_performed':True,'csv_record_count':len(records),'eligible_count':len(eligible),'blocked_count':len(records)-len(eligible),'status_counts':dict(Counter(r['mapping_status'] for r in records)),'records':records}
    OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'no_stripe_writes_performed':True,'eligible_count':len(eligible),'blocked_count':len(records)-len(eligible),'status_counts':out['status_counts'],'report':str(OUT)},ensure_ascii=False,indent=2))

if __name__=='__main__': main()
