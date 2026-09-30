-- Keep the legacy primary-image alias available for older storefront/admin integrations.
-- `images` remains the canonical ordered multi-image field.
alter table public.products
  add column if not exists image_url text;

update public.products
set image_url = nullif((images ->> 0), '')
where images is not null
  and jsonb_typeof(images) = 'array';
