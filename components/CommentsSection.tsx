'use client'

import { type Comment } from '@/lib/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2, MessageSquare, Send, Trash2, UserCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  publicationId: string
  initialComments: Comment[]
  currentUserId: string
  isAdmin: boolean
}

const MAX = 1000

export default function CommentsSection({
  publicationId,
  initialComments,
  currentUserId,
  isAdmin,
}: Props) {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publication_id: publicationId, content: text.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setComments((prev) => [...prev, data.comment as Comment])
      setText('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar comentário')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      setComments((prev) => prev.filter((c) => c.id !== id))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir comentário')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <section className="p-6 sm:p-8">
      <h2 className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-6">
        <MessageSquare className="w-5 h-5 text-brand-500" />
        Comentários
        <span className="text-sm font-normal text-gray-400">({comments.length})</span>
      </h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">
          {error}
        </div>
      )}

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">
          Nenhum comentário ainda. Seja o primeiro a comentar!
        </p>
      ) : (
        <ul className="space-y-4 mb-6">
          {comments.map((c) => {
            const canDelete = isAdmin || c.user_id === currentUserId
            return (
              <li key={c.id} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center mt-0.5">
                  <UserCircle className="w-4 h-4 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {c.user_display_name}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs text-gray-400">
                        {format(new Date(c.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                      {canDelete && (
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
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {c.content}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX}
            rows={3}
            placeholder="Escreva um comentário..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
          />
          <span className={`absolute bottom-2 right-3 text-xs ${text.length > MAX * 0.9 ? 'text-orange-500' : 'text-gray-300'}`}>
            {text.length}/{MAX}
          </span>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />}
            {submitting ? 'Enviando…' : 'Comentar'}
          </button>
        </div>
      </form>
    </section>
  )
}
