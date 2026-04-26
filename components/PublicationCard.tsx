import { type Publication } from '@/lib/types'
import CategoryBadge from './CategoryBadge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Download, FileText } from 'lucide-react'
import Link from 'next/link'

interface Props {
  publication: Publication
}

export default function PublicationCard({ publication }: Props) {
  const formattedDate = format(new Date(publication.published_at), "dd/MM/yyyy", {
    locale: ptBR,
  })

  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-200 flex flex-col overflow-hidden group">
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <CategoryBadge category={publication.category} />
          <span className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap mt-0.5">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
        </div>

        <Link href={`/publicacoes/${publication.id}`} className="flex-1">
          <h3 className="font-semibold text-gray-900 leading-snug group-hover:text-brand-700 transition-colors line-clamp-2">
            {publication.title}
          </h3>
          {publication.content && (
            <p className="text-gray-500 text-sm mt-2 line-clamp-3 leading-relaxed">
              {publication.content}
            </p>
          )}
        </Link>
      </div>

      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2">
        {publication.file_url ? (
          <a
            href={publication.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 font-medium transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="w-3.5 h-3.5" />
            {publication.file_name ?? 'Baixar arquivo'}
          </a>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <FileText className="w-3.5 h-3.5" />
            Sem arquivo
          </span>
        )}

        <Link
          href={`/publicacoes/${publication.id}`}
          className="text-xs text-brand-600 hover:text-brand-800 font-medium transition-colors"
        >
          Ver detalhes →
        </Link>
      </div>
    </article>
  )
}
