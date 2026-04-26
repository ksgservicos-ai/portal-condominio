import { createClient } from '@/lib/supabase/server'
import PerfilForm from '@/components/PerfilForm'
import { UserCircle } from 'lucide-react'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const meta = user?.user_metadata ?? {}

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
          <UserCircle className="w-6 h-6 text-brand-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-500 text-sm">Gerencie suas informações pessoais</p>
        </div>
      </div>

      <PerfilForm
        userId={user!.id}
        email={user!.email ?? ''}
        initialNome={meta.nome ?? ''}
        initialApartamento={meta.apartamento ?? ''}
        initialBloco={meta.bloco ?? ''}
      />
    </main>
  )
}
