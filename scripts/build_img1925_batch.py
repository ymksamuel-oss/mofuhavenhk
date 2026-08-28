from __future__ import annotations

import json
from decimal import Decimal, ROUND_CEILING
from pathlib import Path

CNY_TO_HKD = Decimal('1.1654')
RETAIL_MULTIPLIER = Decimal('1.76')
TAIL = Decimal('0.90')

IMAGE_URLS = {
    'cream-low-profile-pet-bowl-40cm-2026': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/SbUPDqWBuKeORnlQ.png',
    'charcoal-low-profile-pet-bowl-40cm-2026': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/nzjpoIvXXJsIRiQv.png',
    'blush-pink-pet-bed-40cm-2026': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/GsWdwbEKqUTZALDJ.png',
    'green-round-pet-bed-50cm-2026': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/sjsMEJvIZrEELzlH.png',
    'green-round-pet-bed-40cm-2026': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/NKXcMZlsTlCOVjoJ.png',
    'wooden-cat-tower-toy-ball-2026': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/GnAjDYAYYfRldQZr.png',
    'blush-pink-round-pet-bed-2026': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/BbbIszrkuiLQLFfi.png',
    'woven-oval-cat-bed-cream-cushion-2026': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/vfnXlxchqlbJGOAQ.png',
    'beige-low-profile-pet-bed-95x80-2026': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/PqdMxifcsVYmfyFB.png',
}

VARIANT_IMAGE_URLS = {
    'cream-40cm': IMAGE_URLS['cream-low-profile-pet-bowl-40cm-2026'],
    'charcoal-40cm': IMAGE_URLS['charcoal-low-profile-pet-bowl-40cm-2026'],
    'blush-pink-40cm': IMAGE_URLS['blush-pink-pet-bed-40cm-2026'],
    'forest-green-50cm': IMAGE_URLS['green-round-pet-bed-50cm-2026'],
    'sage-green-40cm': IMAGE_URLS['green-round-pet-bed-40cm-2026'],
    'wooden-tower-standard': IMAGE_URLS['wooden-cat-tower-toy-ball-2026'],
    'blush-pink-large': IMAGE_URLS['blush-pink-round-pet-bed-2026'],
    'grey-large': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/wdMiLssQfDRBkEVo.png',
    'light-green-large': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/CTAxrQlJFsWBkroh.png',
    'dark-green-large': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/EfkDvFrSaVpbsqEa.png',
    'woven-oval-cream-standard': IMAGE_URLS['woven-oval-cat-bed-cream-cushion-2026'],
    'beige-95x80': IMAGE_URLS['beige-low-profile-pet-bed-95x80-2026'],
}


def round_up_to_90(value: Decimal) -> Decimal:
    return (value - TAIL).to_integral_value(rounding=ROUND_CEILING) + TAIL


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    source = root / 'data' / 'img1925_candidate_products_2026-08-28.json'
    output = root / 'data' / 'img1925_approved_product_batch_2026-08-28.json'
    report = root / 'reports' / 'img1925_pricing_preview_2026-08-28.json'
    payload = json.loads(source.read_text(encoding='utf-8'))
    products = []
    for product in payload['products']:
        import_key = product['import_key']
        image_url = IMAGE_URLS[import_key]
        variants = []
        product_image_urls = []
        for variant in product['variants']:
            cost = Decimal(variant['cost_cny'])
            unrounded = cost * CNY_TO_HKD * RETAIL_MULTIPLIER
            retail = round_up_to_90(unrounded)
            variant_image_url = VARIANT_IMAGE_URLS.get(variant['key'], image_url)
            product_image_urls.append(variant_image_url)
            variants.append({
                **variant,
                'retail_hkd': f'{retail:.2f}',
                'retail_hkd_minor': int(retail * 100),
                'unrounded_retail_hkd': f'{unrounded:.2f}',
                'pricing_rule': 'ceil_to_.90(cost_cny × 1.1654 × 1.76)',
                'image_url': variant_image_url,
                'image_status': 'clean_ivory_generated',
            })
        products.append({
            **product,
            'images': list(dict.fromkeys(product_image_urls)),
            'variants': variants,
            'image_processing_status': 'clean_ivory_generated',
        })
    result = {
        'generated_from': source.name,
        'policy_version': payload['policy_version'],
        'currency': 'hkd',
        'cny_to_hkd': str(CNY_TO_HKD),
        'retail_multiplier': str(RETAIL_MULTIPLIER),
        'rounding': 'upward .90',
        'product_count': len(products),
        'variant_count': sum(len(p['variants']) for p in products),
        'products': products,
    }
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'output': str(output), 'report': str(report), 'product_count': len(products), 'variant_count': result['variant_count']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
