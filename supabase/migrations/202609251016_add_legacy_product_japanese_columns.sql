alter table public.products
  add column if not exists name_ja text,
  add column if not exists description_ja text;
