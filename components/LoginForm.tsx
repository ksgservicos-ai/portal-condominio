'use client'

import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  Home,
  Lock,
  Mail,
  Shield,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type View = 'choose' | 'admin' | 'morador'

interface Props {
  next: string
  tipo?: string
}

export default function LoginForm({ next, tipo }: Props) {
  const initialView: View =
    tipo === 'admin' ? 'admin' : tipo === 'morador' ? 'morador' : 'choose'

  const [view, setView] = useState<View>(initialView)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const resetForm = (v: View) => {
    setView(v)
    setEmail('')
    setPassword('')
    setError(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-mail ou senha incorretos. Verifique suas credenciais.')
      setLoading(false)
      return
    }

    // Admin form always goes to /admin — permission check is in the admin layout
    router.push(view === 'admin' ? '/admin' : next)
    router.refresh()
  }

  /* ── CHOOSE SCREEN ── */
  if (view === 'choose') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-900 to-brand-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-700 rounded-2xl mb-4 shadow-lg">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Portal de Transparência</h1>
            <p className="text-brand-300 mt-1 text-sm">Viver Bem JD Independência</p>
          </div>

          <p className="text-center text-brand-200 text-base mb-6 font-medium">
            Como deseja acessar?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Admin card */}
            <button
              onClick={() => resetForm('admin')}
              className="group relative bg-brand-800 hover:bg-brand-700 border border-brand-700 hover:border-brand-500 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-700 group-hover:bg-brand-600 flex items-center justify-center transition-colors">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">Admin</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">Administrador</h3>
              <p className="text-brand-300 text-sm leading-relaxed">
                Acesse o painel de gerenciamento, publicações e usuários.
              </p>
              <div className="mt-5 text-brand-400 text-xs font-medium group-hover:text-brand-200 transition-colors flex items-center gap-1">
                Entrar como admin →
              </div>
            </button>

            {/* Morador card */}
            <button
              onClick={() => resetForm('morador')}
              className="group relative bg-white hover:bg-gray-50 border border-gray-200 hover:border-brand-300 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-100 group-hover:bg-brand-200 flex items-center justify-center transition-colors">
                  <Home className="w-5 h-5 text-brand-700" />
                </div>
                <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Morador</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">Morador</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Visualize documentos, atas, comunicados e arquivos do Viver Bem JD Independência.
              </p>
              <div className="mt-5 text-brand-600 text-xs font-medium group-hover:text-brand-800 transition-colors flex items-center gap-1">
                Entrar como morador →
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── LOGIN FORM (admin or morador) ── */
  const isAdmin = view === 'admin'

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 to-brand-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-700 rounded-2xl mb-4 shadow-lg">
            {isAdmin ? <Shield className="w-7 h-7 text-white" /> : <Home className="w-7 h-7 text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isAdmin ? 'Entrar como Administrador' : 'Entrar como Morador'}
          </h1>
          <p className="text-brand-300 mt-1 text-sm">Portal de Transparência</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Back button */}
          <button
            onClick={() => resetForm('choose')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {isAdmin ? 'Acesso ao painel' : 'Acesso ao portal'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-700 hover:bg-brand-800 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Register link — only for morador */}
          {!isAdmin && (
            <p className="mt-6 text-center text-sm text-gray-500">
              Ainda não tem conta?{' '}
              <Link href="/cadastro" className="text-brand-600 hover:text-brand-800 font-medium">
                Cadastrar-se
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
