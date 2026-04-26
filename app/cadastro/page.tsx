import CadastroForm from '@/components/CadastroForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CadastroPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/')
  return <CadastroForm />
}
