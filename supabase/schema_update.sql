-- ============================================================
--  Portal de Transparência — Atualização: Perfis de Usuário
--  Execute este script no SQL Editor do Supabase
-- ============================================================

-- ⚠️  PASSO OBRIGATÓRIO — Execute ANTES de fazer o deploy.
--
--  Defina o perfil 'admin' para o(s) usuário(s) administrador(es)
--  já existentes. Substitua o e-mail abaixo pelo e-mail real do admin.
--
--  Você pode fazer isso de duas formas:
--
--  OPÇÃO A — via SQL (execute aqui no SQL Editor):
UPDATE auth.users
SET raw_user_meta_data =
      coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
WHERE email = 'seu-email-admin@email.com';    -- ← substitua pelo e-mail real
--
--  OPÇÃO B — via Dashboard do Supabase:
--    Authentication → Users → clique no usuário → Edit → User Metadata
--    Adicione: {"role": "admin"}
--    Salve.
--
-- ============================================================

-- ============================================================
--  (Opcional) Tornar o bucket privado — maior segurança
--  Por padrão o bucket 'publicacoes' é público (qualquer um
--  com a URL pode baixar o arquivo).
--  Se quiser restringir a usuários autenticados, execute:
-- ============================================================

-- Remove a política de leitura pública existente
DROP POLICY IF EXISTS "Leitura pública dos arquivos" ON storage.objects;

-- Substitui por leitura apenas para autenticados
CREATE POLICY "Somente autenticados podem baixar arquivos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'publicacoes');
