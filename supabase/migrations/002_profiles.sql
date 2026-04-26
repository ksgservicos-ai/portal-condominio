-- ============================================================
--  Migração 002: tabela profiles + campos nome/apartamento/bloco
--  Execute no SQL Editor para quem já tem o schema v1 instalado
-- ============================================================

-- Função updated_at (idempotente)
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Cria tabela profiles
create table if not exists public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  email       text        not null,
  nome        text,
  apartamento text,
  bloco       text,
  role        text        not null check (role in ('admin', 'usuario')) default 'usuario',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_profiles_role        on public.profiles (role);
create index if not exists idx_profiles_bloco       on public.profiles (bloco);
create index if not exists idx_profiles_apartamento on public.profiles (apartamento);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Trigger para novos usuários
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, nome, apartamento, bloco, role)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'nome',
    new.raw_user_meta_data->>'apartamento',
    new.raw_user_meta_data->>'bloco',
    coalesce(new.raw_user_meta_data->>'role', 'usuario')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;

drop policy if exists "Usuário lê próprio perfil"      on public.profiles;
drop policy if exists "Admin lê todos os perfis"       on public.profiles;
drop policy if exists "Usuário atualiza próprio perfil" on public.profiles;
drop policy if exists "Admin gerencia todos os perfis" on public.profiles;

create policy "Usuário lê próprio perfil"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "Admin lê todos os perfis"
  on public.profiles for select to authenticated
  using ((select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin');

create policy "Usuário atualiza próprio perfil"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admin gerencia todos os perfis"
  on public.profiles for all to authenticated
  using ((select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin');

-- Backfill: cria perfil para usuários já existentes
insert into public.profiles (id, email, nome, apartamento, bloco, role)
select
  id,
  coalesce(email, ''),
  raw_user_meta_data->>'nome',
  raw_user_meta_data->>'apartamento',
  raw_user_meta_data->>'bloco',
  coalesce(raw_user_meta_data->>'role', 'usuario')
from auth.users
on conflict (id) do update
  set email       = excluded.email,
      nome        = excluded.nome,
      apartamento = excluded.apartamento,
      bloco       = excluded.bloco,
      role        = excluded.role;
