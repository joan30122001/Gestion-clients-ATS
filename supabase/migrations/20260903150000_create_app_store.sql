create table public.app_store (
  file_name text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_store enable row level security;

create policy "app_store_no_direct_access"
on public.app_store for all
to anon, authenticated
using (false)
with check (false);

revoke all on public.app_store from public, anon, authenticated;
grant all on public.app_store to service_role;
