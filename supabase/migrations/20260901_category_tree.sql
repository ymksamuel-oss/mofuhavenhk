-- Database-backed category hierarchy for the storefront and Admin.
-- Safe to run repeatedly in Supabase SQL Editor / migration deployment.
begin;

alter table public.categories
  add column if not exists parent_id uuid;

-- Preserve existing databases while adding the relation exactly once.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'categories_parent_id_fkey'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
      add constraint categories_parent_id_fkey
      foreign key (parent_id)
      references public.categories(id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'categories_parent_id_not_self'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
      add constraint categories_parent_id_not_self
      check (parent_id is null or parent_id <> id);
  end if;
end $$;

create index if not exists categories_parent_id_sort_order_idx
  on public.categories (parent_id, sort_order, id);

create index if not exists products_category_id_idx
  on public.products (category_id);

create or replace function public.prevent_category_parent_cycle()
returns trigger
language plpgsql
as $$
begin
  if new.parent_id is null then
    return new;
  end if;

  if exists (
    with recursive ancestors as (
      select id, parent_id from public.categories where id = new.parent_id
      union all
      select category.id, category.parent_id
      from public.categories category
      join ancestors on category.id = ancestors.parent_id
    )
    select 1 from ancestors where id = new.id
  ) then
    raise exception 'categories.parent_id would create a cycle';
  end if;

  return new;
end;
$$;

drop trigger if exists categories_prevent_parent_cycle on public.categories;
create trigger categories_prevent_parent_cycle
before insert or update of parent_id on public.categories
for each row execute function public.prevent_category_parent_cycle();

commit;
