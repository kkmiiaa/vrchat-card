import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { FREE_CARD_LIMIT } from '@/lib/plans'

// GET /api/cards — ログインユーザーのカード一覧
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/cards — 新規カード作成
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const { templateId, title, cardData, background, visibility = 'private' } = await request.json()
  if (!templateId) return NextResponse.json({ error: 'templateId is required' }, { status: 400 })

  // プラン制限チェック
  const { data: userRow } = await supabase
    .from('users')
    .select('plan, plan_expires_at')
    .eq('id', user.id)
    .single()

  const isPro = userRow?.plan === 'pro' &&
    (userRow.plan_expires_at == null || new Date(userRow.plan_expires_at) > new Date())

  if (!isPro) {
    const { count } = await supabase
      .from('cards')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= FREE_CARD_LIMIT) {
      return NextResponse.json({ error: 'card_limit_reached' }, { status: 403 })
    }
  }

  const { data, error } = await supabase
    .from('cards')
    .insert({
      user_id: user.id,
      template_id: templateId,
      title,
      card_data: cardData ?? {},
      background: background ?? null,
      visibility,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ cardId: data.id }, { status: 201 })
}
