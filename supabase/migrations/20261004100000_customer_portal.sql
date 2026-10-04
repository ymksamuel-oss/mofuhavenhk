begin;

create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  phone text not null default '',
  avatar_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_profiles_display_name_length check (char_length(display_name) <= 100),
  constraint customer_profiles_phone_length check (char_length(phone) <= 32)
);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  address_type text not null check (address_type in ('home', 'business', 'sf_pickup')),
  recipient_name text not null,
  recipient_phone text not null,
  address text not null default '',
  address_line2 text not null default '',
  district text not null default '',
  region text,
  pickup_point_code text,
  pickup_point_name text,
  pickup_point_type text check (pickup_point_type is null or pickup_point_type in ('station', 'locker', 'partner')),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_addresses_label_length check (char_length(label) between 1 and 80),
  constraint customer_addresses_recipient_name_length check (char_length(recipient_name) between 1 and 100),
  constraint customer_addresses_phone_length check (char_length(recipient_phone) between 1 and 32),
  constraint customer_addresses_address_length check (char_length(address) <= 500),
  constraint customer_addresses_pickup_fields check (
    (address_type = 'sf_pickup' and pickup_point_code is not null and pickup_point_name is not null)
    or (address_type <> 'sf_pickup' and pickup_point_code is null and pickup_point_name is null and pickup_point_type is null)
  )
);

create table if not exists public.customer_pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  species text not null check (species in ('dog', 'cat')),
  birthday date,
  breed text not null default '',
  allergy_ingredients text[] not null default '{}'::text[],
  special_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_pets_name_length check (char_length(name) between 1 and 80),
  constraint customer_pets_breed_length check (char_length(breed) <= 100),
  constraint customer_pets_notes_length check (char_length(special_notes) <= 2000)
);

alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists payment_method_label text,
  add column if not exists tracking_number text;

create index if not exists customer_addresses_user_updated_idx
  on public.customer_addresses(user_id, updated_at desc);
create index if not exists customer_pets_user_created_idx
  on public.customer_pets(user_id, created_at asc);
create index if not exists orders_user_created_idx
  on public.orders(user_id, created_at desc);
