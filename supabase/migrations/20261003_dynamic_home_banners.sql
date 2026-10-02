-- Mofu Haven dynamic home hero banners.
-- Non-destructive: extends the independent public.banners table only.

alter table public.banners
  add column if not exists tag_en text not null default 'concept',
  add column if not exists title_zh text not null default '',
  add column if not exists title_en text,
  add column if not exists subtitle_zh text,
  add column if not exists subtitle_en text,
  add column if not exists button_text_zh text not null default '探索更多 ➔',
  add column if not exists button_text_en text default 'Explore More ➔',
  add column if not exists link_url text not null default '/collections/all',
  add column if not exists bg_type text not null default 'product_grid',
  add column if not exists custom_image_url text,
  add column if not exists is_active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

update public.banners
set
  title_zh = coalesce(nullif(title_zh, ''), title, ''),
  title_en = coalesce(nullif(title_en, ''), title),
  link_url = coalesce(nullif(link_url, ''), link, '/collections/all'),
  custom_image_url = coalesce(nullif(custom_image_url, ''), nullif(image_url, '')),
  updated_at = now();

create index if not exists banners_active_order_idx
  on public.banners (is_active, sort_order, created_at);

comment on table public.banners is 'Independent CMS content for the homepage hero carousel; unrelated to products data.';
comment on column public.banners.bg_type is 'product_grid for product matrix artwork, or custom_image for custom_image_url.';
