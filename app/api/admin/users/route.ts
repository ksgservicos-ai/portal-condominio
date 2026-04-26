import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // user_metadata.role can be undefined for legacy users — check profiles table
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role ?? (user.user_metadata?.role as string | undefined)
  return role === 'admin' ? user : null
}

export async function GET() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const users = data.users.map((u) => ({
    id: u.id,
    email: u.email ?? '',
    nome: (u.user_metadata?.nome as string) ?? '',
    apartamento: (u.user_metadata?.apartamento as string) ?? '',
    bloco: (u.user_metadata?.bloco as string) ?? '',
    role: (u.user_metadata?.role as string) ?? 'usuario',
    created_at: u.created_at,
  }))

  return NextResponse.json({ users })
}

export async function POST(request: Request) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { email, password, nome, apartamento, bloco, role } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 })
  }
  if (!['admin', 'usuario'].includes(role)) {
    return NextResponse.json({ error: 'Perfil inválido' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'A senha deve ter no mínimo 6 caracteres' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome: nome ?? '', apartamento: apartamento ?? '', bloco: bloco ?? '', role },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Upsert profile row
  await admin.from('profiles').upsert({
    id: data.user.id,
    email,
    nome: nome ?? '',
    apartamento: apartamento ?? '',
    bloco: bloco ?? '',
    role,
  })

  return NextResponse.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      nome: nome ?? '',
      apartamento: apartamento ?? '',
      bloco: bloco ?? '',
      role,
      created_at: data.user.created_at,
    },
  })
}
