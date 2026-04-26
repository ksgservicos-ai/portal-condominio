import { createAdminClient } from '@/lib/supabase/admin'
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

  // Use admin client to bypass RLS — guarantees correct role is always read
  const admin = createAdminClient()
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('role, nome')
    .eq('id', user.id)
    .single()

  console.log('[PortalLayout] userId          :', user.id)
  console.log('[PortalLayout] email            :', user.email)
  console.log('[PortalLayout] metadata.role    :', user.user_metadata?.role)
  console.log('[PortalLayout] metadata.nome    :', user.user_metadata?.nome)
  console.log('[PortalLayout] profile row      :', JSON.stringify(profile))
  console.log('[PortalLayout] profile error    :', profileError?.message ?? 'none')

  const role  = (profile?.role ?? user.user_metadata?.role)  as string | undefined
  const nome  = (profile?.nome ?? user.user_metadata?.nome)  as string | undefined
  const email = user.email ?? ''

  console.log('[PortalLayout] resolved role    :', role)
  console.log('[PortalLayout] resolved nome    :', nome)

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
