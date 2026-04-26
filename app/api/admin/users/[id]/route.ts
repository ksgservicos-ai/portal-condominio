import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') return null
  return user
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await requireAdmin()
  if (!caller) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const { id } = await params
  if (caller.id === id) {
    return NextResponse.json({ error: 'Você não pode excluir sua própria conta' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await requireAdmin()
  if (!caller) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const { id } = await params
  const body = await request.json()
  const { role, nome, apartamento, bloco } = body

  if (role !== undefined && !['admin', 'usuario'].includes(role)) {
    return NextResponse.json({ error: 'Perfil inválido' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Fetch current metadata to merge
  const { data: userData } = await admin.auth.admin.getUserById(id)
  const currentMeta = userData?.user?.user_metadata ?? {}

  const updatedMeta: Record<string, unknown> = { ...currentMeta }
  if (role !== undefined)       updatedMeta.role       = role
  if (nome !== undefined)       updatedMeta.nome       = nome
  if (apartamento !== undefined) updatedMeta.apartamento = apartamento
  if (bloco !== undefined)      updatedMeta.bloco      = bloco

  const { error } = await admin.auth.admin.updateUserById(id, { user_metadata: updatedMeta })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Sync profiles table
  const profilePatch: Record<string, unknown> = {}
  if (role !== undefined)        profilePatch.role       = role
  if (nome !== undefined)        profilePatch.nome       = nome
  if (apartamento !== undefined) profilePatch.apartamento = apartamento
  if (bloco !== undefined)       profilePatch.bloco      = bloco

  if (Object.keys(profilePatch).length > 0) {
    await admin.from('profiles').update(profilePatch).eq('id', id)
  }

  return NextResponse.json({ success: true })
}
