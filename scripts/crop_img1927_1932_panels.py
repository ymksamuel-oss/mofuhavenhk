from __future__ import annotations

from pathlib import Path
from PIL import Image

OUT = Path('/home/ubuntu/webdev-static-assets/img1927_1932_refs')
OUT.mkdir(parents=True, exist_ok=True)

# Coordinates are source-pixel crops chosen from the supplied screenshots.
# Each crop includes the product visual and enough surrounding context for an
# image-edit model to identify the product, while excluding unrelated panels.
CROPS = {
    'IMG_1932': {
        'source': '/home/ubuntu/upload/IMG_1932.JPG',
        'panels': {
            'lion_anti_flea_550ml': (0, 145, 235, 505),
            'lion_smooth_550ml': (235, 145, 470, 505),
            'lion_smooth_refill_400ml': (470, 145, 704, 505),
            'lion_smooth_combo_550ml_400ml': (0, 1280, 704, 1524),
        },
    },
    'IMG_1931': {
        'source': '/home/ubuntu/upload/IMG_1931.JPG',
        'panels': {
            'lion_deodorizing_skin_550ml': (0, 75, 352, 650),
            'lion_puppy_kitten_230ml': (352, 75, 704, 650),
            'lion_cat_smooth_330ml': (0, 650, 352, 1200),
            'lion_anti_flea_combo_400ml_unclear': (352, 650, 704, 1524),
        },
    },
    'IMG_1930': {
        'source': '/home/ubuntu/upload/IMG_1930.JPG',
        'panels': {
            'double_bowl_rack_black_white': (0, 125, 365, 440),
            'double_bowl_rack_yellow_pink': (365, 125, 704, 440),
            'single_bowl_rack_black': (0, 440, 352, 800),
            'single_bowl_rack_white': (352, 440, 704, 800),
            'ceramic_single_black_paw': (0, 800, 352, 1130),
            'ceramic_single_white_fish': (352, 800, 704, 1130),
            'ceramic_single_yellow_paw': (0, 1130, 352, 1480),
            'ceramic_single_yellow_fish': (352, 1130, 704, 1480),
        },
    },
    'IMG_1929': {
        'source': '/home/ubuntu/upload/IMG_1929.JPG',
        'panels': {
            'double_bowl_rack_black_white': (0, 90, 460, 410),
            'double_bowl_rack_yellow_pink': (460, 90, 920, 410),
            'double_bowl_black_pair': (920, 90, 1376, 410),
            'single_bowl_black_paw': (0, 410, 344, 770),
            'single_bowl_white_paw': (344, 410, 688, 770),
            'single_bowl_black_fish': (688, 410, 1032, 770),
            'single_bowl_white_fish': (1032, 410, 1376, 770),
            'single_bowl_pink_fish': (0, 770, 344, 1200),
            'single_bowl_pink_paw': (344, 770, 688, 1200),
            'pink_bowl_pair': (688, 770, 1032, 1200),
        },
    },
    'IMG_1928': {
        'source': '/home/ubuntu/upload/IMG_1928.JPG',
        'panels': {
            'double_bowl_rack_white': (0, 0, 352, 500),
            'double_bowl_rack_yellow': (352, 0, 704, 500),
            'double_bowl_rack_black': (0, 500, 352, 820),
            'single_bowl_rack_pink': (352, 500, 704, 820),
            'single_bowl_rack_black': (0, 820, 352, 1100),
            'single_bowl_rack_pink_lower': (352, 820, 704, 1100),
            'ceramic_single_yellow_paw': (0, 1100, 352, 1524),
            'ceramic_single_yellow_fish': (352, 1100, 704, 1524),
        },
    },
    'IMG_1927': {
        'source': '/home/ubuntu/upload/IMG_1927.JPG',
        'panels': {
            'double_bowl_rack_white': (0, 0, 352, 500),
            'double_bowl_rack_yellow': (352, 0, 704, 500),
            'double_bowl_rack_black': (0, 500, 352, 820),
            'single_bowl_rack_pink': (352, 500, 704, 820),
            'single_bowl_rack_black': (0, 820, 352, 1100),
            'single_bowl_rack_pink_lower': (352, 820, 704, 1100),
            'ceramic_single_yellow_paw': (0, 1100, 352, 1524),
            'ceramic_single_yellow_fish': (352, 1100, 704, 1524),
        },
    },
    'IMG_1926': {
        'source': '/home/ubuntu/upload/IMG_1926.JPG',
        'panels': {
            'woven_cat_bed_blue_mat_chopsticks': (0, 0, 344, 385),
            'woven_cat_bed_blue_cushion': (344, 0, 688, 385),
            'woven_cat_bed_empty': (688, 0, 1032, 385),
            'white_cat_house_bed': (1032, 0, 1376, 385),
            'pink_small_medium_dog_bed': (0, 385, 344, 768),
            'blue_small_medium_dog_bed': (344, 385, 688, 768),
            'blue_large_ear_dog_round_bed': (688, 385, 1032, 768),
            'pink_large_dog_bed': (1032, 385, 1376, 768),
        },
    },
}

for group, config in CROPS.items():
    source = Path(config['source'])
    image = Image.open(source).convert('RGB')
    group_dir = OUT / group
    group_dir.mkdir(parents=True, exist_ok=True)
    for name, box in config['panels'].items():
        left, top, right, bottom = box
        left = max(0, min(left, image.width - 1))
        top = max(0, min(top, image.height - 1))
        right = max(left + 1, min(right, image.width))
        bottom = max(top + 1, min(bottom, image.height))
        image.crop((left, top, right, bottom)).save(group_dir / f'{name}.png')

print(f'created crop groups in {OUT}')
