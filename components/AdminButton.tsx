'use client'

import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminButton() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          setIsAdmin(data?.role === 'admin')
        })
    })
  }, [])

  if (!isAdmin) return null

  return (
    <Link
      href="/admin"
      className="flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
    >
      <LayoutDashboard className="w-4 h-4" />
      <span>Admin</span>
    </Link>
  )
}
