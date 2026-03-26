import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Log raw Cookie header and parsed cookies as errors so they appear in Vercel logs
  const rawCookie = request.headers.get('cookie') ?? ''
  const parsedCookies = request.cookies.getAll().map(c => c.name)
  console.error('[callback] raw-cookie-header:', rawCookie.substring(0, 500))
  console.error('[callback] parsed-cookie-names:', JSON.stringify(parsedCookies))

  const next = searchParams.get('next') ?? '/'

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return response
    console.error('[callback] exchange-error:', JSON.stringify(error))
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`)
}
