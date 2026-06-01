import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { fetchTemplateLayout } from '@/lib/templateLayout'
import { migrateLegacyCardData } from '@/lib/legacyCardDataMigration'
import CardEditorClient from './CardEditorClient'


export default async function CardPage({ params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: card, error: cardError } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single()

  if (cardError) console.error('[CardPage] card fetch error:', cardError)
  if (!card) notFound()

  // 非公開カードは本人のみ
  if (card.visibility === 'private' && card.user_id !== user?.id) {
    redirect('/auth/login')
  }

  const isOwner = user?.id === card.user_id

  const templateId = card.template_id as string

  // DB からテンプレート定義を取得（シリアライズ可能な TemplateLayoutRow のみサーバーで取得）
  const templateDbRow = await fetchTemplateLayout(templateId)
  const migratedCardData = migrateLegacyCardData(templateId, card.card_data ?? {})

  return (
    <CardEditorClient
      card={{ ...card, card_data: migratedCardData }}
      templateId={templateId}
      templateDbRow={templateDbRow}
      isOwner={isOwner}
      ogpVersion={(card as { ogp_version?: number }).ogp_version ?? 0}
    />
  )
}
