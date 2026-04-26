import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { publication_id, content } = await request.json()

  if (!publication_id || !content?.trim()) {
    return NextResponse.json({ error: 'publication_id e content são obrigatórios' }, { status: 400 })
  }
  if (content.trim().length > 1000) {
    return NextResponse.json({ error: 'Comentário muito longo (máx. 1000 caracteres)' }, { status: 400 })
  }

  // Verify the publication exists, is published, and allows comments
  const { data: pub } = await supabase
    .from('publications')
    .select('allow_comments, is_published')
    .eq('id', publication_id)
    .maybeSingle()

  if (!pub?.is_published || !pub?.allow_comments) {
    return NextResponse.json({ error: 'Comentários não estão habilitados nesta publicação' }, { status: 403 })
  }

  // Get user display name from their own profile (RLS allows reading own row)
  const { data: profile } = await supabase
    .from('profiles')
    .select('nome, email')
    .eq('id', user.id)
    .maybeSingle()

  const displayName = profile?.nome?.trim() || user.email || 'Usuário'

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({ publication_id, user_id: user.id, content: content.trim(), user_display_name: displayName })
    .select('id, content, created_at, user_id, user_display_name')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ comment }, { status: 201 })
}
