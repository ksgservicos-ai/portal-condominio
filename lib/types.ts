export type Category = 'Atas' | 'Financeiro' | 'Comunicados' | 'Contratos' | 'Obras'

export const CATEGORIES: Category[] = ['Atas', 'Financeiro', 'Comunicados', 'Contratos', 'Obras']

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string }> = {
  Atas:        { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  Financeiro:  { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200'  },
  Comunicados: { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-200'   },
  Contratos:   { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  Obras:       { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
}

export interface Publication {
  id: string
  title: string
  content: string | null
  category: Category
  file_url: string | null
  file_name: string | null
  allow_comments: boolean
  is_published: boolean
  published_at: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  publication_id: string
  user_id: string
  user_display_name: string
  content: string
  created_at: string
}
