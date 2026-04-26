-- ============================================================
--  Migração 003: comentários nas publicações
--  Execute no SQL Editor do Supabase
-- ============================================================

-- Adiciona coluna allow_comments à tabela publications
ALTER TABLE public.publications
  ADD COLUMN IF NOT EXISTS allow_comments boolean NOT NULL DEFAULT false;

-- Tabela de comentários
CREATE TABLE IF NOT EXISTS public.comments (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id     uuid        NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  user_id            uuid        NOT NULL REFERENCES auth.users(id)          ON DELETE CASCADE,
  user_display_name  text        NOT NULL DEFAULT '',
  content            text        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_publication_id ON public.comments (publication_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id        ON public.comments (user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at     ON public.comments (created_at DESC);

-- RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ler comentários
CREATE POLICY "Autenticados leem comentários"
  ON public.comments FOR SELECT TO authenticated
  USING (true);

-- Usuário autenticado pode inserir seu próprio comentário
CREATE POLICY "Usuário insere comentário"
  ON public.comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Autor ou admin pode excluir
CREATE POLICY "Autor ou admin exclui comentário"
  ON public.comments FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
