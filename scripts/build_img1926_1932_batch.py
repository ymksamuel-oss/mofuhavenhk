from __future__ import annotations

import json
from decimal import Decimal, ROUND_CEILING
from pathlib import Path

CNY_TO_HKD = Decimal('1.1654')
RETAIL_MULTIPLIER = Decimal('1.76')
TAIL = Decimal('0.90')

RAW_URLS = {
    'raw-IMG_1926': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/fpnzlspHxJgHDZEN.JPG',
    'raw-IMG_1927': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/gYZeEkTDjcnkoLjI.JPG',
    'raw-IMG_1928': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/rsgqnelBNlqbiFjA.JPG',
    'raw-IMG_1929': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/xaEXMlZbcBOZnaCO.JPG',
    'raw-IMG_1930': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/UwnLzxccDufJKmco.JPG',
    'raw-IMG_1931': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/QNhzyKPcLXDecIXJ.JPG',
    'raw-IMG_1932': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/xSqrTrlZAFfjcVpW.JPG',
}

CLEAN_URLS = {
    'clean-img1932-lion-smooth-550ml': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/UVPKOlfAePRIweqw.png',
    'clean-img1932-lion-smooth-refill-400ml': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/gWoAqvMZFSRnZdlM.png',
    'clean-img1931-lion-deodorizing-skin-550ml': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/PLvroQwuSPzTyBgJ.png',
    'clean-img1931-lion-puppy-kitten-230ml': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/SgUmHwqJyfBAoZPX.png',
    'clean-img1931-lion-cat-smooth-330ml': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/byuKKyjjmJrdHHvL.png',
}

CROP_URLS = {
    'crop-double-bowl-rack-black-white': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/gYZeEkTDjcnkoLjI.png',
    'crop-double-bowl-rack-yellow-pink': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/ACOMZDmUjuVHmyVe.png',
    'crop-single-bowl-rack-black': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/CrIRDVoVwuiGhtbG.png',
    'crop-single-bowl-rack-pink': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/nHTYfntIvqltYkqO.png',
    'crop-single-bowl-rack-white': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/HHjGwabQTxdairyp.png',
    'crop-ceramic-single-black-paw': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/ulDCcWStaYtfHUkm.png',
    'crop-ceramic-single-white-paw': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/zjekSNiNurPfdmTH.png',
    'crop-ceramic-single-black-fish': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/aaESVCddFjmJjcLV.png',
    'crop-ceramic-single-white-fish': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/xRAuJsbYtQSpanog.png',
    'crop-ceramic-single-pink-paw': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/zNNMnlzVKsGaugQK.png',
    'crop-ceramic-single-pink-fish': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/vsIugvvhYKqEnGRk.png',
    'crop-double-bowl-black-pair': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/sWUpGvDbFyPrnBEy.png',
    'crop-pink-bowl-pair': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/BmMLpTpOeWXFERzo.png',
    'crop-ceramic-single-yellow-paw': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/WAlIgzyLyNtTCeQD.png',
    'crop-ceramic-single-yellow-fish': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/BTUyVWGdWnjhNVkI.png',
    'crop-woven-cat-bed-blue-mat-chopsticks': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/XOrqcZczgzJtqEKO.png',
    'crop-woven-cat-bed-blue-cushion': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/DkfJHAjfTACTYHDv.png',
    'crop-woven-cat-bed-empty': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/uvjBvwfdHYiJgZGr.png',
    'crop-white-cat-house-bed': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/dPebVPzYGoriugWR.png',
    'crop-pink-small-medium-dog-bed': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/IXTWyIUBIAqbzUaP.png',
    'crop-blue-small-medium-dog-bed': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/fDJQxEbfrJHZuUqK.png',
    'crop-blue-large-ear-dog-round-bed': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/quXAqOsqMzgqSiTD.png',
    'crop-pink-large-dog-bed': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663882010321/YIybAKjtZCzPaNqk.png',
}


def round_up_to_90(value: Decimal) -> Decimal:
    return (value - TAIL).to_integral_value(rounding=ROUND_CEILING) + TAIL


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    source_path = root / 'data' / 'img1926_1932_candidate_products_2026-08-28.json'
    output_path = root / 'data' / 'img1926_1932_approved_product_batch_2026-08-28.json'
    report_path = root / 'reports' / 'img1926_1932_pricing_preview_2026-08-28.json'
    payload = json.loads(source_path.read_text(encoding='utf-8'))
    products = []
    missing_assets = []
    for product in payload['products']:
        product_image_urls = []
        variants = []
        for variant in product['variants']:
            cost = Decimal(variant['cost_cny'])
            unrounded = cost * CNY_TO_HKD * RETAIL_MULTIPLIER
            retail = round_up_to_90(unrounded)
            asset_key = variant['image_asset_key']
            if asset_key in CLEAN_URLS:
                image_url = CLEAN_URLS[asset_key]
                image_status = 'clean_ivory_generated'
            elif asset_key in CROP_URLS:
                image_url = CROP_URLS[asset_key]
                image_status = 'original_cropped_screenshot_pending_clean_ivory'
            elif asset_key in RAW_URLS:
                image_url = RAW_URLS[asset_key]
                image_status = 'original_screenshot_pending_clean_ivory'
            else:
                image_url = ''
                image_status = 'missing_image_asset'
                missing_assets.append({'product': product['import_key'], 'variant': variant['key'], 'asset_key': asset_key})
            product_image_urls.append(image_url)
            variants.append({
                **variant,
                'retail_hkd': f'{retail:.2f}',
                'retail_hkd_minor': int(retail * 100),
                'unrounded_retail_hkd': f'{unrounded:.2f}',
                'pricing_rule': 'ceil_to_.90(cost_cny × 1.1654 × 1.76)',
                'image_url': image_url,
                'image_status': image_status,
            })
        statuses = {variant['image_status'] for variant in variants}
        product_status = 'clean_ivory_generated' if statuses == {'clean_ivory_generated'} else ('mixed_clean_and_cropped_or_original_pending_clean_ivory' if 'clean_ivory_generated' in statuses else 'cropped_or_original_screenshot_pending_clean_ivory')
        products.append({
            **product,
            'images': list(dict.fromkeys(url for url in product_image_urls if url)),
            'variants': variants,
            'image_processing_status': product_status,
        })
    result = {
        'generated_from': source_path.name,
        'policy_version': payload['policy_version'],
        'currency': 'hkd',
        'cny_to_hkd': str(CNY_TO_HKD),
        'retail_multiplier': str(RETAIL_MULTIPLIER),
        'rounding': 'upward .90',
        'product_count': len(products),
        'variant_count': sum(len(p['variants']) for p in products),
        'products': products,
        'excluded_items': payload.get('excluded_items', []),
        'missing_assets': missing_assets,
        'temporary_image_policy': 'Original screenshots are temporary only where clean ivory generation was unavailable; replace after image quota reset.',
    }
    output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    report_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'output': str(output_path), 'report': str(report_path), 'product_count': len(products), 'variant_count': result['variant_count'], 'missing_assets': len(missing_assets)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
