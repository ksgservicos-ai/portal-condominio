'use client'

import { type Comment } from '@/lib/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2, MessageSquare, Trash2, UserCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  comments: Comment[]
}

export default function CommentsAdmin({ comments: initial }: Props) {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>(initial)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeleting(id)
    setError(null)
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      setComments((prev) => prev.filter((c) => c.id !== id))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-gray-400" />
        <h2 className="font-semibold text-gray-800">Comentários</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {comments.length}
        </span>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">
          {error}
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-10">Nenhum comentário.</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center mt-0.5">
                <UserCircle className="w-4 h-4 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {c.user_display_name}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">
                      {format(new Date(c.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deleting === c.id}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                      title="Excluir comentário"
                    >
                      {deleting === c.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {c.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
