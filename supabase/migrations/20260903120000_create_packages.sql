create table public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text not null check (char_length(btrim(description)) between 1 and 1000),
  monthly_price bigint not null check (monthly_price > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index packages_stable_order_idx on public.packages (created_at desc, id desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger packages_set_updated_at
before update on public.packages
for each row execute function public.set_updated_at();

alter table public.packages enable row level security;

create policy "packages_select_active_admin"
on public.packages for select to authenticated
using (exists (
  select 1 from public.profiles
  where profiles.id = (select auth.uid())
    and profiles.role = 'ADMIN'
    and profiles.is_active = true
));

create policy "packages_insert_active_admin"
on public.packages for insert to authenticated
with check (exists (
  select 1 from public.profiles
  where profiles.id = (select auth.uid())
    and profiles.role = 'ADMIN'
    and profiles.is_active = true
));

create policy "packages_update_active_admin"
on public.packages for update to authenticated
using (exists (
  select 1 from public.profiles
  where profiles.id = (select auth.uid())
    and profiles.role = 'ADMIN'
    and profiles.is_active = true
))
with check (exists (
  select 1 from public.profiles
  where profiles.id = (select auth.uid())
    and profiles.role = 'ADMIN'
    and profiles.is_active = true
));

create function public.list_packages_admin()
returns table (id uuid, name text, description text, monthly_price text, is_active boolean, created_at timestamptz, updated_at timestamptz)
language sql stable security invoker set search_path = ''
as $$ select p.id, p.name, p.description, p.monthly_price::text, p.is_active, p.created_at, p.updated_at from public.packages p order by p.created_at desc, p.id desc $$;

create function public.create_package_admin(package_name text, package_description text, package_monthly_price text, package_is_active boolean)
returns table (id uuid, name text, description text, monthly_price text, is_active boolean, created_at timestamptz, updated_at timestamptz)
language sql volatile security invoker set search_path = ''
as $$
  insert into public.packages (name, description, monthly_price, is_active)
  values (
    btrim(package_name), btrim(package_description),
    case when package_monthly_price ~ '^[1-9][0-9]{0,18}$'
      and (char_length(package_monthly_price) < 19 or package_monthly_price <= '9223372036854775807')
      then package_monthly_price::bigint else null end,
    package_is_active
  )
  returning packages.id, packages.name, packages.description, packages.monthly_price::text, packages.is_active, packages.created_at, packages.updated_at
$$;

create function public.update_package_admin(package_id uuid, package_name text, package_description text, package_monthly_price text, package_is_active boolean)
returns table (id uuid, name text, description text, monthly_price text, is_active boolean, created_at timestamptz, updated_at timestamptz)
language sql volatile security invoker set search_path = ''
as $$
  update public.packages set name = btrim(package_name), description = btrim(package_description), monthly_price =
    case when package_monthly_price ~ '^[1-9][0-9]{0,18}$'
      and (char_length(package_monthly_price) < 19 or package_monthly_price <= '9223372036854775807')
      then package_monthly_price::bigint else null end,
    is_active = package_is_active
  where packages.id = package_id
  returning packages.id, packages.name, packages.description, packages.monthly_price::text, packages.is_active, packages.created_at, packages.updated_at
$$;

revoke all on function public.list_packages_admin() from public, anon;
revoke all on function public.create_package_admin(text, text, text, boolean) from public, anon;
revoke all on function public.update_package_admin(uuid, text, text, text, boolean) from public, anon;
grant execute on function public.list_packages_admin() to authenticated;
grant execute on function public.create_package_admin(text, text, text, boolean) to authenticated;
grant execute on function public.update_package_admin(uuid, text, text, text, boolean) to authenticated;
