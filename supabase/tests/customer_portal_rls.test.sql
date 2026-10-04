-- Run after 20261004100000_customer_portal.sql with Supabase's pgTAP test runner.
begin;
select plan(10);

insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data)
values
  ('11111111-1111-4111-8111-111111111111', 'portal-owner@example.test', now(), '{"display_name":"Portal Owner"}'::jsonb),
  ('22222222-2222-4222-8222-222222222222', 'portal-other@example.test', now(), '{"display_name":"Other User"}'::jsonb)
on conflict (id) do nothing;

insert into public.orders (customer_info, items, total, status, order_number)
select '{"email":"portal-owner@example.test","name":"Portal Owner"}'::jsonb, '[]'::jsonb, 125.00, 'paid', 'RLS-PORTAL-OWNER-01'
where not exists (select 1 from public.orders where order_number = 'RLS-PORTAL-OWNER-01');

insert into public.customer_addresses (id, user_id, label, address_type, recipient_name, recipient_phone, address, district)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'Owner home', 'home', 'Portal Owner', '+852 91234567', '1 Test Road', '中西區'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'Other home', 'home', 'Other User', '+852 91234568', '2 Test Road', '油尖旺區')
on conflict (id) do nothing;

insert into public.customer_pets (id, user_id, name, species)
values
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '11111111-1111-4111-8111-111111111111', 'Momo', 'cat'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '22222222-2222-4222-8222-222222222222', 'Paw', 'dog')
on conflict (id) do nothing;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);

select is((select count(*) from public.customer_addresses), 1::bigint, 'member sees only their own address');
select is((select count(*) from public.customer_pets), 1::bigint, 'member sees only their own pet');
select is((select count(*) from public.customer_profiles), 1::bigint, 'member sees only their own profile');
select is((select count(*) from public.orders where order_number = 'RLS-PORTAL-OWNER-01'), 1::bigint, 'verified email signup trigger links a matching guest order');
select lives_ok($$insert into public.customer_addresses (user_id, label, address_type, recipient_name, recipient_phone, address, district) values (auth.uid(), 'New home', 'home', 'Portal Owner', '+852 91234567', '3 Test Road', '中西區')$$, 'member may create own address');
select throws_ok($$insert into public.customer_addresses (user_id, label, address_type, recipient_name, recipient_phone, address, district) values ('22222222-2222-4222-8222-222222222222', 'Injected', 'home', 'Other User', '+852 91234568', 'Bad', '油尖旺區')$$, '42501', null, 'member cannot create another user address');
select is((with changed as (update public.customer_pets set name = 'Hacked' where id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd' returning 1) select count(*) from changed), 0::bigint, 'cross-user pet update affects no rows');
select lives_ok($$select public.set_customer_default_address('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')$$, 'member can set an owned address as default');
select is((select count(*) from public.customer_addresses where is_default), 1::bigint, 'default address RPC selects one owned address');
select throws_ok($$insert into public.orders (customer_info, items, total, status) values ('{}'::jsonb, '[]'::jsonb, 0, 'pending')$$, '42501', null, 'member cannot insert or forge order rows');

select * from finish();
rollback;
