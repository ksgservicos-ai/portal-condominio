'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Eye, EyeOff, Loader2, Plus, Shield, Trash2, User, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface UserRow {
  id: string
  email: string
  role: string
  created_at: string
}

interface Props {
  users: UserRow[]
  currentUserId: string
}

const ROLE_LABELS: Record<string, string> = { admin: 'Admin', usuario: 'Usuário' }
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  usuario: 'bg-blue-100 text-blue-700 border-blue-200',
}

export default function UsersTable({ users, currentUserId }: Props) {
  const router = useRouter()

  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('usuario')
  const [adding, setAdding] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const notify = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEmail('')
      setPassword('')
      setRole('usuario')
      setShowForm(false)
      notify('Usuário criado com sucesso!')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setConfirmDelete(null)
      notify('Usuário excluído.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir usuário')
    } finally {
      setDeleting(null)
    }
  }

  const handleRoleChange = async (id: string, newRole: string) => {
    setUpdatingRole(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      notify('Perfil atualizado.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil')
    } finally {
      setUpdatingRole(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <span className="font-semibold text-gray-800">Usuários cadastrados</span>
          <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {users.length}
          </span>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(null) }}
          className="flex items-center gap-1.5 px-3 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo usuário
        </button>
      </div>

      {/* Feedback messages */}
      {error && (
        <div className="mx-6 mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          {success}
        </div>
      )}

      {/* Add user form */}
      {showForm && (
        <div className="mx-6 mt-4 mb-2 bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo usuário
          </h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="usuario@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Mínimo 6 caracteres"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="usuario">Usuário — somente visualização</option>
                <option value="admin">Admin — acesso total</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-2 pt-1">
              <button
                type="submit"
                disabled={adding}
                className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 disabled:opacity-60"
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {adding ? 'Criando...' : 'Criar usuário'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(null) }}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 font-medium text-gray-500">E-mail</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Perfil</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Cadastro</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      {u.role === 'admin'
                        ? <Shield className="w-3.5 h-3.5 text-brand-700" />
                        : <User className="w-3.5 h-3.5 text-brand-600" />}
                    </div>
                    <span className="font-medium text-gray-800">{u.email}</span>
                    {u.id === currentUserId && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">você</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  {updatingRole === u.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={u.id === currentUserId}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600 border-gray-200'} disabled:opacity-60 disabled:cursor-default`}
                    >
                      <option value="usuario">Usuário</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </td>
                <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                  {format(new Date(u.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </td>
                <td className="px-6 py-4 text-right">
                  {u.id === currentUserId ? (
                    <span className="text-xs text-gray-400">—</span>
                  ) : confirmDelete === u.id ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-xs text-red-600 mr-1">Confirmar exclusão?</span>
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={deleting === u.id}
                        className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        {deleting === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Excluir
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-2.5 py-1 border border-gray-300 text-gray-600 rounded-lg text-xs hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(u.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Excluir usuário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-gray-100">
        {users.map((u) => (
          <div key={u.id} className="px-4 py-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  {u.role === 'admin'
                    ? <Shield className="w-3.5 h-3.5 text-brand-700" />
                    : <User className="w-3.5 h-3.5 text-brand-600" />}
                </div>
                <span className="text-sm font-medium text-gray-800 truncate">{u.email}</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {ROLE_LABELS[u.role] ?? u.role}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3 ml-9">
              {format(new Date(u.created_at), 'dd/MM/yyyy', { locale: ptBR })}
              {u.id === currentUserId && <span className="ml-2 text-gray-400">(você)</span>}
            </p>
            {u.id !== currentUserId && (
              <div className="ml-9 flex gap-2">
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  disabled={updatingRole === u.id}
                  className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none"
                >
                  <option value="usuario">Usuário</option>
                  <option value="admin">Admin</option>
                </select>
                {confirmDelete === u.id ? (
                  <>
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={deleting === u.id}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium"
                    >
                      {deleting === u.id ? '...' : 'Confirmar'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(u.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
        {users.length} usuário{users.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
