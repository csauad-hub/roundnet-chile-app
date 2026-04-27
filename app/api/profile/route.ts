import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: Request) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const isVisible = body.visible_in_directory === true

  const admin = createAdminClient()

  // Step 1: update
  const { error: updateError } = await admin
    .from('profiles')
    .update({
      full_name: (body.full_name as string) || null,
      city: (body.city as string) || null,
      region: (body.region as string) || null,
      instagram: body.instagram ? (body.instagram as string).replace('@', '') : null,
      phone: (body.phone as string) || null,
      visible_in_directory: isVisible,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Step 2: read back what is ACTUALLY in the DB now
  const { data: verified, error: readError } = await admin
    .from('profiles')
    .select('id, full_name, visible_in_directory')
    .eq('id', user.id)
    .single()

  if (readError || !verified) {
    // Profile row doesn't exist — create it
    const { data: inserted, error: insertError } = await admin
      .from('profiles')
      .insert({
        id: user.id,
        full_name: (body.full_name as string) || null,
        city: (body.city as string) || null,
        region: (body.region as string) || null,
        instagram: body.instagram ? (body.instagram as string).replace('@', '') : null,
        phone: (body.phone as string) || null,
        visible_in_directory: isVisible,
      })
      .select('id, full_name, visible_in_directory')
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, saved: inserted })
  }

  return NextResponse.json({ ok: true, saved: verified })
}
