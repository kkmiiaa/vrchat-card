import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchTemplateLayouts } from '@/lib/templateLayout'
import { type Metadata } from 'next'
import TemplateCardsClient from './TemplateCardsClient'

type Props = { params: Promise<{ templateId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { templateId } = await params
  const layouts = await fetchTemplateLayouts()
  const tpl = layouts[templateId]
  if (!tpl) return {}
  return {
    title: `${tpl.label} のカード一覧 — vaacard`,
    description: tpl.description ?? `${tpl.label} テンプレートで作られた VRChat 自己紹介カード一覧。`,
  }
}

export default async function TemplateCardsPage({ params }: Props) {
  const { templateId } = await params
  const supabase = await createClient()

  const layouts = await fetchTemplateLayouts()
  const templateRow = layouts[templateId]

  // VRChat 界隈に属するテンプレートのみ
  if (!templateRow || !templateRow.community_slugs.includes('vrchat')) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  let isPro = false
  if (user) {
    const { data: userRow } = await supabase
      .from('users').select('plan, plan_expires_at').eq('id', user.id).single()
    isPro = userRow?.plan === 'pro' &&
      (userRow.plan_expires_at == null || new Date(userRow.plan_expires_at) > new Date())
  }

  const { data: initialCards } = await supabase
    .from('cards')
    .select('id, title, image_url, card_data, background, created_at, template_id, user_id, like_count, view_count')
    .eq('visibility', 'public')
    .eq('template_id', templateId)
    .order('created_at', { ascending: false })
    .limit(isPro ? 24 : 20)

  const userIds = [...new Set((initialCards ?? []).map(c => c.user_id).filter(Boolean))]
  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('user_id, display_name, avatar_url').in('user_id', userIds)
    : { data: [] }

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))
  const cards = (initialCards ?? []).map(c => ({ ...c, profile: profileMap[c.user_id] ?? null }))

  // 同じ界隈の他テンプレート（ナビ用）
  const siblingTemplates = Object.values(layouts)
    .filter(t => t.community_slugs.includes('vrchat'))
    .map(t => ({ id: t.id, label: t.label }))

  return (
    <TemplateCardsClient
      templateId={templateId}
      templateRow={templateRow}
      initialCards={cards}
      siblingTemplates={siblingTemplates}
      isPro={isPro}
      isLoggedIn={!!user}
    />
  )
}
