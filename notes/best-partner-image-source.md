# Best Partner image-source findings

- Official homepage: https://best-partner.co.jp/
- Official product example: https://best-partner.co.jp/archives/3626/
- Official product page exposes JAN 4976064024626 and original images under https://best-partner.co.jp/wp/wp/wp-content/uploads/ with filenames beginning with the JAN, e.g. 4976064024626.jpg and 4976064024626-1.jpg.
- Official search works with `https://best-partner.co.jp/?s=<query>` and returns `/archives/<id>/` product links.
- Official dog category confirms Japanese names such as ささみ巻きガム, ビーフロールスティック, 鹿肉キューブ, and さつまいもキューブ.
- Existing implementation incorrectly used https://www.wt-japan.com and only exact-matched the full prefixed storefront name.
- New implementation uses Best Partner official source, JAN-first matching via product `mofu_sku`, then cleaned text after `|` with storefront prefixes/specifications removed, extracts official title/JAN/original image, downloads to Supabase, and preserves prior images as fallback.
