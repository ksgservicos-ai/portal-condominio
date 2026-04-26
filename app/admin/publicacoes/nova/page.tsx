import PublicationForm from '@/components/admin/PublicationForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NovaPublicacaoPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Nova Publicação</h1>
          <p className="text-gray-500 text-sm mt-0.5">Preencha os dados da nova publicação</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <PublicationForm mode="create" />
      </div>
    </div>
  )
}
