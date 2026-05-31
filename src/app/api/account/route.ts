import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/** PATCH /api/account — username_slug の変更 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const { username_slug } = await request.json()
  if (!username_slug || !/^[a-z0-9_-]{3,30}$/.test(username_slug)) {
    return NextResponse.json({ error: 'invalid_slug' }, { status: 400 })
  }

  const { error } = await supabase
    .from('users')
    .update({ username_slug })
    .eq('id', user.id)

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'already_taken' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, username_slug })
}

/** DELETE /api/account — 自分のアカウントを削除 */
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