create unique index if not exists orders_checkout_session_id_unique_idx
  on public.orders(stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create unique index if not exists customer_addresses_one_default_per_user_idx
  on public.customer_addresses(user_id)
  where is_default;

create or replace function public.touch_customer_record_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.touch_customer_record_updated_at() from public, anon, authenticated;

create or replace function public.handle_new_customer_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    insert into public.customer_profiles (user_id, display_name, avatar_url)
    values (
      new.id,
      left(coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 100),
      left(coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', ''), 1000)
    )
    on conflict (user_id) do nothing;
  exception when others then
    raise warning 'Customer profile bootstrap failed for auth user %: %', new.id, sqlerrm;
  end;

  if new.email_confirmed_at is not null and nullif(btrim(new.email), '') is not null then
    begin
      update public.orders
      set user_id = new.id
      where user_id is null
        and lower(btrim(customer_info ->> 'email')) = lower(btrim(new.email));
    exception when others then
      raise warning 'Guest order linking failed for auth user %: %', new.id, sqlerrm;
    end;
  end if;
  return new;
end;
$$;

revoke all on function public.handle_new_customer_profile() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_customer_profile on auth.users;
create trigger on_auth_user_created_customer_profile
  after insert on auth.users
  for each row execute function public.handle_new_customer_profile();

drop trigger if exists on_auth_user_verified_link_guest_orders on auth.users;
create trigger on_auth_user_verified_link_guest_orders
  after update of email, email_confirmed_at on auth.users
  for each row
  when (new.email_confirmed_at is not null and (old.email_confirmed_at is null or old.email is distinct from new.email))
  execute function public.handle_new_customer_profile();

create or replace function public.link_verified_customer_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id is null and nullif(btrim(new.customer_info ->> 'email'), '') is not null then
    begin
      update public.orders as target
      set user_id = customer.id
      from auth.users as customer
      where target.id = new.id
        and target.user_id is null
        and customer.email_confirmed_at is not null
        and lower(btrim(customer.email)) = lower(btrim(new.customer_info ->> 'email'));
    exception when others then
      -- Order creation and Stripe payment completion must remain available if
      -- account linking encounters a transient database/schema issue.
      raise warning 'Verified-email order linking failed for order row %: %', new.id, sqlerrm;
    end;
  end if;
  return new;
end;
$$;

revoke all on function public.link_verified_customer_order() from public, anon, authenticated;
drop trigger if exists on_order_created_link_verified_customer on public.orders;
create trigger on_order_created_link_verified_customer
  after insert on public.orders
  for each row execute function public.link_verified_customer_order();

create or replace function public.set_customer_default_address(p_address_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.customer_addresses
    where id = p_address_id and user_id = v_user_id
  ) then
    raise exception 'Address not found' using errcode = 'P0002';
  end if;

  update public.customer_addresses
  set is_default = false, updated_at = now()
  where user_id = v_user_id and is_default and id <> p_address_id;

  update public.customer_addresses
  set is_default = true, updated_at = now()
  where id = p_address_id and user_id = v_user_id;
end;
$$;

revoke all on function public.set_customer_default_address(uuid) from public, anon;
grant execute on function public.set_customer_default_address(uuid) to authenticated;

drop trigger if exists customer_profiles_touch_updated_at on public.customer_profiles;
create trigger customer_profiles_touch_updated_at before update on public.customer_profiles
  for each row execute function public.touch_customer_record_updated_at();
drop trigger if exists customer_addresses_touch_updated_at on public.customer_addresses;
create trigger customer_addresses_touch_updated_at before update on public.customer_addresses
  for each row execute function public.touch_customer_record_updated_at();
drop trigger if exists customer_pets_touch_updated_at on public.customer_pets;
create trigger customer_pets_touch_updated_at before update on public.customer_pets
  for each row execute function public.touch_customer_record_updated_at();

alter table public.customer_profiles enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.customer_pets enable row level security;
alter table public.orders enable row level security;

revoke all on table public.customer_profiles from anon, authenticated;
revoke all on table public.customer_addresses from anon, authenticated;
revoke all on table public.customer_pets from anon, authenticated;
revoke all on table public.orders from anon, authenticated;

grant select, insert, update on table public.customer_profiles to authenticated;
grant select, insert, update, delete on table public.customer_addresses to authenticated;
grant select, insert, update, delete on table public.customer_pets to authenticated;
grant select on table public.orders to authenticated;

drop policy if exists customer_profiles_select_own on public.customer_profiles;
create policy customer_profiles_select_own on public.customer_profiles
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists customer_profiles_insert_own on public.customer_profiles;
create policy customer_profiles_insert_own on public.customer_profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists customer_profiles_update_own on public.customer_profiles;
create policy customer_profiles_update_own on public.customer_profiles
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists customer_addresses_select_own on public.customer_addresses;
create policy customer_addresses_select_own on public.customer_addresses
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists customer_addresses_insert_own on public.customer_addresses;
create policy customer_addresses_insert_own on public.customer_addresses
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists customer_addresses_update_own on public.customer_addresses;
create policy customer_addresses_update_own on public.customer_addresses
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists customer_addresses_delete_own on public.customer_addresses;
create policy customer_addresses_delete_own on public.customer_addresses
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists customer_pets_select_own on public.customer_pets;
create policy customer_pets_select_own on public.customer_pets
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists customer_pets_insert_own on public.customer_pets;
create policy customer_pets_insert_own on public.customer_pets
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists customer_pets_update_own on public.customer_pets;
create policy customer_pets_update_own on public.customer_pets
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists customer_pets_delete_own on public.customer_pets;
create policy customer_pets_delete_own on public.customer_pets
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
  for select to authenticated using ((select auth.uid()) = user_id);

commit;
