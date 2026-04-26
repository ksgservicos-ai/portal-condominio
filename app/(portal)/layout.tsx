import { createClient } from '@/lib/supabase/server'
import UserDropdown from '@/components/UserDropdown'
import { Building2 } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Read profile directly — the server client carries the user session,
  // so RLS (auth.uid() = id) resolves correctly.
  // maybeSingle() returns null instead of error when row is missing.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, nome')
    .eq('id', user.id)
    .maybeSingle()

  const role  = (profile?.role  ?? user.user_metadata?.role)  as string | undefined
  const nome  = (profile?.nome  ?? user.user_metadata?.nome)  as string | undefined
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

            <UserDropdown email={email} nome={nome} role={role} />
          </div>
        </div>
      </header>

      {children}
    </div>
  )
}
