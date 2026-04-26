-- ============================================================
--  Portal de Transparência - Schema
--  Execute este script no SQL Editor do Supabase
-- ============================================================

-- Tabela de publicações
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

-- Índices para performance de filtros
create index if not exists idx_publications_category    on public.publications (category);
create index if not exists idx_publications_published   on public.publications (is_published);
create index if not exists idx_publications_published_at on public.publications (published_at desc);

-- Trigger: atualiza updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_publications_updated_at on public.publications;
create trigger set_publications_updated_at
  before update on public.publications
  for each row execute function public.handle_updated_at();

-- ============================================================
--  Row Level Security (RLS)
-- ============================================================
alter table public.publications enable row level security;

-- Leitura pública: só publicações visíveis
create policy "Leitura pública de publicações"
  on public.publications for select
  using (is_published = true);

-- Admin autenticado pode ler tudo (incluindo rascunhos)
create policy "Admin lê todas as publicações"
  on public.publications for select
  to authenticated
  using (true);

-- Admin pode inserir
create policy "Admin pode inserir publicações"
  on public.publications for insert
  to authenticated
  with check (true);

-- Admin pode atualizar
create policy "Admin pode atualizar publicações"
  on public.publications for update
  to authenticated
  using (true)
  with check (true);

-- Admin pode excluir
create policy "Admin pode excluir publicações"
  on public.publications for delete
  to authenticated
  using (true);

-- ============================================================
--  Storage bucket para arquivos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('publicacoes', 'publicacoes', true)
on conflict (id) do nothing;

-- Política de leitura pública dos arquivos
create policy "Leitura pública dos arquivos"
  on storage.objects for select
  using (bucket_id = 'publicacoes');

-- Admin pode fazer upload
create policy "Admin pode fazer upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'publicacoes');

-- Admin pode excluir arquivos
create policy "Admin pode excluir arquivos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'publicacoes');

-- ============================================================
--  Dados de exemplo (opcional — remova em produção)
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
