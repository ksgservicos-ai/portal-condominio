import { createClient } from '@/lib/supabase/server'
import AdminPublicationTable from '@/components/admin/PublicationTable'
import { CATEGORIES, type Publication } from '@/lib/types'
import { FileText, TrendingUp } from 'lucide-react'

async function getAllPublications(): Promise<Publication[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return data as Publication[]
}

export default async function AdminDashboard() {
  const publications = await getAllPublications()

  const published = publications.filter((p) => p.is_published).length
  const drafts = publications.filter((p) => !p.is_published).length

  const countsByCategory = CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = publications.filter((p) => p.category === cat).length
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel de Publicações</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gerencie todas as publicações do portal de transparência.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{publications.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-500">Publicados</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{published}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-500">Rascunhos</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{drafts}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-500">Categorias</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{CATEGORIES.length}</p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => (
          <div key={cat} className="bg-white rounded-lg p-3 border border-gray-200 text-center shadow-sm">
            <p className="text-xl font-bold text-brand-700">{countsByCategory[cat]}</p>
            <p className="text-xs text-gray-500 mt-0.5">{cat}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Todas as Publicações</h2>
        </div>
        <AdminPublicationTable publications={publications} />
      </div>
    </div>
  )
}
