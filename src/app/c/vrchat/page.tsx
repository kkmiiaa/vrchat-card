import { createClient } from '@/lib/supabase/server'
import { type Metadata } from 'next'
import ExploreClient from './ExploreClient'

export const metadata: Metadata = {
  title: 'VRChat カード一覧 — vaacard',
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
  const { data: initialCards } = await supabase
    .from('cards')
    .select('id, title, image_url, card_data, created_at, template_id')
    .eq('visibility', 'public')
    .contains('communities', ['VRChat'])
    .order('created_at', { ascending: false })
    .limit(isPro ? 24 : 20)

  return <ExploreClient initialCards={initialCards ?? []} isPro={isPro} isLoggedIn={!!user} />
}
