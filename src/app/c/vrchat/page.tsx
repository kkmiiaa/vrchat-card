import { createClient } from '@/lib/supabase/server'
import { type Metadata } from 'next'
import ExploreClient from './ExploreClient'

export const metadata: Metadata = {
  title: 'VRChat 界隈のユーザーをみつける — vaacard',
  description: 'VRChatユーザーの自己紹介カード一覧。プロプランで詳細検索が可能。',
}

export default async function Page() {
  const supabase = await createClient()

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

  // 初期データ（最新20件）
  // カードはテンプレート経由で界隈に属する（card → template → community_templates）
  const { data: initialCards } = await supabase
    .from('cards')
    .select('id, title, image_url, card_data, created_at, template_id, user_id, templates!inner(community_templates!inner(community_slug))')
    .eq('visibility', 'public')
    .eq('templates.community_templates.community_slug', 'vrchat')
    .order('created_at', { ascending: false })
    .limit(isPro ? 24 : 20)

  // プロフィールをまとめて取得
  const userIds = [...new Set((initialCards ?? []).map(c => c.user_id).filter(Boolean))]
  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('user_id, display_name, avatar_url').in('user_id', userIds)
    : { data: [] }

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))
  const cards = (initialCards ?? []).map(c => ({ ...c, profile: profileMap[c.user_id] ?? null }))

  return <ExploreClient initialCards={cards} isPro={isPro} isLoggedIn={!!user} />
}
