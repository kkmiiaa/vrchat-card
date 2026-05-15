import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let slug = ''
  for (let i = 0; i < 8; i++) slug += chars[Math.floor(Math.random() * chars.length)]
  return slug
}

async function createUserWithSlug(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  userId: string
): Promise<void> {
  const MAX_ATTEMPTS = 10
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const slug = generateSlug()
    const { data: conflict } = await admin
      .from('users')
      .select('id')
      .eq('username_slug', slug)
      .single()
    if (!conflict) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await admin.from('users').insert({ id: userId, username_slug: slug } as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await admin.from('profiles').insert({ user_id: userId } as any)
      return
    }
  }
  throw new Error('slug generation failed after max attempts')
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)

  const supabase = await createClient()
  const { error, data } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user) return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)

  const userId = data.user.id
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: existingUser } = await admin
    .from('users')
    .select('id')
    .eq('id', userId)
    .single()

  if (!existingUser) {
    try {
      await createUserWithSlug(admin, userId)
    } catch {
      return NextResponse.redirect(`${origin}/auth/login?error=signup_failed`)
    }
    // 新規ユーザーは自分のプロフィールページへ
    const { data: newUser } = await admin.from('users').select('username_slug').eq('id', userId).single()
    const profileUrl = newUser ? `${origin}/u/${newUser.username_slug}` : `${origin}/`
    return NextResponse.redirect(profileUrl)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
