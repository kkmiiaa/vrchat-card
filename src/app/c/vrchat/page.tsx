import { createClient } from '@/lib/supabase/server'
import { type Metadata } from 'next'
import ExploreClient from './ExploreClient'
import { fetchTemplateLayouts } from '@/lib/templateLayout'

export const metadata: Metadata = {
  title: 'VRChat 界隈のユーザーをみつける — vaacard',
  description: 'VRChatユーザーの自己紹介カード一覧。プロプランで詳細検索が可能。',
}

const FREE_EXPLORE_LIMIT = 3

export default async function Page() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  let isPro = false
  let freeRemaining = FREE_EXPLORE_LIMIT
  if (user) {
    const { data: userRow } = await supabase
      .from('users')
      .select('plan, plan_expires_at, free_explore_count, free_explore_reset_month')
      .eq('id', user.id)
      .single()
    isPro = userRow?.plan === 'pro' &&
      (userRow?.plan_expires_at == null || new Date(userRow.plan_expires_at) > new Date())
    if (!isPro && userRow) {
      const currentMonth = new Date().toISOString().slice(0, 7)
      const count = userRow.free_explore_reset_month === currentMonth ? userRow.free_explore_count : 0
      freeRemaining = Math.max(0, FREE_EXPLORE_LIMIT - count)
    }
  }

  // 初期データ（最新20件）
  const { data: initialCards } = await supabase
    .from('cards')
    .select('id, title, image_url, card_data, background, created_at, template_id, user_id, like_count, view_count, templates!inner(community_templates!inner(community_slug))')
    .eq('visibility', 'public')
    .eq('templates.community_templates.community_slug', 'vrchat')
    .order('created_at', { ascending: false })
    .limit(isPro ? 24 : 20)

  const userIds = [...new Set((initialCards ?? []).map(c => c.user_id).filter(Boolean))]
  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('user_id, display_name, avatar_url').in('user_id', userIds)
    : { data: [] }

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))
  const cards = (initialCards ?? []).map(c => ({ ...c, profile: profileMap[c.user_id] ?? null }))

  const allLayouts = await fetchTemplateLayouts()
  const communityTemplates = Object.values(allLayouts)
    .filter(t => t.community_slugs.includes('vrchat'))

  return (
    <ExploreClient
      initialCards={cards}
      isPro={isPro}
      isLoggedIn={!!user}
      communityTemplates={communityTemplates}
      initialFreeRemaining={freeRemaining}
    />
  )
}
