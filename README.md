# Portal de Transparência - Condomínio

Portal público para divulgação de documentos e informações condominiais, com painel administrativo protegido.

## Funcionalidades

- **Portal público**: lista de publicações com busca por título, filtro por categoria e período de datas
- **Categorias**: Atas, Financeiro, Comunicados, Contratos, Obras
- **Detalhe de publicação**: conteúdo completo e download de arquivo anexo
- **Painel admin**: login seguro, CRUD completo de publicações, toggle publicado/rascunho
- **Upload de arquivos**: PDFs e imagens via Supabase Storage

## Setup

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o conteúdo de `supabase/schema.sql`
3. Em **Authentication → Users**, crie o usuário administrador (email + senha)
4. Copie a **URL** e a **anon key** do projeto em **Settings → API**

### 2. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
```

### 3. Rodar localmente

```bash
npm install
npm run dev
```

Acesse:
- Portal público: http://localhost:3000
- Admin: http://localhost:3000/admin/login

### 4. Deploy no Vercel

1. Faça push do repositório para o GitHub
2. Importe o projeto no [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Estrutura

```
app/
  page.tsx                        # Portal público (listagem)
  publicacoes/[id]/page.tsx       # Detalhe da publicação
  admin/
    login/page.tsx                # Login admin
    page.tsx                      # Dashboard admin
    publicacoes/nova/page.tsx     # Criar publicação
    publicacoes/[id]/editar/      # Editar publicação
  api/auth/
    callback/route.ts             # OAuth callback
    signout/route.ts              # Logout

components/
  PublicationCard.tsx             # Card da publicação pública
  CategoryBadge.tsx               # Badge de categoria
  SearchAndFilter.tsx             # Barra de busca e filtros
  admin/
    PublicationForm.tsx           # Formulário criar/editar
    PublicationTable.tsx          # Tabela admin com ações

lib/
  types.ts                        # Tipos TypeScript
  supabase/
    client.ts                     # Cliente browser
    server.ts                     # Cliente server
    middleware.ts                 # Auth middleware

supabase/
  schema.sql                      # Esquema do banco + dados de exemplo
```
