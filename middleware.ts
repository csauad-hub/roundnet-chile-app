import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Always pass through the OAuth callback route
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  const path = request.nextUrl.pathname
  const isAdminPath = path.startsWith('/admin')
  const isPerfilPath = path.startsWith('/perfil')

  // Only protect /admin and /perfil routes
  if (!isAdminPath && !isPerfilPath) {
    return NextResponse.next({ request })
  }

  // Use @supabase/ssr to read the session properly (handles v0.6+ cookie format)
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const next = isPerfilPath ? '/auth?next=/perfil' : '/auth?next=/admin'
    return NextResponse.redirect(new URL(next, request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/perfil/:path*'],
}
