import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ cardId: string }> }

// delta: +1 or -1
export async function POST(req: NextRequest, { params }: Params) {
  const { cardId } = await params
  const { delta } = await req.json() as { delta: 1 | -1 }
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('increment_like_count', { card_id: cardId, delta })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // いいねしたとき（+1）、カードオーナーに通知を作成
  if (delta === 1) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: card } = await supabase
      .from('cards')
      .select('user_id')
      .eq('id', cardId)
      .single()

    // 自分のカードへのいいねは通知しない
    if (card && user && card.user_id !== user.id) {
      await supabase.from('user_notifications').insert({
        user_id:      card.user_id,
        type:         'like',
        from_user_id: user.id,
        card_id:      cardId,
      })
    }
  }

  return NextResponse.json({ like_count: data })
}
