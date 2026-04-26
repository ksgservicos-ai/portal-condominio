import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import CommentsSection from '@/components/CommentsSection'
import { CATEGORY_COLORS, type Comment, type Publication } from '@/lib/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Calendar, Download, FileText, Tag } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getPublication(id: string): Promise<Publication | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()
  if (error || !data) return null
  return data as Publication
}

async function getComments(publicationId: string): Promise<Comment[]> {
  // Use admin client so the query is not subject to RLS edge-cases
  const admin = createAdminClient()
  const { data } = await admin
    .from('comments')
    .select('id, publication_id, user_id, user_display_name, content, created_at')
    .eq('publication_id', publicationId)
    .order('created_at', { ascending: true })
  return (data ?? []) as Comment[]
}

export default async function PublicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const publication = await getPublication(id)
  if (!publication) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Resolve role from profiles
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .maybeSingle()
  const isAdmin = profile?.role === 'admin'

  const comments = publication.allow_comments ? await getComments(id) : []

  const colors = CATEGORY_COLORS[publication.category]
  const formattedDate = format(new Date(publication.published_at), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  })

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-800 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao portal
        </Link>
      </div>

      <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
              <Tag className="w-3 h-3" />
              {publication.category}
            </span>
            <span className="flex items-center gap-1.5 text-gray-500 text-sm">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {publication.title}
          </h1>
        </div>

        {publication.content && (
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {publication.content}
            </p>
          </div>
        )}

        {publication.file_url && (
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documento anexado
            </h2>
            <a
              href={publication.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium shadow-sm"
            >
              <Download className="w-4 h-4" />
              {publication.file_name ?? 'Baixar documento'}
            </a>
          </div>
        )}

        {/* Comments section */}
        {publication.allow_comments && (
          <div className="border-t border-gray-100">
            <CommentsSection
              publicationId={id}
              initialComments={comments}
              currentUserId={user!.id}
              isAdmin={isAdmin}
            />
          </div>
        )}
      </article>
    </main>
  )
}
