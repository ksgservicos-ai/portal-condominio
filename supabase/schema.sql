-- ============================================================
--  Portal de Transparência - Schema Completo (v2)
--  Execute este script no SQL Editor do Supabase
-- ============================================================

-- ============================================================
--  Função utilitária: updated_at automático
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
--  Tabela: profiles
--  Armazena dados de perfil vinculados a auth.users
-- ============================================================
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

-- Trigger: cria perfil automaticamente ao criar usuário em auth.users
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

-- ============================================================
--  RLS: profiles
-- ============================================================
alter table public.profiles enable row level security;

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

-- ============================================================
--  Tabela: publications
-- ============================================================
create table if not exists public.publications (
  id            uuid        primary key default gen_random_uuid(),
  title         text        not null,
  content       text,
  category      text        not null check (category in ('Atas', 'Financeiro', 'Comunicados', 'Contratos', 'Obras')),
  file_url      text,
  file_name     text,
  is_published  boolean     not null default true,
  published_at  timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_publications_category     on public.publications (category);
create index if not exists idx_publications_published    on public.publications (is_published);
create index if not exists idx_publications_published_at on public.publications (published_at desc);

drop trigger if exists set_publications_updated_at on public.publications;
create trigger set_publications_updated_at
  before update on public.publications
  for each row execute function public.handle_updated_at();

-- ============================================================
--  RLS: publications
-- ============================================================
alter table public.publications enable row level security;

create policy "Autenticados leem publicações visíveis"
  on public.publications for select to authenticated
  using (is_published = true);

create policy "Admin lê todas as publicações"
  on public.publications for select to authenticated
  using ((select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin');

create policy "Admin insere publicações"
  on public.publications for insert to authenticated
  with check ((select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin');

create policy "Admin atualiza publicações"
  on public.publications for update to authenticated
  using ((select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin');

create policy "Admin exclui publicações"
  on public.publications for delete to authenticated
  using ((select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin');

-- ============================================================
--  Storage: bucket publicacoes
-- ============================================================
insert into storage.buckets (id, name, public)
values ('publicacoes', 'publicacoes', true)
on conflict (id) do nothing;

create policy "Autenticados baixam arquivos"
  on storage.objects for select to authenticated
  using (bucket_id = 'publicacoes');

create policy "Admin faz upload de arquivos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'publicacoes' and
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin');

create policy "Admin exclui arquivos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'publicacoes' and
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin');

-- ============================================================
--  ⚠️  PASSO OBRIGATÓRIO: defina o perfil do admin existente
-- ============================================================
-- Execute com o e-mail do seu administrador antes de fazer deploy:
--
-- UPDATE auth.users
-- SET raw_user_meta_data =
--       coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- WHERE email = 'seu-admin@email.com';
--
-- Em seguida, backfill o perfil:
-- INSERT INTO public.profiles (id, email, role)
-- SELECT id, email, coalesce(raw_user_meta_data->>'role','usuario')
-- FROM auth.users
-- ON CONFLICT (id) DO UPDATE
--   SET email = EXCLUDED.email,
--       role  = EXCLUDED.role;
-- ============================================================

-- ============================================================
--  Dados de exemplo (remova em produção)
-- ============================================================
insert into public.publications (title, content, category, published_at, is_published) values
  ('Ata da Assembleia Geral Ordinária – Março 2025',
   'Aos 15 dias do mês de março de 2025, reuniram-se em assembleia os condôminos para deliberar sobre os assuntos da pauta: aprovação das contas do exercício anterior, eleição do novo síndico e fixação do valor da taxa condominial.',
   'Atas', '2025-03-15', true),
  ('Balancete Financeiro – Fevereiro 2025',
   'Demonstrativo de receitas e despesas do mês de fevereiro de 2025. Saldo disponível em conta corrente: R$ 18.450,00. Fundo de reserva: R$ 42.300,00.',
   'Financeiro', '2025-03-01', true),
  ('Comunicado: Manutenção do Elevador – Bloco A',
   'Informamos que o elevador do Bloco A estará em manutenção preventiva no dia 20/04/2025, das 08h às 17h. Pedimos a compreensão de todos.',
   'Comunicados', '2025-04-10', true),
  ('Contrato de Prestação de Serviços – Limpeza 2025',
   'Contrato firmado com a empresa CleanMax Serviços para prestação de serviços de limpeza e conservação das áreas comuns, vigência de 12 meses.',
   'Contratos', '2025-01-02', true),
  ('Obra: Reforma da Área de Lazer – Fase 1',
   'Iniciamos a primeira fase da reforma da área de lazer, contemplando a pintura da piscina e renovação do deck. Previsão de conclusão: 30 dias.',
   'Obras', '2025-04-01', true)
on conflict do nothing;
