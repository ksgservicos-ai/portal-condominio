import { createClient } from '@/lib/supabase/server'
import { Building2, LayoutDashboard, LogOut } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = user.user_metadata?.role as string | undefined
  const email = user.email ?? ''

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-brand-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="bg-brand-700 p-2 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold leading-tight block">Portal de Transparência</span>
                <span className="text-brand-300 text-xs">Condomínio</span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              {role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-brand-300 hover:text-white px-2 sm:px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <div className="hidden sm:flex items-center text-brand-300 text-sm px-2 border-l border-brand-700 ml-1">
                <span className="max-w-[160px] truncate">{email}</span>
              </div>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 text-brand-300 hover:text-red-300 px-2 sm:px-3 py-1.5 rounded-lg text-sm transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </form>
            </nav>
          </div>
        </div>
      </header>

      {children}
    </div>
  )
}
