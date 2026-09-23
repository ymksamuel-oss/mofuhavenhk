from __future__ import annotations

import json
import re
from pathlib import Path

RESULT = Path('/home/ubuntu/.mcp/tool-results/2026-09-23_15-41-54.524550130_supabase_execute_sql_4411e845.json')
OUT = Path('/tmp/name_en_updates.json')
REPORT = Path('/tmp/name_en_generation_report.json')
CJK = re.compile(r'[\u3400-\u9fff\u3040-\u30ff]')
GENERIC = re.compile(r'pet\s+lifestyle\s+accessory|japanese\s+natural\s+pet\s+treat|japanese\s+pet\s+essential', re.I)

# Ordered longest-first replacements for the managed Traditional Chinese catalog names.
REPLACEMENTS = [
    ('低敏原肉馬肉棒', 'Pure Horse Meat Energy Sticks'), ('純馬肉健康能量棒', 'Pure Horse Meat Energy Sticks'),
    ('北海道蝦夷鹿肉乾', 'Hokkaido Wild Deer Jerky'), ('蝦夷鹿肉乾', 'Hokkaido Wild Deer Jerky'), ('鹿肉乾', 'Wild Deer Jerky'),
    ('雞里肌', 'Chicken Breast'), ('純雞肉', 'Pure Chicken'), ('雞胸肉', 'Chicken Breast'), ('雞砂肝', 'Chicken Gizzard'), ('雞肝', 'Chicken Liver'), ('雞爪', 'Chicken Feet'), ('雞冠骨', 'Chicken Comb Bone'),
    ('牛蹄筋', 'Beef Tendon'), ('牛大筋', 'Beef Tendon'), ('牛筋', 'Beef Tendon'), ('牛蹄', 'Beef Hoof'), ('牛舌', 'Beef Tongue'), ('牛肋排骨', 'Beef Rib Bones'), ('牛肉', 'Beef'),
    ('馬蹄筋', 'Horse Hoof Tendon'), ('馬肉', 'Horse Meat'), ('羊肋骨', 'Lamb Rib Bones'), ('仔羊', 'Lamb'), ('豬耳', 'Pork Ears'), ('黑豚', 'Black Pork'), ('豬肉', 'Pork'), ('鴨頸骨', 'Duck Neck Bone'), ('鴨里肌', 'Duck Breast'),
    ('黃鰭金槍魚', 'Yellowfin Tuna'), ('金槍魚', 'Tuna'), ('吞拿魚', 'Tuna'), ('柴魚', 'Bonito Flakes'), ('鰹魚', 'Bonito'), ('小魚乾', 'Crispy Dried Sardines'), ('丁香魚', 'Dried Sardines'), ('姬鱈魚', 'Hime Cod'), ('鱈魚', 'Cod'), ('三文魚', 'Salmon'), ('鮭魚', 'Salmon'), ('鯊魚軟骨', 'Shark Cartilage'), ('鯊魚皮', 'Shark Skin'), ('魚乾', 'Fish Jerky'), ('白身魚', 'White Fish'), ('真鯛', 'Sea Bream'), ('海鰻', 'Sea Eel'), ('鱧魚', 'Hamo Eel'),
    ('犛牛芝士', 'Himalayan Yak Cheese'), ('山羊奶', 'Goat Milk'), ('芝士', 'Cheese'), ('乳酪', 'Yogurt'), ('地瓜', 'Sweet Potato'), ('蕃薯', 'Sweet Potato'), ('甘藷', 'Sweet Potato'), ('安納芋', 'Japanese Sweet Potato'), ('蔬菜', 'Vegetable'), ('水果', 'Fruit'), ('蔓越莓', 'Cranberry'), ('納豆', 'Natto'), ('豆腐', 'Tofu'), ('大豆', 'Soybean'), ('香蕉', 'Banana'), ('蘋果', 'Apple'),
    ('薄削花撒粉', 'Flakes Topper'), ('撒粉', 'Meal Topper'), ('拌糧粉', 'Meal Topper'), ('拌糧', 'Food Topper'), ('肉碎', 'Meat Crumble'), ('肉鬆', 'Meat Floss'), ('手撕肉絲', 'Hand-Torn Shreds'), ('肉絲', 'Meat Strips'), ('肉乾', 'Jerky'), ('原肉', 'Natural Meat'), ('肉棒', 'Meat Sticks'), ('能量棒', 'Energy Sticks'), ('薄片', 'Thin-Cut Slices'), ('薄切', 'Thin-Cut Slices'), ('脆片', 'Crispy Slices'), ('方塊', 'Cubes'), ('一口丁', 'One-Bite Cubes'), ('小方塊', 'Small Cubes'), ('細切條', 'Fine-Cut Strips'), ('肉條', 'Meat Strips'), ('軟骨', 'Cartilage'), ('磨牙骨', 'Dental Chew Bone'), ('潔齒', 'Dental Chew'), ('耐咬', 'Long-Lasting Chew'), ('凍乾', 'Freeze-Dried'), ('鬆餅', 'Waffle'), ('米果', 'Rice Cracker'), ('小饅頭', 'Mini Bites'), ('餅乾', 'Biscuits'), ('乾糧', 'Dry Food'), ('主食', 'Complete Meal'), ('拾便袋', 'Waste Bags'), ('胸背帶', 'Harness'), ('頸圈', 'Collar'), ('牽引帶', 'Leash'), ('牽引繩', 'Leash'), ('托特包', 'Tote Bag'),
]


