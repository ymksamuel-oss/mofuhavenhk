alter table public.products
  add column if not exists cost_price_rmb numeric(12,4);

comment on column public.products.cost_price_rmb is 'Supplier cost in RMB/CNY used for dynamic HKD retail pricing.';

create index if not exists products_cost_price_rmb_idx
  on public.products(cost_price_rmb)
  where cost_price_rmb is not null;

insert into public.store_settings(key, value, updated_at)
values
  ('rmb_hkd_rate', '1.178', now()),
  ('pricing_multiplier', '1.88', now())
on conflict (key) do nothing;

-- The exchange-rate settings are intentionally not public-readable; the storefront
-- receives only the already-calculated HKD selling price from products.price.
revoke select on public.store_settings from anon, authenticated;
grant select on public.store_settings to anon, authenticated;
drop policy if exists settings_public_read on public.store_settings;
create policy settings_public_read on public.store_settings
  for select using (key in ('announcement','shipping_note','whatsapp_url','instagram_url','stripe_publishable_key'));
