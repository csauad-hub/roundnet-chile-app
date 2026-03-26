import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const response = NextResponse.redirect(`${origin}${next}`)

  // @supabase/ssr v0.3.0 has a bug where exchangeCodeForSession cannot read the
  // PKCE code verifier from cookies set by createBrowserClient (cookie encoding
  // mismatch). Workaround: read the verifier directly from the cookie and call
  // Supabase's token endpoint manually, then persist the session via setSession().
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
  const verifierCookieName = `sb-${projectRef}-auth-token-code-verifier`

  // createBrowserClient stores the verifier as JSON.stringify(value), URL-encoded.
  // Next.js URL-decodes it, giving us e.g. '"abc123"' (with JSON quotes).
  const rawVerifier = request.cookies.get(verifierCookieName)?.value ?? null
  let codeVerifier: string | null = null
  if (rawVerifier !== null) {
    try {
      const parsed = JSON.parse(rawVerifier)
      codeVerifier = typeof parsed === 'string' ? parsed : rawVerifier
    } catch {
      codeVerifier = rawVerifier
    }
  }

  if (!codeVerifier) {
    console.error('[callback] PKCE verifier missing from cookies')
    return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`)
  }

  // Call Supabase's token endpoint directly to exchange the code for a session
  const tokenRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify({
      auth_code: code,
      code_verifier: codeVerifier,
    }),
  })

  if (!tokenRes.ok) {
    const errBody = await tokenRes.json().catch(() => ({}))
    console.error('[callback] token exchange failed:', JSON.stringify(errBody))
    return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`)
  }

  const { access_token, refresh_token } = await tokenRes.json()

  // Use createServerClient to persist the session in cookies in the correct format
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  })

  const { error: setSessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  })

  if (setSessionError) {
    console.error('[callback] setSession error:', JSON.stringify(setSessionError))
    return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`)
  }

  return response
}
