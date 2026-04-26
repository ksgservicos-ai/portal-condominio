'use client'

import { createClient } from '@/lib/supabase/client'
import { type Publication } from '@/lib/types'
import CategoryBadge from '../CategoryBadge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Edit2, Eye, EyeOff, ExternalLink, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  publications: Publication[]
}

export default function AdminPublicationTable({ publications }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = publications.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('publications').delete().eq('id', id)
    setDeleting(null)
    setConfirmDelete(null)
    router.refresh()
  }

  const handleTogglePublish = async (publication: Publication) => {
    setToggling(publication.id)
    const supabase = createClient()
    await supabase
      .from('publications')
      .update({ is_published: !publication.is_published, updated_at: new Date().toISOString() })
      .eq('id', publication.id)
    setToggling(null)
    router.refresh()
  }

  return (
    <div>
      {/* Search */}
      <div className="px-6 py-3 border-b border-gray-100">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar publicação..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          Nenhuma publicação encontrada.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Título</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Categoria</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Data</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((pub) => (
                  <tr key={pub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800 line-clamp-1 max-w-xs block">
                        {pub.title}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <CategoryBadge category={pub.category} size="sm" />
                    </td>
                    <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                      {format(new Date(pub.published_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          pub.is_published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {pub.is_published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/publicacoes/${pub.id}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                          title="Ver no portal"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleTogglePublish(pub)}
                          disabled={toggling === pub.id}
                          className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                          title={pub.is_published ? 'Despublicar' : 'Publicar'}
                        >
                          {pub.is_published ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <Link
                          href={`/admin/publicacoes/${pub.id}/editar`}
                          className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        {confirmDelete === pub.id ? (
                          <div className="flex items-center gap-1 ml-1">
                            <button
                              onClick={() => handleDelete(pub.id)}
                              disabled={deleting === pub.id}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                              {deleting === pub.id ? '...' : 'Confirmar'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-2 py-1 border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(pub.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filtered.map((pub) => (
              <div key={pub.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CategoryBadge category={pub.category} size="sm" />
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      pub.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {pub.is_published ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">{pub.title}</p>
                <p className="text-xs text-gray-400 mb-3">
                  {format(new Date(pub.published_at), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/publicacoes/${pub.id}/editar`}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50"
                  >
                    <Edit2 className="w-3 h-3" /> Editar
                  </Link>
                  <button
                    onClick={() => handleTogglePublish(pub)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50"
                  >
                    {pub.is_published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {pub.is_published ? 'Ocultar' : 'Publicar'}
                  </button>
                  {confirmDelete === pub.id ? (
                    <>
                      <button
                        onClick={() => handleDelete(pub.id)}
                        disabled={deleting === pub.id}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs"
                      >
                        Confirmar
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
                      onClick={() => setConfirmDelete(pub.id)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" /> Excluir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
        {filtered.length} de {publications.length} publicações
      </div>
    </div>
  )
}
