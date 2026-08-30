-- Mofu Haven category/SKU repair.
-- Idempotent: safe to run in Supabase SQL Editor more than once.

alter table public.products
  add column if not exists mofu_sku text;

create index if not exists products_mofu_sku_idx
  on public.products (mofu_sku);

insert into public.categories (name, slug, sort_order)
values
  ('貓咪商品', 'cats', 10),
  ('貓咪商品（相容路由）', 'cat', 10),
  ('狗狗商品', 'dogs', 20),
  ('狗狗商品（相容路由）', 'dog', 20)
on conflict (slug) do update
set name = excluded.name,
    sort_order = excluded.sort_order;

-- products.category_id is a single foreign key, so each SKU is bound to the
-- canonical plural category. The singular category rows above are route/API
-- aliases and are normalized by the application to cats/dogs.
update public.products as p
set category_id = c.id
from public.categories as c
where c.slug = case
  when upper(coalesce(p.mofu_sku, '')) like '%MH-CAT%' then 'cats'
  when upper(coalesce(p.mofu_sku, '')) like '%MH-DOG%' then 'dogs'
end
and c.slug in ('cats', 'dogs');

-- Keep existing category assignments canonical when their slug is singular.
update public.products as p
set category_id = c_plural.id
from public.categories as c_singular
join public.categories as c_plural
  on c_plural.slug = case c_singular.slug
    when 'cat' then 'cats'
    when 'dog' then 'dogs'
  end
where p.category_id = c_singular.id;

-- Verification query (run separately if a result table is desired):
-- select c.slug, count(*)
-- from public.products p
-- join public.categories c on c.id = p.category_id
-- where upper(coalesce(p.mofu_sku, '')) like '%MH-CAT%'
--    or upper(coalesce(p.mofu_sku, '')) like '%MH-DOG%'
-- group by c.slug
-- order by c.slug;