def parse_rows() -> list[dict]:
    wrapper = json.loads(RESULT.read_text())
    text = wrapper['result']
    start = text.find('[{')
    end = text.rfind('}]') + 2
    if start < 0 or end <= start:
        raise RuntimeError('Unable to locate SQL result array')
    return json.loads(text[start:end])


def safe(value: str | None) -> bool:
    value = str(value or '').strip()
    return bool(value) and not CJK.search(value) and not GENERIC.search(value)


def spec(row: dict, source: str) -> str:
    value = str(row.get('product_spec') or '').strip()
    if not value:
        matches = re.findall(r'\d+(?:\.\d+)?\s*(?:kg|g|ml|本|枚|個|隻|支|包|入|P)', source, flags=re.I)
        value = matches[-1] if matches else ''
    value = value.replace('本', ' pcs').replace('枚', ' pcs').replace('個', ' pcs').replace('隻', ' pc').replace('支', ' pcs').replace('入', ' pcs').replace('P', ' pcs')
    value = re.sub(r'\s+', ' ', value).strip()
    return value


def generated(row: dict) -> str:
    source = str(row.get('name_zh') or row.get('name') or '').strip()
    tags = ' '.join(str(x) for x in (row.get('feature_tags') or []) if x)
    combined = f'{source} {tags}'
    animal = 'Cat' if str(row.get('pet_species') or '').lower() == 'cat' or re.search(r'貓|猫', combined) else 'Dog'
    words: list[str] = []
    for zh, en in REPLACEMENTS:
        if zh in combined and en not in words:
            words.append(en)
    # Use a product-type signal rather than a made-up category when the source is sparse.
    if not words:
        words.append('Natural Pet Food')
    result = f'BestPartner {animal} ' + ' '.join(words)
    size = spec(row, source)
    if size:
        result += f' {size}'
    result = re.sub(r'\s+', ' ', result).strip()
    # Never allow source-language leakage into name_en.
    result = CJK.sub('', result)
    result = re.sub(r'\s{2,}', ' ', result).strip()
    return result


def normalize_existing(value: str, row: dict) -> str:
    value = re.sub(r'\s+', ' ', value).strip()
    # Standardize only the brand prefix; preserve the curated product wording.
    value = re.sub(r'^\[?Made in Japan\]?\s*', '', value, flags=re.I)
    value = re.sub(r'^Best\s+Partner\s+Made in Japan\s+', '', value, flags=re.I)
    value = re.sub(r'^Best\s+Partner\s+', '', value, flags=re.I)
    value = re.sub(r'^Japan-Made\s+', '', value, flags=re.I)
    animal = 'Cat' if str(row.get('pet_species') or '').lower() == 'cat' or re.search(r'貓|猫', str(row.get('name_zh') or row.get('name') or '')) else 'Dog'
    return f'BestPartner {animal} {value}'.strip()

rows = parse_rows()
updates = []
changed = 0
invalid_before = 0
for row in rows:
    current = str(row.get('name_en') or '').strip()
    if not safe(current):
        invalid_before += 1
        new_value = generated(row)
    else:
        new_value = normalize_existing(current, row)
    if not safe(new_value):
        raise RuntimeError(f'Generated unsafe name for {row.get("mofu_sku")}: {new_value!r}')
    if new_value != current:
        changed += 1
    updates.append({'id': row['id'], 'mofu_sku': row.get('mofu_sku'), 'old_name_en': current, 'name_en': new_value})

OUT.write_text(json.dumps(updates, ensure_ascii=False, indent=2) + '\n')
REPORT.write_text(json.dumps({'total_rows': len(rows), 'invalid_before': invalid_before, 'changed': changed, 'cjk_after': sum(bool(CJK.search(x['name_en'])) for x in updates), 'generic_after': sum(bool(GENERIC.search(x['name_en'])) for x in updates)}, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(json.loads(REPORT.read_text()), ensure_ascii=False))
