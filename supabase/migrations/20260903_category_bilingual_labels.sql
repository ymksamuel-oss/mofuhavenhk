-- Add locale-aware display labels for parent and child category cards.
-- Existing `name` remains the required operational fallback.
alter table public.categories
  add column if not exists name_zh text,
  add column if not exists name_en text;

-- Preserve all existing storefront labels when first enabling bilingual fields.
update public.categories
set name_zh = name
where coalesce(trim(name_zh), '') = '';

comment on column public.categories.name_zh is 'Traditional Chinese storefront label for this category';
comment on column public.categories.name_en is 'English storefront label for this category';
