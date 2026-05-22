import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { VRCHAT_COMPONENT_KEY_MAP } from '@/lib/components'

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

  // 界隈（現状はVRChat固定）
  const communitySlug = searchParams.get('community') ?? 'vrchat'

  // フィルターパラメータ（Proのみ有効）
  // component_key → card_data のキー名に変換
  const gender      = isPro ? (searchParams.get('gender') ?? '') : ''
  const platform    = isPro ? (searchParams.get('env') ?? '') : ''
  const language    = isPro ? (searchParams.get('lang') ?? '') : ''
  const friendPolicy = isPro ? (searchParams.get('friendPolicy') ?? '') : ''
  const q           = isPro ? (searchParams.get('q') ?? '') : ''
  const cursor      = searchParams.get('cursor') ?? null

  let query = supabase
    .from('cards')
    .select('id, title, image_url, card_data, created_at, template_id, community_slug, user_id')
    .eq('visibility', 'public')
    .eq('community_slug', communitySlug)
    .order('created_at', { ascending: false })

  if (!isPro) {
    query = query.limit(20)
  } else {
    query = query.limit(PAGE_SIZE)
    if (cursor) query = query.lt('created_at', cursor)
  }

  // gender → card_data->'gender'->>'tag'（gender形式）
  if (gender) {
    const cardDataKey = VRCHAT_COMPONENT_KEY_MAP['gender']
    query = query.eq(`card_data->'${cardDataKey}'->>'tag'`, gender)
  }

  // platform → card_data->'playEnv'
  if (platform) {
    const cardDataKey = VRCHAT_COMPONENT_KEY_MAP['platform']
    query = query.filter(`card_data->${cardDataKey}`, 'cs', JSON.stringify([platform]))
  }

  // language → card_data->'language'
  if (language) {
    const cardDataKey = VRCHAT_COMPONENT_KEY_MAP['language']
    query = query.filter(`card_data->${cardDataKey}`, 'cs', JSON.stringify([language]))
  }

  // friend_policy → card_data->>'friendPolicy'（文字列または配列を両方サポート）
  if (friendPolicy) {
    const cardDataKey = VRCHAT_COMPONENT_KEY_MAP['friend_policy']
    query = query.eq(`card_data->>${cardDataKey}`, friendPolicy)
  }

  // 全文検索（card_data name/selfIntro + profiles display_name）
  if (q) {
    // display_name がマッチするユーザーIDを取得してOR結合
    const { data: matchedProfiles } = await supabase
      .from('profiles')
      .select('user_id')
      .ilike('display_name', `%${q}%`)

    const matchedUserIds = (matchedProfiles ?? []).map(p => p.user_id)

    const orClause = [
      `card_data->>name.ilike.%${q}%`,
      `card_data->>selfIntro.ilike.%${q}%`,
      ...(matchedUserIds.length > 0 ? [`user_id.in.(${matchedUserIds.join(',')})`] : []),
    ].join(',')

    query = query.or(orClause)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // プロフィールをまとめて取得してカードに付与
  const userIds = [...new Set((data ?? []).map(c => c.user_id).filter(Boolean))]
  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('user_id, display_name, avatar_url').in('user_id', userIds)
    : { data: [] }

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))
  const cards = (data ?? []).map(c => ({ ...c, profile: profileMap[c.user_id] ?? null }))

  return NextResponse.json({ cards, isPro })
}
