begin;

-- Brand is already stored independently in products.brand/supplier_brand.
-- Keep those attributes unchanged and remove repeated supplier text from titles.
with selected_products as (
  select id, mofu_sku, name, name_zh, name_en
  from public.products
  where concat_ws(' ', name, name_zh, name_en) ~* 'Best[[:space:]]*Partner'
  order by id
  limit 252 offset 0
), cleaned_titles as (
  select
    id,
    case
      when mofu_sku = '4976064025623' then '【低敏紅肉】日本國產純馬肉健康能量棒 35g'
      when mofu_sku = '4976064022301' then '【鹿兒島產】黑豚原隻大豬耳特惠裝 5枚入'
      when mofu_sku = '4976064025791' then '【航天級凍乾】日本國產原條凍乾雞里肌肉 4本入'
      when name is null then null
      else trim(regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(name, 'Best[[:space:]]*Partner', '', 'gi'),
                '【日本製造[・、]?', '【', 'g'
              ),
              '(狗狗專用|狗狗用|狗用|犬用|貓貓專用|貓貓用|貓用)', '', 'g'
            ),
            '^[[:space:]]*(Dog[[:space:]]*/[[:space:]]*Cat|Dogs?|Cats?)[[:space:]]+', '', 'i'
          ),
          '【[[:space:]]*】', '', 'g'
        ),
        '(】)[[:space:]]+', '\1', 'g'
      ))
    end as name,
    case
      when mofu_sku = '4976064025623' then '【低敏紅肉】日本國產純馬肉健康能量棒 35g'
      when mofu_sku = '4976064022301' then '【鹿兒島產】黑豚原隻大豬耳特惠裝 5枚入'
      when mofu_sku = '4976064025791' then '【航天級凍乾】日本國產原條凍乾雞里肌肉 4本入'
      when name_zh is null then null
      else trim(regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(name_zh, 'Best[[:space:]]*Partner', '', 'gi'),
                '【日本製造[・、]?', '【', 'g'
              ),
              '(狗狗專用|狗狗用|狗用|犬用|貓貓專用|貓貓用|貓用)', '', 'g'
            ),
            '^[[:space:]]*(Dog[[:space:]]*/[[:space:]]*Cat|Dogs?|Cats?)[[:space:]]+', '', 'i'
          ),
          '【[[:space:]]*】', '', 'g'
        ),
        '(】)[[:space:]]+', '\1', 'g'
      ))
    end as name_zh,
    case
      when name_en is null then null
      else trim(regexp_replace(
        regexp_replace(
          regexp_replace(name_en, 'Best[[:space:]]*Partner', '', 'gi'),
          '^[[:space:]]*(Dog[[:space:]]*/[[:space:]]*Cat|Dogs?|Cats?)[[:space:]]+', '', 'i'
        ),
        '[[:space:]]+', ' ', 'g'
      ))
    end as name_en
  from selected_products
)
update public.products as p
set name = cleaned_titles.name,
    name_zh = cleaned_titles.name_zh,
    name_en = cleaned_titles.name_en
from cleaned_titles
where p.id = cleaned_titles.id;

commit;
