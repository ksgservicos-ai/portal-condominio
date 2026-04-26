import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import UsersTable from '@/components/admin/UsersTable'

async function getUsers() {
  const admin = createAdminClient()

  const [authResult, profilesResult] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('profiles').select('id, role, nome, apartamento, bloco'),
  ])

  if (authResult.error) return []

  // profiles table is the source of truth for role and profile fields
  const profileMap = new Map(
    (profilesResult.data ?? []).map((p) => [p.id as string, p])
  )

  return authResult.data.users.map((u) => {
    const p = profileMap.get(u.id)
    return {
      id: u.id,
      email: u.email ?? '',
      nome: p?.nome ?? (u.user_metadata?.nome as string) ?? '',
      apartamento: p?.apartamento ?? (u.user_metadata?.apartamento as string) ?? '',
      bloco: p?.bloco ?? (u.user_metadata?.bloco as string) ?? '',
      role: p?.role ?? (u.user_metadata?.role as string) ?? 'usuario',
      created_at: u.created_at,
    }
  })
}

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
        <p className="text-gray-500 text-sm mt-1">
          Cadastre e gerencie os usuários com acesso ao portal.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <UsersTable users={users} currentUserId={user!.id} />
      </div>
    </div>
  )
}
