'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Building2, Eye, EyeOff, Loader2, Plus, Shield, Trash2, User, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface UserRow {
  id: string
  email: string
  nome: string
  apartamento: string
  bloco: string
  role: string
  created_at: string
}

interface Props {
  users: UserRow[]
  currentUserId: string
}

const ROLE_COLORS: Record<string, string> = {
  admin:   'bg-purple-100 text-purple-700 border-purple-200',
  usuario: 'bg-blue-100 text-blue-700 border-blue-200',
}
const ROLE_LABELS: Record<string, string> = { admin: 'Admin', usuario: 'Morador' }

export default function UsersTable({ users, currentUserId }: Props) {
  const router = useRouter()

  /* ── form state ── */
  const [showForm, setShowForm]         = useState(false)
  const [fEmail, setFEmail]             = useState('')
  const [fPassword, setFPassword]       = useState('')
  const [fNome, setFNome]               = useState('')
  const [fApartamento, setFApartamento] = useState('')
  const [fBloco, setFBloco]             = useState('')
  const [fRole, setFRole]               = useState('usuario')
  const [showPassword, setShowPassword] = useState(false)
  const [adding, setAdding]             = useState(false)

  /* ── action state ── */
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting]           = useState<string | null>(null)
  const [updatingRole, setUpdatingRole]   = useState<string | null>(null)

  /* ── feedback ── */
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const notify = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  const resetForm = () => {
    setFEmail(''); setFPassword(''); setFNome('')
    setFApartamento(''); setFBloco(''); setFRole('usuario')
    setShowPassword(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true); setError(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fEmail, password: fPassword,
          nome: fNome, apartamento: fApartamento, bloco: fBloco, role: fRole,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      resetForm(); setShowForm(false)
      notify('Usuário criado com sucesso!')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário')
    } finally { setAdding(false) }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id); setError(null)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setConfirmDelete(null)
      notify('Usuário excluído.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally { setDeleting(null) }
  }

  const handleRoleChange = async (id: string, newRole: string) => {
    setUpdatingRole(id); setError(null)
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
      setError(err instanceof Error ? err.message : 'Erro ao atualizar')
    } finally { setUpdatingRole(null) }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800">Usuários</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{users.length}</span>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(null) }}
          className="flex items-center gap-1.5 px-3 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo usuário
        </button>
      </div>

      {/* Feedback */}
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

      {/* Add form */}
      {showForm && (
        <div className="mx-6 mt-4 mb-2 bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo usuário
          </h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
              <input type="text" value={fNome} onChange={(e) => setFNome(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="João da Silva" />
            </div>
            {/* Apartamento + Bloco */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apartamento</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={fApartamento} onChange={(e) => setFApartamento(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="101" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bloco</label>
              <input type="text" value={fBloco} onChange={(e) => setFBloco(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="A" />
            </div>
            {/* Email */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail <span className="text-red-500">*</span></label>
              <input type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="usuario@email.com" />
            </div>
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={fPassword}
                  onChange={(e) => setFPassword(e.target.value)} required minLength={6}
                  className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Mín. 6 caracteres" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
              <select value={fRole} onChange={(e) => setFRole(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                <option value="usuario">Morador — somente visualização</option>
                <option value="admin">Admin — acesso total</option>
              </select>
            </div>
            {/* Buttons */}
            <div className="sm:col-span-2 flex gap-2 pt-1">
              <button type="submit" disabled={adding}
                className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 disabled:opacity-60">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {adding ? 'Criando...' : 'Criar usuário'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); setError(null) }}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Desktop table */}
      {users.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">Nenhum usuário cadastrado.</div>
      ) : (
        <>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-6 py-3 font-medium text-gray-500">Nome / E-mail</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Apto</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Bloco</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Perfil</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Cadastro</th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                          {u.role === 'admin'
                            ? <Shield className="w-3.5 h-3.5 text-purple-600" />
                            : <User className="w-3.5 h-3.5 text-brand-600" />}
                        </div>
                        <div className="min-w-0">
                          {u.nome ? (
                            <>
                              <p className="font-medium text-gray-800 truncate">{u.nome}</p>
                              <p className="text-xs text-gray-400 truncate">{u.email}</p>
                            </>
                          ) : (
                            <p className="text-gray-700 truncate">{u.email}</p>
                          )}
                          {u.id === currentUserId && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">você</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{u.apartamento || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-4 text-gray-600">{u.bloco || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-4">
                      {updatingRole === u.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : (
                        <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={u.id === currentUserId}
                          className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600 border-gray-200'} disabled:opacity-60 disabled:cursor-default`}>
                          <option value="usuario">Morador</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-500 whitespace-nowrap text-xs">
                      {format(new Date(u.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.id === currentUserId ? (
                        <span className="text-xs text-gray-300">—</span>
                      ) : confirmDelete === u.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-xs text-red-600 mr-1">Confirmar?</span>
                          <button onClick={() => handleDelete(u.id)} disabled={deleting === u.id}
                            className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-1">
                            {deleting === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            Excluir
                          </button>
                          <button onClick={() => setConfirmDelete(null)}
                            className="px-2.5 py-1 border border-gray-300 text-gray-600 rounded-lg text-xs hover:bg-gray-50">
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(u.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Excluir usuário">
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
          <div className="lg:hidden divide-y divide-gray-100">
            {users.map((u) => (
              <div key={u.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      {u.role === 'admin' ? <Shield className="w-3.5 h-3.5 text-purple-600" /> : <User className="w-3.5 h-3.5 text-brand-600" />}
                    </div>
                    <div className="min-w-0">
                      {u.nome && <p className="text-sm font-medium text-gray-800 truncate">{u.nome}</p>}
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {ROLE_LABELS[u.role] ?? u.role}
                  </span>
                </div>
                {(u.apartamento || u.bloco) && (
                  <p className="text-xs text-gray-400 ml-10 mb-2 flex gap-3">
                    {u.apartamento && <span>Apto {u.apartamento}</span>}
                    {u.bloco && <span>Bloco {u.bloco}</span>}
                  </p>
                )}
                {u.id !== currentUserId && (
                  <div className="ml-10 flex gap-2 flex-wrap">
                    <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={updatingRole === u.id}
                      className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none">
                      <option value="usuario">Morador</option>
                      <option value="admin">Admin</option>
                    </select>
                    {confirmDelete === u.id ? (
                      <>
                        <button onClick={() => handleDelete(u.id)} disabled={deleting === u.id}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium">
                          {deleting === u.id ? '...' : 'Confirmar'}
                        </button>
                        <button onClick={() => setConfirmDelete(null)}
                          className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs">
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDelete(u.id)}
                        className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50">
                        <Trash2 className="w-3 h-3" /> Excluir
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
        {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
