import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const PAGE_SIZE = 24
const FREE_EXPLORE_LIMIT = 3

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const { data: { user } } = await supabase.auth.getUser()
  let isPro = false
  let freeRemaining = FREE_EXPLORE_LIMIT
  let userRow: { plan: string; plan_expires_at: string | null; free_explore_count: number; free_explore_reset_month: string | null } | null = null

  if (user) {
    const { data } = await supabase
      .from('users')
      .select('plan, plan_expires_at, free_explore_count, free_explore_reset_month')
      .eq('id', user.id)
      .single()
    userRow = data
    isPro = userRow?.plan === 'pro' &&
      (userRow.plan_expires_at == null || new Date(userRow.plan_expires_at) > new Date())

    if (!isPro && userRow) {
      const currentMonth = new Date().toISOString().slice(0, 7) // "2026-06"
      const count = userRow.free_explore_reset_month === currentMonth
        ? userRow.free_explore_count
        : 0
      freeRemaining = Math.max(0, FREE_EXPLORE_LIMIT - count)
    }
  }

  const communitySlug = searchParams.get('community') ?? 'vrchat'
  const templateId    = searchParams.get('template') ?? ''
  const cursor        = searchParams.get('cursor') ?? null

  // フィルター/検索パラメータが存在するか確認
  const q      = searchParams.get('q') ?? ''
  const gender = searchParams.get('gender') ?? ''
  const lang   = searchParams.get('lang') ?? ''
  const age    = searchParams.get('age') ?? ''
  const hasFilter = !!(q || gender || lang || age)

  // Free ユーザーでフィルターを使用する場合、残り回数を確認・インクリメント
  if (!isPro && hasFilter && user && userRow) {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const isNewMonth = userRow.free_explore_reset_month !== currentMonth
    const count = isNewMonth ? 0 : userRow.free_explore_count

    if (count >= FREE_EXPLORE_LIMIT) {
      return NextResponse.json({ error: 'limit_exceeded', isPro: false, remaining: 0 }, { status: 403 })
    }

    // カウントをインクリメント
    await supabase
      .from('users')
      .update({
        free_explore_count: count + 1,
        free_explore_reset_month: currentMonth,
      })
      .eq('id', user.id)

    freeRemaining = Math.max(0, FREE_EXPLORE_LIMIT - (count + 1))
  }

  // Free ユーザーは未ログインorフィルターなしの場合もフィルター適用しない
  const activeQ      = isPro || hasFilter ? q      : ''
  const activeGender = isPro || hasFilter ? gender : ''
  const activeLang   = isPro || hasFilter ? lang   : ''
  const activeAge    = isPro || hasFilter ? age    : ''

  // カードはテンプレート経由で界隈に属する（card → template → community_templates）
  let query = supabase
    .from('cards')
    .select('id, title, image_url, card_data, background, created_at, template_id, user_id, like_count, view_count, templates!inner(community_templates!inner(community_slug))')
    .eq('visibility', 'public')
    .eq('templates.community_templates.community_slug', communitySlug)
    .order('created_at', { ascending: false })

  if (templateId) query = query.eq('template_id', templateId)

  if (!isPro) {
    query = query.limit(20)
  } else {
    query = query.limit(PAGE_SIZE)
    if (cursor) query = query.lt('created_at', cursor)
  }

  // global filters
  if (activeGender) query = query.filter('card_data->>genderTag', 'eq', activeGender)
  if (activeLang)   query = query.filter('card_data->language->preset', 'cs', JSON.stringify([activeLang]))
  if (activeAge)    query = query.filter('card_data->age->>searchTag', 'eq', activeAge)

  // template-specific filters（Pro または Free でフィルター使用時）
  if ((isPro || hasFilter) && templateId) {
    const { data: tplRow } = await supabase
      .from('templates')
      .select('block_pool')
      .eq('id', templateId)
      .single()

    const pool = (tplRow?.block_pool ?? {}) as Record<string, { componentKey: string; dataKey: string; blockConfig?: Record<string, unknown> }>
    const SEARCHABLE_COMPONENT_KEYS = new Set(['select', 'multi-select', 'expressive-select', 'gauge'])

    for (const entry of Object.values(pool)) {
      if (!SEARCHABLE_COMPONENT_KEYS.has(entry.componentKey)) continue
      const val = searchParams.get(entry.dataKey)
      if (!val) continue

      if (entry.componentKey === 'multi-select') {
        query = query.filter(`card_data->${entry.dataKey}`, 'cs', JSON.stringify([val]))
      } else if (entry.componentKey === 'expressive-select') {
        query = query.filter(`card_data->${entry.dataKey}->>'tag'`, 'eq', val)
      } else {
        query = query.filter(`card_data->>'${entry.dataKey}'`, 'eq', val)
      }
    }
  }

  if (activeQ) {
    const { data: matchedProfiles } = await supabase
      .from('profiles')
      .select('user_id')
      .ilike('display_name', `%${activeQ}%`)

    const matchedUserIds = (matchedProfiles ?? []).map(p => p.user_id)

    const orClause = [
      `card_data->>name.ilike.%${activeQ}%`,
      `card_data->>selfIntro.ilike.%${activeQ}%`,
      ...(matchedUserIds.length > 0 ? [`user_id.in.(${matchedUserIds.join(',')})`] : []),
    ].join(',')

    query = query.or(orClause)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const userIds = [...new Set((data ?? []).map(c => c.user_id).filter(Boolean))]
  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('user_id, display_name, avatar_url').in('user_id', userIds)
    : { data: [] }

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))
  const cards = (data ?? []).map(c => ({ ...c, profile: profileMap[c.user_id] ?? null }))

  return NextResponse.json({ cards, isPro, freeRemaining })
}
