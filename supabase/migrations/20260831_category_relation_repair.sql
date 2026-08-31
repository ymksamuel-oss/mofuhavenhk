-- Canonicalize legacy category rows so the public category cards and routes
-- receive stable, unique slugs while preserving product foreign-key references.
-- The statements are name-based and idempotent; no generated UUIDs are embedded.

begin;

-- Remove zero-product alias rows before promoting the real parent rows.
delete from public.categories c
where lower(coalesce(c.slug, '')) in ('cats', 'dogs')
  and c.name in ('貓咪熱銷', '狗狗熱銷')
  and not exists (
    select 1 from public.products p where p.category_id = c.id
  );

-- Promote the existing parent rows from singular aliases to canonical slugs.
update public.categories c
set slug = 'cats', name = '貓咪商品', sort_order = 10
where lower(coalesce(c.slug, '')) = 'cat'
  and c.name = '貓咪商品'
  and not exists (
    select 1 from public.categories other
    where other.id <> c.id and lower(coalesce(other.slug, '')) = 'cats'
  );

update public.categories c
set slug = 'dogs', name = '狗狗商品', sort_order = 20
where lower(coalesce(c.slug, '')) = 'dog'
  and c.name = '狗狗商品'
  and not exists (
    select 1 from public.categories other
    where other.id <> c.id and lower(coalesce(other.slug, '')) = 'dogs'
  );

-- Repair imported category slugs used by products and the admin editor.
update public.categories c
set slug = 'dry-food', name = '乾糧', sort_order = 60
where lower(coalesce(c.slug, '')) = 'cat'
  and c.name in ('乾糧', '貓乾糧', '狗狗乾糧')
  and not exists (
    select 1 from public.categories other
    where other.id <> c.id and lower(coalesce(other.slug, '')) = 'dry-food'
  );

update public.categories
set slug = 'cat-cans', name = '貓罐頭', sort_order = 55
where name = '貓罐頭'
  and btrim(coalesce(slug, '')) = '';

commit;
