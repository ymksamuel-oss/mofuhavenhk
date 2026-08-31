-- Mofu Haven Banner mobile artwork support.
-- Idempotent: safe to run in Supabase SQL Editor more than once.
--
-- Adds an optional mobile-specific Banner image so the storefront can prefer
-- portrait artwork on phones while keeping the desktop image unchanged.

alter table public.banners
  add column if not exists mobile_image_url text;

comment on column public.banners.mobile_image_url is
  'Optional mobile (portrait) Banner image URL. When set, the storefront prefers this artwork on viewports below 640px.';
