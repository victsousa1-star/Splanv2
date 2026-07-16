-- SPlan - Configuracao Supabase
-- Execute este arquivo no SQL Editor do seu projeto Supabase.

create table if not exists public.splan_data (
  id text primary key,
  doc_id text not null,
  collection text not null,
  owner_id text,
  shared_emails text[] not null default '{}',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists splan_data_collection_idx on public.splan_data (collection);
create index if not exists splan_data_owner_idx on public.splan_data (owner_id);
create index if not exists splan_data_shared_emails_idx on public.splan_data using gin (shared_emails);

alter table public.splan_data enable row level security;

create or replace function public.is_splan_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.splan_data
    where collection = 'users'
      and doc_id = auth.uid()::text
      and data->>'role' = 'admin'
  );
$$;

drop policy if exists "Acesso publico total" on public.splan_data;
drop policy if exists "splan_select_own_shared_admin" on public.splan_data;
drop policy if exists "splan_insert_own_or_admin" on public.splan_data;
drop policy if exists "splan_update_own_shared_admin" on public.splan_data;
drop policy if exists "splan_delete_own_or_admin" on public.splan_data;

create policy "splan_select_own_shared_admin"
on public.splan_data
for select
using (
  collection = 'appConfig'
  or owner_id = auth.uid()::text
  or auth.email() = any(shared_emails)
  or public.is_splan_admin()
);

create policy "splan_insert_own_or_admin"
on public.splan_data
for insert
with check (
  public.is_splan_admin()
  or (collection = 'users' and doc_id = auth.uid()::text and coalesce(data->>'role', 'user') = 'user')
  or (collection not in ('appConfig', 'admins', 'users') and owner_id = auth.uid()::text)
);

create policy "splan_update_own_shared_admin"
on public.splan_data
for update
using (
  owner_id = auth.uid()::text
  or auth.email() = any(shared_emails)
  or public.is_splan_admin()
)
with check (
  owner_id = auth.uid()::text
  or auth.email() = any(shared_emails)
  or public.is_splan_admin()
);

create policy "splan_delete_own_or_admin"
on public.splan_data
for delete
using (
  owner_id = auth.uid()::text
  or public.is_splan_admin()
);

create table if not exists public.rdo_fotos (
  id uuid primary key default gen_random_uuid(),
  obra_id text not null,
  data_registro timestamp with time zone not null,
  descricao text default '',
  url_foto text not null,
  uploaded_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists rdo_fotos_obra_id_idx on public.rdo_fotos (obra_id);
create index if not exists rdo_fotos_data_registro_idx on public.rdo_fotos (data_registro);

alter table public.rdo_fotos enable row level security;

drop policy if exists "rdo_fotos_select_authenticated" on public.rdo_fotos;
drop policy if exists "rdo_fotos_insert_authenticated" on public.rdo_fotos;
drop policy if exists "rdo_fotos_update_owner_admin" on public.rdo_fotos;
drop policy if exists "rdo_fotos_delete_owner_admin" on public.rdo_fotos;

create policy "rdo_fotos_select_authenticated"
on public.rdo_fotos
for select
using (auth.role() = 'authenticated');

create policy "rdo_fotos_insert_authenticated"
on public.rdo_fotos
for insert
with check (auth.role() = 'authenticated');

create policy "rdo_fotos_update_owner_admin"
on public.rdo_fotos
for update
using (uploaded_by = auth.email() or public.is_splan_admin())
with check (uploaded_by = auth.email() or public.is_splan_admin());

create policy "rdo_fotos_delete_owner_admin"
on public.rdo_fotos
for delete
using (uploaded_by = auth.email() or public.is_splan_admin());

insert into storage.buckets (id, name, public)
values ('rdo-fotos', 'rdo-fotos', true)
on conflict (id) do update set public = true;

drop policy if exists "rdo_fotos_storage_select_public" on storage.objects;
drop policy if exists "rdo_fotos_storage_insert_authenticated" on storage.objects;
drop policy if exists "rdo_fotos_storage_update_authenticated" on storage.objects;
drop policy if exists "rdo_fotos_storage_delete_authenticated" on storage.objects;

create policy "rdo_fotos_storage_select_public"
on storage.objects
for select
using (bucket_id = 'rdo-fotos');

create policy "rdo_fotos_storage_insert_authenticated"
on storage.objects
for insert
with check (
  bucket_id = 'rdo-fotos'
  and auth.role() = 'authenticated'
);

create policy "rdo_fotos_storage_update_authenticated"
on storage.objects
for update
using (
  bucket_id = 'rdo-fotos'
  and auth.role() = 'authenticated'
);

create policy "rdo_fotos_storage_delete_authenticated"
on storage.objects
for delete
using (
  bucket_id = 'rdo-fotos'
  and auth.role() = 'authenticated'
);
