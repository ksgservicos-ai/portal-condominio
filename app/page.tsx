import { createClient } from '@/lib/supabase/server'
import { CATEGORIES, type Category, type Publication } from '@/lib/types'
import PublicationCard from '@/components/PublicationCard'
import SearchAndFilter from '@/components/SearchAndFilter'
import { Building2, FileText, Shield } from 'lucide-react'
import Link from 'next/link'

interface SearchParams {
  q?: string
  categoria?: string
  de?: string
  ate?: string
}

async function getPublications(params: SearchParams): Promise<Publication[]> {
  const supabase = await createClient()
  let query = supabase
    .from('publications')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (params.q) {
    query = query.ilike('title', `%${params.q}%`)
  }
  if (params.categoria && CATEGORIES.includes(params.categoria as Category)) {
    query = query.eq('category', params.categoria)
  }
  if (params.de) {
    query = query.gte('published_at', params.de)
  }
  if (params.ate) {
    query = query.lte('published_at', `${params.ate}T23:59:59`)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching publications:', error)
    return []
  }
  return data as Publication[]
}

async function getCounts(): Promise<Record<string, number>> {
  const supabase = await createClient()
  const counts: Record<string, number> = {}
  for (const cat of CATEGORIES) {
    const { count } = await supabase
      .from('publications')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
      .eq('category', cat)
    counts[cat] = count ?? 0
  }
  return counts
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolvedParams = await searchParams
  const [publications, counts] = await Promise.all([
    getPublications(resolvedParams),
    getCounts(),
  ])

  const totalPublications = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-brand-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-brand-700 p-2 rounded-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Portal de Transparência</h1>
                <p className="text-brand-300 text-xs">Condomínio</p>
              </div>
            </div>
            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 text-brand-300 hover:text-white text-sm transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Área Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-800 to-brand-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            Transparência para todos
          </h2>
          <p className="text-brand-200 text-lg max-w-2xl mx-auto">
            Acesse atas de reuniões, informações financeiras, comunicados, contratos e atualizações de obras do seu condomínio.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-brand-300">
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium">{totalPublications} documento{totalPublications !== 1 ? 's' : ''} publicado{totalPublications !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-0 divide-x divide-gray-200">
            {CATEGORIES.map((cat) => (
              <a
                key={cat}
                href={`/?categoria=${cat}`}
                className="flex-shrink-0 flex flex-col items-center py-3 px-6 hover:bg-gray-50 transition-colors group"
              >
                <span className="text-xl font-bold text-brand-700 group-hover:text-brand-900">
                  {counts[cat]}
                </span>
                <span className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">{cat}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <SearchAndFilter
          initialQ={resolvedParams.q}
          initialCategoria={resolvedParams.categoria}
          initialDe={resolvedParams.de}
          initialAte={resolvedParams.ate}
        />

        {publications.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-1">
              Nenhuma publicação encontrada
            </h3>
            <p className="text-gray-400 text-sm">
              Tente ajustar os filtros ou buscar por outro termo.
            </p>
            <a
              href="/"
              className="mt-4 inline-block text-brand-600 hover:text-brand-800 text-sm font-medium"
            >
              Limpar filtros
            </a>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {publications.length} resultado{publications.length !== 1 ? 's' : ''} encontrado{publications.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {publications.map((pub) => (
                <PublicationCard key={pub.id} publication={pub} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>Portal de Transparência · Condomínio</p>
          <p className="mt-1 text-gray-500 text-xs">
            As informações publicadas neste portal são de responsabilidade da administração do condomínio.
          </p>
        </div>
      </footer>
    </div>
  )
}
