import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

  const { templateId, title, cardData, visibility = 'public', communities = [] } = await request.json()
  if (!templateId) return NextResponse.json({ error: 'templateId is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('cards')
    .insert({ user_id: user.id, template_id: templateId, title, card_data: cardData ?? {}, visibility, communities })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ cardId: data.id }, { status: 201 })
}
