# HD product image source notes

- Official supplier site: https://best-partner.co.jp/
- Official new-products archive: https://best-partner.co.jp/archives/category/new-products/
- Official site identifies dog, cat, supplies categories and publishes product detail pages under `/archives/<post-id>/`.
- Official product images are served from `https://best-partner.co.jp/wp/wp/wp-content/uploads/...`.
- The batch script only accepts an official page image when both pixel dimensions are at least 800px; it never upscales or uses third-party marketplace images.
- Supabase project URL: `https://hkuxxgduymkztkmyhhot.supabase.co`
- Supabase Storage bucket/path currently used by the storefront: `public-images/best-partner/`.
- Sample live product `4976064026545` (Hokkaido wild deer jerky) current cover was measured at 1020x1627; its secondary image `4976064026545-1.jpg` was 100x157. The cover is already above the 800px threshold.
- Official site content confirms Best Partner’s Japanese product catalog and manufacturing identity; source page was fetched on 2026-10-01.
