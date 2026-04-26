import LoginForm from '@/components/LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; tipo?: string }>
}) {
  const { next, tipo } = await searchParams
  return <LoginForm next={next ?? '/'} tipo={tipo} />
}
