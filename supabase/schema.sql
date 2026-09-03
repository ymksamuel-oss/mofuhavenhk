create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), name text not null, name_zh text, name_en text, slug text not null unique,
  image_url text, sort_order integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), name text not null, price numeric(12,2) not null default 0,
  original_price numeric(12,2), stock integer not null default 0, description text, images jsonb not null default '[]'::jsonb,
  category_id uuid references public.categories(id) on delete set null, seo_title text, seo_description text,
  created_at timestamptz not null default now(),
  is_published boolean not null default true,
  mofu_sku text,
  brand text,
  current_hkd numeric(12,2),
  status text not null default 'published',
  source_product_id text,
  source_price_id text
);
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(), image_url text not null, mobile_image_url text, link text, title text,
  sort_order integer not null default 0, created_at timestamptz not null default now()
);

-- Existing databases pick up the optional mobile Banner column via the migration below.
alter table public.banners
  add column if not exists mobile_image_url text;
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(), code text not null unique, discount_amount numeric(12,2) not null default 0,
  discount_type text not null default 'fixed' check (discount_type in ('fixed','percentage')), active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), customer_info jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb, total numeric(12,2) not null default 0,
  status text not null default 'pending', order_number text, payment_intent_id text,
  created_at timestamptz not null default now()
);
create table if not exists public.store_settings (
  key text primary key, value text not null default '', updated_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_created_at_idx on public.products(created_at desc);
create index if not exists products_storefront_status_idx on public.products(status, is_published, stock);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create unique index if not exists orders_order_number_idx on public.orders(order_number) where order_number is not null;
create index if not exists orders_payment_intent_idx on public.orders(payment_intent_id) where payment_intent_id is not null;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.banners enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select using (true);
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select using (true);
drop policy if exists banners_public_read on public.banners;
create policy banners_public_read on public.banners for select using (true);
drop policy if exists coupons_public_read on public.coupons;
create policy coupons_public_read on public.coupons for select using (active = true);
drop policy if exists settings_public_read on public.store_settings;
create policy settings_public_read on public.store_settings for select using (key in ('announcement','shipping_note','whatsapp_url','instagram_url','stripe_publishable_key'));

insert into storage.buckets (id, name, public) values ('public-images', 'public-images', true) on conflict (id) do update set public = true;

drop policy if exists public_images_read on storage.objects;
create policy public_images_read on storage.objects for select using (bucket_id = 'public-images');

do $$ begin
  if not exists (select 1 from public.store_settings where key = 'announcement') then
    insert into public.store_settings(key,value) values
      ('announcement','歡迎來到 Mofu Haven HK'),('shipping_note','滿指定金額享免費送貨'),
      ('whatsapp_url',''),('instagram_url',''),('stripe_publishable_key','');
  end if;
end $$;
