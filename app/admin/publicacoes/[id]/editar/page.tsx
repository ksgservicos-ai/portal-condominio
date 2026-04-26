import { createClient } from '@/lib/supabase/server'
import PublicationForm from '@/components/admin/PublicationForm'
import { type Publication } from '@/lib/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getPublication(id: string): Promise<Publication | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Publication
}

export default async function EditarPublicacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const publication = await getPublication(id)
  if (!publication) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Publicação</h1>
          <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">{publication.title}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <PublicationForm mode="edit" publication={publication} />
      </div>
    </div>
  )
}
