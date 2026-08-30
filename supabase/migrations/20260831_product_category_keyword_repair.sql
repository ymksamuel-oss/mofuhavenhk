-- Idempotent category repair for the managed storefront.
-- Run in Supabase SQL Editor with the service role / owner connection.

-- Normalize the two legacy rows whose slugs were empty or incorrectly reused.
update public.categories
set slug = 'lifestyle', name = '寵物生活用品', sort_order = 40
where (slug is null or btrim(slug) = '') and name in ('睡窩及家居', '寵物生活用品');

update public.categories
set slug = 'dry-food', name = '乾糧', sort_order = 60
where name in ('乾糧', '貓乾糧', '狗狗乾糧') and lower(coalesce(slug, '')) = 'cat';

-- Add canonical category rows only when a matching slug/name does not already exist.
insert into public.categories (name, slug, sort_order)
select definition.name, definition.slug, definition.sort_order
from (values
  ('貓咪商品', 'cats', 10),
  ('狗狗商品', 'dogs', 20),
  ('小寵物用品', 'small-pets', 30),
  ('寵物生活用品', 'lifestyle', 40),
  ('零食', 'snacks', 50),
  ('乾糧', 'dry-food', 60)
) as definition(name, slug, sort_order)
where not exists (
  select 1 from public.categories c
  where lower(coalesce(c.slug, '')) = lower(definition.slug)
);

-- Keyword precedence is intentional: small pets first, then treats and dry food,
-- then pet family, then general lifestyle. Unknown product copy falls back to lifestyle
-- instead of retaining the historical all-products default UUID.
with category_ids as (
  select
    (select id from public.categories where lower(slug) = 'cats' order by sort_order, id limit 1) as cats_id,
    (select id from public.categories where lower(slug) = 'dogs' order by sort_order, id limit 1) as dogs_id,
    (select id from public.categories where lower(slug) = 'small-pets' order by sort_order, id limit 1) as small_pets_id,
    (select id from public.categories where lower(slug) = 'lifestyle' order by sort_order, id limit 1) as lifestyle_id,
    (select id from public.categories where lower(slug) = 'snacks' order by sort_order, id limit 1) as snacks_id,
    (select id from public.categories where lower(slug) = 'dry-food' order by sort_order, id limit 1) as dry_food_id
), classified as (
  select
    p.id,
    case
      when concat_ws(' ', p.name, p.description, p.mofu_sku) ilike any (array['%兔%', '%rabbit%', '%倉鼠%', '%hamster%', '%沙鼠%', '%天竺鼠%', '%龍貓%', '%chinchilla%', '%刺蝟%', '%小寵物%', '%small pet%']) then 'small-pets'
      when concat_ws(' ', p.name, p.description, p.mofu_sku) ilike any (array['%零食%', '%小食%', '%肉乾%', '%肉干%', '%肉泥%', '%脆餅%', '%餅乾%', '%treat%', '%snack%', '%jerky%', '%chew%']) then 'snacks'
      when concat_ws(' ', p.name, p.description, p.mofu_sku) ilike any (array['%乾糧%', '%干粮%', '%貓糧%', '%猫粮%', '%狗糧%', '%飼料%', '%kibble%', '%dry food%']) then 'dry-food'
      when upper(coalesce(p.mofu_sku, '')) like '%MH-CAT%' or concat_ws(' ', p.name, p.description) ilike any (array['%貓%', '%猫%', '%cat%', '%feline%']) then 'cats'
      when upper(coalesce(p.mofu_sku, '')) like '%MH-DOG%' or concat_ws(' ', p.name, p.description) ilike any (array['%狗%', '%犬%', '%dog%', '%canine%']) then 'dogs'
      else 'lifestyle'
    end as target_slug
  from public.products p
)
update public.products p
set category_id = case classified.target_slug
  when 'cats' then category_ids.cats_id
  when 'dogs' then category_ids.dogs_id
  when 'small-pets' then category_ids.small_pets_id
  when 'lifestyle' then category_ids.lifestyle_id
  when 'snacks' then category_ids.snacks_id
  when 'dry-food' then category_ids.dry_food_id
end
from classified, category_ids
where p.id = classified.id
  and case classified.target_slug
    when 'cats' then category_ids.cats_id
    when 'dogs' then category_ids.dogs_id
    when 'small-pets' then category_ids.small_pets_id
    when 'lifestyle' then category_ids.lifestyle_id
    when 'snacks' then category_ids.snacks_id
    when 'dry-food' then category_ids.dry_food_id
  end is not null;

-- Verification: this should return zero default UUID rows and show the final distribution.
-- select c.slug, c.name, count(*)
-- from public.products p
-- left join public.categories c on c.id = p.category_id
-- group by c.slug, c.name
-- order by c.slug nulls last;
