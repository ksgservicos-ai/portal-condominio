'use client'

import { ChevronDown, LayoutDashboard, LogOut, UserCircle } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface Props {
  email: string
  nome?: string
  role?: string
}

export default function UserDropdown({ email, nome, role }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const displayName = nome?.trim() || email

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-brand-300 hover:text-white px-2 sm:px-3 py-1.5 rounded-lg text-sm transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <UserCircle className="w-4 h-4 flex-shrink-0" />
        <span className="hidden sm:inline max-w-[160px] truncate">{displayName}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 min-w-[220px] pt-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl py-1 overflow-hidden">
            {/* User info header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-0.5">Conectado como</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{nome?.trim() || email}</p>
              {nome && (
                <p className="text-xs text-gray-400 truncate">{email}</p>
              )}
              {role && (
                <span className={`inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  role === 'admin'
                    ? 'bg-purple-100 text-purple-700 border-purple-200'
                    : 'bg-blue-100 text-blue-700 border-blue-200'
                }`}>
                  {role === 'admin' ? 'Administrador' : 'Morador'}
                </span>
              )}
            </div>

            {/* Menu items */}
            {role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-purple-500 flex-shrink-0" />
                Painel Admin
              </Link>
            )}

            <Link
              href="/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <UserCircle className="w-4 h-4 text-brand-500 flex-shrink-0" />
              Meu Perfil
            </Link>

            <div className="my-1 border-t border-gray-100" />

            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                Sair
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
