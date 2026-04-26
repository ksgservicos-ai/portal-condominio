import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { Building2, FileText, LogOut, Plus, Users } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Use admin client to bypass RLS — reliable role check
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role ?? (user.user_metadata?.role as string | undefined)

  if (role !== 'admin') redirect('/')

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-brand-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                <div className="bg-brand-700 p-1.5 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold">Painel Admin</span>
                  <p className="text-brand-300 text-xs leading-none">Portal de Transparência</p>
                </div>
              </Link>
            </div>

            <nav className="flex items-center gap-2">
              <Link
                href="/admin/publicacoes/nova"
                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nova Publicação</span>
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-brand-300 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Publicações</span>
              </Link>
              <Link
                href="/admin/usuarios"
                className="flex items-center gap-1.5 text-brand-300 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Usuários</span>
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 text-brand-300 hover:text-red-300 px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </form>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
