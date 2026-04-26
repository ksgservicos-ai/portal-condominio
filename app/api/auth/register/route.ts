import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password, nome, apartamento, bloco } = await request.json()

  if (!email || !password || !nome) {
    return NextResponse.json(
      { error: 'Nome, e-mail e senha são obrigatórios' },
      { status: 400 }
    )
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: 'A senha deve ter no mínimo 6 caracteres' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome, apartamento: apartamento ?? null, bloco: bloco ?? null, role: 'usuario' },
  })

  if (error) {
    const msg = error.message.includes('already registered')
      ? 'Este e-mail já está cadastrado.'
      : error.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // Upsert profile (trigger já cria, mas garantimos consistência)
  if (data.user) {
    await admin.from('profiles').upsert({
      id: data.user.id,
      email,
      nome,
      apartamento: apartamento ?? null,
      bloco: bloco ?? null,
      role: 'usuario',
    })
  }

  return NextResponse.json({ success: true })
}
