import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const PAGE_SIZE = 24

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  // ログインユーザーのプラン確認
  const { data: { user } } = await supabase.auth.getUser()
  let isPro = false
  if (user) {
    const { data: userRow } = await supabase
      .from('users')
      .select('plan, plan_expires_at')
      .eq('id', user.id)
      .single()
    isPro = userRow?.plan === 'pro' &&
      (userRow.plan_expires_at == null || new Date(userRow.plan_expires_at) > new Date())
  }

  // フィルターパラメータ（Proのみ有効）
  const gender = isPro ? (searchParams.get('gender') ?? '') : ''
  const env = isPro ? (searchParams.get('env') ?? '') : ''
  const lang = isPro ? (searchParams.get('lang') ?? '') : ''
  const friendPolicy = isPro ? (searchParams.get('friendPolicy') ?? '') : ''
  const q = isPro ? (searchParams.get('q') ?? '') : ''
  const cursor = searchParams.get('cursor') ?? null // created_at for pagination

  let query = supabase
    .from('cards')
    .select('id, title, image_url, card_data, created_at, template_id')
    .eq('visibility', 'public')
    .contains('communities', ['VRChat'])
    .order('created_at', { ascending: false })

  // Freeは20件固定
  if (!isPro) {
    query = query.limit(20)
  } else {
    query = query.limit(PAGE_SIZE)
    if (cursor) query = query.lt('created_at', cursor)
  }

  // Pro フィルター: JSONB検索
  if (gender) {
    query = query.ilike('card_data->>gender', `%${gender}%`)
  }
  if (env) {
    // playEnv は配列: card_data->'playEnv' ? 'PCVR'
    query = query.filter('card_data->playEnv', 'cs', JSON.stringify([env]))
  }
  if (lang) {
    query = query.filter('card_data->language', 'cs', JSON.stringify([lang]))
  }
  if (friendPolicy) {
    // friendPolicy は配列または文字列
    query = query.or(
      `card_data->>'friendPolicy'.eq.${friendPolicy},card_data->'friendPolicy'.cs.${JSON.stringify([friendPolicy])}`
    )
  }
  if (q) {
    query = query.or(
      `card_data->>'name'.ilike.%${q}%,card_data->>'selfIntro'.ilike.%${q}%`
    )
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ cards: data ?? [], isPro })
}
