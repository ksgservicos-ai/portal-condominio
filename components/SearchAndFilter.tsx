'use client'

import { CATEGORIES, type Category } from '@/lib/types'
import { Filter, Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

interface Props {
  initialQ?: string
  initialCategoria?: string
  initialDe?: string
  initialAte?: string
}

export default function SearchAndFilter({ initialQ, initialCategoria, initialDe, initialAte }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(initialQ ?? '')
  const [categoria, setCategoria] = useState(initialCategoria ?? '')
  const [de, setDe] = useState(initialDe ?? '')
  const [ate, setAte] = useState(initialAte ?? '')

  const hasFilters = q || categoria || de || ate

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (categoria) params.set('categoria', categoria)
    if (de) params.set('de', de)
    if (ate) params.set('ate', ate)
    const search = params.toString()
    router.push(search ? `/?${search}` : '/')
  }, [q, categoria, de, ate, router])

  const clearFilters = () => {
    setQ('')
    setCategoria('')
    setDe('')
    setAte('')
    router.push('/')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') applyFilters()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por título..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
        </div>

        {/* Category */}
        <div className="sm:w-44">
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white text-gray-700"
          >
            <option value="">Todas as categorias</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="flex gap-2 sm:w-auto">
          <input
            type="date"
            value={de}
            onChange={(e) => setDe(e.target.value)}
            title="Data inicial"
            className="flex-1 sm:w-36 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-gray-700"
          />
          <input
            type="date"
            value={ate}
            onChange={(e) => setAte(e.target.value)}
            title="Data final"
            className="flex-1 sm:w-36 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-gray-700"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              title="Limpar filtros"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active filters summary */}
      {hasFilters && (
        <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          {q && (
            <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-xs px-2.5 py-1 rounded-full border border-brand-100">
              Busca: "{q}"
              <button onClick={() => { setQ(''); applyFilters() }}>
                <X className="w-3 h-3 ml-0.5" />
              </button>
            </span>
          )}
          {categoria && (
            <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-xs px-2.5 py-1 rounded-full border border-brand-100">
              {categoria}
              <button onClick={() => { setCategoria(''); applyFilters() }}>
                <X className="w-3 h-3 ml-0.5" />
              </button>
            </span>
          )}
          {(de || ate) && (
            <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-xs px-2.5 py-1 rounded-full border border-brand-100">
              {de && `De: ${de}`}{de && ate && ' '}{ate && `Até: ${ate}`}
              <button onClick={() => { setDe(''); setAte(''); applyFilters() }}>
                <X className="w-3 h-3 ml-0.5" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
