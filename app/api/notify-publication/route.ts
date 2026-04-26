import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendPublicationNotification } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Verify caller is an admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: callerProfile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (callerProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { publicationId } = await request.json()
  if (!publicationId) {
    return NextResponse.json({ error: 'publicationId é obrigatório' }, { status: 400 })
  }

  // Fetch publication
  const { data: pub } = await admin
    .from('publications')
    .select('id, title, category, content, is_published')
    .eq('id', publicationId)
    .maybeSingle()

  if (!pub?.is_published) {
    return NextResponse.json({ error: 'Publicação não encontrada ou não publicada' }, { status: 404 })
  }

  // Fetch all user emails from profiles
  const { data: profiles } = await admin
    .from('profiles')
    .select('email')

  const recipients = (profiles ?? [])
    .map((p) => p.email as string)
    .filter(Boolean)

  if (recipients.length === 0) {
    return NextResponse.json({ sent: 0, message: 'Nenhum destinatário encontrado' })
  }

  await sendPublicationNotification({
    recipients,
    publicationId: pub.id,
    title: pub.title,
    category: pub.category,
    content: pub.content,
  })

  return NextResponse.json({ sent: recipients.length })
}
