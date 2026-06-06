import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const PAGE_SIZE = 24

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

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

  const communitySlug = searchParams.get('community') ?? 'vrchat'
  const templateId    = searchParams.get('template') ?? ''
  const q             = isPro ? (searchParams.get('q') ?? '') : ''
  const gender        = isPro ? (searchParams.get('gender') ?? '') : ''
  const lang          = isPro ? (searchParams.get('lang') ?? '') : ''
  const age           = isPro ? (searchParams.get('age') ?? '') : ''
  const cursor        = searchParams.get('cursor') ?? null

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

  // global filters（global: true のコンポーネントに対応）
  if (gender) query = query.filter('card_data->>genderTag', 'eq', gender)
  if (lang) query = query.filter('card_data->language->preset', 'cs', JSON.stringify([lang]))
  if (age) query = query.filter('card_data->age->>searchTag', 'eq', age)

  // template-specific filters: block_pool を参照して searchable なフィールドのみ適用
  if (isPro && templateId) {
    const { data: tplRow } = await supabase
      .from('templates')
      .select('block_pool')
      .eq('id', templateId)
      .single()

    const pool = (tplRow?.block_pool ?? {}) as Record<string, { componentKey: string; dataKey: string; blockConfig?: Record<string, unknown> }>

    // componentKey → フィルター方式のマッピング（searchable: true のもののみ）
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
        // select, gauge
        query = query.filter(`card_data->>'${entry.dataKey}'`, 'eq', val)
      }
    }
  }

  if (q) {
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

  const userIds = [...new Set((data ?? []).map(c => c.user_id).filter(Boolean))]
  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('user_id, display_name, avatar_url').in('user_id', userIds)
    : { data: [] }

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))
  const cards = (data ?? []).map(c => ({ ...c, profile: profileMap[c.user_id] ?? null }))

  return NextResponse.json({ cards, isPro })
}
