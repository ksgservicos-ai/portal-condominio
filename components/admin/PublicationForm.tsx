'use client'

import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, type Category, type Publication } from '@/lib/types'
import { format } from 'date-fns'
import { Loader2, Paperclip, Save, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

interface Props {
  mode: 'create' | 'edit'
  publication?: Publication
}

export default function PublicationForm({ mode, publication }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(publication?.title ?? '')
  const [content, setContent] = useState(publication?.content ?? '')
  const [category, setCategory] = useState<Category>(publication?.category ?? 'Comunicados')
  const [publishedAt, setPublishedAt] = useState(
    publication?.published_at
      ? format(new Date(publication.published_at), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd')
  )
  const [isPublished, setIsPublished] = useState(publication?.is_published ?? true)
  const [file, setFile] = useState<File | null>(null)
  const [existingFileUrl, setExistingFileUrl] = useState(publication?.file_url ?? null)
  const [existingFileName, setExistingFileName] = useState(publication?.file_name ?? null)
  const [removeFile, setRemoveFile] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.size > 20 * 1024 * 1024) {
        setError('O arquivo não pode ultrapassar 20 MB.')
        return
      }
      setFile(selected)
      setRemoveFile(false)
    }
  }

  const handleRemoveExistingFile = () => {
    setRemoveFile(true)
    setExistingFileUrl(null)
    setExistingFileName(null)
  }

  const uploadFile = async (file: File): Promise<{ url: string; name: string }> => {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('publicacoes')
      .upload(fileName, file, { upsert: false })

    if (uploadError) throw new Error(`Erro ao enviar arquivo: ${uploadError.message}`)

    const { data } = supabase.storage.from('publicacoes').getPublicUrl(fileName)
    return { url: data.publicUrl, name: file.name }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('O título é obrigatório.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      let fileUrl = existingFileUrl
      let fileName = existingFileName

      if (removeFile) {
        fileUrl = null
        fileName = null
      }

      if (file) {
        const uploaded = await uploadFile(file)
        fileUrl = uploaded.url
        fileName = uploaded.name
      }

      const payload = {
        title: title.trim(),
        content: content.trim() || null,
        category,
        published_at: new Date(publishedAt).toISOString(),
        is_published: isPublished,
        file_url: fileUrl,
        file_name: fileName,
        updated_at: new Date().toISOString(),
      }

      if (mode === 'create') {
        const { error: insertError } = await supabase.from('publications').insert([payload])
        if (insertError) throw new Error(insertError.message)
      } else {
        const { error: updateError } = await supabase
          .from('publications')
          .update(payload)
          .eq('id', publication!.id)
        if (updateError) throw new Error(updateError.message)
      }

      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-start gap-2">
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={255}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Ex: Ata da Assembleia Geral Ordinária - Março 2025"
        />
      </div>

      {/* Category + Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Categoria <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Data de publicação <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Conteúdo / Descrição
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
          placeholder="Descreva o conteúdo da publicação (opcional)..."
        />
      </div>

      {/* File upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Arquivo (PDF, imagem, etc.) — máx. 20 MB
        </label>

        {existingFileUrl && !removeFile && (
          <div className="flex items-center gap-2 mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600 flex-1 truncate">{existingFileName ?? 'Arquivo atual'}</span>
            <button
              type="button"
              onClick={handleRemoveExistingFile}
              className="text-red-400 hover:text-red-600 flex-shrink-0"
              title="Remover arquivo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {file && (
          <div className="flex items-center gap-2 mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Paperclip className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-sm text-green-700 flex-1 truncate">{file.name}</span>
            <button
              type="button"
              onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
              className="text-red-400 hover:text-red-600 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all w-full justify-center"
        >
          <Paperclip className="w-4 h-4" />
          {file || existingFileUrl ? 'Substituir arquivo' : 'Selecionar arquivo'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"
          onChange={handleFileChange}
        />
      </div>

      {/* Is Published */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => setIsPublished(!isPublished)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
            isPublished ? 'bg-brand-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              isPublished ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <div>
          <p className="text-sm font-medium text-gray-700">
            {isPublished ? 'Publicado' : 'Rascunho'}
          </p>
          <p className="text-xs text-gray-400">
            {isPublished
              ? 'Visível no portal público'
              : 'Não visível no portal público'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-700 text-white rounded-lg text-sm font-semibold hover:bg-brand-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {mode === 'create' ? 'Criar publicação' : 'Salvar alterações'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
