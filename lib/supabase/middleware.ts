import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as never)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isLoginPage   = pathname === '/login' || pathname === '/admin/login'
  const isCadastro    = pathname === '/cadastro'
  const isPortalRoute = pathname === '/' || pathname.startsWith('/publicacoes/')
  const isAdminRoute  = pathname.startsWith('/admin') && !isLoginPage
  const isAuthApi     = pathname.startsWith('/api/auth/')

  // Always allow public/auth routes
  if (isAuthApi || isCadastro) return supabaseResponse

  // Portal requires an authenticated user (any role)
  if (isPortalRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    if (pathname !== '/') url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Admin routes require an authenticated user
  // Role check (admin vs usuario) is handled inside the admin layout,
  // which uses the service-role client and is reliable in all environments
  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login pages
  if (isLoginPage && user) {
    const role = user.user_metadata?.role as string | undefined
    const url = request.nextUrl.clone()
    url.pathname = role === 'admin' ? '/admin' : '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
