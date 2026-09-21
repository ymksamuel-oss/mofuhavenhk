import concurrent.futures
import json
import re
from pathlib import Path
from openai import OpenAI

SRC = Path('/home/ubuntu/mofuhavenhk/top20-products-source.json')
OUT = Path('/home/ubuntu/mofuhavenhk/top20-copy-drafts.json')
MODEL = 'gpt-5-mini'
client = OpenAI()

SCHEMA = {
    'type': 'object', 'additionalProperties': False,
    'properties': {
        'id': {'type': 'string'}, 'mofu_sku': {'type': 'string'},
        'description_zh': {'type': 'string'}, 'description_en': {'type': 'string'},
        'review_flags': {'type': 'array', 'items': {'type': 'string'}},
    },
    'required': ['id', 'mofu_sku', 'description_zh', 'description_en', 'review_flags']
}

SYSTEM = '''你是香港寵物用品電商的專業繁體中文 SEO 編輯。只可根據提供的商品名稱、規格、價格、標籤及原始描述改寫，不得新增原始資料沒有的產地、成分、營養數字、功效、認證或使用方式。若原文有誇大或醫療暗示，改成中性、可核實的產品描述，並在 review_flags 標記。不要把價格寫入 description，價格由網站 Schema 管理。輸出 description_zh 必須有四個清晰區塊：1) 痛點與核心賣點（1-2句）；2) 核心產品特色（3-4點）；3) 規格與購買資訊（保留已知規格，未知寫「以包裝標示為準」）；4) FAQ（兩條，只回答原始資料能支持的問題，不能猜測）。description_en 使用相同結構，以自然英文寫作。不得使用「治療、改善疾病、保證、絕對、取代獸醫、抗焦慮、去牙石、消炎、護眼明目」等醫療或保證性表述；可改寫為「適合作為日常獎勵／咀嚼／餵食選擇」。保留原始已知數字時不得改動。'''

def clean(x):
    return re.sub(r'\\u[0-9a-fA-F]{4}', '', x or '').strip()

def one(p):
    payload = {k: p.get(k) for k in ['id','mofu_sku','name_zh','name_en','price','original_price','description_zh','description_en','product_spec','pet_species','feature_tags','brand','supplier_brand']}
    r = client.chat.completions.create(
        model=MODEL,
        messages=[{'role':'system','content':SYSTEM},{'role':'user','content':json.dumps(payload,ensure_ascii=False)}],
        max_completion_tokens=2400,
        response_format={'type':'json_schema','json_schema':{'name':'product_copy','strict':True,'schema':SCHEMA}},
    )
    out = json.loads(r.choices[0].message.content)
    out['description_zh'] = clean(out['description_zh'])
    out['description_en'] = clean(out['description_en'])
    return out

products = json.loads(SRC.read_text())
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    drafts = list(pool.map(one, products))
OUT.write_text(json.dumps(drafts, ensure_ascii=False, indent=2))
print(f'wrote {len(drafts)} drafts to {OUT}')

