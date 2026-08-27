#!/usr/bin/env python3
from __future__ import annotations
import json,os
from datetime import datetime,timezone
from pathlib import Path
import requests
OUT=Path('/home/ubuntu/mofu-haven-hk/reports/cat_bowl_variant_image_binding_2026-08-28.json')
BINDINGS={
 'prod_V8szxN4qvZQyrJ':{
  '自在如風（藍色插畫）':'/images/product-variants/cat-bowls/cat-ear-zizai-rufeng.png',
  '柿柿如意（綠色插畫）':'/images/product-variants/cat-bowls/cat-ear-persimmon-ruiyi.png',
  '藍胖胖':'/images/product-variants/cat-bowls/cat-ear-blue-chubby.png',
  '綠胖胖':'/images/product-variants/cat-bowls/cat-ear-green-chubby.png'},
 'prod_V8szss31Rm8tiJ':{
  '綠葉圖案':'/images/product-variants/cat-bowls/raised-flat-green-leaf.png',
  '羽毛圖案':'/images/product-variants/cat-bowls/raised-flat-feather.png'},
 'prod_V8t03LiP3rgoHN':{
  '橘色':'/images/product-variants/cat-bowls/cat-face-slanted-orange.png',
  '藍色':'/images/product-variants/cat-bowls/cat-face-slanted-blue.png'}}
def all_prices(s,pid):
 out=[];params={'product':pid,'active':'true','currency':'hkd','limit':100}
 while True:
  r=s.get('https://api.stripe.com/v1/prices',params=params,timeout=60);r.raise_for_status();data=r.json();out+=data.get('data',[])
  if not data.get('has_more') or not data.get('data'):return out
  params['starting_after']=data['data'][-1]['id']
def main():
 key=os.environ.get('STRIPE_SECRET_KEY')
 if not key:raise SystemExit('STRIPE_SECRET_KEY is required')
 s=requests.Session();s.auth=(key,''); records=[]
 for product_id,labels in BINDINGS.items():
  prices=all_prices(s,product_id)
  for label,url in labels.items():
   matched=[p for p in prices if (p.get('metadata') or {}).get('variant_label_zh','').strip()==label]
   if len(matched)!=1:raise SystemExit(f'{product_id} {label}: expected 1 active Price, got {len(matched)}')
   p=matched[0]
   r=s.post(f'https://api.stripe.com/v1/prices/{p["id"]}',data={'metadata[variant_image_url]':url},timeout=60)
   r.raise_for_status();updated=r.json()
   records.append({'product_id':product_id,'price_id':p['id'],'variant_label_zh':label,'variant_image_url':url,'verified_metadata_value':(updated.get('metadata') or {}).get('variant_image_url')})
 OUT.write_text(json.dumps({'updated_at_utc':datetime.now(timezone.utc).isoformat(),'operation':'bind_variant_images_only_no_price_or_cost_change','record_count':len(records),'records':records},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 if any(x['variant_image_url']!=x['verified_metadata_value'] for x in records):raise SystemExit('metadata verification failed')
 print(json.dumps({'bound':len(records),'report':str(OUT)},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
